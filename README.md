# 本地开发环境
> 名称：Alpha  
> 作者：罗瑛  
> 联系方式： 企信

## 前言
为了摆脱对后端模板的依赖，也为了解决后端模板坏了导致的前端工作停滞，还避免复杂的配置，我用node.js开发了一套本地开发环境，功能与nginx保持一致。  
目前支持的功能特性有：
* 静态文件服务
* 各环境快速切换
* 模板页面输出（接管后端模板）
* 接口代理服务
* 远程配置
* 启动时检查更新
* https
* 静态资源gzip压缩
* 访问日志和错误日志记录

## 使用
1.签出源码：git clone http://git.firstshare.cn/fe-tools/alpha.git。  
2.静态文件配置：打开`config/static.json`，把`root`和`statics`下的`alias`都配置成你本机上代码所在目录，类似nginx；`path`支持正则表达式。  
3.监听端口配置：打开`config/server.json`，修改`port`和`https_port`，默认80和443。  
4.先关闭nginx，避免端口占用。  
5.命令行启动： `npm run start -- fte2`，`--`之后的参数即是后端服务环境，目前支持切换的环境有：`sde` `fte` `fte2` `pte`、`fsceshi`。  
6.打开浏览器，输入`localhost/XV/User/Login`，随便选择一个账号登录。  
7.快速切换环境，退出当前命令，重新启动：`npm run start -- 新环境`，刷新浏览器，在登录页重新选择账号登陆。  
8.调试`fsceshi`，启动`fsceshi`环境，即可在本地接入`fsceshi`服务来调试代码。  

## 高级
1.关闭gzip压缩，打开`config/static.json`，修改其中的`gzip`为`false`，然后重启环境即可。  
2.关闭https，打开`config/server.json`，修改其中的`https`为`false`，然后重启环境即可。  
3.修改代理接口配置，打开`config/proxy.json`，修改`proxies`下各服务的代理配置，然后重启环境即可。
4.添加账号，打开`config/accounts.json`，在对应的环境下新增账号。  

## 结束语
有问题联系`罗瑛`，企信或QQ。
祝开发愉快。
