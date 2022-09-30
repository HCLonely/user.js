// ==UserScript==
// @name        AuTo Redeem Steamkey
// @namespace   HCLonely
// @author      HCLonely
// @description 复制网页中的Steamkey后自动激活，3.0+版本为Beta版
// @version     3.1.7
// @supportURL  https://keylol.com/t344489-1-1
// @homepage    https://blog.hclonely.com/posts/71381355/
// @iconURL     https://blog.hclonely.com/img/avatar.jpg
// @updateURL   https://github.com/HCLonely/user.js/raw/master/AuTo_Redeem_Steamkey.user.js
// @include     *://*/*
// @exclude     *store.steampowered.com/widget/*
// @exclude     *googleads*
// @grant       GM_setClipboard
// @grant       GM_addStyle
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// @grant       unsafeWindow
// @run-at      document-idle
// @require     https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js
// @resource    style https://cdn.jsdelivr.net/npm/sweetalert2@11.3.5/dist/sweetalert2.min.css
// @connect     *
// @compatible  chrome 没有测试其他浏览器的兼容性
// ==/UserScript==
(function() {
  'use strict';
  var __webpack_require__ = {};
  !function() {
    __webpack_require__.n = function(module) {
      var getter = module && module.__esModule ? function() {
        return module['default'];
      } : function() {
        return module;
      };
      __webpack_require__.d(getter, {
        a: getter
      });
      return getter;
    };
  }();
  !function() {
    __webpack_require__.d = function(exports, definition) {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          });
        }
      }
    };
  }();
  !function() {
    __webpack_require__.o = function(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }();
  var __webpack_exports__ = {};
  const external_Swal_namespaceObject = Swal;
  var external_Swal_default = __webpack_require__.n(external_Swal_namespaceObject);
  const asfCommands = `<table class='hclonely'>
  <thead>
    <tr>
      <th style="width: 40px;">操作</th>
      <th>命令</th>
      <th>权限</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>2fa &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>为指定机器人生成临时的​<strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN">两步验证</a></strong>​令牌。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>2fano &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>为指定机器人拒绝所有等待操作的​<strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN">两步验证</a></strong>​交易确认。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>2faok &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>为指定机器人接受所有等待操作的​<strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN">两步验证</a></strong>​交易确认。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>addlicense &lt;Bots&gt; &lt;Licenses&gt;</code>
      </td>
      <td><code>Operator</code>
      </td>
      <td>为指定机器人激活给定的 <code>Licenses </code>（许可），该参数解释详见​<strong><a href="#addlicense-%E5%91%BD%E4%BB%A4%E7%9A%84-licenses-%E5%8F%82%E6%95%B0">下文</a></strong>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>balance &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>显示指定机器人的 Steam 钱包余额。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>bgr &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>显示指定机器人的 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Background-games-redeemer-zh-CN">BGR</a></strong>（后台游戏激活器）队列信息。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>bl &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>列出指定机器人的交易黑名单用户。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>bladd &lt;Bots&gt; &lt;SteamIDs64&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将给定的 <code>SteamIDs</code> 加入指定机器人的交易黑名单。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>blrm &lt;Bots&gt; &lt;SteamIDs64&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将给定的 <code>SteamIDs</code> 从指定机器人的交易黑名单中移除。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>exit</code>
      </td>
      <td><code>Owner</code>
      </td>
      <td>完全停止 ASF 进程。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>farm &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>重新启动指定机器人的挂卡模块。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>help</code>
      </td>
      <td><code>FamilySharing</code>
      </td>
      <td>显示帮助（指向此页面的链接）。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>input &lt;Bots&gt; &lt;Type&gt; &lt;Value&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>为指定机器人填写给定的输入值，仅在 <code>Headless</code> 模式中可用——详见​<strong><a href="#input-%E5%91%BD%E4%BB%A4">下文的解释</a></strong>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>ib &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>列出指定机器人的自动挂卡黑名单。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>ibadd &lt;Bots&gt; &lt;AppIDs&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将给定的 <code>AppIDs</code> 加入指定机器人的自动挂卡黑名单。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>ibrm &lt;Bots&gt; &lt;AppIDs&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将给定的 <code>AppIDs</code> 从指定机器人的自动挂卡黑名单中移除。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>iq &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>列出指定机器人的优先挂卡队列。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>iqadd &lt;Bots&gt; &lt;AppIDs&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将给定的 <code>AppIDs</code> 加入指定机器人的优先挂卡队列。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>iqrm &lt;Bots&gt; &lt;AppIDs&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将给定的 <code>AppIDs</code> 从指定机器人的优先挂卡队列中移除。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>level &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>显示指定机器人的 Steam 帐户等级。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>loot &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的所有 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>loot@ &lt;Bots&gt; &lt;RealAppIDs&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的所有符合给定 <code>RealAppIDs</code> 的 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>loot^ &lt;Bots&gt; &lt;AppID&gt; &lt;ContextID&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 的物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>nickname &lt;Bots&gt; &lt;Nickname&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的昵称更改为 <code>Nickname</code>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>owns &lt;Bots&gt; &lt;Games&gt;</code>
      </td>
      <td><code>Operator</code>
      </td>
      <td>检查指定机器人是否已拥有 <code>Games</code>，该参数解释详见​<strong><a href="#owns-%E5%91%BD%E4%BB%A4%E7%9A%84-games-%E5%8F%82%E6%95%B0">下文</a></strong>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>password &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>显示指定机器人加密后的密码（配合 <code>PasswordFormat</code> 使用）。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>pause &lt;Bots&gt;</code>
      </td>
      <td><code>Operator</code>
      </td>
      <td>永久暂停指定机器人的自动挂卡模块。 ASF 在本次会话中将不会再尝试对此帐户进行挂卡，除非您手动 <code>resume</code> 或者重启 ASF。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>pause~ &lt;Bots&gt;</code>
      </td>
      <td><code>FamilySharing</code>
      </td>
      <td>临时暂停指定机器人的自动挂卡模块。 挂卡进程将会在下次游戏事件或者机器人断开连接时自动恢复。 您可以 <code>resume</code> 以恢复挂卡。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>pause&amp; &lt;Bots&gt; &lt;Seconds&gt;</code>
      </td>
      <td><code>Operator</code>
      </td>
      <td>临时暂停指定机器人的自动挂卡模块 <code>Seconds</code> 秒。 之后，挂卡模块会自动恢复。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>play &lt;Bots&gt; &lt;AppIDs,GameName&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>切换到手动挂卡——使指定机器人运行给定的 <code>AppIDs</code>，并且可选自定义 <code>GameName</code> 为游戏名称。 使用 <code>reset</code> 或 <code>resume</code> 命令恢复。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>privacy &lt;Bots&gt; &lt;Settings&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>更改指定机器人实例的 <strong><a href="https://steamcommunity.com/my/edit/settings" rel="nofollow">Steam 隐私设置</a></strong>，可用选项见​<strong><a href="#privacy-%E8%AE%BE%E7%BD%AE">下文</a></strong>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>redeem &lt;Bots&gt; &lt;Keys&gt;</code>
      </td>
      <td><code>Operator</code>
      </td>
      <td>为指定机器人激活给定的游戏序列号或钱包充值码。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>redeem^ &lt;Bots&gt; &lt;Modes&gt; &lt;Keys&gt;</code>
      </td>
      <td><code>Operator</code>
      </td>
      <td>以 <code>Modes</code> 模式为指定机器人激活给定的游戏序列号或钱包充值码，模式详见下文的​<strong><a href="#redeem-%E6%A8%A1%E5%BC%8F">解释</a></strong>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>reset &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>重置游戏状态为正常状态，用来配合 <code>play</code> 命令的手动挂卡模式使用。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>restart</code>
      </td>
      <td><code>Owner</code>
      </td>
      <td>重新启动 ASF 进程。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>resume &lt;Bots&gt;</code>
      </td>
      <td><code>FamilySharing</code>
      </td>
      <td>恢复指定机器人的自动挂卡进程。 参见 <code>pause</code> 和 <code>play</code>。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>start &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>启动指定机器人。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>stats</code>
      </td>
      <td><code>Owner</code>
      </td>
      <td>显示进程统计信息，例如托管内存用量。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>status &lt;Bots&gt;</code>
      </td>
      <td><code>FamilySharing</code>
      </td>
      <td>显示指定机器人的状态。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>stop &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>停止指定机器人。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>transfer &lt;Bots&gt; &lt;TargetBot&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的所有 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>transfer@ &lt;Bots&gt; &lt;RealAppIDs&gt; &lt;TargetBot&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的所有符合给定 <code>RealAppIDs</code> 的 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>transfer^ &lt;Bots&gt; &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 的物品转移到一个目标机器人。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>unpack &lt;Bots&gt;</code>
      </td>
      <td><code>Master</code>
      </td>
      <td>拆开指定机器人库存中的所有补充包。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>update</code>
      </td>
      <td><code>Owner</code>
      </td>
      <td>检查 GitHub 上的 ASF 更新（每隔 <code>UpdatePeriod</code> 就会自动执行一次）。</td>
    </tr>
    <tr>
      <td><button class="swal-button">使用</button></td>
      <td><code>version</code>
      </td>
      <td><code>FamilySharing</code>
      </td>
      <td>显示 ASF 的版本号。</td>
    </tr>
  </tbody>
</table>
`;
  function _classPrivateMethodInitSpec(obj, privateSet) {
    _checkPrivateRedeclaration(obj, privateSet);
    privateSet.add(obj);
  }
  function _checkPrivateRedeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
      throw new TypeError('Cannot initialize the same private elements twice on an object');
    }
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classPrivateMethodGet(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
      throw new TypeError('attempted to get private field on non-instance');
    }
    return fn;
  }
  var _showAllCommand = new WeakSet();
  var _sendCommand = new WeakSet();
  class ASF {
    constructor() {
      _classPrivateMethodInitSpec(this, _sendCommand);
      _classPrivateMethodInitSpec(this, _showAllCommand);
      _defineProperty(this, 'options', void 0);
      _defineProperty(this, 'status', void 0);
      const {
        protocol,
        host,
        port,
        password,
        botName: _botName
      } = GM_getValue('settings') || {};
      if (!(protocol && host && port && password)) {
        this.status = false;
        external_Swal_default().fire('请配置ASF设置！', '', 'warning');
        return this;
      }
      this.options = {
        protocol: protocol,
        host: host,
        port: port,
        password: password,
        botName: _botName
      };
      this.status = true;
      return this;
    }
    sendCommandPre(text) {
      if (!this.status) {
        external_Swal_default().fire({
          allowOutsideClick: false,
          icon: 'warning',
          title: '此功能需要在设置中配置ASF IPC并开启ASF功能！'
        });
        return;
      }
      external_Swal_default().fire({
        allowOutsideClick: false,
        title: '请在下方输入要执行的ASF指令：',
        html: `<input id="asf-command" class="swal2-input"${text ? ` value=${text}` : ''}>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="stats">连接测试</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="pause">暂停挂卡</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="resume">恢复挂卡</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="2fa">获取令牌</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="more">更多ASF指令</button>`,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '运行命令',
        denyButtonText: '激活key',
        cancelButtonText: '取消',
        preConfirm: () => {
          return $('#asf-command').val();
        }
      }).then(_ref => {
        let {
          value
        } = _ref;
        return _classPrivateMethodGet(this, _sendCommand, _sendCommand2).call(this, value);
      }).catch(() => null);
      $('.auto-redeem-key').on('click', event => {
        const subCommand = $(event.target).attr('data-command');
        if (subCommand === 'more') {
          _classPrivateMethodGet(this, _showAllCommand, _showAllCommand2).call(this);
          return;
        }
        $('#asf-command').val(`!${subCommand} ${this.options.botName || ''}`);
      });
    }
  }
  function _showAllCommand2() {
    external_Swal_default().fire({
      allowOutsideClick: false,
      title: 'ASF指令',
      html: asfCommands,
      showCancelButton: true,
      confirmButtonText: '返回',
      cancelButtonText: '关闭'
    }).then(_ref2 => {
      let {
        isConfirmed
      } = _ref2;
      if (isConfirmed) {
        this.sendCommandPre();
      }
    });
    $('table.hclonely button.swal-button').on('click', event => {
      const botName = this.options.botName;
      const command = $(event.target).parent().next().text().trim();
      this.sendCommandPre(botName ? command.replace(/<Bots>/gi, botName) : command);
    });
  }
  async function _sendCommand2(command) {
    if (!command) {
      external_Swal_default().fire({
        allowOutsideClick: false,
        title: 'ASF指令不能为空！',
        icon: 'warning'
      }).then(() => this.sendCommandPre());
      return;
    }
    console.log(command);
  }
  const asf = ASF;
  GM_addStyle(GM_getResourceText('style'));
  GM_registerMenuCommand('Test', () => {
    unsafeWindow.asf = new asf();
  });
})();