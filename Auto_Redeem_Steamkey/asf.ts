/*
 * @Author       : HCLonely
 * @Date         : 2025-04-24 09:33:07
 * @LastEditTime : 2025-07-15 16:53:06
 * @LastEditors  : HCLonely
 * @FilePath     : /user.js/Auto_Redeem_Steamkey/asf.ts
 * @Description  :
 */
import { arr, getKeysByRE } from './utils';
import { asfCommands } from './asfCmd';

// ASF API 响应类型
interface ASFResponse {
  Success?: boolean;
  Message?: string;
  Result?: string;
}

// 通用 ASF API 调用配置
const getASFConfig = (setting: Setting) => ({
  protocol: setting.asfProtocol,
  host: setting.asfHost,
  port: setting.asfPort,
  password: setting.asfPassword
});

// 通用 ASF API 请求头
const getASFHeaders = (setting: Setting) => {
  const { protocol, host, port } = getASFConfig(setting);
  return {
    accept: 'application/json',
    'Content-Type': 'application/json',
    Authentication: setting.asfPassword,
    Host: `${host}:${port}`,
    Origin: `${protocol}://${host}:${port}`,
    Referer: `${protocol}://${host}:${port}/page/commands`
  };
};

// 获取 ASF API URL
const getASFUrl = (setting: Setting) => {
  const { protocol, host, port } = getASFConfig(setting);
  return `${protocol}://${host}:${port}/Api/Command`;
};

export function asfSend(command: string = ''): void {
  const setting = GM_getValue<Setting>('setting') || globalThis.defaultSetting;

  if (!setting?.asf) {
    swal({
      closeOnClickOutside: false,
      className: 'swal-user',
      icon: 'warning',
      title: '此功能需要在设置中配置ASF IPC并开启ASF功能！',
      //@ts-ignore
      buttons: {
        confirm: '确定'
      }
    });
    return;
  }

  swal({
    closeOnClickOutside: false,
    className: 'swal-user',
    text: '请在下方输入要执行的ASF指令：',
    content: {
      element: 'input',
      attributes: {
        placeholder: '输入ASF指令'
      }
    },
    //@ts-ignore
    buttons: {
      test: '连接测试',
      redeem: '激活key',
      pause: '暂停挂卡',
      resume: '恢复挂卡',
      '2fa': '获取令牌',
      '2faok': '2faok',
      more: '更多ASF指令',
      confirm: '确定',
      cancel: '取消'
    }
  }).then((value: string | null) => {
    switch (value) {
      case 'redeem':
        swalRedeem();
        break;
      case 'pause':
      case 'resume':
      case '2fa':
      case '2faok':
        asfRedeem(`!${value}`);
        break;
      case 'test':
        asfTest();
        break;
      case 'more':
        swal({
          closeOnClickOutside: false,
          className: 'swal-user',
          text: 'ASF指令',
          //@ts-ignore
          content: $(asfCommands)[0],
          //@ts-ignore
          buttons: {
            confirm: '返回',
            cancel: '关闭'
          }
        }).then((value: string | null) => {
          if (value) asfSend();
        });

        $('table.hclonely button.swal-button').on('click', function () {
          const command = setting.asfBot
            ? $(this)
                .parent()
                .next()
                .text()
                .trim()
                .replace(/<Bots>/gim, setting.asfBot)
            : $(this)
                .parent()
                .next()
                .text()
                .trim();
          asfSend(command);
        });
        break;
      case null:
        break;
      default:
        const inputValue = $('.swal-content__input').val()?.toString()?.trim();
        if (!inputValue) {
          swal({
            closeOnClickOutside: false,
            title: 'ASF指令不能为空！',
            icon: 'warning',
            //@ts-ignore
            buttons: {
              confirm: '确定'
            }
          }).then(() => {
            asfSend(command);
          });
        } else {
          const finalCommand = value || inputValue;
          if (finalCommand) asfRedeem(finalCommand);
        }
        break;
    }
  });

  if (command) {
    $('.swal-content__input').val(`!${command}`);
  }
}

export function swalRedeem(): void {
  swal({
    closeOnClickOutside: false,
    className: 'swal-user',
    title: '请输入要激活的key:',
    //@ts-ignore
    content: $('<textarea id="keyText" class="asf-output"></textarea>')[0] as HTMLElement,
    //@ts-ignore
    buttons: {
      confirm: '激活',
      cancel: '返回'
    }
  }).then((value: string | null) => {
    if (value) {
      const key = getKeysByRE($('#keyText').val()?.toString()?.trim() || '');
      if (key.length > 0) {
        const setting = GM_getValue<Setting>('setting') || globalThis.defaultSetting;
        const asfBot = setting.asfBot ? `${setting.asfBot} ` : '';
        asfRedeem(`!redeem ${asfBot}${key.join(',')}`);
      } else {
        swal({
          closeOnClickOutside: false,
          title: 'steam key不能为空！',
          icon: 'error',
          //@ts-ignore
          buttons: {
            confirm: '返回',
            cancel: '关闭'
          }
        }).then((value: string | null) => {
          if (value) {
            swalRedeem();
          }
        });
      }
    } else {
      asfSend();
    }
  });
}

