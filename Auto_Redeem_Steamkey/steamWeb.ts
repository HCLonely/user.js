/*
 * @Author       : HCLonely
 * @Date         : 2025-04-23 21:52:47
 * @LastEditTime : 2025-07-15 16:45:32
 * @LastEditors  : HCLonely
 * @FilePath     : /user.js/Auto_Redeem_Steamkey/steamWeb.ts
 * @Description  :
 */
import { getKeysByRE, arr, httpRequest } from "./utils";
import { redeemKeys } from "./redeem";

// 添加类型定义
interface StoreTokenParams {
  steamID: string;
  nonce: string;
  redir: string;
  auth: string;
}

interface CartConfig {
  rgUserCountryOptions: Record<string, string>;
}

interface UserInfo {
  country_code: string;
}

// 添加 swal 类型定义
interface SwalOptions {
  title?: string;
  icon?: 'success' | 'error' | 'warning' | 'info';
  content?: any; // 由于 swal 的类型定义不完整，这里使用 any
  buttons?: Record<string, any>;
  className?: string;
  closeOnClickOutside?: boolean;
}

// 常量定义
const STEAM_HOSTS = {
  STORE: 'store.steampowered.com',
  LOGIN: 'login.steampowered.com'
} as const;

// 统一的错误处理
const handleError = (error: unknown, message: string): false => {
  console.error(`${message}:`, error);
  return false;
};

export async function refreshToken(): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('redir', `https://${STEAM_HOSTS.STORE}/`);

    const response = await httpRequest({
      url: `https://${STEAM_HOSTS.LOGIN}/jwt/ajaxrefresh`,
      method: 'POST',
      responseType: 'json',
      headers: {
        Host: STEAM_HOSTS.LOGIN,
        Origin: `https://${STEAM_HOSTS.STORE}`,
        Referer: `https://${STEAM_HOSTS.STORE}/`
      },
      data: formData
    });

    if (response.result === 'Success' && response.data?.response?.success) {
      return await setStoreToken(response.data.response);
    }
    return false;
  } catch (error) {
    return handleError(error, 'Failed to refresh token');
  }
}

