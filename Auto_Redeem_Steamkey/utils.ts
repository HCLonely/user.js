import { webRedeem } from "./steamWeb";
import { asfRedeem } from "./asf";
import type swal from "sweetalert";

export function mouseClick($: JQueryStatic, e: JQuery.ClickEvent): void {
  const $i = $('<span/>').text('Steam Key');
  const x = e.pageX;
  const y = e.pageY;
  $i.css({
    'z-index': 9999999999999999999,
    top: y - 20,
    left: x,
    position: 'absolute',
    'font-weight': 'bold',
    color: '#ff6651'
  });
  $('body').append($i);
  $i.animate({ top: y - 180, opacity: 0 }, 1500, () => {
    $i.remove();
  });
}

export function addBtn(): HTMLButtonElement {
  const div = $('<div id="keyDiv" style="position:fixed;left:5px;bottom:5px"></div>');
  const btn = $('<button id="allKey" class="btn btn-default" key="" style="display:none;z-index:9999">激活本页面所有key(共0个)</button>')[0] as HTMLButtonElement;

  btn.onclick = function () {
    const setting = GM_getValue<setting>('setting') || {};
    const keys = getKeysByRE($(this).attr('key') || '');
    if (setting.asf) {
      asfRedeem(`!redeem ${setting.asfBot} ${keys.join(',')}`);
    } else if (setting.newTab) {
      window.open(`https://store.steampowered.com/account/registerkey?key=${keys.join(',')}`, '_blank');
    } else {
      webRedeem(keys.join(','));
    }
  };

  div.append(btn);
  $('body').append(div);
  return btn;
}

export function redeemAllKey(): void {
  let len = 0;
  let keyList = '';
  let hasKey: string[] = [];
  const btn = addBtn();

  setInterval(() => {
    const allSteamKey = arr(getKeysByRE($('body').text() || '')) || [];
    len = allSteamKey.length;

    if (len > 0) {
      hasKey.push(...allSteamKey);
      hasKey = arr(hasKey);
      keyList = hasKey.join(',');

      if ($(btn).attr('key') !== keyList) {
        $(btn)
          .attr('key', keyList)
          .text(`激活本页面所有key(共${hasKey.length}个)`)
          .show();
      }
    } else if (document.getElementById('allKey')?.style?.display === 'block') {
      $(btn)
        .hide()
        .text('激活本页面所有key(共0个)');
    }
  }, 1000);
}

export function arr<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export async function httpRequest(options: GMRequestDetails, times = 0): Promise<any> {
  if (window.TRACE) {
    console.trace('%cAuto-Task[Debug]:', 'color:blue');
  }

  try {
    const result: {
      result: string,
      statusText: string,
      status: number,
      data: any,
      options: GMRequestDetails
    } = await new Promise((resolve) => {
      if (options.dataType) {
        options.responseType = options.dataType;
      }

      const requestObj = {
        timeout: 30000,
        ontimeout(data: GMResponse) {
          resolve({
            result: 'Error',
            statusText: 'Timeout',
            status: 601,
            data,
            options
          });
        },
        onabort(data: GMResponse) {
          resolve({
            result: 'Error',
            statusText: 'Aborted',
            status: 602,
            data,
            options
          });
        },
        onerror(data: GMResponse) {
          resolve({
            result: 'Error',
            statusText: 'Error',
            status: 603,
            data,
            options
          });
        },
        onload(data: GMResponse) {
          if (options.responseType === 'json' && data?.responseText && typeof data.response !== 'object') {
            try {
              data.response = JSON.parse(data.responseText);
            } catch (error) {}
          }
          resolve({
            result: 'Success',
            statusText: 'Load',
            status: 600,
            data,
            options
          });
        },
        ...options
      };

      GM_xmlhttpRequest(requestObj);
    });

    if (window.DEBUG) {
      console.log('%cAuto-Task[httpRequest]:', 'color:blue', JSON.stringify(result));
    }

    if (result.status !== 600 && times < 2) {
      return await httpRequest(options, times + 1);
    }

    return result;
  } catch (error) {
    console.log('%cAuto-Task[httpRequest]:', 'color:red', JSON.stringify({
      errorMsg: error,
      options
    }));
    return {
      result: 'JsError',
      statusText: 'Error',
      status: 604,
      error,
      options
    };
  }
}