export function asfTest(): void {
  const setting = GM_getValue<Setting>('setting') || globalThis.defaultSetting;
  if (!setting.asf) {
    swal({
      closeOnClickOutside: false,
      title: '请先在设置中开启ASF功能',
      icon: 'warning',
      //@ts-ignore
      buttons: {
        confirm: '确定'
      }
    });
    return;
  }

  const apiUrl = getASFUrl(setting);

  swal({
    closeOnClickOutside: false,
    title: 'ASF连接测试',
    text: `正在尝试连接 "${apiUrl}"`,
    //@ts-ignore
    buttons: {
      confirm: '确定'
    }
  });

  GM_xmlhttpRequest({
    method: 'POST',
    url: apiUrl,
    data: '{"Command":"!stats"}',
    responseType: 'json',
    headers: getASFHeaders(setting),
    onload(data: GMResponse): void {
      const response = data.response as ASFResponse;

      if (data.status === 200) {
        if (response?.Success === true && response.Message === 'OK' && response.Result) {
          swal({
            closeOnClickOutside: false,
            title: 'ASF连接成功！',
            icon: 'success',
            text: `连接地址 "${apiUrl}" \n返回内容 "${response.Result.trim()}"`,
            //@ts-ignore
            buttons: {
              confirm: '确定'
            }
          });
        } else if (response?.Message) {
          swal({
            closeOnClickOutside: false,
            title: 'ASF连接成功？',
            icon: 'info',
            text: `连接地址 "${apiUrl}" \n返回内容 "${response.Message.trim()}"`,
            //@ts-ignore
            buttons: {
              confirm: '确定'
            }
          });
        } else {
          swal({
            closeOnClickOutside: false,
            title: 'ASF连接失败！',
            icon: 'error',
            text: `连接地址 "${apiUrl}" \n返回内容 "${data.responseText}"`,
            //@ts-ignore
            buttons: {
              confirm: '确定'
            }
          });
        }
      } else {
        swal({
          closeOnClickOutside: false,
          title: `ASF连接失败：${data.status}`,
          icon: 'error',
          text: `连接地址 "${apiUrl}"`,
          //@ts-ignore
          buttons: {
            confirm: '确定'
          }
        });
      }
    },
    onabort(): void {
      showErrorDialog('ASF连接失败：aborted', apiUrl);
    },
    onerror(): void {
      showErrorDialog('ASF连接失败：error', apiUrl);
    },
    ontimeout(): void {
      showErrorDialog('ASF连接失败：timeout', apiUrl);
    }
  });
}

// 显示错误对话框
function showErrorDialog(title: string, apiUrl: string): void {
  swal({
    closeOnClickOutside: false,
    title,
    icon: 'error',
    text: `连接地址 "${apiUrl}"`,
    //@ts-ignore
    buttons: {
      confirm: '确定'
    }
  });
}

export function asfRedeem(command: string): void {
  const setting = GM_getValue<Setting>('setting') || globalThis.defaultSetting;
  const apiUrl = getASFUrl(setting);

  const textarea = document.createElement('textarea');
  textarea.setAttribute('class', 'asf-output');
  textarea.setAttribute('readonly', 'readonly');

  const btn = /!redeem/gim.test(command)
    ? { confirm: '提取未使用key', cancel: '关闭' }
    : { confirm: '确定' };

  swal({
    closeOnClickOutside: false,
    className: 'swal-user',
    text: `正在执行ASF指令：${command}`,
    //@ts-ignore
    content: textarea as HTMLElement,
    //@ts-ignore
    buttons: btn
  }).then((v: boolean | null) => {
    if (/!redeem/gim.test(command)) {
      let value = '';
      const textareaElement = $('.swal-content textarea');
      if (textareaElement.length > 0) {
        value = textareaElement.val()?.toString() || '';
      }
      GM_setValue('history', [$('.swal-content').html() || '', value]);

      if (v) {
        const unUseKey = textareaElement
          .val()
          ?.toString()
          ?.split(/[(\r\n)\r\n]+/)
          .filter((e) => /未使用/gim.test(e || ''))
          .join(',');
        if (unUseKey) {
          GM_setClipboard(arr(getKeysByRE(unUseKey)).join(','));
          swal({ title: '复制成功！', icon: 'success' });
        }
      }
    }
  });

  GM_xmlhttpRequest({
    method: 'POST',
    url: apiUrl,
    data: JSON.stringify({ Command: command }),
    responseType: 'json',
    headers: getASFHeaders(setting),
    onload(data: GMResponse): void {
      console.log(data);
      console.log(command);

      if (data.status === 200) {
        if (data.response?.Success && data.response.Message === 'OK' && data.response.Result) {
          textarea.value += `${data.response.Result.trim()} \n`;
        } else if (data.response?.Message) {
          textarea.value += `${data.response.Message.trim()} \n`;
        } else {
          textarea.value += data.responseText || '';
        }
      } else {
        swal({
          closeOnClickOutside: false,
          className: 'swal-user',
          title: `执行ASF指令(${command})失败！请检查ASF配置是否正确！`,
          text: data.responseText || data.status.toString(),
          icon: 'error',
          //@ts-ignore
          buttons: {
            confirm: '关闭'
          }
        });
      }
    },
    onabort(): void {
      swal({
        closeOnClickOutside: false,
        className: 'swal-user',
        title: `执行ASF指令(${command})失败！请检查网络！`,
        text: 'aborted',
        icon: 'error',
        //@ts-ignore
        buttons: {
          confirm: '关闭'
        }
      });
    },
    onerror(error: any): void {
      console.error(error);
      swal({
        closeOnClickOutside: false,
        className: 'swal-user',
        title: `执行ASF指令(${command})失败！请检查控制台日志！`,
        text: 'error',
        icon: 'error',
        //@ts-ignore
        buttons: {
          confirm: '关闭'
        }
      });
    },
    ontimeout(): void {
      swal({
        closeOnClickOutside: false,
        className: 'swal-user',
        title: `执行ASF指令(${command})失败！请检查网络！`,
        text: '连接超时',
        icon: 'error',
        //@ts-ignore
        buttons: {
          confirm: '关闭'
        }
      });
    }
  });
}
