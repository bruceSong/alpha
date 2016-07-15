'use strict';

const fs = require('fs');
const serverConf = require('../config/server');
let utils = require('../utils');

// 初始化，创建log目录
try {
  fs.statSync('./log');
} catch (e) {
  fs.mkdirSync('./log');
}

function getRequestData(req, res) {
  return {
    now: utils.formatDate(new Date(), 'yyyy/MM/dd hh:mm:ss'),
    client: req.connection.remoteAddress,
    method: req.method,
    url: req.url,
    http: `http/${req.httpVersion}`,
    status: res && res.statusCode,
    host: req.headers['host'],
    userAgent: req.headers['user-agent']
  };
}

function getAccessLog(req, res) {
  let data = getRequestData(req, res);
  let log =
    `${data.client} - - [${data.now}] "${data.method} ${data.url} ${data.http}" ${data.status} "-" "${data.userAgent}"`;
  return log;
}

function getErrorLog(req, errorMsg) {
  let data = getRequestData(req);
  let log =
    `${data.now} [error]: ${errorMsg || 'unkown error'}, client: ${data.client}, request: "${data.method} ${data.url} ${data.http}", host: ${data.host}`;
  return log;
}

function writeAccessLog(msg) {
  console.log(msg);
  serverConf.enable_access_log && fs.appendFile('./log/access.log', msg + '\n');
}

function writeErrorLog(msg) {
  console.error(msg);
  serverConf.enable_error_log && fs.appendFile('./log/error.log', msg + '\n');
}

module.exports = {
  log(req, res, error) {
    let msg = error ? getErrorLog(req, error) : getAccessLog(req, res);
    error ? writeErrorLog(msg) : writeAccessLog(msg);
  }
};
