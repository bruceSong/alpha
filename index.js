'use strict';

const spawn = require('child_process').spawn;

let env = 'sde';
let argv = process.argv;
if (argv && argv[2]) {
  env = argv[2];
}

// 先执行git命令更新源码，更新源码完毕后，再执行server进程启动Alpha服务器
const git = spawn('git', 'pull origin master'.split(' '));
console.log('updating code...\n');
listen('git', git, (code) => {
  if (code !== 0) {
    console.error('update code error.');
    return;
  }

  console.log('update the code is completed.');
  console.log('start the server...')

  let isWin = ['win32', 'win64'].indexOf(process.platform) >= 0;
  let command = isWin ? 'npm.cmd' : 'sudo'; // mac linux等系统需要sudo权限启动80和443端口
  let args = ['run', 'server', '--', env];
  !isWin && args.unshift('npm');
  let server = spawn(command, args);
  listen('server', server, () => {
    process.exit(0);
  });
});

function listen(name, _process, next) {
  _process.stdout.on('data', (data) => {
    console.log(data.toString().replace(/\n$/, ''));
  });
  _process.stderr.on('data', (data) => {
    console.log(data.toString().replace(/\n$/, ''));
  });
  _process.on('close', (code) => {
    console.log(`${name} exit: ${code}\n`);
    next && next(code);
  });
  _process.on('error', (err) => {
    console.error(err.stack);
    process.exit(1);
  });
}