export function settingChange(): void {
  const setting: setting = GM_getValue<setting>('setting') || globalThis.defaultSetting;
  const div = $(`
      <div id="hclonely-asf">
        <input type="checkbox" name="newTab" ${setting.newTab ? 'checked=checked' : ''} title="开启ASF激活后此功能无效"/>
        <span title="开启ASF激活后此功能无效">新标签页激活</span>
        <br/>
        <input type="checkbox" name="copyListen" ${setting.copyListen ? 'checked=checked' : ''} title="复制key时询问是否激活"/>
        <span title="复制key时询问是否激活">开启复制捕捉</span>
        <input type="checkbox" name="selectListen" ${setting.selectListen ? 'checked=checked' : ''} title="选中key时显示激活图标"/>
        <span title="选中key时显示激活图标">开启选中捕捉</span>
        <input type="checkbox" name="clickListen" ${setting.clickListen ? 'checked=checked' : ''} title="点击key时添加激活链接"/>
        <span title="点击key时添加激活链接">开启点击捕捉</span><br/>
        <input type="checkbox" name="allKeyListen" ${setting.allKeyListen ? 'checked=checked' : ''} title="匹配页面内所有符合steam key格式的内容"/>
        <span title="匹配页面内所有符合steam key格式的内容">捕捉页面内所有key</span>
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
      </div>`)[0];

  swal({
    closeOnClickOutside: false,
    className: 'asf-class',
    title: '全局设置',
    //@ts-ignore
    content: div,
    //@ts-ignore
    buttons: {
      save: '保存',
      showHistory: '上次激活记录',
      showSwitchKey: 'Key格式转换',
      cancel: '取消'
    }
  }).then((value: string | null) => {
    if (value === 'save') {
      const newSetting: Partial<setting> = {};
      $('#hclonely-asf input').each(function (index, element) {
        const name = $(element).attr('name') as keyof setting;
        if (name) {
          //@ts-ignore
          newSetting[name] = (element as HTMLInputElement).type === 'checkbox' ? (element as HTMLInputElement).checked : (element as HTMLInputElement).value;
        }
      });
      GM_setValue('setting', newSetting);
      swal({
        closeOnClickOutside: false,
        icon: 'success',
        title: '保存成功！',
        text: '刷新页面后生效！',
        //@ts-ignore
        buttons: {
          confirm: '确定'
        }
      });
    } else if (value === 'showHistory') {
      showHistory();
    } else if (value === 'showSwitchKey') {
      showSwitchKey();
    }
  });
}

export function showHistory(): void {
  const history = GM_getValue<[string, string | null]>('history');

  if (Array.isArray(history)) {
    swal({
      closeOnClickOutside: false,
      className: 'swal-user',
      title: '上次激活记录：',
      //@ts-ignore
      content: $(history[0])[0],
      //@ts-ignore
      buttons: {
        confirm: '确定'
      }
    });
    if (history[1]) {
      $('.swal-content textarea').val(history[1]);
    }
  } else {
    swal({
      closeOnClickOutside: false,
      title: '没有操作记录！',
      icon: 'error',
      //@ts-ignore
      buttons: {
        cancel: '关闭'
      }
    });
  }
}

export function showSwitchKey(): void {
  swal({
    closeOnClickOutside: false,
    title: '请选择要转换成什么格式：',
    //@ts-ignore
    buttons: {
      confirm: '确定',
      cancel: '关闭'
    },
    //@ts-ignore
    content: $('<div class="switch-key"><div class="switch-key-left"><p>key</p><p>key</p><p>key</p><input name="keyType" type="radio" value="1"/></div><div class="switch-key-right"><p>&nbsp;</p><p>key,key,key</p><p>&nbsp;</p><input name="keyType" type="radio" value="2"/></div></div>')[0]
  }).then((value: string | null) => {
    if (value) {
      const selectedValue = $('input:radio:checked').val() as string | undefined;
      if (selectedValue) {
        showSwitchArea(selectedValue);
      } else {
        swal({
          closeOnClickOutside: false,
          title: '请选择要将key转换成什么格式！',
          icon: 'warning'
        }).then(() => showSwitchKey());
      }
    }
  });
  $('.switch-key div').each(function () {
    $(this).on('click', function () {
      $(this).find('input')[0].click();
    });
  });
}



export function showSwitchArea(type: string): void {
  swal({
    closeOnClickOutside: false,
    title: '请输入要转换的key:',
    //@ts-ignore
    content: $('<textarea style="width: 80%;height: 100px;"></textarea>')[0],
    //@ts-ignore
    buttons: {
      confirm: '转换',
      back: '返回',
      cancel: '关闭'
    }
  }).then((value: string | null) => {
    if (value === 'back') {
      showSwitchKey();
    } else if (value) {
      const inputKey = $('.swal-content textarea').val() as string | undefined;
      if (inputKey) {
        switchKey(inputKey, type);
      }
    }
  });
}

export function switchKey(key: string, type: string): void {
  switch (type) {
    case '1':
      showKey(getKeysByRE(key).join('\n'), type);
      break;
    case '2':
      showKey(getKeysByRE(key).join(','), type);
      break;
    default:
      break;
  }
}

export function showKey(key: string, type: string): void {
  swal({
    closeOnClickOutside: false,
    icon: 'success',
    title: '转换成功！',
    //@ts-ignore
    content: $(`<textarea style="width: 80%;height: 100px;" readonly="readonly">${key}</textarea>`)[0],
    //@ts-ignore
    buttons: {
      confirm: '返回',
      cancel: '关闭'
    }
  }).then((value: string | null) => {
    if (value) {
      showSwitchArea(type);
    }
  });
  $('.swal-content textarea').on('click', function () {
    (this as HTMLTextAreaElement).select();
  });
}

export function getKeysByRE(text: string): string[] {
  text = text.trim().toUpperCase();
  const reg = new RegExp('([0-9A-Z]{5}-){2,4}[0-9A-Z]{5}', 'g');
  const keys: string[] = [];

  let result: RegExpExecArray | null;
  while ((result = reg.exec(text))) { // eslint-disable-line no-cond-assign
    keys.push(result[0]);
  }

  return keys;
}
