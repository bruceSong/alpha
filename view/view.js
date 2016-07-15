/**
 * 动态文件服务（页面视图，支持动态数据渲染）
 */

'use strict';

const fs = require('fs');
const url = require('url');
const path = require('path');
const zlib = require('zlib');
const Readable = require('stream').Readable;
const serverConf = require('../config/server');
const logger = require('../logger');
const proxyServer = require('../proxy');
const utils = require('../utils');

// 路由列表
let routes = {};
// 模板符号
let tpl_reg = /<%\s*(\w+)\s*%>/g;
let cookie_prefix = '__alpha_';

let cacheDir = `./cache`;
utils.mkdirSync(cacheDir);

// 上次爬取首页时间
let crawl_lastTime = 0;

// 注册动态视图路由
function route(path, handle) {
  routes[path] = handle;
}

// 渲染模板
function template(html, data) {
  return html.replace(tpl_reg, (m, p) => {
    return data[p] || '';
  });
}

function send500(req, res, err) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1 style="text-align:center;">500 Internal Server Error</h1>');
  logger.log(req, res, err.message);
  console.error(err);
}

function send(req, res, data) {
  // 按文件流方式发送
  let readable = new Readable();
  readable.on('error', (err) => {
    send500(req, res, err);
  });
  readable.push(data);
  readable.push(null);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  if (serverConf.gzip) { // 支持压缩
    let acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.match(/\bgzip\b/)) {
      res.setHeader('Content-Encoding', 'gzip');
      readable.pipe(zlib.createGzip()).pipe(res);
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
      res.setHeader('Content-Encoding', 'deflate');
      readable.pipe(zlib.createDeflate()).pipe(res);
    } else {
      readable.pipe(res);
    }
  } else {
    readable.pipe(res);
  }
  logger.log(req, res);
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end();
}

// 渲染视图
function render(req, res, tpl, tplData) {
  fs.readFile(tpl, 'utf8', (err, data) => {
    if (err) return send500(req, res, err);
    send(req, res, template(data, tplData));
  });
}

function renderIndex(req, res, data) {
  let tplData = Object.assign({}, data, {
    env: serverConf.env,
    host: req.headers['host'],
    contactData: JSON.stringify(data.contactData),
    pageExtendData: JSON.stringify(data.pageExtendData),
    paymentGray: JSON.stringify(data.paymentGray)
  });
  render(req, res, path.resolve(__dirname, './tpls/index.tpl'), tplData);
}

// 解析远程首页，提起注入的数据
function parseIndexContent(content) {
  let _parse = function(reg) {
    let match = content.match(reg);
    return match && match.length > 1 ? match[1] : null;
  };
  let data = getIndexDefaultData();
  let token = _parse(/value="(\w+)"\s+id="fs_token"/);
  let traceId = _parse(/value="(\w+)"\s+id="fs_traceId"/);
  let isInvite = _parse(/FS\.setAppStore\("isInvite",\s*(\d)\);/);
  let contactData = _parse(/FS\.setAppStore\("contactData",\s*(.+)\);/);
  let pageExtendData = _parse(/FS\.setAppStore\("pageExtendData",\s*(.+)\);/);
  let crmAvaliablity = _parse(/FS\.setAppStore\("crmAvaliablity",\s*(\d)\);/);
  let paymentGray = _parse(/FS\.setAppStore\("paymentGray",\s*(.+)\);/);
  token && (data.token = token);
  traceId && (data.traceId = traceId);
  isInvite && (data.isInvite = isInvite);
  contactData && (data.contactData = JSON.parse(contactData));
  pageExtendData && (data.pageExtendData = JSON.parse(pageExtendData));
  crmAvaliablity && (data.crmAvaliablity = crmAvaliablity);
  paymentGray && (data.paymentGray = JSON.parse(paymentGray));
  return data;
}

// 缓存爬取的远程数据，当下一次爬取失败时，使用此缓存数据
function setIndexCacheData(data, enterprise, account) {
  let raw = fs.createWriteStream(`${cacheDir}/${enterprise}_${account}.json`);
  raw.end(JSON.stringify(data));
  raw.on('error', (err) => {
    console.error(err.stack);
  });
}

// 根据环境和账号取出缓存数据
function getIndexCacheData(enterprise, account) {
  try {
    let content = fs.readFileSync(`${cacheDir}/${enterprise}_${account}.json`, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return getIndexDefaultData();
  }
}

function getIndexDefaultData() {
  return {
    token: '',
    traceId: '',
    isInvite: 1,
    contactData: {},
    pageExtendData: {},
    crmAvaliablity: 1,
    paymentGray: {}
  };
}

function routeIndex(req, res, pathname) {
  let cookie = req.headers['cookie'];
  // 未登录或切换了环境，跳到登录页重新登录
  if (!cookie) {
    redirect(res, '/XV/User/Login');
    return;
  }

  let env = utils.getCookie(cookie, `${cookie_prefix}env`);
  if (env !== serverConf.env) {
    redirect(res, '/XV/User/Login');
    return;
  }

  let enterprise = utils.getCookie(cookie, `${cookie_prefix}enterprise`);
  let account = utils.getCookie(cookie, `${cookie_prefix}account`);
  let now = +new Date();

  // 距离上次爬页面超过30分钟或切换了用户，重新爬
  if ((now - crawl_lastTime) > 30 * 60 * 1000) {
    // 远程爬取首页注入的数据：token、contact等
    proxyServer.crawl(pathname, {
      cookie: cookie,
      host: req.headers['host'],
      isHttps: !!req.connection.encrypted,
      complete: (content, statusCode, headers) => {
        if (content) {
          let data = parseIndexContent(content);
          crawl_lastTime = now;
          setIndexCacheData(data, enterprise, account);
          renderIndex(req, res, data);
          return;
        }

        // 重定向
        if (statusCode === 302) {
          redirect(res, headers['location']);
          return;
        }

        // 使用缓存数据渲染模板页
        renderIndex(req, res, getIndexCacheData(enterprise, account));
      }
    });
  } else {
    // 30分钟内，用缓存数据渲染模板页
    renderIndex(req, res, getIndexCacheData(enterprise, account));
  }
}

route('/XV/Home/Index', (req, res) => {
  routeIndex(req, res, '/XV/Home/Index');
});

route('/XV/Home/Index2', (req, res) => {
  routeIndex(req, res, '/XV/Home/Index2');
});

route('/XV/Home/Index3', (req, res) => {
  routeIndex(req, res, '/XV/Home/Index3');
});

route('/XV/User/Login', (req, res) => {
  let date = new Date(0);
  res.setHeader('set-cookie', [
    `FSAuthX=; path=/; expires=${date.toUTCString()}`,
    `FSAuthXC=; path=/; expires=${date.toUTCString()}`
  ]);
  crawl_lastTime = 0;
  render(req, res, path.resolve(__dirname, './tpls/login.tpl'), {
    env: serverConf.env,
    accounts: JSON.stringify(require('../config/accounts')[serverConf.env])
  });
});

exports.isView = function(pathname) {
  return !!(routes[pathname]);
};

// 渲染动态视图页面
exports.render = function(req, res) {
  let pathname = url.parse(req.url).pathname;
  let handle = routes[pathname];
  handle && handle(req, res);
};
