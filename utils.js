'use strict';

const fs = require('fs');

module.exports = {
  isNumber: function(n) {
    return typeof n === 'number' || Object.prototype.toString.call(n) === '[object Number]';
  },

  formatDate(d, fmt) {
    this.isNumber(d) && (d = new Date(d));

    fmt = fmt || 'yyyy-MM-dd hh:mm:ss'; //支持的格式模板部件有：y--年份，M--月份，d--日，h--24制小时，H--12制小时，m--分，q--季度
    let o = {
      'M+': d.getMonth() + 1, //月份
      'd+': d.getDate(), //日
      'H+': d.getHours() % 12 === 0 ? 12 : d.getHours() % 12, //小时
      'h+': d.getHours(), //小时
      'm+': d.getMinutes(), //分
      's+': d.getSeconds(), //秒
      'q+': Math.floor((d.getMonth() + 3) / 3), //季度
      'S': d.getMilliseconds() //毫秒
    };
    /(y+)/.test(fmt) && (fmt = fmt.replace(RegExp.$1, (d.getFullYear() +
      '').substr(4 - RegExp.$1.length)));
    for (let k in o) {
      let v = o[k];
      new RegExp('(' + k + ')').test(fmt) && (fmt = fmt.replace(
        RegExp.$1, RegExp.$1.length === 1 ? v : ('00' + v).substr(
          ('' + v).length)));
    }
    return fmt;
  },

  getCookie: function(cookie, name) {
    let cs = cookie.split('; ');
    for (let i = 0; i < cs.length; i++) {
      let c = cs[i].split('=');
      if (c[0] === name) return c[1];
    }
    return '';
  },

  // 逐级创建目录
  mkdir: function(path, callback) {
    if (!path) return;
    let paths = path.split('/');
    let index = 0;
    let mk = function(p, next) {
      if (index > paths.length) {
        return callback && callback();
      }
      fs.stat(p, (err) => {
        if (err) {
          fs.mkdir(p, () => {
            next(p + '/' + paths[index++], mk);
          });
          return;
        }
        next(p + '/' + paths[index++], mk);
      });
    };
    mk(paths[index++], mk);
  },

  // 同步逐级创建目录
  mkdirSync: function(path) {
    if (!path) return;
    let paths = path.split('/');
    let _path = '';
    for (let i = 0; i < paths.length; i++) {
      _path += paths[i];
      try {
        fs.statSync(_path);
      } catch (e) {
        fs.mkdirSync(_path);
      }
      _path += '/';
    }
  }
};
