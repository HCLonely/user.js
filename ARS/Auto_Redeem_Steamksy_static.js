var arsStatic = {
  html: `
<table class='hclonely'>
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
`,
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABsFBMVEVHcEz9/f3+/v8Tdaf///8LGTP+/v4NPWX+/v8GGDj8/f4OGzX///////////8ZJ1ALJ0oNGzf+/v4mOGXX2+T8/f3z9vkPH0UjMFj5+fr///8NGzMJG0ERHS8SKEgXW40Ubp8WY5Ula5ePnrb3+PlnhKUfQ3Q3R3C2vMvt8PRcZH7///8TgrMTgbITfa4YNmcPHDT///8JGj0HGT2rucxGWYJ0g6H///9aZYbGy9jFyNQhL1TO0dp5lbOTma39/f7///+Sl6br7O6SlqT///////8UY5UUY5UJGTgTc6QThLUTfa8VToETdKYQK1sRK1sUWowUY5X///+mq7tlc5MzWX7Mztl5gZuytcJPV3AjL08iLlEUTYAUPXATK10Tfa4FO3IVToHEz9wAL2fj5+5GUG4JFz1mbIC8wMsFFzYFGDwHGkILGTIJG0cLHUoFGD8RJFMUU4YUN2kOIE4TSHsUYJMUbqAUQnUVTYAQLWEUWowUPG8SKFoTZ5kRHDATfq8Tdqf///8IIFQUaJkeWYrA0N4JMmgHQndAc5wJTYIIVooGXpNllrdchanT3ui2xtaZV9eJAAAAaXRSTlMAj/j97/vmAtD8xzncwJvwJay59uHd/ObqgnBtlpgLPfz8Femx+/7s0vitXqVLf53k3VmE9fDr59vaxLSY/qmGRnxeXjI/lGy5MLbr+8A/cPuiqLzgfLHJhJfN17bjr6z8xfmu9cH4cHitMXlOAAACjUlEQVQ4y2XTh1faQBgA8IMGQqCiGPaQAgUE3OLeFTfurR120SYkAQSrQUABUSyOf7l3kQC+/i7JfXff9/Ly4DsAXuA4AG0qi02jsVlUbS/rRnCpsvXkqnpsKmGrnsZBy2KOyTGyHBrooWlpeAkMLAzDyBiRDIayvloFnKwMJSOoKgJGsghD9YsVOLASBEE3pKtz/8t34MBCEXQddbQ7O/trjKAiVB96BY630I2ow1BobjoUmjXQdAR+KRyL0Ug0VhWlD+c+jBkMxzNzM3BXgwrWog1oYyBgODr47adnpv2xSBT+HkDDRlgxz9H+wM/jgNkc8BvNBzGWtQLgNLAcy8JbGLFJs3HSZDJNmQzjpmaWM7SBviRXk2SbxyXGSQkCI1jAqUB/Mp6sYbfV6mGvWq2W7JOSPQ7urIPuJBsXccNbkNG7t7cf397aQQkrMLUPZLh4JoMushV5P0yS3vatUbSV+QwkytaRQbJQ4DOFwqiySQnBR1PTKAnTPCyY0ikUSoVrgPcOjihE2vYdPnPK8yTfDczytwKtbsQVhHOvTqcd4Hn+VMCvg2lM3itHMK3LMyiXD/UGPbeXkFBwuQacrh8Yhg1hiM8TxHxu/vT8UvQJtud3j/ubVKCXTrix8O15Xaob/hf21MlJOZiX5qXSvHvi+Tacqgmn7Kgfvl6E7+58ped8vpTyTdwlLkThi49CP9gTiZv7R/1juXxTerpPNEINA6/d9Eb6/kH/VNKXbtJ1G+kFsSk3zxyOv46Hh3KlclbjOJsHYleDzWKxmK1UskUkixSzxfnGc9f1DvkjQvHCq6OHL61eX1+/qYLR6tKrw4lKOr+sXFWtdNj/O99wiTs7uzqWlzu6Op14Pf0P2PD9NrHDeWsAAAAASUVORK5CYII=',
  css: `table.hclonely {
    font-family: verdana,arial,sans-serif;
    font-size: 11px;
    color: #333333;
    border-width: 1px;
    border-color: #999999;
    border-collapse: collapse;
}

table.hclonely th {
    background-color: #c3dde0;
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #a9c6c9;
}

table.hclonely tr {
    background-color: #d4e3e5;
}

table.hclonely td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #a9c6c9;
}
table.hclonely caption {
    padding-top: 8px;
    color: #808294;
    text-align: center;
    caption-side: top;
    background-color: #94d7df;
}
table.hclonely h2 {
    margin: 0;
    font-size: 25px;
}

.swal-user {
    width: 80%;
}

table.hclonely a {
    color: #2196F3;
}
table.hclonely .swal-button {
    padding: 5px;
}
#unusedKeyArea code {
    padding: 2px 4px;
    font-size: 90%;
    color: #c7254e;
    background-color: #f9f2f4;
    border-radius: 3px;
}

.notice_box_content {
    border: 1px solid #a25024;
    border-radius: 3px;
    color: #acb2b8;
    font-size: 14px;
    font-family: "Motiva Sans", Sans-serif;
    font-weight: normal;
    padding: 15px 15px;
    margin-bottom: 15px;
}

.notice_box_content b {
    font-weight: normal;
    color: #f47b20;
    float: left;
}

#unusedKeys {
    margin:0 15px;
}

#copyUnuseKey span {
    font-size: 15px;
    line-height: 20px;
}

#unusedKeyArea li {
    white-space: nowrap;
    color: #007fff;
}

.currency_change_option_ctn {
	vertical-align: top;
	margin: 0 6%;
}
.currency_change_option_ctn:first-child {
	margin-bottom: 12px;
}
.currency_change_option_ctn > p {
	font-size: 12px;
	margin: 8px 8px 0 8px;
}
.currency_change_option_ctn {
	vertical-align: top;
	margin: 0 6%;
}
.currency_change_option_ctn:first-child {
	margin-bottom: 12px;
}

.currency_change_option {
			font-family: "Motiva Sans", Sans-serif;
		font-weight: 300; /* light */

			display: block;
}

.currency_change_option > span {
	display: block;
	padding: 9px 19px;
}

.currency_change_option .country {
	font-size: 20px;
}
.currency_change_option .notes {
	font-size: 13px;
	line-height: 18px;
}

.currency_change_option_ctn > p {
	font-size: 12px;
	margin: 8px 8px 0 8px;
}

.asf-class input[type="text"]{
    border: 1px solid #c2e9ee;
    width:180px;
}

.asf-output{
    width:90%;
    min-height:150px;
}

.switch-key {
    margin:0 15%;
    height:100px;
}
.switch-key-left {
    float:left;
}
.switch-key-right {
    float:right;
}

.switch-key div {
    width: 50%;
    position: relative;
    cursor:default;
}
.switch-key input {
    margin:10px 0;
}
.switch-key p {
    font-size:25px;
    height:25px;
    color:black;
    margin:0;
}
.swal-content *{
    color:#000;
}
.swal-content textarea{
    background: #fff;
}
#allKey{
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;color: #333;
    background-color: #fff;
    border-color: #ccc;
}
#allKey:hover{
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
    text-decoration: none;
}
#allKey:focus{
    color: #333;
    background-color: #e6e6e6;
    border-color: #8c8c8c;
    text-decoration: none;
}
#allKey:active{
    background-image: none;
    outline: 0;
    -webkit-box-shadow: inset 0 3px 5px rgba(0,0,0,.125);
    box-shadow: inset 0 3px 5px rgba(0,0,0,.125);color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
}
.icon-img {
    position: absolute;
    width: 32px;
    height: 32px;
    margin: 0px!important;
}

.icon-div {
    width: 32px!important;
    height: 32px!important;
    display: none;
    background: #fff!important;
    border-radius: 16px!important;
    box-shadow: 4px 4px 8px #888!important;
    position: absolute!important;
    z-index: 2147483647!important;
    cursor: pointer;
}
`
}
