import { webRedeem } from './steamWeb';
import { asfRedeem } from './asf';
import { getKeysByRE } from './utils';

export function redeemKey(key: string): void {
  const failureDetail = {
    14: '无效激活码',
    15: '重复激活',
    53: '次数上限',
    13: '地区限制',
    9: '已拥有',
    24: '缺少主游戏',
    36: '需要PS3?',
    50: '这是充值码'
  };
  GM_xmlhttpRequest({
    url: 'https://store.steampowered.com/account/ajaxregisterkey/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Origin: 'https://store.steampowered.com',
      Referer: 'https://store.steampowered.com/account/registerkey'
    },
    data: `product_key=${key}&sessionid=${globalThis.sessionID}`,
    method: 'POST',
    responseType: 'json',
    onloadstart(): void {
      if ($(globalThis.selecter + 'table').is(':hidden')) {
        $(globalThis.selecter + 'table').fadeIn();
      }
    },
    onload(response): void {
      if (response.status === 200 && response.response) {
        const data = response.response;
        if (data.success === 1) {
          tableUpdateKey(
            key,
            globalThis.myTexts.success,
            globalThis.myTexts.line,
            data.purchase_receipt_info.line_items[0].packageid,
            data.purchase_receipt_info.line_items[0].line_item_description
          );
          return;
        } else if (data.purchase_result_details !== undefined && data.purchase_receipt_info) {
          if (!data.purchase_receipt_info.line_items[0]) {
            tableUpdateKey(
              key,
              globalThis.myTexts.fail,
              failureDetail[data.purchase_result_details] ? failureDetail[data.purchase_result_details] : globalThis.myTexts.others,
              0,
              globalThis.myTexts.nothing
            );
          } else {
            tableUpdateKey(
              key,
              globalThis.myTexts.fail,
              failureDetail[data.purchase_result_details] ? failureDetail[data.purchase_result_details] : globalThis.myTexts.others,
              data.purchase_receipt_info.line_items[0].packageid,
              data.purchase_receipt_info.line_items[0].line_item_description
            );
          }
          return;
        }
        tableUpdateKey(key, globalThis.myTexts.fail, globalThis.myTexts.nothing, 0, globalThis.myTexts.nothing);
      } else {
        tableUpdateKey(key, globalThis.myTexts.fail, globalThis.myTexts.network, 0, globalThis.myTexts.nothing);
      }
    },
    ontimeout: (): void => {
      tableUpdateKey(key, globalThis.myTexts.fail, globalThis.myTexts.network, 0, globalThis.myTexts.nothing);
    },
    onerror: (): void => {
      tableUpdateKey(key, globalThis.myTexts.fail, globalThis.myTexts.network, 0, globalThis.myTexts.nothing);
    },
    onabort: (): void => {
      tableUpdateKey(key, globalThis.myTexts.fail, globalThis.myTexts.network, 0, globalThis.myTexts.nothing);
    }
  });
}

export function setUnusedKeys(
  key: string,
  success: boolean,
  reason: string,
  subId: number,
  subName: string
): void {
  const unusedKeyReasons = [
    '次数上限',
    '地区限制',
    '已拥有',
    '缺少主游戏',
    '其他错误',
    '未知错误',
    '网络错误或超时'
  ];
  if (success && globalThis.allUnusedKeys.includes(key)) {
    let listObject: JQuery<HTMLElement> | undefined;
    globalThis.allUnusedKeys = globalThis.allUnusedKeys.filter((keyItem) => keyItem !== key);

    $(`${globalThis.selecter}li`).each((i, e) => {
      if ($(e).html()?.includes(key)) {
        listObject = $(e);
        listObject.remove();
      }
    });
  } else if (!success && !globalThis.allUnusedKeys.includes(key) && unusedKeyReasons.includes(reason)) {
    const listObject = $('<li></li>');
    listObject.html(
      `${key} (${reason}${subId !== 0 ? `: <code>${subId}</code> ${subName}` : ''})`
    );
    $('#unusedKeys').append(listObject);

    globalThis.allUnusedKeys.push(key);
  }
}

export function tableInsertKey(key: string): void {
  globalThis.keyCount++;
  const row = $('<tr></tr>');
  row.append(`<td class="nobr">${globalThis.keyCount}</td>`);
  row.append(`<td class="nobr"><code>${key}</code></td>`);
  row.append(`<td colspan="3">${globalThis.myTexts.redeeming}...</td>`);

  $(`${globalThis.selecter}tbody`).prepend(row);
}

