import Swal from "sweetalert2";

interface settings {
  newTab: boolean
  copyListen: boolean
  selectListen: boolean
  clickListen: boolean
  allKeyListen: boolean
  asf: boolean
  asfProtocol: 'http' | 'https' | 'ws' | 'wss'
  asfHost: string
  asfPort: `${number}`
  asfPassword: string
  asfBot?: string
}
const defaultSettings: settings = {
  newTab: false,
  copyListen: true,
  selectListen: true,
  clickListen: true,
  allKeyListen: false,
  asf: false,
  asfProtocol: 'http',
  asfHost: '127.0.0.1',
  asfPort: '1242',
  asfPassword: '',
  asfBot: ''
};
function settings() {
  const setting = { ...defaultSettings, ...GM_getValue<settings>('setting')};
  const html = `
      <div id="hclonely-asf">
        <input type="checkbox" name="newTab" ${setting.newTab ? 'checked=checked' : ''} title="开启ASF激活后此功能无效"/>
        <span title="开启ASF激活后此功能无效">新标签页激活</span>
        <br/>
        <input type="checkbox" name="copyListen" ${setting.copyListen ? 'checked=checked' : ''} title="复制key时询问是否激活"/>
        <span title="复制key时询问是否激活">开启复制捕捉</span>
        <input type="checkbox" name="selectListen" ${setting.selectListen ? 'checked=checked' : ''} title="选中key时显示激活图标"/>
        <span title="选中key时显示激活图标">开启选中捕捉</span>
        <input type="checkbox" name="clickListen" ${setting.clickListen ? 'checked=checked' : ''} title="点击key时添加激活链接"/>
        <span title="点击key时添加激活链接">开启点击捕捉</  span><br/>
        <input type="checkbox" name="allKeyListen" ${setting.allKeyListen ? 'checked=checked' : ''} title="匹配页面内所有符合steam key格式的内容"/>
        <span title="匹配页面内所有符合steam key 格式的内容">捕捉页面内所有key</span>
        <div class="swal-title">ASF IPC设置</div>
        <span>ASF IPC协议</span><input type="text" name="asfProtocol" value='${setting.asfProtocol}' placeholder="http或https,默认为http"/>
        <br/>
        <span>ASF IPC地址</span><input type="text" name="asfHost" value='${setting.asfHost}' placeholder="ip地址或域名,默认为127.0.0.1"/>
        <br/>
        <span>ASF IPC端口</span><input type="text" name="asfPort" value='${setting.asfPort}' placeholder="默认1242"/>
        <br/>
        <span>ASF IPC密码</span><input type="text" name="asfPassword" value='${setting.asfPassword}' placeholder="ASF IPC密码"/>
        <br/>
        <span>ASF Bot名字</span><input type="text" name="asfBot" value='${setting.asfBot}' placeholder="ASF Bot name,可留空"/>
        <br/>
        <input type="checkbox" name="asf" ${setting.asf ? 'checked=checked' : ''} title="此功能默认关闭新标签页激活"/>
        <span title="此功能默认关闭新标签页激活">开启ASF激活</span>
      </div>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-type="showHistory">上次激活记录</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-type="showSwitchKey">Key格式转换</button>`;

  Swal.fire({
    allowOutsideClick: false,
    title: '全局设置',
    html,
    showCancelButton: true,
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        $('#hclonely-asf input').map(function (index, ele) {
          //@ts-ignore
          defaultSettings[$(ele).attr('name') as keyof settings] = (<HTMLInputElement>ele).value === 'on' ? (<HTMLInputElement>ele).checked : (<HTMLInputElement>ele).value;
        });
        GM_setValue('setting', defaultSettings);
        Swal.fire('保存成功！', '刷新页面后生效！', 'success');
      }
    });

  $('.auto-redeem-key').on('click', (event) => {
    const buttonType = $(event.target).attr('data-type');
    if (buttonType === 'showHistory') {
      showHistory();
    } else if (buttonType === 'showSwitchKey') {
      showSwitchKey();
    }
  });
}
