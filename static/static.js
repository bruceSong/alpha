/**
 * 静态文件服务
 */

'use strict';

const fs = require('fs');
const zlib = require('zlib');
const url = require('url');
const path = require('path');
const mimeTypes = require('../config/mime-types');
const staticConf = require('../config/static');
const logger = require('../logger');

// 首页根目录：别名配置优先级高于根目录root配置
let indexRoot = getIndexAlias() || staticConf.root;
// 首页文件（绝对地址）
let indexFile = getIndexFile() || indexRoot;

// 查找首页别名配置
function getIndexAlias() {
  for (let i = 0; i < staticConf.statics.length; i++) {
    let st = staticConf.statics[i];
    if (st.path === '/') return st.alias;
  }
  return '';
}

// 查找首页文件，按配置的顺序查找
function getIndexFile() {
  for (let i = 0; i < staticConf.index.length; i++) {
    let filename = path.join(indexRoot, staticConf.index[i]);
    try {
      fs.accessSync(filename, fs.R_OK);
      return filename;
    } catch (e) {
      console.error(e.stack);
    }
  }
  return '';
}

// 根据配置的别名规则，解析文件地址，得出绝对路径的文件名
function parseUrl(pathname) {
  // 首页
  if (pathname === '/') {
    return indexFile;
  }

  // 根据别名规则来解析，支持正则表达式规则
  for (let i = 0; i < staticConf.statics.length; i++) {
    let st = staticConf.statics[i];
    let p = st.path;

    // 首页path，忽略
    if (p === '/') continue;

    // 正则表达式匹配
    if (/^~\s/.test(p)) {
      p = p.substr(2);
      if (new RegExp(p).test(pathname)) {
        return st.alias.replace(/(\$\d+)/g, (m) => {
          new RegExp(p).test(pathname);
          return RegExp[m];
        });
      }
      continue;
    }

    // 普通字符串匹配
    if (pathname.slice(0, p.length) === p) {
      return path.join(st.alias, pathname.replace(p, ''));
    }
  }

  // 无别名配置，取根路径 + 文件pathname
  return path.join(staticConf.root, pathname);
}

// 根据文件扩展后缀名返回对应的content-type
function getContentType(ext) {
  let type = ext.substr(1);
  return mimeTypes[type] || '';
}

function send404(req, res, err) {
  let accept = req.headers['accept'] || '';
  res.statusCode = 404;
  if (accept.match(/text\/html/)) {
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1 style="text-align:center;">404 Not Found</h1>');
  } else {
    res.end();
  }
  logger.log(req, res, err.message);
  console.error(err);
}

function send500(req, res, err) {
  let accept = req.headers['accept'] || '';
  res.statusCode = 500;
  if (accept.match(/text\/html/)) {
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1 style="text-align:center;">500 Internal Server Error</h1>');
  } else {
    res.end();
  }
  logger.log(req, res, err.message);
  console.error(err);
}

function send304(req, res) {
  res.statusCode = 304;
  res.end();
  logger.log(req, res);
}

function send200(req, res, filename) {
  let raw = fs.createReadStream(filename); // 按文件流方式发送
  raw.on('error', (err) => {
    send500(req, res, err);
  });

  res.statusCode = 200;
  if (staticConf.gzip) { // 支持压缩
    let acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.match(/\bgzip\b/)) {
      res.setHeader('Content-Encoding', 'gzip');
      raw.pipe(zlib.createGzip()).pipe(res);
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
      res.setHeader('Content-Encoding', 'deflate');
      raw.pipe(zlib.createDeflate()).pipe(res);
    } else {
      raw.pipe(res);
    }
  } else {
    raw.pipe(res);
  }
  logger.log(req, res);
}

function setContentTypeHeader(res, ext) {
  res.setHeader('Content-Type', getContentType(ext) || 'text/plain');
}

function setExpiresHeader(res) {
  let expires = new Date();
  expires.setTime(expires.getTime() + staticConf.expires.maxAge * 1000);
  res.setHeader('Expires', expires.toUTCString());
  res.setHeader('Cache-Control', `max-age=${staticConf.expires.maxAge}`);
}

function setLastModifiedHeader(res, lastModified) {
  res.setHeader('Last-Modified', lastModified);
}

exports.isStatic = function(pathname) {
  let ext = path.extname(pathname);
  return !!ext;
};

// 发送静态文件
exports.send = function(req, res) {
  let pathname = url.parse(req.url).pathname;
  let filename = parseUrl(pathname);
  console.log(`request: ${req.url}`);
  console.log(`filename: ${filename}`);

  fs.stat(filename, (err, stat) => {
    if (err) {
      send404(req, res, err);
      return;
    }

    let ext = path.parse(filename).ext;
    setContentTypeHeader(res, ext);

    // 设置缓存首部
    if (ext.match(new RegExp(staticConf.expires.match))) {
      setExpiresHeader(res);
    }

    // 设置最后修改时间首部
    let lastModified = stat.mtime.toUTCString();
    setLastModifiedHeader(res, lastModified);

    // 文件未修改过，使用缓存，不发送文件主体
    let ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && lastModified === ifModifiedSince) {
      send304(req, res);
      return;
    }

    // 发送文件主体
    send200(req, res, filename);
  });
};
