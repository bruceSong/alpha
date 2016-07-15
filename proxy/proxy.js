/**
 * 接口代理服务
 */

'use strict';

const http = require('http');
const url = require('url');
const proxyConf = require('../config/proxy');
const serverConf = require('../config/server');
const logger = require('../logger');

function getProxy(pathname) {
  let proxies = proxyConf.proxies;
  for (let i = 0; i < proxies.length; i++) {
    let proxy = proxies[i];
    let reg = new RegExp(/^~\s/.test(proxy.path) ? proxy.path.substr(2) : ('^' + proxy.path));
    if (reg.test(pathname)) return proxy;
  }
  return null;
}

function getHostAndPort(pathname, env) {
  let proxy = getProxy(pathname);
  return proxy ? proxy[env].split(':') : null;
}

function getErrorData(msg) {
  return {
    Result: {
      FailureCode: 1,
      StatusCode: -100,
      Message: msg
    },
    Value: null
  };
}

function sendError(req, res, msg) {
  res.statusCode = 200;
  res.end(JSON.stringify(getErrorData(msg)));
  logger.log(req, res, msg);
}

exports.isProxy = function(pathname) {
  return !!getProxy(pathname);
};

// 代理接口请求
exports.proxy = function(req, res) {
  let pathname = url.parse(req.url).pathname;
  let hostAndPort = getHostAndPort(pathname, serverConf.env);

  if (!hostAndPort) {
    sendError(req, res, 'Not Found the API.');
    return;
  }

  let opts = {
    host: hostAndPort[0],
    port: hostAndPort[1],
    path: req.url,
    method: req.method,
    headers: Object.assign({}, req.headers, {
      'X-Forwarded-Proto': req.connection.encrypted ? 'https' : 'http'
    })
  };

  // 转发请求
  let preq = http.request(opts, (pres) => {
    // 转发响应结果
    res.setHeader('X-Proxy', serverConf.server_name);
    if (pres.statusCode === 200) {
      res.writeHead(200, pres.headers);
      pres.pipe(res);
      logger.log(req, res);
    } else if (pres.statusCode === 302) {
      res.statusCode = 302;
      res.setHeader('Location', pres.headers['location']);
      res.end();
    } else {
      sendError(req, res, pres.statusMessage);
    }
  });

  if (/post|put/i.test(req.method)) {
    req.pipe(preq);
  } else {
    preq.end();
  }

  req.on('close', () => {
    preq.abort();
  });

  preq.setTimeout(proxyConf.timeout * 1000, () => {
    preq.abort();
    sendError(req, res, 'TIMEOUT: timeout');
  });

  preq.on('error', (err) => {
    sendError(req, res, `${err.code}: ${err.message}`);
    console.error(err.stack);
  });
};

// 爬页面
exports.crawl = function(pathname, options) {
  let hostAndPort = getHostAndPort(pathname, serverConf.env);
  let opts = {
    host: hostAndPort[0],
    port: hostAndPort[1],
    path: pathname,
    headers: {
      'Accept': 'text/html',
      'Cache-Control': 'no-cache',
      'Cookie': options.cookie || '',
      'Host': options.host || 'localhost',
      'Pragma': 'no-cache',
      'User-Agent': serverConf.server_name,
      'X-Forwarded-Proto': options.isHttps ? 'https' : 'http'
    }
  };

  console.log(`crawl ${pathname}`);
  let req = http.get(opts, (res) => {
    console.log(`crawled ${pathname} ${res.statusCode}`);
    if (res.statusCode === 200) {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        options.complete(body, 200, res.headers);
      });
    } else {
      options.complete(null, res.statusCode, res.headers);
    }
  });

  req.setTimeout(15 * 1000, () => {
    req.abort();
  });

  req.on('error', (err) => {
    options.complete(null, 500);
    console.error(err);
  });

  req.end();
};
