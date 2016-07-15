'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const serverConf = require('./config/server');

let argv = process.argv;
if (argv && argv[2]) {
  serverConf.env = argv[2];
}
console.log(`the server environment is ${serverConf.env}`);

const staticServer = require('./static');
const viewServer = require('./view');
const proxyServer = require('./proxy');

// 创建http server
const httpServer = http.createServer(serverHandler);
httpServer.listen(serverConf.port, serverConf.host, () => {
  console.log(`${serverConf.server_name} running at http://${serverConf.host}:${serverConf.port}/`);
});
httpServer.on('error', (err) => {
  console.error('Server Error:', err.message);
});

// 创建https server
if (serverConf.https) {
  const httpsServer = https.createServer({
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.crt')
  }, serverHandler);
  httpsServer.listen(serverConf.https_port, serverConf.host, () => {
    console.log(`${serverConf.server_name} running at https://${serverConf.host}:${serverConf.https_port}/`);
  });
  httpsServer.on('error', (err) => {
    console.error('Server Error:', err.message);
  });
}

function serverHandler(req, res) {
  let pathname = url.parse(req.url).pathname;
  res.setHeader('Server', serverConf.server_name);

  // 是首页
  if (pathname === '/') {
    staticServer.send(req, res);
    return;
  }

  // 老登录页地址，重定向到新登录页
  if (pathname === '/login.aspx') {
    res.writeHead(302, {
      'Location': '/XV/User/Login'
    });
    res.end();
    return;
  }

  // 是静态文件
  if (staticServer.isStatic(pathname)) {
    staticServer.send(req, res);
    return;
  }

  // 是动态视图
  if (viewServer.isView(pathname)) {
    viewServer.render(req, res);
    return;
  }

  // 是代理接口
  if (proxyServer.isProxy(pathname)) {
    proxyServer.proxy(req, res);
    return;
  }

  res.writeHead(200, {});
  res.end();
}
