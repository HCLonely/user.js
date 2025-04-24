export const asfCommands = `
<table class="hclonely">
<thead>
<tr>
<th>命令</th>
<th>权限</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>2fa [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人生成临时的​<strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN">两步验证</a></strong>​令牌。</td>
</tr>
<tr>
<td><code>2fafinalize [Bots] &lt;ActivationCode&gt;</code></td>
<td><code>Master</code></td>
<td>使用短信或邮件验证码，完成为指定机器人绑定新<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据的流程。</td>
</tr>
<tr>
<td><code>2fafinalized [Bots] &lt;ActivationCode&gt;</code></td>
<td><code>Master</code></td>
<td>为指定机器人导入已创建完成的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据，并用两步验证令牌代码验证。</td>
</tr>
<tr>
<td><code>2fafinalizedforce [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人导入已创建完成的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据，并跳过两步验证令牌代码验证。</td>
</tr>
<tr>
<td><code>2fainit [Bots]</code></td>
<td><code>Master</code></td>
<td>开始为指定机器人绑定新<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据的流程。</td>
</tr>
<tr>
<td><code>2fano [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人拒绝所有等待操作的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN"><strong>两步验证</strong></a>交易确认。</td>
</tr>
<tr>
<td><code>2faok [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人接受所有等待操作的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN"><strong>两步验证</strong></a>交易确认。</td>
</tr>
<tr>
<td><code>addlicense [Bots] &lt;Licenses&gt;</code></td>
<td><code>Operator</code></td>
<td>为指定机器人激活给定的 <code>Licenses </code>（许可），该参数解释详见<a href="#addlicense-%E5%91%BD%E4%BB%A4%E7%9A%84-licenses-%E5%8F%82%E6%95%B0"><strong>下文</strong></a>。</td>
</tr>
<tr>
<td><code>balance [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 Steam 钱包余额。</td>
</tr>
<tr>
<td><code>bgr [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Background-games-redeemer-zh-CN">BGR</a></strong>（后台游戏激活器）队列信息。</td>
</tr>
<tr>
<td><code>bgrclear [Bots]</code></td>
<td><code>Master</code></td>
<td>清除指定机器人的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Background-games-redeemer-zh-CN"><strong>后台游戏激活器</strong></a>队列。</td>
</tr>
<tr>
<td><code>encrypt &lt;encryptionMethod&gt; &lt;stringToEncrypt&gt;</code></td>
<td><code>Owner</code></td>
<td>以给定的加密方式加密字符串——详见<a href="#encrypt-%E5%91%BD%E4%BB%A4"><strong>下文的解释</strong></a>。</td>
</tr>
<tr>
<td><code>exit</code></td>
<td><code>Owner</code></td>
<td>完全停止 ASF 进程。</td>
</tr>
<tr>
<td><code>farm [Bots]</code></td>
<td><code>Master</code></td>
<td>重新启动指定机器人的挂卡模块。</td>
</tr>
<tr>
<td><code>fb [Bots]</code></td>
<td><code>Master</code></td>
<td>列出指定机器人的自动挂卡黑名单。</td>
</tr>
<tr>
<td><code>fbadd [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 加入指定机器人的自动挂卡黑名单。</td>
</tr>
<tr>
<td><code>fbrm [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 从指定机器人的自动挂卡黑名单中移除。</td>
</tr>
<tr>
<td><code>fq [Bots]</code></td>
<td><code>Master</code></td>
<td>列出指定机器人的优先挂卡队列。</td>
</tr>
<tr>
<td><code>fqadd [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 加入指定机器人的优先挂卡队列。</td>
</tr>
<tr>
<td><code>fqrm [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 从指定机器人的优先挂卡队列中移除。</td>
</tr>
<tr>
<td><code>hash &lt;hashingMethod&gt; &lt;stringToHash&gt;</code></td>
<td><code>Owner</code></td>
<td>以指定的加密方式生成给定字符串的哈希值——详见<a href="#hash-%E5%91%BD%E4%BB%A4"><strong>下文的解释</strong></a>。</td>
</tr>
<tr>
<td><code>help</code></td>
<td><code>FamilySharing</code></td>
<td>显示帮助（指向此页面的链接）。</td>
</tr>
<tr>
<td><code>input [Bots] &lt;Type&gt; &lt;Value&gt;</code></td>
<td><code>Master</code></td>
<td>为指定机器人填写给定的输入值，仅在 <code>Headless</code> 模式中可用——详见<a href="#input-%E5%91%BD%E4%BB%A4"><strong>下文的解释</strong></a>。</td>
</tr>
<tr>
<td><code>inventory [Bots]</code></td>
<td><code>Operator</code></td>
<td>显示指定机器人的库存摘要。</td>
</tr>
<tr>
<td><code>level [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 Steam 帐户等级。</td>
</tr>
<tr>
<td><code>loot [Bots]</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
</tr>
<tr>
<td><code>loot@ [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有符合给定 <code>AppIDs</code> 的 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。 此命令与 <code>loot%</code> 相反。</td>
</tr>
<tr>
<td><code>loot% [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有不符合给定 <code>AppIDs</code> 的 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。 此命令与 <code>loot@</code> 相反。</td>
</tr>
<tr>
<td><code>loot^ [Bots] &lt;AppID&gt; &lt;ContextID&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 的物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
</tr>
<tr>
<td><code>loot&amp; [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;Rarities&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 并且符合给定 <strong><a href="#%E5%B7%B2%E7%9F%A5%E7%9A%84%E7%A8%80%E6%9C%89%E5%BA%A6"><code>Rarities</code></a></strong> 的物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
</tr>
<tr>
<td><code>mab [Bots]</code></td>
<td><code>Master</code></td>
<td>列出 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>MatchActively</code></a></strong> 自动交易的 App 黑名单。</td>
</tr>
<tr>
<td><code>mabadd [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 加入到 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>MatchActively</code></a></strong> 自动交易的 App 黑名单。</td>
</tr>
<tr>
<td><code>mabrm [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 从 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>MatchActively</code></a></strong> 自动交易的 App 黑名单中移除。</td>
</tr>
<tr>
<td><code>match [Bots]</code></td>
<td><code>Master</code></td>
<td>控制 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>ItemsMatcherPlugin</code></a></strong> 的特殊命令，用于立即触发 <code>MatchActively</code> 流程。</td>
</tr>
<tr>
<td><code>nickname [Bots] &lt;Nickname&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的昵称更改为 <code>Nickname</code>。</td>
</tr>
<tr>
<td><code>owns [Bots] &lt;Games&gt;</code></td>
<td><code>Operator</code></td>
<td>检查指定机器人是否已拥有 <code>Games</code>，该参数解释详见<a href="#owns-%E5%91%BD%E4%BB%A4%E7%9A%84-games-%E5%8F%82%E6%95%B0"><strong>下文</strong></a>。</td>
</tr>
<tr>
<td><code>pause [Bots]</code></td>
<td><code>Operator</code></td>
<td>永久暂停指定机器人的自动挂卡模块。 ASF 在本次会话中将不会再尝试对此帐户进行挂卡，除非您手动 <code>resume</code> 或者重启 ASF。</td>
</tr>
<tr>
<td><code>pause~ [Bots]</code></td>
<td><code>FamilySharing</code></td>
<td>临时暂停指定机器人的自动挂卡模块。 挂卡进程将会在下次游戏事件或者机器人断开连接时自动恢复。 您可以 <code>resume</code> 以恢复挂卡。</td>
</tr>
<tr>
<td><code>pause&amp; [Bots] &lt;Seconds&gt;</code></td>
<td><code>Operator</code></td>
<td>临时暂停指定机器人的自动挂卡模块 <code>Seconds</code> 秒。 之后，挂卡模块会自动恢复。</td>
</tr>
<tr>
<td><code>play [Bots] &lt;AppIDs,GameName&gt;</code></td>
<td><code>Master</code></td>
<td>切换到手动挂卡——使指定机器人运行给定的 <code>AppIDs</code>，并且可选自定义 <code>GameName</code> 为游戏名称。 若要此功能正常工作，您的 Steam 帐户<strong>必须</strong>拥有所有您指定的 <code>AppIDs</code> 的有效许可，包括免费游戏。 使用 <code>reset</code> 或 <code>resume</code> 命令恢复。</td>
</tr>
<tr>
<td><code>points [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 <a href="https://store.steampowered.com/points/shop" rel="nofollow"><strong>Steam 点数商店</strong></a>点数余额。</td>
</tr>
<tr>
<td><code>privacy [Bots] &lt;Settings&gt;</code></td>
<td><code>Master</code></td>
<td>更改指定机器人的 <strong><a href="https://steamcommunity.com/my/edit/settings" rel="nofollow">Steam 隐私设置</a></strong>，可用选项见<a href="#privacy-%E8%AE%BE%E7%BD%AE"><strong>下文</strong></a>。</td>
</tr>
<tr>
<td><code>redeem [Bots] &lt;Keys&gt;</code></td>
<td><code>Operator</code></td>
<td>为指定机器人激活给定的游戏序列号或钱包充值码。</td>
</tr>
<tr>
<td><code>redeem^ [Bots] &lt;Modes&gt; &lt;Keys&gt;</code></td>
<td><code>Operator</code></td>
<td>以 <code>Modes</code> 模式为指定机器人激活给定的游戏序列号或钱包充值码，模式详见下文的<a href="#redeem-%E6%A8%A1%E5%BC%8F"><strong>解释</strong></a>。</td>
</tr>
<tr>
<td><code>redeempoints [Bots] &lt;DefinitionIDs&gt;</code></td>
<td><code>Operator</code></td>
<td>为指定机器人以 <a href="https://store.steampowered.com/points/shop" rel="nofollow"><strong>Steam 点数</strong></a>兑换给定物品。 默认只允许免费物品，如果要无条件兑换物品，包括付费物品，则需要在每个符合条件的物品 <code>DefinitionID</code> 结尾添加 <code>!</code> 符号。</td>
</tr>
<tr>
<td><code>reset [Bots]</code></td>
<td><code>Master</code></td>
<td>重置为原始（之前的）游玩状态，用来配合 <code>play</code> 命令的手动挂卡模式使用。</td>
</tr>
<tr>
<td><code>restart</code></td>
<td><code>Owner</code></td>
<td>重新启动 ASF 进程。</td>
</tr>
<tr>
<td><code>resume [Bots]</code></td>
<td><code>FamilySharing</code></td>
<td>恢复指定机器人的自动挂卡进程。</td>
</tr>
<tr>
<td><code>start [Bots]</code></td>
<td><code>Master</code></td>
<td>启动指定机器人。</td>
</tr>
<tr>
<td><code>stats</code></td>
<td><code>Owner</code></td>
<td>显示进程统计信息，例如托管内存用量。</td>
</tr>
<tr>
<td><code>status [Bots]</code></td>
<td><code>FamilySharing</code></td>
<td>显示指定机器人的状态。</td>
</tr>
<tr>
<td><code>std [Bots]</code></td>
<td><code>Master</code></td>
<td>控制 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/SteamTokenDumperPlugin-zh-CN"><code>SteamTokenDumperPlugin</code></a></strong> 的特殊命令，用于触发刷新指定的机器人并立即提交数据。</td>
</tr>
<tr>
<td><code>stop [Bots]</code></td>
<td><code>Master</code></td>
<td>停止指定机器人。</td>
</tr>
<tr>
<td><code>tb [Bots]</code></td>
<td><code>Master</code></td>
<td>列出指定机器人的交易黑名单用户。</td>
</tr>
<tr>
<td><code>tbadd [Bots] &lt;SteamIDs64&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>SteamIDs</code> 加入指定机器人的交易黑名单。</td>
</tr>
<tr>
<td><code>tbrm [Bots] &lt;SteamIDs64&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>SteamIDs</code> 从指定机器人的交易黑名单中移除。</td>
</tr>
<tr>
<td><code>transfer [Bots] &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。</td>
</tr>
<tr>
<td><code>transfer@ [Bots] &lt;AppIDs&gt; &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有符合给定 <code>AppIDs</code> 的 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。 此命令与 <code>transfer%</code> 相反。</td>
</tr>
<tr>
<td><code>transfer% [Bots] &lt;AppIDs&gt; &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有不符合给定 <code>AppIDs</code> 的 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。 此命令与 <code>transfer@</code> 相反。</td>
</tr>
<tr>
<td><code>transfer^ [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 的物品转移到一个目标机器人。</td>
</tr>
<tr>
<td><code>transfer&amp; [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt; &lt;Rarities&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 并且符合给定 <strong><a href="#%E5%B7%B2%E7%9F%A5%E7%9A%84%E7%A8%80%E6%9C%89%E5%BA%A6"><code>Rarities</code></a></strong> 的物品转移到一个目标机器人。</td>
</tr>
<tr>
<td><code>unpack [Bots]</code></td>
<td><code>Master</code></td>
<td>拆开指定机器人库存中的所有补充包。</td>
</tr>
<tr>
<td><code>update [Channel]</code></td>
<td><code>Owner</code></td>
<td>在 GitHub 上检查 ASF 新版本，如果可用则更新。 通常这会每隔 <code>UpdatePeriod</code> 自动执行一次。 可选的 <code>Channel</code> 参数指定 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#updatechannel"><code>UpdateChannel</code></a></strong>，如果未提供，则默认使用全局设置中的值。 <code>Channel</code> 可以用 <code>!</code> 字符结尾，这会强制在指定频道上更新——包括降级等操作。</td>
</tr>
<tr>
<td><code>updateplugins [Channel] [Plugins]</code></td>
<td><code>Owner</code></td>
<td>更新指定的插件。 如果插件支持多个更新频道，可选的 <code>Channel</code> 参数允许您选择不同的 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#updatechannel"><code>UpdateChannel</code></a></strong> 进行更新。 <code>Channel</code> 可以用 <code>!</code> 字符结尾，这会强制在指定频道上更新——包括降级等操作，但具体的功能取决于插件自身。 如果不指定 <code>Plugins</code>，则所有由 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#pluginsupdatelist"><code>PluginsUpdateList</code></a></strong> 和 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#pluginsupdatemode"><code>PluginsUpdateMode</code></a></strong> 配置判断为允许自动更新的插件都会被更新。 如果您要更新指定插件，特别是已经默认禁用自动更新的，则需要同时提供 <code>Channel</code> 和 <code>Plugins</code> 参数，这样 ASF 就会忽略其自动更新设置，强行更新它们。</td>
</tr>
<tr>
<td><code>version</code></td>
<td><code>FamilySharing</code></td>
<td>显示 ASF 的版本号。</td>
</tr>
</tbody>
</table>
`;
