
import { redeemKeys, registerkey, redeem, toggleUnusedKeyArea } from './redeem';
import { asfRedeem, asfSend } from './asf';
import { getKeysByRE, arr, mouseClick, redeemAllKey, settingChange } from "./utils";
import { redeemSub, redeemSubs, cc } from "./steamWeb";
import { css } from './css';

globalThis.url = window.location.href;
globalThis.defaultSetting = {
  newTab: false,
  copyListen: true,
  selectListen: true,
  clickListen: true,
  allKeyListen: false,
  asf: false,
  asfProtocol: 'http',
  asfHost: '127.0.0.1',
  asfPort: 1242,
  asfPassword: '',
  asfBot: ''
};
globalThis.sessionID = '';
try {
  globalThis.sessionID = g_sessionID; // eslint-disable-line camelcase
} catch (e) {
  globalThis.sessionID = '';
}
if (Object.prototype.toString.call(GM_getValue('setting')) !== '[object Object]') GM_setValue('setting', globalThis.defaultSetting);

globalThis.allUnusedKeys = [];

globalThis.selecter = globalThis.url.includes('/account/registerkey') ? '' : '.hclonely ';
globalThis.myTexts = {
  fail: '失败',
  success: '成功',
  network: '网络错误或超时',
  line: '——',
  nothing: '',
  others: '其他错误',
  unknown: '未知错误',
  redeeming: '激活中',
  waiting: '等待中',
  showUnusedKey: '显示未使用的Key',
  hideUnusedKey: '隐藏未使用的Key'
};

// 激活页面自动激活
globalThis.autoDivideNum = 9;
globalThis.waitingSeconds = 20;

globalThis.keyCount = 0;
globalThis.recvCount = 0;