export async function setStoreToken(param: StoreTokenParams): Promise<boolean> {
  try {
    const host = 'store.steampowered.com';
    const formData = new FormData();
    formData.append('steamID', param.steamID);
    formData.append('nonce', param.nonce);
    formData.append('redir', param.redir);
    formData.append('auth', param.auth);

    const { result, statusText, status, data } = await httpRequest({
      url: `https://${host}/login/settoken`,
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Host: host,
        Origin: `https://${host}`
        // Referer: `https://${host}/login`
      },
      data: formData
    });

    if (result === 'Success') {
      if (data?.status === 200) {
        return true;
      }
      return false;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateStoreAuth(retry = false): Promise<boolean> {
  try {
    const { result, statusText, status, data } = await httpRequest({
      url: 'https://store.steampowered.com/',
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Upgrade-Insecure-Requests': '1'
      },
      fetch: false,
      redirect: 'manual'
    });

    if (data?.status === 200) {
      if (!data.responseText.includes('data-miniprofile=')) {
        if (await refreshToken()) {
          if (retry) {
            return false;
          }
          return updateStoreAuth(true);
        }
        return false;
      }

      const storeSessionID = data.responseText.match(/g_sessionID = "(.+?)";/)?.[1];
      if (storeSessionID) {
        globalThis.sessionID = storeSessionID;
        return true;
      }
      return false;
    }

    if ([301, 302].includes(data?.status)) {
      if (await refreshToken()) {
        if (retry) {
          return false;
        }
        return updateStoreAuth(true);
      }
      return false;
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 优化 UI 相关函数
const showSwalMessage = (options: Partial<SwalOptions>): Promise<any> => {
  return swal({
    className: 'swal-user',
    closeOnClickOutside: false,
    ...options
  });
};

// 优化 webRedeem 函数
export function webRedeem(key: string): void {
  const redeemContent = createRedeemContent();

  showSwalMessage({
    title: '正在获取sessionID...',
    buttons: {
      confirm: '关闭'
    }
  });

  if (!globalThis.sessionID) {
    handleNoSession(key, redeemContent);
    return;
  }

  showRedeemDialog(key, redeemContent);
}

function createRedeemContent(): HTMLElement {
  return $(`
    <div id="registerkey_examples_text">
      <div class="notice_box_content" id="unusedKeyArea">
        <b>未使用的Key：</b><br>
        <div><ol id="unusedKeys" align="left"></ol></div>
      </div>
      <div class="table-responsive table-condensed">
        <table class="table table-hover hclonely">
          <caption><h2>激活记录</h2></caption>
          <thead>
            <th>No.</th><th>Key</th><th>结果</th><th>详情</th><th>Sub</th>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <br>
    </div>
  `)[0] as HTMLElement;
}

function handleNoSession(key: string, redeemContent: HTMLElement): void {
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://store.steampowered.com/account/registerkey',
    onload: async (data: GMResponse) => {
      if (data.finalUrl.includes('login') && !(await updateStoreAuth())) {
        showSwalMessage({
          title: '请先登录steam！',
          icon: 'warning',
          buttons: {
            confirm: '登录',
            cancel: '关闭'
          }
        }).then((value: boolean | null) => {
          if (value) window.open('https://store.steampowered.com/login/', '_blank');
        });
      } else {
        if (data.status === 200) {
          globalThis.sessionID = data.responseText?.match(/g_sessionID = "(.+?)";/)?.[1] || '';
          showRedeemDialog(key, redeemContent);
        } else {
          showSwalMessage({
            title: '获取sessionID失败！',
            icon: 'error',
            buttons: {
              confirm: '关闭'
            }
          });
        }
      }
    }
  });
}

function showRedeemDialog(key: string, redeemContent: HTMLElement): void {
  showSwalMessage({
    title: '正在激活steam key...',
    content: redeemContent,
    buttons: {
      confirm: '提取未使用key',
      cancel: '关闭'
    }
  }).then((v: boolean | null) => {
    let value = '';
    const textarea = $('.swal-content textarea');
    if (textarea.length > 0) {
      value = textarea.val()?.toString() || '';
    }
    GM_setValue('history', [$('.swal-content').html() || '', value]);
    if (v) {
      GM_setClipboard(arr(getKeysByRE($('#unusedKeys').text() || '')).join(','));
      showSwalMessage({ title: '复制成功！', icon: 'success' });
    }
  });
  redeemKeys(key);
}

export function redeemSub(e?: string): void {
  const subText = e || ($('#gameSub').val() as string | undefined);
  if (subText) {
    const ownedPackages: Record<number, boolean> = {};
    $('.account_table a').each((i, el) => {
      const match = (el as HTMLAnchorElement).href.match(/javascript:RemoveFreeLicense\( ([0-9]+), '/);
      if (match !== null) {
        ownedPackages[+match[1]] = true;
      }
    });

    const freePackages = subText.match(/[\d]{2,}/g) || [];
    let loaded = 0;
    const total = freePackages.length;

    swal('正在执行…', '请等待所有请求完成。 忽略所有错误，让它完成。');

    freePackages.forEach((packae) => {
      const packageId = parseInt(packae, 10);
      if (ownedPackages[packageId]) {
        loaded++;
        return;
      }

      $.post('//store.steampowered.com/checkout/addfreelicense', {
        action: 'add_to_cart',
        sessionid: g_sessionID,
        subid: packageId
      }).always(() => {
        loaded++;
        if (loaded >= total) {
          if (window.location.href.includes('licenses')) {
            window.open('https://store.steampowered.com/account/licenses/', '_self');
          } else {
            swal('全部激活完成，是否前往账户页面查看结果？', {
            //@ts-ignore
              buttons: {
                cancel: '取消',
                确定: true
              }
            }).then((value: boolean) => {
              if (value) {
                window.open('https://store.steampowered.com/account/licenses/', '_blank');
              }
            });
          }
        } else {
          swal('正在激活…', `进度：${loaded}/${total}.`);
        }
      });
    });
  }
}

export function redeemSubs(): void {
  const key = ($('#inputKey').val() as string | undefined)?.trim();
  if (key) {
    redeemSub(key);
  }
}

// 优化国家切换相关函数
export async function cc(): Promise<void> {
  try {
    showSwalMessage({ title: '正在获取当前国家/地区...', icon: 'info' });

    const cartData = await fetchCartData();
    const { cartConfig, userInfo } = parseCartData(cartData);

    if (!isValidCartConfig(cartConfig, userInfo)) {
      showSwalMessage({ title: '需要挂相应地区的梯子！', icon: 'warning' });
      return;
    }

    showCountryChangeDialog(cartConfig, userInfo, cartData);
  } catch (error) {
    showSwalMessage({ title: '获取当前国家/地区失败！', icon: 'error' });
  }
}

function fetchCartData(): Promise<string> {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '//store.steampowered.com/cart/',
      type: 'get',
      success: (data: string) => resolve(data),
      error: reject
    });
  });
}