export function tableWaitKey(key: string): void {
  globalThis.keyCount++;
  const row = $('<tr></tr>');
  row.append(`<td class="nobr">${globalThis.keyCount}</td>`);
  row.append(`<td class="nobr"><code>${key}</code></td>`);
  row.append(`<td colspan="3">${globalThis.myTexts.waiting} (${globalThis.waitingSeconds}秒)...</td>`);

  $(`${globalThis.selecter}tbody`).prepend(row);
}

export function tableUpdateKey(
  key: string,
  result: string,
  detail: string,
  subId: number,
  subName: string
): void {
  setUnusedKeys(key, result === globalThis.myTexts.success, detail, subId, subName);

  globalThis.recvCount++;
  if (!globalThis.selecter && globalThis.recvCount === globalThis.keyCount) {
    $('#buttonRedeem').fadeIn();
    $('#inputKey').removeAttr('disabled');
  }

  const rowObjects = $(`${globalThis.selecter}tr`);
  for (let i = 1; i < rowObjects.length; i++) {
    const rowElement = rowObjects[i];
    const rowObject = $(rowElement);

    if (
      rowObject.children()[1].innerHTML.includes(key) &&
      rowObject.children()[2].innerHTML.includes(globalThis.myTexts.redeeming)
    ) {
      rowObject.children()[2].remove();
      if (result === globalThis.myTexts.fail) {
        rowObject.append(`<td class="nobr" style="color:red">${result}</td>`);
      } else {
        rowObject.append(`<td class="nobr" style="color:green">${result}</td>`);
      }
      rowObject.append(`<td class="nobr">${detail}</td>`);
      if (subId === 0) {
        rowObject.append('<td>——</td>');
      } else {
        rowObject.append(
          `<td><code>${subId}</code> <a href="https://steamdb.info/sub/${subId}/" target="_blank">${subName}</a></td>`
        );
      }
      break;
    }
  }
}

export function startTimer(): void {
  const timer = setInterval(() => {
    let flag = false;
    let nowKey = 0;

    const rowObjects = $(`${globalThis.selecter}tr`);
    for (let i = rowObjects.length - 1; i >= 1; i--) {
      const rowElement = rowObjects[i];
      const rowObject = $(rowElement);
      const cellContent = rowObject.children()[2]?.innerHTML;

      if (cellContent?.includes(globalThis.myTexts.waiting)) {
        nowKey++;
        if (nowKey <= globalThis.autoDivideNum) {
          let key = rowObject.children()[1]?.innerHTML.substring(6);
          key = key?.substring(0, key.indexOf('</code>')) || '';
          rowObject.children()[2].innerHTML = `<td colspan="3">${globalThis.myTexts.redeeming}...</td>`;
          redeemKey(key);
        } else {
          flag = true;
          break;
        }
      }
    }
    if (!flag) {
      clearInterval(timer);
    }
  }, 1000 * globalThis.waitingSeconds);
}

export function redeem(keys: string[]): void {
  if (keys.length <= 0) {
    return;
  }

  if (!globalThis.selecter) {
    $('#buttonRedeem').hide();
    $('#inputKey').attr('disabled', 'disabled');
  }

  let nowKey = 0;
  keys.forEach((key) => {
    nowKey++;
    if (nowKey <= globalThis.autoDivideNum) {
      tableInsertKey(key);
      redeemKey(key);
    } else {
      tableWaitKey(key);
    }
  });

  if (nowKey > globalThis.autoDivideNum) {
    startTimer();
  }
}

export function redeemKeys(key?: string): void {
  const keys = key
    ? key.split(',')
    : getKeysByRE($('#inputKey').val()?.toString()?.trim() || '');
  redeem(keys);
}

export function toggleUnusedKeyArea(): void {
  if (!globalThis.selecter) {
    const unusedKeyArea = $('#unusedKeyArea');
    if (unusedKeyArea.is(':hidden')) {
      unusedKeyArea.show();
    } else {
      unusedKeyArea.hide();
    }
  }
}



export function registerkey(key: string): void {
  const setting = GM_getValue<setting>('setting');
  const keys = getKeysByRE(key);

  if (setting.asf) {
    const asfCommand = `!redeem ${setting.asfBot ? `${setting.asfBot} ` : ''}${keys.join(',')}`;
    asfRedeem(asfCommand);
  } else if (setting.newTab) {
    const url = `https://store.steampowered.com/account/registerkey?key=${keys.join(',')}`;
    window.open(url, '_blank');
  } else {
    webRedeem(keys.join(','));
  }
}