try {
  if (GM_getValue<setting>('setting')?.selectListen) {
    // 选中激活功能
    const icon = document.createElement('div');
    icon.className = 'icon-div';
    icon.title = '激活';
    icon.innerHTML = `<img src="'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABsFBMVEVHcEz9/f3+/v8Tdaf///8LGTP+/v4NPWX+/v8GGDj8/f4OGzX///////////8ZJ1ALJ0oNGzf+/v4mOGXX2+T8/f3z9vkPH0UjMFj5+fr///8NGzMJG0ERHS8SKEgXW40Ubp8WY5Ula5ePnrb3+PlnhKUfQ3Q3R3C2vMvt8PRcZH7///8TgrMTgbITfa4YNmcPHDT///8JGj0HGT2rucxGWYJ0g6H///9aZYbGy9jFyNQhL1TO0dp5lbOTma39/f7///+Sl6br7O6SlqT///////8UY5UUY5UJGTgTc6QThLUTfa8VToETdKYQK1sRK1sUWowUY5X///+mq7tlc5MzWX7Mztl5gZuytcJPV3AjL08iLlEUTYAUPXATK10Tfa4FO3IVToHEz9wAL2fj5+5GUG4JFz1mbIC8wMsFFzYFGDwHGkILGTIJG0cLHUoFGD8RJFMUU4YUN2kOIE4TSHsUYJMUbqAUQnUVTYAQLWEUWowUPG8SKFoTZ5kRHDATfq8Tdqf///8IIFQUaJkeWYrA0N4JMmgHQndAc5wJTYIIVooGXpNllrdchanT3ui2xtaZV9eJAAAAaXRSTlMAj/j97/vmAtD8xzncwJvwJay59uHd/ObqgnBtlpgLPfz8Femx+/7s0vitXqVLf53k3VmE9fDr59vaxLSY/qmGRnxeXjI/lGy5MLbr+8A/cPuiqLzgfLHJhJfN17bjr6z8xfmu9cH4cHitMXlOAAACjUlEQVQ4y2XTh1faQBgA8IMGQqCiGPaQAgUE3OLeFTfurR120SYkAQSrQUABUSyOf7l3kQC+/i7JfXff9/Ly4DsAXuA4AG0qi02jsVlUbS/rRnCpsvXkqnpsKmGrnsZBy2KOyTGyHBrooWlpeAkMLAzDyBiRDIayvloFnKwMJSOoKgJGsghD9YsVOLASBEE3pKtz/8t34MBCEXQddbQ7O/trjKAiVB96BY630I2ow1BobjoUmjXQdAR+KRyL0Ug0VhWlD+c+jBkMxzNzM3BXgwrWog1oYyBgODr47adnpv2xSBT+HkDDRlgxz9H+wM/jgNkc8BvNBzGWtQLgNLAcy8JbGLFJs3HSZDJNmQzjpmaWM7SBviRXk2SbxyXGSQkCI1jAqUB/Mp6sYbfV6mGvWq2W7JOSPQ7urIPuJBsXccNbkNG7t7cf397aQQkrMLUPZLh4JoMushV5P0yS3vatUbSV+QwkytaRQbJQ4DOFwqiySQnBR1PTKAnTPCyY0ikUSoVrgPcOjihE2vYdPnPK8yTfDczytwKtbsQVhHOvTqcd4Hn+VMCvg2lM3itHMK3LMyiXD/UGPbeXkFBwuQacrh8Yhg1hiM8TxHxu/vT8UvQJtud3j/ubVKCXTrix8O15Xaob/hf21MlJOZiX5qXSvHvi+Tacqgmn7Kgfvl6E7+58ped8vpTyTdwlLkThi49CP9gTiZv7R/1juXxTerpPNEINA6/d9Eb6/kH/VNKXbtJ1G+kFsSk3zxyOv46Hh3KlclbjOJsHYleDzWKxmK1UskUkixSzxfnGc9f1DvkjQvHCq6OHL61eX1+/qYLR6tKrw4lKOr+sXFWtdNj/O99wiTs7uzqWlzu6Op14Pf0P2PD9NrHDeWsAAAAASUVORK5CYII='" class="icon-img" alt="激活图标">`;
    const $icon = $(icon);

    $('html').append(icon);

    $(document).mousedown((e: JQuery.MouseDownEvent) => {
      if (
        e.target === icon ||
        e.target?.parentNode === icon ||
        e.target?.parentNode?.parentNode === icon
      ) {
        // 点击了激活图标
        e.preventDefault();
      }
    });

    // 取消选中，隐藏激活图标和激活面板
    document.addEventListener('selectionchange', () => {
      if (!window.getSelection()?.toString()?.trim()) {
        $icon.hide();
      }
    });

    $(document).mouseup((e: JQuery.MouseUpEvent) => {
      if (
        e.target === icon ||
        e.target?.parentNode === icon ||
        e.target?.parentNode?.parentNode === icon
      ) {
        // 点击了激活图标
        e.preventDefault();
        return false;
      }

      const text = window.getSelection()?.toString()?.trim();
      const productKey = text || (e.target as HTMLInputElement)?.value;

      if (/[\d\w]{5}(-[\d\w]{5}){2}/.test(productKey) && text && $icon.is(':hidden')) {
        $icon.css({
          top: e.pageY + 12,
          left: e.pageX + 18
        }).show();
      } else if (!text) {
        $icon.hide();
      }
    });

    $icon.click((e: JQuery.ClickEvent) => {
      const productKey =
        window.getSelection()?.toString()?.trim() || (e.target as HTMLInputElement)?.value;
      registerkey(productKey);
    });
  }

  // 复制激活功能
  if (
    !/https?:\/\/store\.steampowered\.com\/account\/registerkey[\w\W]{0,}/.test(globalThis.url) &&
    GM_getValue<setting>('setting')?.copyListen
  ) {
    const activateProduct = async function (e: ClipboardEvent): Promise<void> {
      const productKey =
        window.getSelection()?.toString()?.trim() ||
        (e.target as HTMLInputElement)?.value;

      // 将内容写入剪贴板
      const clipboardSuccess = await navigator.clipboard
        .writeText(productKey)
        .then(() => true, () => false);

      if (/^([\w\W]*)?([\d\w]{5}(-[\d\w]{5}){2}(\r||,||，)?){1,}/.test(productKey)) {
        if (!$('div.swal-overlay').hasClass('swal-overlay--show-modal')) {
          swal({
            title: '检测到神秘key,是否激活？',
            icon: 'success',
            //@ts-ignore
            buttons: {
              confirm: '激活',
              cancel: '取消'
            }
          }).then((value: boolean) => {
            if (value) registerkey(productKey);
          });
        }
      } else if (/^!addlicense.*[\d]+$/gi.test(productKey)) {
        if (
          GM_getValue<setting>('setting')?.asf &&
          !$('div.swal-overlay').hasClass('swal-overlay--show-modal')
        ) {
          swal({
            closeOnClickOutside: false,
            className: 'swal-user',
            title: '检测到您复制了以下ASF指令，是否执行？',
            text: productKey,
            //@ts-ignore
            buttons: {
              confirm: '执行',
              cancel: '取消'
            }
          }).then((value: boolean) => {
            if (value) asfRedeem(productKey);
          });
        }
      }
    };

    window.addEventListener('copy', activateProduct, false);
  }

  if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey*/.test(globalThis.url)) {
    $('#registerkey_examples_text').html(`
      <div class="notice_box_content" id="unusedKeyArea" style="display: none">
        <b>未使用的Key：</b>
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" id="copyUnuseKey">
          <span>提取未使用key</span>
        </a>
        <br>
        <div><ol id="unusedKeys"></ol></div>
      </div>
      <div class="table-responsive table-condensed">
        <table class="table table-hover" style="display: none">
          <caption><h2>激活记录</h2></caption>
          <thead>
            <tr>
              <th>No.</th>
              <th>Key</th>
              <th>结果</th>
              <th>详情</th>
              <th>Sub</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <br>`);

    $('#copyUnuseKey').click(() => {
      const unusedKeys = $('#unusedKeys').text();
      GM_setClipboard(arr(getKeysByRE(unusedKeys)).join(','));
      swal({ title: '复制成功！', icon: 'success' });
    });

    $('.registerkey_input_box_text').parent()
      .css('float', 'none')
      .append(`
        <textarea class="form-control" rows="3" id="inputKey" placeholder="支持批量激活，可以把整个网页文字复制过来&#10;若一次激活的Key的数量超过9个则会自动分批激活（等待20秒）&#10;激活多个SUB时每个SUB之间用英文逗号隔开" style="margin: 3px 0px 0px; width: 525px; height: 102px;"></textarea><br>`);

    if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey\?key=.+/.test(globalThis.url)) {
      $('#inputKey').val(globalThis.url.replace(/https?:\/\/store\.steampowered\.com\/account\/registerkey\?key=/i, ''));
    }

    $('.registerkey_input_box_text,#purchase_confirm_ssa').hide();

    $('#register_btn').parent()
      .css('margin', '10px 0')
      .append(`
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="margin-left:0" id="redeemKey">
          <span>激活key</span>
        </a> &nbsp;&nbsp;
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="margin-left:0" id="redeemSub">
          <span>激活sub</span>
        </a> &nbsp;&nbsp;
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="margin-left:0" id="changeCountry">
          <span>更换国家/地区</span>
        </a> &nbsp;&nbsp;`);

    $('#register_btn').remove();

    if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey\?key=.+/.test(globalThis.url)) {
      redeem(getKeysByRE(globalThis.url.replace(/https?:\/\/store\.steampowered\.com\/account\/registerkey\?key=/i, '').trim()));
    }

    $('#redeemKey').click(() => { redeemKeys(); });
    $('#redeemSub').click(redeemSubs);
    $('#changeCountry').click(cc);

    toggleUnusedKeyArea();
  } else if (/https?:\/\/steamdb\.info\/freepackages\//.test(globalThis.url)) {
    const activateConsole = () => {
      const sub: string[] = [];
      $('#freepackages span:visible').each(function () {
        const subId = $(this).attr('data-subid');
        if (subId) sub.push(subId);
      });
      const freePackages = sub.join(',');
      window.open(`https://store.steampowered.com/account/licenses/?sub=${freePackages}`, '_self');
    };

    const fp = setInterval(() => {
      if ($('#freepackages').length > 0) {
        $('#freepackages').click(activateConsole);
        clearInterval(fp);
      }
    }, 1000);
  } else if (/https?:\/\/store\.steampowered\.com\/account\/licenses\/(\?sub=[\w\W]{0,})?/.test(globalThis.url)) {
    $('h2.pageheader').parent()
      .append(`
        <div style="float: left;">
          <textarea class="registerkey_input_box_text" rows="1" name="product_key" id="gameSub" placeholder="输入SUB,多个SUB之间用英文逗号连接" value="" style="margin: 3px 0px 0px; width: 400px; height: 15px;background-color:#102634; padding: 6px 18px 6px 18px; font-weight:bold; color:#fff;"></textarea> &nbsp;
        </div>
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="width: 95px; height: 30px;" id="buttonSUB">
          <span>激活SUB</span>
        </a>
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="width: 125px; height: 30px;margin-left:5px" id="changeCountry-account">
          <span>更改国家/地区</span>
        </a>`);

    $('#buttonSUB').click(() => { redeemSub(); });
    $('#changeCountry-account').click(cc);

    if (/https?:\/\/store\.steampowered\.com\/account\/licenses\/\?sub=([\d]+,)+/.test(globalThis.url)) {
      setTimeout(() => { redeemSub(globalThis.url); }, 2000);
    }
  } else if (GM_getValue<setting>('setting')?.clickListen) {
    let htmlEl: HTMLElement | null = null;

    if ($('body').length > 0) {
      $('body').click((event: JQuery.ClickEvent) => {
        htmlEl = event.target as HTMLElement;

        if ($(htmlEl).parents('.swal-overlay').length === 0 &&
          !['A', 'BUTTON', 'TEXTAREA'].includes(htmlEl.tagName) &&
          !['button', 'text'].includes(htmlEl.getAttribute('type') || '') &&
          ($(htmlEl).children().length === 0 ||
            !/([0-9,A-Z]{5}-){2,4}[0-9,A-Z]{5}/gim.test($.makeArray($(htmlEl).children()
              .map(function () {
                return $(this).text();
              })).join(''))) &&
          /([0-9,A-Z]{5}-){2,4}[0-9,A-Z]{5}/gim.test($(htmlEl).text())) {
          mouseClick($, event);
          arr($(htmlEl).text()
            .match(/[\w\d]{5}(-[\w\d]{5}){2}/gim) || []).map((e) => {
              //@ts-ignore
              $(htmlEl).html($(htmlEl).html()
                ?.replace(new RegExp(e, 'gi'), `<a class="redee-key" href='javascript:void(0)' target="_self" key='${e}'>${e}</a>`));
            });
          $('.redee-key').click(function () {
            registerkey($(this).attr('key') || '');
          });
        }
      });
    }
  }

  if (/https?:\/\/store\.steampowered\.com\//.test(globalThis.url)) {
    $('#account_pulldown').before('<span id="changeCountry" style="cursor:pointer;display:inline-block;padding-left:4px;line-height:25px" class="global_action_link persona_name_text_content">更改国家/地区 |</span>');
    $('#changeCountry').click(cc);
  }

  if (GM_getValue<setting>('setting')?.allKeyListen) {
    redeemAllKey();
  }

  GM_addStyle(css);

  GM_registerMenuCommand('⚙设置', settingChange);
  GM_registerMenuCommand('执行ASF指令', () => { asfSend(); });
} catch (e) {
  swal('AuTo Redeem Steamkey脚本执行出错，详情请查看控制台！', (e as Error).stack as string, 'error');
  console.error(e);
}
