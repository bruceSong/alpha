<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<meta name="renderer" content="webkit"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
<title>登录纷享销客</title>
<meta name="description" content="" />
<meta name="author" content="fxiaoke" />
<meta name="viewport" content="width=device-width"/>
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<style>
h1.title {
  width: 400px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
form#form {
  width: 400px;
  margin: 0 auto;
  text-align: center;
}
.form-item {
  padding: 10px 0;
}
select, input[type="text"] {
  width: 320px;
  height: 40px;
  padding: 0 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 18px;
}
input[type="submit"] {
  width: 380px;
  height: 40px;
  line-height: 40px;
  border-radius: 10px;
  background-color: #f8a200;
  border: none;
  outline: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}
</style>
</head>
<body>
  <h1 class="title">当前环境：<% env %></h1>
  <form id="form" action="/FHH/EM0HXUL/Authorize/Login" method="post">
    <div class="form-item">
      <label>企业：<select id="enterprise" name="enterprise"></select></label>
    </div>
    <div class="form-item">
      <label>个人：<select id="account" name="account"></select></label>
    </div>
    <div class="form-item">
      <label>密码：<input id="password" type="text" name="password" /></label>
    </div>
    <div class="form-item">
      <input type="submit" value="登 录" />
    </div>
  </form>
  <script>
  (function() {
    var env = '<% env %>';
    var enterprises = <% accounts %>;
    var currentAccounts = [];

    var $form = document.getElementById('form');
    var $enterprise = document.getElementById('enterprise');
    var $account = document.getElementById('account');
    var $password = document.getElementById('password');

    $form.onsubmit = function(evt) {
      evt.preventDefault();
      login({
        enterprise: $form['enterprise'].value,
        account: $form['account'].value,
        password: $form['password'].value,
      });
    };

    $enterprise.onchange = function(evt) {
      setEnterprise(evt.target.value);
    };

    $account.onchange = function(evt) {
      setAccount(evt.target.value);
    };

    var enterprise_opts = [];
    for(var i = 0; i < enterprises.length; i ++) {
      var a = enterprises[i];
      enterprise_opts.push('<option value="' + a.enterprise + '">' + a.enterprise + '</option>');
    }
    $enterprise.innerHTML = enterprise_opts.join('');
    setEnterprise(enterprises[0].enterprise);

    function setEnterprise(enterprise) {
      var accounts = getAccounts(enterprise);
      currentAccounts = accounts;

      var account_opts = [];
      for(var i = 0; i < accounts.length; i++) {
        var account = accounts[i];
        account_opts.push('<option value="' + account.account + '">' + account.account + '</option>');
      }
      $account.innerHTML = account_opts.join('');
      setAccount(accounts[0].account);
    }

    function setAccount(account) {
      var pwd = getPassword(account);
      $password.value = pwd;
    }

    function getAccounts(enterprise) {
      for(var i = 0; i < enterprises.length; i++) {
        var item = enterprises[i];
        if(item.enterprise === enterprise) {
          return item.accounts;
        }
      }
      return [];
    }

    function getPassword(account) {
      for(var i = 0; i < currentAccounts.length; i++) {
        var item = currentAccounts[i];
        if(item.account === account) {
          return item.password;
        }
      }
      return '';
    }

    function login(data) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
          var response = JSON.parse(xhr.responseText || '{}');
          if (response.Value && response.Value.Result == 7) {
            var expires = new Date();
            expires.setTime(expires.getTime() + 180 * 24 * 3600 * 1000);
            setCookie('__alpha_env', env, expires);
            setCookie('__alpha_enterprise', data.enterprise, expires);
            setCookie('__alpha_account', data.account, expires);
            window.location.href = '/XV/Home/Index#stream';
            return;
          }
          alert('登录失败，换个账号试试');
        }
      };
      xhr.open($form.method, $form.action, true);
      xhr.setRequestHeader('Content-type', 'application/javascript');
      xhr.send(JSON.stringify({
        EnterpriseAccount: data.enterprise,
        UserAccount: data.account,
        Password: data.password,
        ImgCode: '',
        PersistenceHint: true,
        ClientId: +new Date() + ''
      }));
    }

    function setCookie(name, value, expires) {
      document.cookie = name + '=' + value + ';path=/' + ';expires=' + expires.toGMTString();
    }
  })();
  </script>
</body>
</html>