function parseCartData(data: string): { cartConfig: CartConfig; userInfo: UserInfo } {
  const cartConfigRaw = data.match(/data-cart_config="(.*?)"/)?.[1];
  const temp = document.createElement('div');
  temp.innerHTML = cartConfigRaw || '';
  const cartConfigStr = temp.textContent || temp.innerText || '';

  try {
    const cartConfig = JSON.parse(cartConfigStr);
    if (!cartConfig || !cartConfig.rgUserCountryOptions) {
      throw new Error('Invalid cartConfig format');
    }

    const userInfoRaw = data.match(/data-userinfo="(.*?)"/)?.[1];
    const temp1 = document.createElement('div');
    temp1.innerHTML = userInfoRaw || '';
    const userInfoStr = temp1.textContent || temp1.innerText || '';

    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo || !userInfo.country_code) {
      throw new Error('Invalid userInfo format');
    }

    return {
      cartConfig: cartConfig as CartConfig,
      userInfo: userInfo as UserInfo
    };
  } catch (e) {
    throw new Error('Failed to parse Steam data');
  }
}

function isValidCartConfig(cartConfig: CartConfig, userInfo: UserInfo): boolean {
  return (
    cartConfig &&
    userInfo &&
    Object.keys(cartConfig.rgUserCountryOptions).length > 2
  );
}

function showCountryChangeDialog(cartConfig: CartConfig, userInfo: UserInfo, cartData: string): void {
  const divContent = cartData
    .match(/<div class="currency_change_options">([\w\W]*?)<p/i)?.[1]
    ?.trim();
  const div = `${divContent || ''}</div>`;

  showSwalMessage({
    closeOnClickOutside: false,
    title: `当前国家/地区：${
      cartConfig.rgUserCountryOptions[userInfo.country_code] ||
      userInfo.country_code
    }`,
    //@ts-ignore
    content: $(`<div>${div}</div>`)[0]
  }).then(() => {
    $('.currency_change_option').click(function () {
      const country = $(this).attr('data-country');
      if (country) {
        changeCountry(country);
      }
    });
  });
}

export function changeCountry(country: string): void {
  showSwalMessage({
    closeOnClickOutside: false,
    icon: 'info',
    title: '正在更换国家/地区...'
  });

  $.ajax({
    url: '//store.steampowered.com/country/setcountry',
    type: 'post',
    data: {
      sessionid: g_sessionID,
      cc: country
    },
    complete() {
      $.ajax({
        url: '//store.steampowered.com/cart/',
        type: 'get',
        success(data: string) {
          // 解析 cartConfig
          const cartConfigRaw = data.match(/data-cart_config="(.*?)"/)?.[1];
          const temp = document.createElement('div');
          temp.innerHTML = cartConfigRaw || '';
          const cartConfigStr = temp.textContent || temp.innerText || '';
          let cartConfig: { rgUserCountryOptions: Record<string, string> } | undefined;

          try {
            cartConfig = JSON.parse(cartConfigStr);
          } catch (e) {
            console.error(e);
            showSwalMessage({ title: '获取当前国家/地区失败！', icon: 'error' });
            return;
          }

          // 解析 userInfo
          const userInfoRaw = data.match(/data-userinfo="(.*?)"/)?.[1];
          const temp1 = document.createElement('div');
          temp1.innerHTML = userInfoRaw || '';
          const userInfoStr = temp1.textContent || temp1.innerText || '';
          let userInfo: { country_code: string } | undefined;

          try {
            userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            console.error(e);
            showSwalMessage({ title: '获取当前国家/地区失败！', icon: 'error' });
            return;
          }

          // 解析 currency_change_options
          const divContent = data
            .match(/<div class="currency_change_options">([\w\W]*?)<p/i)?.[1]
            ?.trim();
          const div = `${divContent || ''}</div>`;

          if (userInfo?.country_code === country) {
            showSwalMessage({ title: '更换成功！', icon: 'success' }).then(() => {
              showSwalMessage({
                closeOnClickOutside: false,
                title: `当前国家/地区：${
                  cartConfig?.rgUserCountryOptions[userInfo.country_code] ||
                  userInfo.country_code
                }`,
                //@ts-ignore
                content: $(`<div>${div}</div>`)[0]
              }).then(() => {
                $('.currency_change_option').click(function () {
                  const newCountry = $(this).attr('data-country');
                  if (newCountry) {
                    changeCountry(newCountry);
                  }
                });
              });
            });
          } else {
            showSwalMessage({ title: '更换失败！', icon: 'error' });
          }
        },
        error: () => {
          showSwalMessage({ title: '获取当前国家/地区失败！', icon: 'error' });
        }
      });
    }
  });
}
