<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if IE 9]>         <html class="no-js ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
<head>
<meta charset="utf-8" />
<script type="text/javascript">var _fp_config = {'_tstart' : +new Date()};</script>
<meta name="renderer" content="webkit"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
<title>纷享销客 畅享智慧工作</title>
<meta name="description" content="" />
<meta name="author" content="fxiaoke" />
<meta name="viewport" content="width=device-width"/>
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<!--[if lt IE 9]><script src="//<% host %>/html/base-dist/assets/libs/html5shiv.js"></script><![endif]-->
<link rel="stylesheet" href="//<% host %>/html/base/assets/style/all.css" />
<link rel="stylesheet" href="//<% host %>/html/crm/assets/style/all.css" />
<link rel="stylesheet" href="//<% host %>/html/fs/assets/style/all.css" />
<link rel="stylesheet" href="//<% host %>/html/app/all.css" />
<script type="text/javascript">_fp_config._thead = +new Date();</script>
</head>
<body>
  <div id="app-portal" class="app-wrapper">
    <header class="hd f-g-hd">
      <div class="hd-t">
        <div class="hd-inner app-inner fn-clear">
          <div class="section-l"><span class="company-name">&nbsp;</span></div>
          <div class="section-c fn-clear fs-limit-user-hide">
            <a href="#stream" class="app-top-nav-l top-nav-l sc-tagon tnavon state-active">工作</a>
            <a href='#crm/index' class='crm-top-nav-l top-nav-l sc-tag'>CRM</a>
            <a href='#app/manage/myapps' class='apps-top-nav-l top-nav-l sc-tag'>应用</a>
            <a href='#outline' class="manage-top-nav-l top-nav-l sc-tag fn-hide">管理</a>
          </div>
          <div class="global-search-f fs-limit-user-hide">
            <div class="f-field"><input type="text" id="global-search" class="textfield h-search-text" placeholder="搜索工作、同事或附件" maxlength="100" /><button class="h-search-btn"></button></div>
          </div>
          <div class="section-r fn-clear">
            <div class="complete-user-control fs-limit-user-hide">
              <div class="f-header-sharegroup" id="j-header-sharegroup">纷享团队</div>
              <div class="common-use-l">
                <div class="common-use-title"><a href="#profile" class="user-name-l tpl-nav-l" title="">&nbsp;</a></div>
                <div class="common-use-list" style="display:none;">
                  <a href="//www.fxiaoke.com/versionhistory.html" class="tpl-nav-l version-history" target="_blank" title="升级说明">升级说明</a>
                  <a href="#settings/personalsetting" class="tpl-nav-l" title="">个人设置</a>
                  <a href="javascript:void(0);" class="f-header-switch-ent" style="display:none">切换企业</a>
                  <form action="../../Account/HtmlLogOff" method="post" class="logout-f"><button type="submit" class="logout-l">退出登录</button></form>
                  <span class="version-info">营销版</span>
                </div>
              </div>
            </div>
          </div>
          <div id="global-remind" class="fs-limit-user-hide">
            <ul class="remind-list"></ul><span class="close-btn" title="临时关闭">×</span>
          </div>
        </div>
      </div>
      <div class="hd-b">
        <div class="hd-inner app-inner fs-limit-user-hide " >
          <form action="../../Account/HtmlLogOff" method="post"><button type="submit" id="return-back-account-btn" class="fn-hide">退出演示帐号</button></form>
          <table class="global-other-tip">
            <tr>
              <td>
                <div class="fn-hide">
                  <p class="sms-amount-tip hdi-right-apv color-999999"><span class="v-rate hdi-right-apv02 color-red fn-right">0%</span><span class="shown-label">剩余短信：</span><span class="v-unit">0条</span></p>
                </div>
                <p class="storage-space-tip hdi-right-apv color-999999"><span class="v-rate hdi-right-apv04 color-red fn-right">0%</span><span class="shown-label">剩余空间：</span><span class="v-unit">0MB</span></p>
              </td>
            </tr>
          </table>
        </div>
        <div class="hd-inner crm-inner " style="display: none;"><div class="tpl-nav fn-clear"></div></div>
      </div>
    </header>
    <div class="bd f-g-bd"><div id="sub-tpl" class="bd-inner app-inner"></div></div>
    <div class="to-top-btn"></div>
    <input type="hidden" value="<% token %>" id="fs_token" />
    <input type="hidden" value="<% traceId %>" id="fs_traceId" />
  </div>
  <script type="text/javascript">
  var FS_VERSION = "10";
  var FS_BASEPATH = "//<% host %>";
  var FS_STATIC_PATH = "//<% host %>/html";
  var FS_MODULES = {
    base: {
      main: 'app',
      version: '4.0.1.0'    // 版本号规则: all.asset.module.tpl
    },
    crm: {
      main: 'app',
      version: '4.0.0.0'    // 版本号规则: all.asset.module.tpl
    },
    fs: {
      main: 'app',
      version: '4.0.2.0'    // 版本号规则: all.asset.module.tpl
    },
    app: {
      main: 'app',
      version: '18.0.2.0'
    },
    manage: {
      main: 'app',
      version: '1.0.0.0'
    }
  };
  var PUBLISH_MODEL = "development";    //development/product
  </script>
  <script src="//<% host %>/html/base/assets/libs/seajs/sea-debug.js"></script>
  <script src="//<% host %>/html/base/assets/libs/underscore/underscore.js"></script>
  <script src="//<% host %>/html/base/assets/libs/underscore/underscore.string.js"></script>
  <script src="//<% host %>/html/base/assets/libs/backbone.js"></script>
  <script src="//<% host %>/html/base/assets/libs/jquery/jquery-1.8.3.min.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/swfobject/swfobject.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/swfupload/swfupload.js"></script>
  <script src="//<% host %>/html/base/assets/libs/store.js"></script>
  <script src="//<% host %>/html/base/assets/libs/paste.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/jquery-plugins/jquery.autosize.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/jquery-plugins/jquery.tinyscrollbar.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/jquery-plugins/autolist/autolist.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/spin/spin.min.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/zclip/1.1.1/zclip_core.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/jquery-plugins/jquery.atwho.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/jquery-plugins/jquery.atwho.custom.js"></script>
  <script src="//<% host %>/html/base/assets/plugins/datatable/js/jquery.dataTables.js"></script>
  <script src="//<% host %>/html/base/assets/js/common.js?v=2"></script>
	<script src="//<% host %>/html/base/assets/plugins/jquery-plugins/jquery.scrollbar.js"></script>
  <script>
  FS.setAppStore("isInvite", <% isInvite %>);
  FS.setAppStore("contactData", <% contactData %>);
  FS.setAppStore("pageExtendData", <% pageExtendData %>);
  FS.setAppStore("crmAvaliablity", <% crmAvaliablity %>);
  FS.setAppStore("paymentGray", <% paymentGray %>);
  seajs.use('module-base', function (app) {
    app.init();
  });
  </script>
</body>
</html>
