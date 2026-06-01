// ==UserScript==
// @name            RedeemHelper
// @namespace       https://github.com/HCLonely/RedeemHelper
// @author          HCLonely
// @description     统一的游戏 Key 提取与领取辅助脚本，聚合了 Steam / IndieGala / itch.io。
// @description:en  Unified helper for extracting and redeeming game keys.
// @version         4.0.0
// @supportURL      https://github.com/HCLonely/RedeemHelper/issues
// @homepageURL     https://github.com/HCLonely/RedeemHelper
// @icon            https://github.com/HCLonely/RedeemHelper/blob/main/icon.ico?raw=true
// @tag             games

// @match           *://*/*
// @exclude         *://store.steampowered.com/widget/*
// @exclude         *://*googleads*

// @grant           GM_setClipboard
// @grant           GM_addStyle
// @grant           GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_xmlhttpRequest
// @grant           GM_cookie
// @run-at          document-idle
// @connect         *
// ==/UserScript==
'use strict';
(() => {
  // src/shared/dom.ts
  function isHost(host) {
    const hosts = Array.isArray(host) ? host : [host];
    const currentHost = window.location.hostname;
    return hosts.some((candidate) => currentHost === candidate || currentHost.endsWith(`.${candidate}`));
  }

  // src/shared/observer.ts
  function mountObserver(callback) {
    const observer3 = new MutationObserver(callback);
    observer3.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
    callback();
    return observer3;
  }

  // src/shared/ui.ts
  let activeModal = null;
  let stylesInjected = false;
  const MODAL_STYLES = `
  .rh-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    padding: 12px;
    box-sizing: border-box;
  }

  .rh-modal {
    width: min(92vw, 460px);
    max-height: 85vh;
    overflow: auto;
    border-radius: 12px;
    background: #ffffff;
    color: #111827;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.24);
    padding: 20px;
    box-sizing: border-box;
    font-family: inherit;
  }

  .rh-modal-icon {
    margin: 0 0 10px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 999px;
    background: #e5e7eb;
    color: #374151;
  }

  .rh-modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 10px;
    color: #111827;
  }

  .rh-modal-text,
  .rh-modal-content {
    margin: 0 0 16px;
    line-height: 1.6;
    font-size: 14px;
    color: #374151;
    word-break: break-word;
  }

  .rh-modal-content input:not([type]),
  .rh-modal-content input[type="text"],
  .rh-modal-content input[type="password"],
  .rh-modal-content input[type="number"],
  .rh-modal-content textarea,
  .rh-modal-content select {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    color: #111827;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 14px;
    line-height: 1.4;
  }

  .rh-modal-content input:not([type]):focus,
  .rh-modal-content input[type="text"]:focus,
  .rh-modal-content input[type="password"]:focus,
  .rh-modal-content input[type="number"]:focus,
  .rh-modal-content textarea:focus,
  .rh-modal-content select:focus {
    outline: 2px solid #93c5fd;
    outline-offset: 1px;
    border-color: #60a5fa;
  }

  .rh-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .rh-modal-button {
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }

  .rh-modal-button--primary {
    background: #2563eb;
    color: #ffffff;
  }

  .rh-modal-button--secondary {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #374151;
  }

  .rh-modal-button--danger {
    background: #dc2626;
    color: #ffffff;
  }

  .rh-modal--success {
    border-top: 3px solid #16a34a;
  }

  .rh-modal--error {
    border-top: 3px solid #dc2626;
  }

  .rh-modal--warning {
    border-top: 3px solid #ea580c;
  }

  .rh-modal--info {
    border-top: 3px solid #2563eb;
  }

  .rh-modal-icon--success {
    background: #dcfce7;
    color: #166534;
  }

  .rh-modal-icon--error {
    background: #fee2e2;
    color: #991b1b;
  }

  .rh-modal-icon--warning {
    background: #ffedd5;
    color: #9a3412;
  }

  .rh-modal-icon--info {
    background: #dbeafe;
    color: #1d4ed8;
  }
`;
  function getModalTone(icon) {
    if (icon === 'success' || icon === 'error' || icon === 'warning' || icon === 'info') {
      return icon;
    }
    return void 0;
  }
  function getModalToneClass(icon) {
    const tone = getModalTone(icon);
    return tone ? `rh-modal--${tone}` : '';
  }
  function getButtonRoleClass(key, tone) {
    if (key === 'confirm') {
      return tone === 'error' ? 'rh-modal-button--danger' : 'rh-modal-button--primary';
    }
    return 'rh-modal-button--secondary';
  }
  function normalizeOptions(optionsOrTitle, text, icon) {
    if (typeof optionsOrTitle === 'string') {
      return {
        title: optionsOrTitle,
        text,
        icon
      };
    }
    return optionsOrTitle;
  }
  function injectStyles() {
    if (stylesInjected) return;
    const style = document.createElement('style');
    style.textContent = MODAL_STYLES;
    const mountTarget = document.head ?? document.documentElement;
    mountTarget.appendChild(style);
    stylesInjected = true;
  }
  function closeActiveModal(value) {
    if (!activeModal) return;
    const current = activeModal;
    activeModal = null;
    document.removeEventListener('keydown', current.escHandler);
    current.overlay.remove();
    current.resolve(value);
  }
  function renderModal(options) {
    if (!activeModal) return;
    const { iconEl, titleEl, textEl, contentEl, actionsEl } = activeModal;
    const opts = options;
    const title = opts.titleText ?? opts.title ?? '';
    titleEl.textContent = title;
    titleEl.style.display = title ? '' : 'none';
    iconEl.className = `rh-modal-icon${opts.icon ? ` rh-modal-icon--${opts.icon}` : ''}`;
    iconEl.textContent = opts.icon ?? '';
    iconEl.style.display = opts.icon ? '' : 'none';
    textEl.textContent = opts.text ?? '';
    textEl.style.display = textEl.textContent ? '' : 'none';
    contentEl.innerHTML = '';
    if (typeof opts.content === 'string') {
      contentEl.textContent = opts.content;
    } else if (opts.content instanceof HTMLElement) {
      contentEl.appendChild(opts.content);
    }
    contentEl.style.display = contentEl.textContent || contentEl.childNodes.length ? '' : 'none';
    const toneClass = getModalToneClass(opts.icon);
    const tone = getModalTone(opts.icon);
    activeModal.modal.className = `rh-modal${opts.className ? ` ${opts.className}` : ''}${toneClass ? ` ${toneClass}` : ''}`;
    activeModal.closeOnClickOutside = opts.closeOnClickOutside !== false;
    actionsEl.innerHTML = '';
    const buttons = opts.buttons && Object.keys(opts.buttons).length ? opts.buttons : opts.showCancelButton ? {
      confirm: opts.confirmButtonText || '确定',
      cancel: opts.cancelButtonText || '取消'
    } : { confirm: '确定' };
    Object.entries(buttons).forEach(([key, config]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `rh-modal-button ${getButtonRoleClass(key, tone)}`;
      button.textContent = typeof config === 'string' ? config : config?.text || key;
      button.addEventListener('click', () => {
        if (key === 'cancel') {
          closeActiveModal(null);
          return;
        }
        if (key === 'confirm') {
          closeActiveModal(true);
          return;
        }
        closeActiveModal(key);
      });
      actionsEl.appendChild(button);
    });
  }
  function showModal(optionsOrTitle, text, icon) {
    injectStyles();
    const options = normalizeOptions(optionsOrTitle, text, icon);
    if (activeModal) {
      closeActiveModal(null);
    }
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'rh-modal-overlay';
      const modal = document.createElement('div');
      modal.className = 'rh-modal';
      const iconEl = document.createElement('div');
      iconEl.className = 'rh-modal-icon';
      const titleEl = document.createElement('div');
      titleEl.className = 'rh-modal-title';
      const textEl = document.createElement('div');
      textEl.className = 'rh-modal-text';
      const contentEl = document.createElement('div');
      contentEl.className = 'rh-modal-content';
      const actionsEl = document.createElement('div');
      actionsEl.className = 'rh-modal-actions';
      modal.append(iconEl, titleEl, textEl, contentEl, actionsEl);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      const escHandler = (event) => {
        if (event.key === 'Escape' && activeModal?.closeOnClickOutside) {
          closeActiveModal(null);
        }
      };
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay && activeModal?.closeOnClickOutside) {
          closeActiveModal(null);
        }
      });
      document.addEventListener('keydown', escHandler);
      activeModal = {
        overlay,
        modal,
        iconEl,
        titleEl,
        textEl,
        contentEl,
        actionsEl,
        resolve,
        closeOnClickOutside: true,
        escHandler
      };
      renderModal(options);
    });
  }
  function updateOrShowModal(options) {
    if (activeModal) {
      renderModal(options);
      return;
    }
    void showModal(options);
  }

  // src/shared/http.ts
  function request(options) {
    return new Promise((resolve) => {
      const finish = (response, error) => {
        const status = response?.status ?? 0;
        const statusText = response?.statusText ?? (error ? 'Error' : '');
        resolve({
          ok: status >= 200 && status < 300,
          status,
          statusText,
          data: response?.response,
          text: response?.responseText,
          response,
          error
        });
      };
      try {
        GM_xmlhttpRequest({
          timeout: 3e4,
          ...options,
          onload: (response) => finish(response),
          onerror: (response) => finish(response, response),
          ontimeout: (response) => finish(response, new Error('Request timed out')),
          onabort: (response) => finish(response, new Error('Request aborted'))
        });
      } catch (error) {
        finish(null, error);
      }
    });
  }

  // src/modules/ig/addToLib.ts
  function updateModal(options) {
    updateOrShowModal(options);
  }
  function parseAddToLibraryRequest(pageHtml, href) {
    const pageId = pageHtml.match(/dataToSend\.(gala_page_)?id[\s]*?=[\s]*?'(.*?)';/)?.[2];
    if (!pageId) return null;
    const csrfToken = pageHtml.match(/<input name="csrfmiddlewaretoken".+?value="(.+?)"/)?.[1];
    if (!csrfToken) return null;
    const targetUrl = new URL(href);
    const gameSlug = targetUrl.pathname.replace(/\//g, '');
    const subdomain = targetUrl.hostname.replace('.indiegala.com', '');
    const url = new URL(`/developers/ajax/add-to-library/${pageId}/${gameSlug}/${subdomain}`, targetUrl).href;
    return { url, csrfToken };
  }
  function syncOwnedIndieGalaLinks() {
    const { syncIgLib } = window;
    if (typeof syncIgLib !== 'function') return;
    void syncIgLib(false, false).then((allGames) => {
      for (const link of Array.from(document.querySelectorAll('a[href*=".indiegala.com/"]'))) {
        link.classList.add('ig-checked');
        try {
          const { href } = link;
          const url = new URL(href);
          if (/^https?:\/\/[\w\d]+?\.indiegala\.com\/.+$/.test(href) && allGames.includes(url.pathname.replace(/\//g, ''))) {
            link.classList.add('ig-owned');
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
  async function promptLogin() {
    const result = await showModal({
      title: '请先登录！',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: '登录',
      cancelButtonText: '关闭'
    });
    if (result) {
      window.open('https://www.indiegala.com/login', '_blank');
    }
  }
  async function addToIndiegalaLibrary(target) {
    const href = target;
    void showModal({
      title: '正在获取入库链接...',
      text: href,
      icon: 'info'
    });
    const pageResponse = await request({
      url: href,
      method: 'GET',
      anonymous: false,
      timeout: 3e4
    });
    if (!pageResponse.text) {
      console.error(pageResponse);
      updateModal({
        title: '获取入库链接失败！',
        text: href,
        icon: 'error'
      });
      return null;
    }
    if (pageResponse.text.includes('loginRedirect')) {
      updateModal({
        title: '请先登录！',
        text: 'https://www.indiegala.com/login',
        icon: 'error'
      });
      return null;
    }
    const addRequest = parseAddToLibraryRequest(pageResponse.text, href);
    if (!addRequest) {
      console.error(pageResponse);
      updateModal({
        title: '获取入库Id失败！',
        text: href,
        icon: 'error'
      });
      return null;
    }
    updateModal({
      title: '正在入库...',
      text: href,
      icon: 'info'
    });
    const addResponse = await request({
      url: addRequest.url,
      method: 'POST',
      responseType: 'json',
      nocache: true,
      headers: {
        'content-type': 'application/json',
        'X-CSRFToken': addRequest.csrfToken,
        'X-CSRF-Token': addRequest.csrfToken
      },
      timeout: 3e4
    });
    if (addResponse.data?.status === 'ok') {
      updateModal({
        title: '入库成功！',
        text: href,
        icon: 'success'
      });
      syncOwnedIndieGalaLinks();
      return true;
    }
    if (addResponse.data?.status === 'added') {
      updateModal({
        title: '已在库中！',
        text: href,
        icon: 'warning'
      });
      return true;
    }
    if (addResponse.data?.status === 'login' || addResponse.data?.status === 'auth') {
      await promptLogin();
      return false;
    }
    console.error(addResponse);
    updateModal({
      title: '入库失败！',
      text: href,
      icon: 'error'
    });
    return null;
  }

  // src/modules/ig/index.ts
  const IG_BUTTON_CLASS = 'add-to-library';
  const IG_PROCESSED_CLASS = 'ig-add2lib';
  const IG_CSS = `.${IG_BUTTON_CLASS}{margin-left:10px;}`;
  let initialized = false;
  let observer = null;
  function isEligibleIndieGalaLink(href) {
    try {
      const url = new URL(href);
      return /^https?:$/.test(url.protocol) && /^.+?\.indiegala\.com$/.test(url.hostname) && !['/login', '/library'].includes(url.pathname) && url.pathname !== '/';
    } catch {
      return false;
    }
  }
  function addButtons() {
    for (const link of Array.from(document.querySelectorAll(`a[href*=".indiegala.com/"]:not(.${IG_PROCESSED_CLASS})`))) {
      link.classList.add(IG_PROCESSED_CLASS);
      const { href } = link;
      if (!isEligibleIndieGalaLink(href)) continue;
      const button = document.createElement('a');
      button.className = IG_BUTTON_CLASS;
      button.href = 'javascript:void(0)';
      button.target = '_self';
      button.dataset.href = href;
      button.textContent = '入库';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        void addToIndiegalaLibrary(href);
      });
      link.after(button);
    }
  }
  function collectBatchLinks() {
    const links = Array.from(document.querySelectorAll(`a.${IG_BUTTON_CLASS}`)).filter((button) => !button.previousElementSibling?.classList.contains('ig-owned'))
      .map((button) => button.dataset.href || '')
      .filter(Boolean);
    return [...new Set(links)];
  }
  function initIG() {
    if (initialized || isHost('indiegala.com')) return;
    initialized = true;
    GM_addStyle(IG_CSS);
    observer = mountObserver(addButtons);
  }
  async function runIGBatch() {
    if (isHost('indiegala.com')) return;
    addButtons();
    const links = collectBatchLinks();
    const failedLinks = [];
    for (const link of links) {
      const result = await addToIndiegalaLibrary(link);
      if (result === false) break;
      if (!result) {
        failedLinks.push(link);
      }
    }
    if (failedLinks.length === 0) {
      void showModal({
        title: '全部任务完成！',
        icon: 'success'
      });
      return;
    }
    void showModal({
      titleText: '以下任务未完成！',
      icon: 'warning',
      text: failedLinks.join('\n')
    });
  }

  // src/shared/storage.ts
  const SETTINGS_KEY = 'setting';
  const defaultSettings = {
    steam: {
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
    },
    ig: {
      enableButtons: true
    },
    itch: {
      autoClose: true
    }
  };
  function mergeSettings(settings = {}, base = defaultSettings) {
    return {
      steam: {
        ...base.steam,
        ...settings.steam
      },
      ig: {
        ...base.ig,
        ...settings.ig
      },
      itch: {
        ...base.itch,
        ...settings.itch
      }
    };
  }
  function getSettings() {
    return mergeSettings(GM_getValue(SETTINGS_KEY, {}));
  }
  function setSettings(settings) {
    GM_setValue(SETTINGS_KEY, mergeSettings(settings, getSettings()));
  }

  // src/modules/itch/redeem.ts
  const GAME_URL_RE = /^https?:\/\/.+?\.itch\.io\/[^/?#]+\/?(?:purchase(?:\?.*)?)?$/i;
  const REWARD_PURCHASE_URL_RE = /^https?:\/\/.+?\.itch\.io\/[^/?#]+\/purchase\?[^#]*reward_id=/i;
  const BUNDLE_URL_RE = /^https?:\/\/itch\.io\/s\/\d+\/.+/i;
  function log(message, icon = 'info', details) {
    if (typeof message !== 'string') {
      console.log(message);
      return;
    }
    updateOrShowModal({
      title: message,
      text: details,
      icon,
      className: 'break-all'
    });
    console.log(details ? `${message}
${details}` : message);
  }
  function parseHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  function textContent(documentOrElement, selector) {
    return documentOrElement.querySelector(selector)?.textContent?.trim() || '';
  }
  function inputValue(document2, selector) {
    const element = document2.querySelector(selector);
    return element?.value || element?.getAttribute('value') || '';
  }
  function isFreePurchasePage(document2) {
    const buttonMessage = document2.querySelector('.button_message');
    const dollars = buttonMessage?.querySelector('.dollars[itemprop]')?.textContent || '';
    const buyMessage = buttonMessage?.querySelector('.buy_message')?.textContent || '';
    const placeholder = document2.querySelector('.money_input')?.placeholder || '';
    return /0\.00/i.test(dollars) || /0\.00/i.test(placeholder) || /自己出价|Name your own price/i.test(buyMessage);
  }
  function isOwnedPageText(html) {
    return html.includes('purchase_banner_inner');
  }
  function isLinkedDownloadPage(document2) {
    const innerText = textContent(document2, 'div.inner_column');
    return /This page is linked|此页面已链接到帐户/i.test(innerText) || document2.querySelector('a.button.download_btn[data-upload_id]') !== null;
  }
  function normalizeGameUrl(target) {
    let url;
    try {
      url = new URL(target, window.location.href);
    } catch {
      return null;
    }
    if (REWARD_PURCHASE_URL_RE.test(url.href)) return url.href;
    if (!GAME_URL_RE.test(url.href)) return null;
    if (url.pathname.endsWith('/purchase')) {
      url.pathname = url.pathname.replace(/\/purchase\/?$/, '');
      url.search = '';
    }
    url.hash = '';
    return url.href.replace(/\/$/, '');
  }
  async function reportRequestFailure(message, response) {
    log(message, 'error');
    log(response);
  }
  async function checkOwnedAndRedeem(url) {
    log('当前游戏链接:', 'info', url);
    log('正在检测游戏是否拥有...', 'info', url);
    const response = await request({
      url,
      method: 'GET'
    });
    if (!response.ok || !response.text) {
      await reportRequestFailure('请求失败！', response);
      return;
    }
    if (isOwnedPageText(response.text)) {
      log('游戏已拥有！', 'success');
      return;
    }
    await purchase(url);
  }
  async function purchase(url) {
    try {
      log('正在加载购买页面...', 'info', url);
      const purchaseUrl = url.includes('/purchase') ? url : `${url}/purchase`;
      const response = await request({
        url: purchaseUrl,
        method: 'GET'
      });
      if (!response.ok || !response.text) {
        await reportRequestFailure('请求失败！', response);
        return;
      }
      const document2 = parseHtml(response.text);
      if (!isFreePurchasePage(document2)) {
        log('价格不为 0, 可能活动已结束！', 'error');
        return;
      }
      const csrfToken = inputValue(document2, '[name="csrf_token"]');
      const rewardId = inputValue(document2, '[name="reward_id"]');
      if (!csrfToken) {
        log('获取 csrf_token 失败！', 'error');
        return;
      }
      await download(purchaseUrl.replace(/\/purchase.*/, ''), csrfToken, rewardId);
    } catch (error) {
      log('请求失败！', 'error');
      log(error);
    }
  }
  async function download(url, csrfToken, rewardId) {
    log('正在请求下载页面...', 'info', url);
    const body = new URLSearchParams({ csrf_token: csrfToken });
    if (rewardId) body.set('reward_id', rewardId);
    const response = await request({
      url: `${url}/download_url`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      data: body.toString(),
      responseType: 'json'
    });
    if (response.ok && response.data?.url) {
      await loadDownload(response.data.url, url);
      return;
    }
    await reportRequestFailure('请求失败！', response);
  }
  function downloadHeaders(url, referer) {
    return {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      DNT: '1',
      Host: url.hostname,
      Referer: referer,
      'Upgrade-Insecure-Requests': '1'
    };
  }
  async function loadDownload(downloadUrl, referer) {
    log('正在加载下载页面...');
    const url = new URL(downloadUrl);
    const response = await request({
      url: url.href,
      method: 'GET',
      headers: downloadHeaders(url, referer)
    });
    if (!response.ok || !response.text) {
      await reportRequestFailure('请求失败！', response);
      return;
    }
    const document2 = parseHtml(response.text);
    const claimButton = Array.from(document2.querySelectorAll('button.button')).find((button) => /link|claim|链接/i.test(button.textContent || ''));
    const claimForm = document2.querySelector('form[action*="claim-key"]') || claimButton?.closest('form');
    if (isLinkedDownloadPage(document2)) {
      log('领取成功！', 'success');
    } else if (claimForm) {
      const action = claimForm.getAttribute('action');
      const csrfToken = claimForm.querySelector('input[name="csrf_token"]')?.value || '';
      if (action && csrfToken) {
        await claimGame(new URL(action, url.href).href, csrfToken, url.href);
      } else {
        log('获取领取表单失败！', 'error');
      }
    } else if (response.response?.finalUrl?.includes('/register')) {
      log('领取失败，请先登录！', 'error');
    } else {
      log('领取完成，结果未知！', 'success');
    }
    const checker = window.checkItchGame;
    if (typeof checker === 'function') checker();
  }
  async function claimGame(action, token, referer) {
    log('正在领取游戏...');
    const url = new URL(action);
    const response = await request({
      url: url.href,
      method: 'POST',
      headers: {
        ...downloadHeaders(url, referer),
        'Cache-Control': 'max-age=0',
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: url.origin
      },
      data: `csrf_token=${encodeURIComponent(token)}`
    });
    if (response.ok && response.text) {
      const document2 = parseHtml(response.text);
      log(isLinkedDownloadPage(document2) ? '领取成功！' : '领取完成，结果未知！', 'success');
    } else if (response.response?.finalUrl?.includes('/register')) {
      log('请先登录！', 'error');
      log(response);
    } else {
      await reportRequestFailure('请求失败！', response);
    }
  }
  function handleItchDownloadPage() {
    for (const button of Array.from(document.querySelectorAll('button.button'))) {
      if (/link|claim|链接/i.test(button.textContent || '')) button.click();
    }
    if (getSettings().itch.autoClose && isLinkedDownloadPage(document)) {
      window.close();
    }
  }
  function injectItchPurchaseButton() {
    const directDownloadButton = document.querySelector('a.direct_download_btn');
    if (/No thanks, just take me to the downloads|不用了，请带我去下载页面/i.test(directDownloadButton?.textContent || '')) {
      directDownloadButton?.click();
      return;
    }
    if (document.querySelector('.purchase_banner_inner') || !isFreePurchasePage(document)) return;
    const buyButton = document.querySelector('.buy_btn');
    if (!buyButton || buyButton.nextElementSibling?.classList.contains('redeem-itch-purchase')) return;
    const button = document.createElement('a');
    button.href = 'javascript:void(0)';
    button.target = '_self';
    button.className = 'button redeem-itch-purchase';
    button.title = '仅支持免费游戏';
    button.dataset.itchHref = buyButton.href;
    button.textContent = '后台领取';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      void redeemItchGame(button.dataset.itchHref || buyButton.href);
    });
    buyButton.after(button);
  }
  async function redeemItchGame(target) {
    log('当前游戏/优惠包链接:', 'info', target);
    if (BUNDLE_URL_RE.test(target)) {
      await redeemItchBundle(target);
      return;
    }
    const url = normalizeGameUrl(target);
    if (!url) return;
    await checkOwnedAndRedeem(url);
  }

  // src/modules/itch/bundle.ts
  const BUNDLE_URL_RE2 = /^https?:\/\/itch\.io\/s\/\d+\/.+/i;
  function log2(message, icon = 'info', details) {
    if (typeof message !== 'string') {
      console.log(message);
      return;
    }
    updateOrShowModal({ title: message, text: details, icon, className: 'break-all' });
    console.log(details ? `${message}
${details}` : message);
  }
  function parseBundleGames(html, baseUrl) {
    const document2 = new DOMParser().parseFromString(html, 'text/html');
    const games = Array.from(document2.querySelectorAll('.game_grid_widget.promo_game_grid a.thumb_link.game_link, a.thumb_link.game_link')).map((link) => new URL(link.href || link.getAttribute('href') || '', baseUrl).href.replace(/\/$/, ''))
      .filter((href) => /^https?:\/\/.+?\.itch\.io\/[^/?#]+$/i.test(href));
    return [...new Set(games)];
  }
  async function getItchBundleGames(url) {
    log2('正在获取优惠包信息...', 'info', url);
    const response = await request({
      url,
      method: 'GET'
    });
    if (!response.ok || !response.text) {
      log2('请求失败！', 'error');
      log2(response);
      return [];
    }
    if (response.text.includes('not_active_notification')) {
      log2('活动已结束！', 'error');
      return [];
    }
    return parseBundleGames(response.text, url);
  }
  async function redeemItchBundle(url) {
    if (!BUNDLE_URL_RE2.test(url)) return;
    const games = await getItchBundleGames(url);
    for (const game of games) {
      await redeemItchGame(game);
    }
  }
  async function redeemCurrentItchBundle() {
    const games = Array.from(document.querySelectorAll('.thumb_link.game_link'));
    for (const game of games) {
      await redeemItchGame(game.href);
    }
  }

  // src/modules/itch/extract.ts
  const GAME_LINK_RE = /^https?:\/\/.+?\.itch\.io\/[^/?#]+\/?(?:purchase)?$/i;
  const REWARD_LINK_RE = /^https?:\/\/.+?\.itch\.io\/[^/?#]+\/purchase\?[^#]*reward_id=/i;
  const BUNDLE_LINK_RE = /^https?:\/\/itch\.io\/s\/\d+\/.+/i;
  function log3(message, icon = 'info', details) {
    updateOrShowModal({ title: message, text: details, icon, className: 'break-all' });
    console.log(details ? `${message}
${details}` : message);
  }
  function normalizeHref(href) {
    try {
      const url = new URL(href, window.location.href);
      url.hash = '';
      if (BUNDLE_LINK_RE.test(url.href) || REWARD_LINK_RE.test(url.href)) return url.href.replace(/\/$/, '');
      if (!GAME_LINK_RE.test(url.href)) return null;
      if (url.pathname.endsWith('/purchase')) {
        url.pathname = url.pathname.replace(/\/purchase\/?$/, '');
        url.search = '';
      }
      return url.href.replace(/\/$/, '');
    } catch {
      return null;
    }
  }
  async function expandItchLink(href) {
    if (BUNDLE_LINK_RE.test(href)) {
      return getItchBundleGames(href);
    }
    const normalized = normalizeHref(href);
    return normalized ? [normalized] : [];
  }
  async function extractAndRedeemItchLinks() {
    log3('正在提取链接，请稍候...');
    const links = Array.from(document.querySelectorAll('a[href*="itch.io"]')).filter((link) => !link.classList.contains('itch-io-game-link-owned'))
      .filter((link) => !/itch\.io\/(?:b|c)\//i.test(link.href))
      .map((link) => link.dataset.itchHref || link.href);
    const games = [];
    for (const link of links) {
      log3('正在处理游戏/优惠包链接:', 'info', link);
      games.push(...await expandItchLink(link));
    }
    for (const game of [...new Set(games)]) {
      await redeemItchGame(game);
    }
    log3('全部领取完成！', 'success');
  }

  // src/modules/itch/index.ts
  const ITCH_PROCESSED_CLASS = 'redeem-itch-game';
  const ITCH_BUTTON_CLASS = 'redeem-itch-button';
  const EXTERNAL_HOSTS = [
    'keylol.com',
    'www.steamgifts.com',
    'www.reddit.com',
    'new.isthereanydeal.com',
    'freegames.codes',
    'itchclaim.tmbpeter.com',
    'shaigrorb.github.io'
  ];
  const ITCH_CSS = `
.rh-modal.break-all .rh-modal-title{word-wrap:break-word;word-break:break-all;}
.${ITCH_BUTTON_CLASS}{margin-left:10px !important;}
.freegames-codes .${ITCH_BUTTON_CLASS}{margin-top:10px !important;margin-left:0 !important;}
.shaigrorb-itch-button{position:relative;height:min-content;right:39px;background-color:#16a34a;top:4px;text-decoration-line:none;color:white;font-weight:bold;border-radius:2px;padding:5px;font-size:13px;}
`;
  let initialized2 = false;
  let observer2 = null;
  function isDownloadPage(url) {
    return /^https?:\/\/.+\.itch\.io\/[\w-]+\/download(?:\/.*|\?.*)?$/i.test(url);
  }
  function isPurchasePage(url) {
    return /^https?:\/\/.*?itch\.io\/.*?\/purchase(?:\?.*)?$/i.test(url);
  }
  function isBundlePage(url) {
    return /^https?:\/\/itch\.io\/s\/\d+\/.+/i.test(url);
  }
  function isEligibleItchHref(href) {
    try {
      const url = new URL(href, window.location.href);
      return /(^|\.)itch\.io$/i.test(url.hostname) && !/itch\.io\/(?:b|c)\//i.test(url.href) && (/^https?:\/\/itch\.io\/s\/\d+\/.+/i.test(url.href) || /^https?:\/\/.+?\.itch\.io\/[^/?#]+\/?(?:purchase(?:\?.*)?)?$/i.test(url.href));
    } catch {
      return false;
    }
  }
  function createRedeemButton(href) {
    const button = document.createElement('a');
    button.href = 'javascript:void(0);';
    button.target = '_self';
    button.dataset.itchHref = href;
    button.textContent = '领取';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      void redeemItchGame(href);
    });
    if (window.location.hostname === 'freegames.codes') {
      button.className = `details__buy ${ITCH_BUTTON_CLASS}`;
    } else if (window.location.hostname === 'shaigrorb.github.io') {
      button.className = `shaigrorb-itch-button ${ITCH_BUTTON_CLASS}`;
    } else {
      button.className = ITCH_BUTTON_CLASS;
    }
    return button;
  }
  function addExternalRedeemButtons() {
    for (const link of Array.from(document.querySelectorAll(`a[href*="itch.io"]:not(.${ITCH_PROCESSED_CLASS})`))) {
      link.classList.add(ITCH_PROCESSED_CLASS);
      const { href } = link;
      if (!isEligibleItchHref(href)) continue;
      const button = createRedeemButton(href);
      if (window.location.hostname === 'shaigrorb.github.io') {
        const card = link.closest('.item-card');
        (card || link).after(button);
      } else {
        link.after(button);
      }
    }
  }
  function injectBundleButton() {
    if (document.querySelector('#redeem-itch-io')) return;
    const button = document.createElement('button');
    button.id = 'redeem-itch-io';
    button.className = 'button';
    button.textContent = '后台领取';
    button.addEventListener('click', () => {
      void redeemCurrentItchBundle();
    });
    const buyRowButton = document.querySelector('.promotion_buy_row .buy_game_btn');
    if (buyRowButton) {
      button.setAttribute('style', 'font-size:18px;letter-spacing:0.025em;line-height:36px;height:40px;padding:0 20px;margin:0 16px');
      buyRowButton.after(button);
      return;
    }
    const countdownRow = document.querySelector('.countdown_row');
    if (!countdownRow) return;
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    button.setAttribute('style', 'font-size:18px;letter-spacing:0.025em;line-height:36px;padding:0 20px;margin:10px 30%;width:40%;');
    wrapper.append(button);
    countdownRow.prepend(wrapper);
  }
  function initItchHostPage() {
    const url = window.location.href;
    if (isDownloadPage(url)) {
      handleItchDownloadPage();
      return;
    }
    if (isPurchasePage(url)) {
      injectItchPurchaseButton();
      return;
    }
    if (isBundlePage(url)) {
      injectBundleButton();
    }
  }
  function initItch() {
    if (initialized2) return;
    initialized2 = true;
    GM_addStyle(ITCH_CSS);
    if (isHost('itch.io')) {
      initItchHostPage();
      return;
    }
    if (!isHost(EXTERNAL_HOSTS)) return;
    document.documentElement.classList.toggle('freegames-codes', window.location.hostname === 'freegames.codes');
    observer2 = mountObserver(addExternalRedeemButtons);
  }
  async function runItchExtract() {
    await extractAndRedeemItchLinks();
  }

  // src/shared/regex.ts
  const STEAM_KEY_RE = /\b(?:[A-Z0-9]{5}-){2,4}[A-Z0-9]{5}\b/gi;
  function extractSteamKeys(input) {
    const matches = input.match(STEAM_KEY_RE) ?? [];
    return [...new Set(matches.map((key) => key.toUpperCase()))];
  }

  // src/modules/steam/settings.ts
  function getSteamSettings() {
    const raw = GM_getValue('setting', {});
    if (raw && 'steam' in raw) {
      return getSettings().steam;
    }
    if (raw && Object.keys(raw).some((key) => key in defaultSettings.steam)) {
      const migrated = { ...defaultSettings.steam, ...raw };
      if (typeof migrated.asfPort === 'string') {
        migrated.asfPort = Number.parseInt(migrated.asfPort, 10) || defaultSettings.steam.asfPort;
      }
      setSettings({ steam: migrated });
      return migrated;
    }
    return getSettings().steam;
  }
  function saveSteamSettings(settings) {
    const next = {
      ...getSteamSettings(),
      ...settings,
      asfPort: Number(settings.asfPort ?? getSteamSettings().asfPort) || defaultSettings.steam.asfPort
    };
    setSettings({ steam: next });
  }
  function showHistory() {
    const history = GM_getValue('history');
    if (Array.isArray(history)) {
      showModal({
        closeOnClickOutside: false,
        className: 'swal-user',
        title: '上次激活记录：',
        content: htmlToElement(history[0]),
        buttons: { confirm: '确定' }
      });
      if (history[1]) {
        setTimeout(() => {
          const textarea = document.querySelector('.rh-modal-content textarea');
          if (textarea) textarea.value = history[1] ?? '';
        }, 0);
      }
    } else {
      showModal({ closeOnClickOutside: false, title: '没有操作记录！', icon: 'error', buttons: { cancel: '关闭' } });
    }
  }
  function showSwitchKey() {
    const content = htmlToElement(`
    <div class="switch-key">
      <div class="switch-key-left"><p>key</p><p>key</p><p>key</p><input name="keyType" type="radio" value="1"/></div>
      <div class="switch-key-right"><p>&nbsp;</p><p>key,key,key</p><p>&nbsp;</p><input name="keyType" type="radio" value="2"/></div>
    </div>
  `);
    showModal({
      closeOnClickOutside: false,
      title: '请选择要转换成什么格式：',
      content,
      buttons: { confirm: '确定', cancel: '关闭' }
    }).then((value) => {
      if (value) {
        const selectedValue = content.querySelector('input[name="keyType"]:checked')?.value;
        if (selectedValue) {
          showSwitchArea(selectedValue);
        } else {
          showModal({ closeOnClickOutside: false, title: '请选择要将key转换成什么格式！', icon: 'warning' }).then(() => showSwitchKey());
        }
      }
    });
    content.querySelectorAll('div').forEach((div) => div.addEventListener('click', () => div.querySelector('input')?.click()));
  }
  function showSwitchArea(type) {
    const textarea = document.createElement('textarea');
    textarea.style.width = '80%';
    textarea.style.height = '100px';
    showModal({
      closeOnClickOutside: false,
      title: '请输入要转换的key:',
      content: textarea,
      buttons: { confirm: '转换', back: '返回', cancel: '关闭' }
    }).then((value) => {
      if (value === 'back') {
        showSwitchKey();
      } else if (value) {
        switchKey(textarea.value, type);
      }
    });
  }
  function switchKey(key, type) {
    const keys = extractSteamKeys(key);
    if (type === '1') {
      showKey(keys.join('\n'), type);
    } else if (type === '2') {
      showKey(keys.join(','), type);
    }
  }
  function showKey(key, type) {
    const textarea = document.createElement('textarea');
    textarea.style.width = '80%';
    textarea.style.height = '100px';
    textarea.readOnly = true;
    textarea.value = key;
    textarea.addEventListener('click', () => textarea.select());
    showModal({
      closeOnClickOutside: false,
      icon: 'success',
      title: '转换成功！',
      content: textarea,
      buttons: { confirm: '返回', cancel: '关闭' }
    }).then((value) => {
      if (value) showSwitchArea(type);
    });
  }
  function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild ?? document.createElement('div');
  }
  function openSteamSettingsDialog() {
    const setting = getSteamSettings();
    const div = htmlToElement(`
    <div id="hclonely-asf">
      <input type="checkbox" name="newTab" ${setting.newTab ? 'checked' : ''} title="开启ASF激活后此功能无效"/>
      <span title="开启ASF激活后此功能无效">新标签页激活</span><br/>
      <input type="checkbox" name="copyListen" ${setting.copyListen ? 'checked' : ''} title="复制key时询问是否激活"/>
      <span title="复制key时询问是否激活">开启复制捕捉</span>
      <input type="checkbox" name="selectListen" ${setting.selectListen ? 'checked' : ''} title="选中key时显示激活图标"/>
      <span title="选中key时显示激活图标">开启选中捕捉</span>
      <input type="checkbox" name="clickListen" ${setting.clickListen ? 'checked' : ''} title="点击key时添加激活链接"/>
      <span title="点击key时添加激活链接">开启点击捕捉</span><br/>
      <input type="checkbox" name="allKeyListen" ${setting.allKeyListen ? 'checked' : ''} title="匹配页面内所有符合steam key格式的内容"/>
      <span title="匹配页面内所有符合steam key格式的内容">捕捉页面内所有key</span>
      <div class="rh-modal-title">ASF IPC设置</div>
      <span>ASF IPC协议</span><input type="text" name="asfProtocol" value="${setting.asfProtocol}" placeholder="http或https,默认为http"/><br/>
      <span>ASF IPC地址</span><input type="text" name="asfHost" value="${setting.asfHost}" placeholder="ip地址或域名,默认为127.0.0.1"/><br/>
      <span>ASF IPC端口</span><input type="text" name="asfPort" value="${setting.asfPort}" placeholder="默认1242"/><br/>
      <span>ASF IPC密码</span><input type="text" name="asfPassword" value="${setting.asfPassword}" placeholder="ASF IPC密码"/><br/>
      <span>ASF Bot名字</span><input type="text" name="asfBot" value="${setting.asfBot}" placeholder="ASF Bot name,可留空"/><br/>
      <input type="checkbox" name="asf" ${setting.asf ? 'checked' : ''} title="此功能默认关闭新标签页激活"/>
      <span title="此功能默认关闭新标签页激活">开启ASF激活</span>
    </div>
  `);
    showModal({
      closeOnClickOutside: false,
      className: 'asf-class',
      title: '全局设置',
      content: div,
      buttons: { save: '保存', showHistory: '上次激活记录', showSwitchKey: 'Key格式转换', cancel: '取消' }
    }).then((value) => {
      if (value === 'save') {
        const next = {};
        div.querySelectorAll('input').forEach((input) => {
          const { name } = input;
          if (!name) return;
          if (input.type === 'checkbox') {
            next[name] = input.checked;
          } else if (name === 'asfPort') {
            next.asfPort = Number.parseInt(input.value, 10) || defaultSettings.steam.asfPort;
          } else {
            next[name] = input.value;
          }
        });
        saveSteamSettings(next);
        showModal({ closeOnClickOutside: false, icon: 'success', title: '保存成功！', text: '刷新页面后生效！', buttons: { confirm: '确定' } });
      } else if (value === 'showHistory') {
        showHistory();
      } else if (value === 'showSwitchKey') {
        showSwitchKey();
      }
    });
  }

  // src/modules/steam/asfCommands.generated.ts
  const ASF_COMMANDS_HTML = `<table role="table" class="hclonely">
<thead>
<tr>
<th>命令</th>
<th>权限</th>
<th>描述</th>
<th>操作</th></tr>
</thead>
<tbody>
<tr>
<td><code>2fa [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人生成临时的​<strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN">两步验证</a></strong>​令牌。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2fa [Bots]">使用</button></td></tr>
<tr>
<td><code>2fafinalize [Bots] &lt;ActivationCode&gt;</code></td>
<td><code>Master</code></td>
<td>使用短信或邮件验证码，完成为指定机器人绑定新<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据的流程。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2fafinalize [Bots] &lt;ActivationCode&gt;">使用</button></td></tr>
<tr>
<td><code>2fafinalized [Bots] &lt;2FACodeFromApp&gt;</code></td>
<td><code>Master</code></td>
<td>为指定机器人导入已创建完成的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据，并用两步验证令牌代码验证。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2fafinalized [Bots] &lt;2FACodeFromApp&gt;">使用</button></td></tr>
<tr>
<td><code>2fafinalizedforce [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人导入已创建完成的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据，并跳过两步验证令牌代码验证。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2fafinalizedforce [Bots]">使用</button></td></tr>
<tr>
<td><code>2fainit [Bots]</code></td>
<td><code>Master</code></td>
<td>开始为指定机器人绑定新<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN#%E5%88%9B%E5%BB%BA"><strong>两步验证</strong></a>凭据的流程。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2fainit [Bots]">使用</button></td></tr>
<tr>
<td><code>2fano [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人拒绝所有等待操作的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN"><strong>两步验证</strong></a>交易确认。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2fano [Bots]">使用</button></td></tr>
<tr>
<td><code>2faok [Bots]</code></td>
<td><code>Master</code></td>
<td>为指定机器人接受所有等待操作的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Two-factor-authentication-zh-CN"><strong>两步验证</strong></a>交易确认。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="2faok [Bots]">使用</button></td></tr>
<tr>
<td><code>addlicense [Bots] &lt;Licenses&gt;</code></td>
<td><code>Operator</code></td>
<td>为指定机器人激活给定的 <code>Licenses </code>（许可），该参数解释详见<a href="#%E8%AE%B8%E5%8F%AF"><strong>下文</strong></a>（仅限免费游戏）。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="addlicense [Bots] &lt;Licenses&gt;">使用</button></td></tr>
<tr>
<td><code>balance [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 Steam 钱包余额。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="balance [Bots]">使用</button></td></tr>
<tr>
<td><code>bgr [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Background-games-redeemer-zh-CN">BGR</a></strong>（后台游戏激活器）队列信息。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="bgr [Bots]">使用</button></td></tr>
<tr>
<td><code>bgrclear [Bots]</code></td>
<td><code>Master</code></td>
<td>清除指定机器人的<a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Background-games-redeemer-zh-CN"><strong>后台游戏激活器</strong></a>队列。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="bgrclear [Bots]">使用</button></td></tr>
<tr>
<td><code>encrypt &lt;encryptionMethod&gt; &lt;stringToEncrypt&gt;</code></td>
<td><code>Owner</code></td>
<td>以给定的加密方式加密字符串——详见<a href="#encrypt-%E5%91%BD%E4%BB%A4"><strong>下文的解释</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="encrypt &lt;encryptionMethod&gt; &lt;stringToEncrypt&gt;">使用</button></td></tr>
<tr>
<td><code>exit</code></td>
<td><code>Owner</code></td>
<td>完全停止 ASF 进程。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="exit">使用</button></td></tr>
<tr>
<td><code>farm [Bots]</code></td>
<td><code>Master</code></td>
<td>重新启动指定机器人的挂卡模块。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="farm [Bots]">使用</button></td></tr>
<tr>
<td><code>fb [Bots]</code></td>
<td><code>Master</code></td>
<td>列出指定机器人的自动挂卡黑名单。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="fb [Bots]">使用</button></td></tr>
<tr>
<td><code>fbadd [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 加入指定机器人的自动挂卡黑名单。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="fbadd [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>fbrm [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code>（或使用 <code>all</code> 表示所有）从指定机器人的自动挂卡黑名单中移除。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="fbrm [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>fq [Bots]</code></td>
<td><code>Master</code></td>
<td>列出指定机器人的优先挂卡队列。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="fq [Bots]">使用</button></td></tr>
<tr>
<td><code>fqadd [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 加入指定机器人的优先挂卡队列。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="fqadd [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>fqrm [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code>（或使用 <code>all</code> 表示所有）从指定机器人的优先挂卡队列中移除。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="fqrm [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>hash &lt;hashingMethod&gt; &lt;stringToHash&gt;</code></td>
<td><code>Owner</code></td>
<td>以指定的加密方式生成给定字符串的哈希值——详见<a href="#hash-%E5%91%BD%E4%BB%A4"><strong>下文的解释</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="hash &lt;hashingMethod&gt; &lt;stringToHash&gt;">使用</button></td></tr>
<tr>
<td><code>help</code></td>
<td><code>FamilySharing</code></td>
<td>显示帮助（指向此页面的链接）。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="help">使用</button></td></tr>
<tr>
<td><code>input [Bots] &lt;Type&gt; &lt;Value&gt;</code></td>
<td><code>Master</code></td>
<td>为指定机器人填写给定的输入值，仅在 <code>Headless</code> 模式中可用——详见<a href="#input-%E5%91%BD%E4%BB%A4"><strong>下文的解释</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="input [Bots] &lt;Type&gt; &lt;Value&gt;">使用</button></td></tr>
<tr>
<td><code>inventory [Bots]</code></td>
<td><code>Operator</code></td>
<td>显示指定机器人的库存摘要。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="inventory [Bots]">使用</button></td></tr>
<tr>
<td><code>level [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 Steam 帐户等级。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="level [Bots]">使用</button></td></tr>
<tr>
<td><code>loot [Bots]</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="loot [Bots]">使用</button></td></tr>
<tr>
<td><code>loot@ [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有符合给定 <code>AppIDs</code> 的 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。 此命令与 <code>loot%</code> 相反。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="loot@ [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>loot% [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有不符合给定 <code>AppIDs</code> 的 <code>LootableTypes</code> 社区物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。 此命令与 <code>loot@</code> 相反。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="loot% [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>loot^ [Bots] &lt;AppID&gt; &lt;ContextID&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 的物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="loot^ [Bots] &lt;AppID&gt; &lt;ContextID&gt;">使用</button></td></tr>
<tr>
<td><code>loot&amp; [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;Rarities&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 并且符合给定 <strong><a href="#%E5%B7%B2%E7%9F%A5%E7%9A%84%E7%A8%80%E6%9C%89%E5%BA%A6"><code>Rarities</code></a></strong> 的物品拾取到其 <code>SteamUserPermissions</code> 属性中设置的 <code>Master</code> 用户（如果有多个则取 steamID 最小的）。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="loot&amp; [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;Rarities&gt;">使用</button></td></tr>
<tr>
<td><code>mab [Bots]</code></td>
<td><code>Master</code></td>
<td>列出 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>MatchActively</code></a></strong> 自动交易的 App 黑名单。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="mab [Bots]">使用</button></td></tr>
<tr>
<td><code>mabadd [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code> 加入到 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>MatchActively</code></a></strong> 自动交易的 App 黑名单。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="mabadd [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>mabrm [Bots] &lt;AppIDs&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>AppIDs</code>（或使用 <code>all</code> 表示所有）从 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>MatchActively</code></a></strong> 自动交易的 App 黑名单中移除。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="mabrm [Bots] &lt;AppIDs&gt;">使用</button></td></tr>
<tr>
<td><code>match [Bots]</code></td>
<td><code>Master</code></td>
<td>控制 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/ItemsMatcherPlugin-zh-CN#matchactively%E4%B8%BB%E5%8A%A8%E5%8C%B9%E9%85%8D"><code>ItemsMatcherPlugin</code></a></strong> 的特殊命令，用于立即触发 <code>MatchActively</code> 流程。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="match [Bots]">使用</button></td></tr>
<tr>
<td><code>nickname [Bots] &lt;Nickname&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的昵称更改为 <code>Nickname</code>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="nickname [Bots] &lt;Nickname&gt;">使用</button></td></tr>
<tr>
<td><code>owns [Bots] &lt;Games&gt;</code></td>
<td><code>Operator</code></td>
<td>检查指定机器人是否已拥有 <code>Games</code>，该参数解释详见<a href="#owns-%E5%91%BD%E4%BB%A4%E7%9A%84-games-%E5%8F%82%E6%95%B0"><strong>下文</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="owns [Bots] &lt;Games&gt;">使用</button></td></tr>
<tr>
<td><code>pause [Bots]</code></td>
<td><code>Operator</code></td>
<td>永久暂停指定机器人的自动挂卡模块。 ASF 在本次会话中将不会再尝试对此帐户进行挂卡，除非您手动 <code>resume</code> 或者重启 ASF。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="pause [Bots]">使用</button></td></tr>
<tr>
<td><code>pause~ [Bots]</code></td>
<td><code>FamilySharing</code></td>
<td>临时暂停指定机器人的自动挂卡模块。 挂卡进程将会在下次游戏事件或者机器人断开连接时自动恢复。 您可以 <code>resume</code> 以恢复挂卡。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="pause~ [Bots]">使用</button></td></tr>
<tr>
<td><code>pause&amp; [Bots] &lt;Seconds&gt;</code></td>
<td><code>Operator</code></td>
<td>临时暂停指定机器人的自动挂卡模块 <code>Seconds</code> 秒。 之后，挂卡模块会自动恢复。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="pause&amp; [Bots] &lt;Seconds&gt;">使用</button></td></tr>
<tr>
<td><code>play [Bots] &lt;AppIDs,GameName&gt;</code></td>
<td><code>Master</code></td>
<td>切换到手动挂卡——使指定机器人运行给定的 <code>AppIDs</code>，并且可选自定义 <code>GameName</code> 为游戏名称。 若要此功能正常工作，您的 Steam 帐户<strong>必须</strong>拥有所有您指定的 <code>AppIDs</code> 的有效许可，包括免费游戏。 使用 <code>reset</code> 或 <code>resume</code> 命令恢复。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="play [Bots] &lt;AppIDs,GameName&gt;">使用</button></td></tr>
<tr>
<td><code>points [Bots]</code></td>
<td><code>Master</code></td>
<td>显示指定机器人的 <a href="https://store.steampowered.com/points/shop" rel="nofollow"><strong>Steam 点数商店</strong></a>点数余额。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="points [Bots]">使用</button></td></tr>
<tr>
<td><code>privacy [Bots] &lt;Settings&gt;</code></td>
<td><code>Master</code></td>
<td>更改指定机器人的 <strong><a href="https://steamcommunity.com/my/edit/settings" rel="nofollow">Steam 隐私设置</a></strong>，可用选项见<a href="#privacy-%E8%AE%BE%E7%BD%AE"><strong>下文</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="privacy [Bots] &lt;Settings&gt;">使用</button></td></tr>
<tr>
<td><code>redeem [Bots] &lt;Keys&gt;</code></td>
<td><code>Operator</code></td>
<td>为指定机器人激活给定的游戏序列号或钱包充值码。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="redeem [Bots] &lt;Keys&gt;">使用</button></td></tr>
<tr>
<td><code>redeem^ [Bots] &lt;Modes&gt; &lt;Keys&gt;</code></td>
<td><code>Operator</code></td>
<td>以 <code>Modes</code> 模式为指定机器人激活给定的游戏序列号或钱包充值码，模式详见下文的<a href="#redeem-%E6%A8%A1%E5%BC%8F"><strong>解释</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="redeem^ [Bots] &lt;Modes&gt; &lt;Keys&gt;">使用</button></td></tr>
<tr>
<td><code>redeempoints [Bots] &lt;DefinitionIDs&gt;</code></td>
<td><code>Operator</code></td>
<td>为指定机器人以 <a href="https://store.steampowered.com/points/shop" rel="nofollow"><strong>Steam 点数</strong></a>兑换给定物品。 默认只允许免费物品，如果要无条件兑换物品，包括付费物品，则需要在每个符合条件的物品 <code>DefinitionID</code> 结尾添加 <code>!</code> 符号。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="redeempoints [Bots] &lt;DefinitionIDs&gt;">使用</button></td></tr>
<tr>
<td><code>reset [Bots]</code></td>
<td><code>Master</code></td>
<td>重置为原始（之前的）游玩状态，用来配合 <code>play</code> 命令的手动挂卡模式使用。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="reset [Bots]">使用</button></td></tr>
<tr>
<td><code>restart</code></td>
<td><code>Owner</code></td>
<td>重新启动 ASF 进程。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="restart">使用</button></td></tr>
<tr>
<td><code>resume [Bots]</code></td>
<td><code>FamilySharing</code></td>
<td>恢复指定机器人的自动挂卡进程。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="resume [Bots]">使用</button></td></tr>
<tr>
<td><code>rmlicense [Bots] &lt;Licenses&gt;</code></td>
<td><code>Master</code></td>
<td>为指定机器人移除给定的 <code>Licenses </code>（许可），该参数解释详见<a href="#%E8%AE%B8%E5%8F%AF"><strong>下文</strong></a>。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="rmlicense [Bots] &lt;Licenses&gt;">使用</button></td></tr>
<tr>
<td><code>start [Bots]</code></td>
<td><code>Master</code></td>
<td>启动指定机器人。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="start [Bots]">使用</button></td></tr>
<tr>
<td><code>stats</code></td>
<td><code>Owner</code></td>
<td>显示进程统计信息，例如托管内存用量。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="stats">使用</button></td></tr>
<tr>
<td><code>status [Bots]</code></td>
<td><code>FamilySharing</code></td>
<td>显示指定机器人的状态。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="status [Bots]">使用</button></td></tr>
<tr>
<td><code>std [Bots]</code></td>
<td><code>Master</code></td>
<td>控制 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/SteamTokenDumperPlugin-zh-CN"><code>SteamTokenDumperPlugin</code></a></strong> 的特殊命令，用于触发刷新指定的机器人并立即提交数据。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="std [Bots]">使用</button></td></tr>
<tr>
<td><code>stop [Bots]</code></td>
<td><code>Master</code></td>
<td>停止指定机器人。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="stop [Bots]">使用</button></td></tr>
<tr>
<td><code>tb [Bots]</code></td>
<td><code>Master</code></td>
<td>列出指定机器人的交易黑名单用户。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="tb [Bots]">使用</button></td></tr>
<tr>
<td><code>tbadd [Bots] &lt;SteamIDs64&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>SteamIDs</code> 加入指定机器人的交易黑名单。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="tbadd [Bots] &lt;SteamIDs64&gt;">使用</button></td></tr>
<tr>
<td><code>tbrm [Bots] &lt;SteamIDs64&gt;</code></td>
<td><code>Master</code></td>
<td>将给定的 <code>SteamIDs</code>（或使用 <code>all</code> 表示所有）从指定机器人的交易黑名单中移除。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="tbrm [Bots] &lt;SteamIDs64&gt;">使用</button></td></tr>
<tr>
<td><code>transfer [Bots] &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="transfer [Bots] &lt;TargetBot&gt;">使用</button></td></tr>
<tr>
<td><code>transfer@ [Bots] &lt;AppIDs&gt; &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有符合给定 <code>AppIDs</code> 的 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。 此命令与 <code>transfer%</code> 相反。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="transfer@ [Bots] &lt;AppIDs&gt; &lt;TargetBot&gt;">使用</button></td></tr>
<tr>
<td><code>transfer% [Bots] &lt;AppIDs&gt; &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的所有不符合给定 <code>AppIDs</code> 的 <code>TransferableTypes</code> 社区物品转移到一个目标机器人。 此命令与 <code>transfer@</code> 相反。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="transfer% [Bots] &lt;AppIDs&gt; &lt;TargetBot&gt;">使用</button></td></tr>
<tr>
<td><code>transfer^ [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 的物品转移到一个目标机器人。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="transfer^ [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt;">使用</button></td></tr>
<tr>
<td><code>transfer&amp; [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt; &lt;Rarities&gt;</code></td>
<td><code>Master</code></td>
<td>将指定机器人的 <code>ContextID</code> 库存分类中符合给定 <code>AppID</code> 并且符合给定 <strong><a href="#%E5%B7%B2%E7%9F%A5%E7%9A%84%E7%A8%80%E6%9C%89%E5%BA%A6"><code>Rarities</code></a></strong> 的物品转移到一个目标机器人。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="transfer&amp; [Bots] &lt;AppID&gt; &lt;ContextID&gt; &lt;TargetBot&gt; &lt;Rarities&gt;">使用</button></td></tr>
<tr>
<td><code>unpack [Bots]</code></td>
<td><code>Master</code></td>
<td>拆开指定机器人库存中的所有补充包。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="unpack [Bots]">使用</button></td></tr>
<tr>
<td><code>update [Channel]</code></td>
<td><code>Owner</code></td>
<td>在 GitHub 上检查 ASF 新版本，如果可用则更新。 通常这会每隔 <code>UpdatePeriod</code> 自动执行一次。 可选的 <code>Channel</code> 参数指定 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#updatechannel"><code>UpdateChannel</code></a></strong>，如果未提供，则默认使用全局设置中的值。 <code>Channel</code> 可以用 <code>!</code> 字符结尾，这会强制在指定频道上更新——包括降级等操作。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="update [Channel]">使用</button></td></tr>
<tr>
<td><code>updateplugins [Channel] [Plugins]</code></td>
<td><code>Owner</code></td>
<td>更新指定的插件。 如果插件支持多个更新频道，可选的 <code>Channel</code> 参数允许您选择不同的 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#updatechannel"><code>UpdateChannel</code></a></strong> 进行更新。 <code>Channel</code> 可以用 <code>!</code> 字符结尾，这会强制在指定频道上更新——包括降级等操作，但具体的功能取决于插件自身。 如果不指定 <code>Plugins</code>，则所有由 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#pluginsupdatelist"><code>PluginsUpdateList</code></a></strong> 和 <strong><a href="https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Configuration-zh-CN#pluginsupdatemode"><code>PluginsUpdateMode</code></a></strong> 配置判断为允许自动更新的插件都会被更新。 如果您要更新指定插件，特别是已经默认禁用自动更新的，则需要同时提供 <code>Channel</code> 和 <code>Plugins</code> 参数，这样 ASF 就会忽略其自动更新设置，强行更新它们。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="updateplugins [Channel] [Plugins]">使用</button></td></tr>
<tr>
<td><code>version</code></td>
<td><code>FamilySharing</code></td>
<td>显示 ASF 的版本号。</td>
<td><button type="button" class="rh-modal-button rh-asf-use" data-command="version">使用</button></td></tr>
</tbody>
</table>`;

  // src/modules/steam/asf.ts
  function getASFHeaders(setting = getSteamSettings()) {
    const origin = `${setting.asfProtocol}://${setting.asfHost}:${setting.asfPort}`;
    return {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authentication: setting.asfPassword,
      Host: `${setting.asfHost}:${setting.asfPort}`,
      Origin: origin,
      Referer: `${origin}/page/commands`
    };
  }
  function getASFUrl(setting = getSteamSettings()) {
    return `${setting.asfProtocol}://${setting.asfHost}:${setting.asfPort}/Api/Command`;
  }
  function htmlToElement2(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild ?? document.createElement('div');
  }
  function showASFRequired() {
    showModal({
      closeOnClickOutside: false,
      className: 'swal-user',
      icon: 'warning',
      title: '此功能需要在设置中配置ASF IPC并开启ASF功能！',
      buttons: { confirm: '确定' }
    });
  }
  function normalizeASFCommandFromTable(rawCommand, asfBot) {
    const command = rawCommand.trim().replace(/^!/, '');
    if (!command) return '';
    if (asfBot.trim()) {
      return `!${command.replace(/\[Bots\]/g, asfBot.trim())}`;
    }
    return `!${command}`;
  }
  function asfSend(command = '') {
    const setting = getSteamSettings();
    if (!setting.asf) {
      showASFRequired();
      return;
    }
    const input = document.createElement('input');
    input.placeholder = '输入ASF指令';
    input.value = command ? `!${command.replace(/^!/, '')}` : '';
    const modalPromise = showModal({
      closeOnClickOutside: false,
      className: 'swal-user',
      text: '请在下方输入要执行的ASF指令：',
      content: input,
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
    });
    requestAnimationFrame(() => input.focus());
    modalPromise.then((value) => {
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
        showASFCommands();
        break;
      case null:
      case void 0:
        break;
      default: {
        const inputValue2 = input.value.trim();
        if (!inputValue2) {
          showModal({ closeOnClickOutside: false, title: 'ASF指令不能为空！', icon: 'warning', buttons: { confirm: '确定' } }).then(() => asfSend(command));
        } else {
          asfRedeem(inputValue2);
        }
      }
      }
    });
  }
  function showASFCommands() {
    const content = htmlToElement2(ASF_COMMANDS_HTML);
    content.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('button.rh-asf-use[data-command]');
      if (!button) return;
      const setting = getSteamSettings();
      const normalizedCommand = normalizeASFCommandFromTable(button.dataset.command ?? '', setting.asfBot ?? '');
      if (!normalizedCommand) return;
      asfSend(normalizedCommand);
    });
    showModal({
      closeOnClickOutside: false,
      className: 'swal-user',
      text: 'ASF指令',
      content,
      buttons: { confirm: '返回', cancel: '关闭' }
    }).then((value) => {
      if (value) asfSend();
    });
  }
  function swalRedeem() {
    const textarea = document.createElement('textarea');
    textarea.id = 'keyText';
    textarea.className = 'asf-output';
    showModal({
      closeOnClickOutside: false,
      className: 'swal-user',
      title: '请输入要激活的key:',
      content: textarea,
      buttons: { confirm: '激活', cancel: '返回' }
    }).then((value) => {
      if (value) {
        const keys = extractSteamKeys(textarea.value.trim());
        if (keys.length > 0) {
          const setting = getSteamSettings();
          const asfBot = setting.asfBot ? `${setting.asfBot} ` : '';
          asfRedeem(`!redeem ${asfBot}${keys.join(',')}`);
        } else {
          showModal({ closeOnClickOutside: false, title: 'steam key不能为空！', icon: 'error', buttons: { confirm: '返回', cancel: '关闭' } }).then((v) => {
            if (v) swalRedeem();
          });
        }
      } else {
        asfSend();
      }
    });
  }
  function asfTest() {
    const setting = getSteamSettings();
    if (!setting.asf) {
      showModal({ closeOnClickOutside: false, title: '请先在设置中开启ASF功能', icon: 'warning', buttons: { confirm: '确定' } });
      return;
    }
    const apiUrl = getASFUrl(setting);
    showModal({ closeOnClickOutside: false, title: 'ASF连接测试', text: `正在尝试连接 "${apiUrl}"`, buttons: { confirm: '确定' } });
    void request({
      method: 'POST',
      url: apiUrl,
      data: '{"Command":"!stats"}',
      responseType: 'json',
      headers: getASFHeaders(setting)
    }).then(({ status, data, text }) => {
      if (status === 200) {
        if (data?.Success === true && data.Message === 'OK' && data.Result) {
          showModal({
            closeOnClickOutside: false, title: 'ASF连接成功！', icon: 'success', text: `连接地址 "${apiUrl}"
返回内容 "${data.Result.trim()}"`, buttons: { confirm: '确定' }
          });
        } else if (data?.Message) {
          showModal({
            closeOnClickOutside: false, title: 'ASF连接成功？', icon: 'info', text: `连接地址 "${apiUrl}"
返回内容 "${data.Message.trim()}"`, buttons: { confirm: '确定' }
          });
        } else {
          showModal({
            closeOnClickOutside: false, title: 'ASF连接失败！', icon: 'error', text: `连接地址 "${apiUrl}"
返回内容 "${text ?? ''}"`, buttons: { confirm: '确定' }
          });
        }
      } else {
        showModal({ closeOnClickOutside: false, title: `ASF连接失败：${status}`, icon: 'error', text: `连接地址 "${apiUrl}"`, buttons: { confirm: '确定' } });
      }
    });
  }
  function asfRedeem(command) {
    const setting = getSteamSettings();
    const apiUrl = getASFUrl(setting);
    const textarea = document.createElement('textarea');
    textarea.className = 'asf-output';
    textarea.readOnly = true;
    const isRedeemCommand = /!redeem/gim.test(command);
    showModal({
      closeOnClickOutside: false,
      className: 'swal-user',
      text: `正在执行ASF指令：${command}`,
      content: textarea,
      buttons: isRedeemCommand ? { confirm: '提取未使用key', cancel: '关闭' } : { confirm: '确定' }
    }).then((value) => {
      if (!isRedeemCommand) return;
      GM_setValue('history', [document.querySelector('.rh-modal-content')?.innerHTML ?? '', textarea.value]);
      if (value) {
        const unusedKeys = textarea.value.split(/[(\r\n)\r\n]+/).filter((line) => /未使用/gim.test(line))
          .join(',');
        if (unusedKeys) {
          GM_setClipboard(extractSteamKeys(unusedKeys).join(','));
          showModal({ title: '复制成功！', icon: 'success' });
        }
      }
    });
    void request({
      method: 'POST',
      url: apiUrl,
      data: JSON.stringify({ Command: command }),
      responseType: 'json',
      headers: getASFHeaders(setting)
    }).then(({ status, data, text, error }) => {
      if (status === 200) {
        if (data?.Success && data.Message === 'OK' && data.Result) {
          textarea.value += `${data.Result.trim()}
`;
        } else if (data?.Message) {
          textarea.value += `${data.Message.trim()}
`;
        } else {
          textarea.value += text ?? '';
        }
        return;
      }
      showModal({
        closeOnClickOutside: false,
        className: 'swal-user',
        title: `执行ASF指令(${command})失败！请检查ASF配置是否正确！`,
        text: text || String(error ?? status),
        icon: 'error',
        buttons: { confirm: '关闭' }
      });
    });
  }
  function openASFDialog() {
    asfSend();
  }

  // src/modules/steam/steamWeb.ts
  const STEAM_HOSTS = {
    STORE: 'store.steampowered.com',
    LOGIN: 'login.steampowered.com'
  };
  function showSwalMessage(options) {
    return showModal({ className: 'swal-user', closeOnClickOutside: false, ...options });
  }
  function htmlToElement3(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild ?? document.createElement('div');
  }
  async function refreshToken() {
    const formData = new FormData();
    formData.append('redir', `https://${STEAM_HOSTS.STORE}/`);
    const response = await request({
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
    if (response.ok && response.data?.success) {
      return setStoreToken(response.data);
    }
    return false;
  }
  async function setStoreToken(param) {
    const formData = new FormData();
    formData.append('steamID', param.steamID);
    formData.append('nonce', param.nonce);
    formData.append('redir', param.redir);
    formData.append('auth', param.auth);
    const response = await request({
      url: `https://${STEAM_HOSTS.STORE}/login/settoken`,
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Host: STEAM_HOSTS.STORE,
        Origin: `https://${STEAM_HOSTS.STORE}`
      },
      data: formData
    });
    return response.status === 200;
  }
  async function updateStoreAuth(retry = false) {
    const response = await request({
      url: `https://${STEAM_HOSTS.STORE}/`,
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
    const html = response.text ?? '';
    if (response.status === 200) {
      if (!html.includes('data-miniprofile=')) {
        if (await refreshToken()) return retry ? false : updateStoreAuth(true);
        return false;
      }
      const storeSessionID = html.match(/g_sessionID = "(.+?)";/)?.[1];
      if (storeSessionID) {
        setSteamSessionID(storeSessionID);
        return true;
      }
      return false;
    }
    if ([301, 302].includes(response.status)) {
      if (await refreshToken()) return retry ? false : updateStoreAuth(true);
      return false;
    }
    return false;
  }
  function createRedeemContent() {
    return htmlToElement3(`
    <div id="registerkey_examples_text">
      <div class="notice_box_content" id="unusedKeyArea">
        <b>未使用的Key：</b><br>
        <div><ol id="unusedKeys" align="left"></ol></div>
      </div>
      <div class="table-responsive table-condensed">
        <table class="table table-hover hclonely">
          <caption><h2>激活记录</h2></caption>
          <thead><tr><th>No.</th><th>Key</th><th>结果</th><th>详情</th><th>Sub</th></tr></thead>
          <tbody></tbody>
        </table>
      </div><br>
    </div>
  `);
  }
  function webRedeem(keysCsv) {
    const redeemContent = createRedeemContent();
    showSwalMessage({ title: '正在获取sessionID...', buttons: { confirm: '关闭' } });
    if (!getSteamSessionID()) {
      handleNoSession(keysCsv, redeemContent);
      return;
    }
    showRedeemDialog(keysCsv, redeemContent);
  }
  function handleNoSession(keysCsv, redeemContent) {
    void request({
      method: 'GET',
      url: 'https://store.steampowered.com/account/registerkey'
    }).then(async (response) => {
      if ((response.response?.finalUrl ?? '').includes('login') && !await updateStoreAuth()) {
        showSwalMessage({
          title: '请先登录steam！',
          icon: 'warning',
          buttons: { confirm: '登录', cancel: '关闭' }
        }).then((value) => {
          if (value) window.open('https://store.steampowered.com/login/', '_blank');
        });
      } else if (response.status === 200) {
        setSteamSessionID(response.text?.match(/g_sessionID = "(.+?)";/)?.[1] || '');
        showRedeemDialog(keysCsv, redeemContent);
      } else {
        showSwalMessage({ title: '获取sessionID失败！', icon: 'error', buttons: { confirm: '关闭' } });
      }
    });
  }
  function showRedeemDialog(keysCsv, redeemContent) {
    setRedeemRenderRoot(redeemContent);
    showSwalMessage({
      title: '正在激活steam key...',
      content: redeemContent,
      buttons: { confirm: '提取未使用key', cancel: '关闭' }
    }).then((value) => {
      const modalContent = document.querySelector('.rh-modal-content');
      const textareaValue = modalContent?.querySelector('textarea')?.value || '';
      GM_setValue('history', [modalContent?.innerHTML || '', textareaValue]);
      if (value) {
        GM_setClipboard(extractSteamKeys(redeemContent.querySelector('#unusedKeys')?.textContent || '').join(','));
        showSwalMessage({ title: '复制成功！', icon: 'success' });
      }
      clearRedeemRenderRoot(redeemContent);
    });
    redeemKeys(keysCsv);
  }
  function redeemSub(raw) {
    const subText = raw || document.querySelector('#gameSub')?.value;
    if (!subText) return;
    const ownedPackages = {};
    document.querySelectorAll('.account_table a').forEach((link) => {
      const match = link.href.match(/javascript:RemoveFreeLicense\( ([0-9]+), '/);
      if (match) ownedPackages[Number(match[1])] = true;
    });
    const freePackages = subText.match(/[\d]{2,}/g) || [];
    let loaded = 0;
    const total = freePackages.length;
    if (total === 0) return;
    const showCompletion = () => {
      if (window.location.href.includes('licenses')) {
        window.open('https://store.steampowered.com/account/licenses/', '_self');
      } else {
        showModal({
          title: '全部激活完成，是否前往账户页面查看结果？',
          buttons: { cancel: '取消', confirm: '确定' }
        }).then((value) => {
          if (value) window.open('https://store.steampowered.com/account/licenses/', '_blank');
        });
      }
    };
    const markLoaded = () => {
      loaded++;
      if (loaded >= total) {
        showCompletion();
      } else {
        showModal('正在激活…', `进度：${loaded}/${total}.`);
      }
    };
    showModal('正在执行…', '请等待所有请求完成。 忽略所有错误，让它完成。');
    freePackages.forEach((packageText) => {
      const packageId = Number.parseInt(packageText, 10);
      if (ownedPackages[packageId]) {
        markLoaded();
        return;
      }
      void request({
        url: 'https://store.steampowered.com/checkout/addfreelicense',
        method: 'POST',
        data: new URLSearchParams({ action: 'add_to_cart', sessionid: getSteamSessionID() || safeGlobalSessionID(), subid: String(packageId) }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
      }).then(markLoaded);
    });
  }
  function redeemSubs() {
    const key = document.querySelector('#inputKey')?.value.trim();
    if (key) redeemSub(key);
  }
  function safeGlobalSessionID() {
    try {
      return typeof g_sessionID === 'string' ? g_sessionID : '';
    } catch {
      return '';
    }
  }
  function changeStoreCountryFlow() {
    void fetchCartData().then((cartData) => {
      const { cartConfig, userInfo } = parseCartData(cartData);
      if (!cartConfig || !userInfo || Object.keys(cartConfig.rgUserCountryOptions).length <= 2) {
        showSwalMessage({ title: '需要挂相应地区的梯子！', icon: 'warning' });
        return;
      }
      showCountryChangeDialog(cartConfig, userInfo, cartData);
    })
      .catch(() => showSwalMessage({ title: '获取当前国家/地区失败！', icon: 'error' }));
    showSwalMessage({ title: '正在获取当前国家/地区...', icon: 'info' });
  }
  function fetchCartData() {
    return request({ url: 'https://store.steampowered.com/cart/', method: 'GET' }).then((response) => {
      if (!response.ok && !response.text) throw new Error('Failed to fetch cart');
      return response.text ?? '';
    });
  }
  function decodeHtml(value) {
    const temp = document.createElement('div');
    temp.innerHTML = value;
    return temp.textContent || temp.innerText || '';
  }
  function parseCartData(data) {
    const cartConfig = JSON.parse(decodeHtml(data.match(/data-cart_config="(.*?)"/)?.[1] || ''));
    const userInfo = JSON.parse(decodeHtml(data.match(/data-userinfo="(.*?)"/)?.[1] || ''));
    return { cartConfig, userInfo };
  }
  function bindCurrencyChangeOption() {
    const intervalId = window.setInterval(() => {
      const options = document.querySelectorAll('.currency_change_option');
      if (options.length > 0) {
        options.forEach((option) => option.addEventListener('click', () => {
          const newCountry = option.dataset.country;
          if (newCountry) changeCountry(newCountry);
        }));
        window.clearInterval(intervalId);
      }
    }, 500);
    window.setTimeout(() => window.clearInterval(intervalId), 1e4);
  }
  function showCountryChangeDialog(cartConfig, userInfo, cartData) {
    const divContent = cartData.match(/<div class="currency_change_options">([\w\W]*?)<p/i)?.[1]?.trim();
    const div = `${divContent || ''}</div>`;
    showSwalMessage({
      closeOnClickOutside: false,
      title: `当前国家/地区：${cartConfig.rgUserCountryOptions[userInfo.country_code] || userInfo.country_code}`,
      content: htmlToElement3(`<div>${div}</div>`)
    });
    bindCurrencyChangeOption();
  }
  function changeCountry(country) {
    showSwalMessage({ closeOnClickOutside: false, icon: 'info', title: '正在更换国家/地区...' });
    void request({
      url: 'https://store.steampowered.com/country/setcountry',
      method: 'POST',
      data: new URLSearchParams({ sessionid: getSteamSessionID() || safeGlobalSessionID(), cc: country }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    }).then(() => {
      void fetchCartData().then((data) => {
        const { cartConfig, userInfo } = parseCartData(data);
        const divContent = data.match(/<div class="currency_change_options">([\w\W]*?)<p/i)?.[1]?.trim();
        const div = `${divContent || ''}</div>`;
        if (userInfo.country_code === country) {
          showSwalMessage({ title: '更换成功！', icon: 'success' }).then(() => {
            showSwalMessage({
              closeOnClickOutside: false,
              title: `当前国家/地区：${cartConfig.rgUserCountryOptions[userInfo.country_code] || userInfo.country_code}`,
              content: htmlToElement3(`<div>${div}</div>`)
            });
            bindCurrencyChangeOption();
          });
        } else {
          showSwalMessage({ title: '更换失败！', icon: 'error' });
        }
      })
        .catch(() => showSwalMessage({ title: '获取当前国家/地区失败！', icon: 'error' }));
    });
  }

  // src/modules/steam/redeem.ts
  const FAILURE_DETAILS = {
    14: '无效激活码',
    15: '重复激活',
    53: '次数上限',
    13: '地区限制',
    9: '已拥有',
    24: '缺少主游戏',
    36: '需要PS3?',
    50: '这是充值码'
  };
  const UNUSED_KEY_REASONS = ['次数上限', '地区限制', '已拥有', '缺少主游戏', '其他错误', '未知错误', '网络错误或超时'];
  const AUTO_DIVIDE_NUM = 9;
  const WAITING_SECONDS = 20;
  const state = {
    allUnusedKeys: [],
    keyCount: 0,
    recvCount: 0,
    renderRoot: null,
    popupFlow: false,
    sessionID: ''
  };
  const texts = {
    fail: '失败',
    success: '成功',
    network: '网络错误或超时',
    line: '——',
    nothing: '',
    others: '其他错误',
    redeeming: '激活中',
    waiting: '等待中'
  };
  function getSessionID() {
    if (state.sessionID) return state.sessionID;
    try {
      state.sessionID = typeof g_sessionID === 'string' ? g_sessionID : '';
    } catch {
      state.sessionID = '';
    }
    return state.sessionID;
  }
  function setSteamSessionID(sessionID) {
    state.sessionID = sessionID;
  }
  function getSteamSessionID() {
    return getSessionID();
  }
  function setRedeemRenderRoot(root, popupFlow = true) {
    state.renderRoot = root;
    state.popupFlow = popupFlow;
    state.keyCount = 0;
    state.recvCount = 0;
    state.allUnusedKeys = [];
  }
  function clearRedeemRenderRoot(root) {
    if ((!root || state.renderRoot === root) && state.recvCount >= state.keyCount) {
      state.renderRoot = null;
      state.popupFlow = false;
    }
  }
  function queryRedeemRoot(selector) {
    return (state.renderRoot ?? document).querySelector(selector);
  }
  function queryRedeemRootAll(selector) {
    return (state.renderRoot ?? document).querySelectorAll(selector);
  }
  function table() {
    return queryRedeemRoot('table');
  }
  function tbody() {
    return queryRedeemRoot('tbody');
  }
  function createCell(tag, html, className) {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    cell.innerHTML = html;
    return cell;
  }
  function createSubCell(subId, subName) {
    const cell = document.createElement('td');
    if (subId === 0) {
      cell.textContent = '——';
      return cell;
    }
    const code = document.createElement('code');
    code.textContent = String(subId);
    const link = document.createElement('a');
    link.href = `https://steamdb.info/sub/${subId}/`;
    link.target = '_blank';
    link.textContent = subName;
    cell.append(code, ' ', link);
    return cell;
  }
  function setUnusedKeys(key, success, reason, subId, subName) {
    const unusedKeys = queryRedeemRoot('#unusedKeys');
    if (!unusedKeys) return;
    if (success && state.allUnusedKeys.includes(key)) {
      state.allUnusedKeys = state.allUnusedKeys.filter((keyItem) => keyItem !== key);
      unusedKeys.querySelectorAll('li').forEach((li) => {
        if (li.textContent?.includes(key)) li.remove();
      });
    } else if (!success && !state.allUnusedKeys.includes(key) && UNUSED_KEY_REASONS.includes(reason)) {
      const li = document.createElement('li');
      li.append(`${key} (${reason}`);
      if (subId !== 0) {
        li.append(': ');
        const code = document.createElement('code');
        code.textContent = String(subId);
        li.append(code, ` ${subName}`);
      }
      li.append(')');
      unusedKeys.append(li);
      state.allUnusedKeys.push(key);
    }
  }
  function tableInsertKey(key) {
    state.keyCount++;
    const row = document.createElement('tr');
    row.append(createCell('td', String(state.keyCount), 'nobr'));
    row.append(createCell('td', `<code>${key}</code>`, 'nobr'));
    const waitCell = createCell('td', `${texts.redeeming}...`);
    waitCell.colSpan = 3;
    row.append(waitCell);
    tbody()?.prepend(row);
  }
  function tableWaitKey(key) {
    state.keyCount++;
    const row = document.createElement('tr');
    row.append(createCell('td', String(state.keyCount), 'nobr'));
    row.append(createCell('td', `<code>${key}</code>`, 'nobr'));
    const waitCell = createCell('td', `${texts.waiting} (${WAITING_SECONDS}秒)...`);
    waitCell.colSpan = 3;
    row.append(waitCell);
    tbody()?.prepend(row);
  }
  function tableUpdateKey(key, result, detail, subId, subName) {
    setUnusedKeys(key, result === texts.success, detail, subId, subName);
    state.recvCount++;
    if (!state.popupFlow && state.recvCount === state.keyCount) {
      document.querySelector('#buttonRedeem, #redeemKey')?.style.removeProperty('display');
      document.querySelector('#inputKey')?.removeAttribute('disabled');
    }
    const rows = Array.from(queryRedeemRootAll('table tr')).slice(1);
    for (const row of rows) {
      const cells = row.children;
      if (cells[1]?.innerHTML.includes(key) && cells[2]?.innerHTML.includes(texts.redeeming)) {
        cells[2].remove();
        const resultCell = createCell('td', result, 'nobr');
        resultCell.style.color = result === texts.fail ? 'red' : 'green';
        row.append(resultCell);
        row.append(createCell('td', detail, 'nobr'));
        row.append(createSubCell(subId, subName));
        break;
      }
    }
  }
  function redeemKey(key) {
    void request({
      url: 'https://store.steampowered.com/account/ajaxregisterkey/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Origin: 'https://store.steampowered.com',
        Referer: 'https://store.steampowered.com/account/registerkey'
      },
      data: `product_key=${encodeURIComponent(key)}&sessionid=${encodeURIComponent(getSessionID())}`,
      method: 'POST',
      responseType: 'json',
      onloadstart: () => {
        const currentTable = table();
        if (currentTable && currentTable.style.display === 'none') currentTable.style.display = '';
      }
    }).then((response) => {
      if (response.status === 200 && response.data) {
        const { data } = response;
        if (data.success === 1 && data.purchase_receipt_info?.line_items[0]) {
          const item = data.purchase_receipt_info.line_items[0];
          tableUpdateKey(key, texts.success, texts.line, item.packageid, item.line_item_description);
          return;
        }
        if (data.purchase_result_details !== void 0 && data.purchase_receipt_info) {
          const item = data.purchase_receipt_info.line_items[0];
          const failureReason = FAILURE_DETAILS[data.purchase_result_details] || texts.others;
          tableUpdateKey(key, texts.fail, failureReason, item?.packageid ?? 0, item?.line_item_description ?? texts.nothing);
          return;
        }
        tableUpdateKey(key, texts.fail, texts.nothing, 0, texts.nothing);
      } else {
        tableUpdateKey(key, texts.fail, texts.network, 0, texts.nothing);
      }
    });
  }
  function startTimer() {
    const timer = window.setInterval(() => {
      let hasWaiting = false;
      let nowKey = 0;
      const rows = Array.from(queryRedeemRootAll('table tr')).slice(1)
        .reverse();
      for (const row of rows) {
        const cell = row.children[2];
        if (cell?.innerHTML.includes(texts.waiting)) {
          nowKey++;
          if (nowKey <= AUTO_DIVIDE_NUM) {
            const key = row.children[1]?.textContent?.trim() ?? '';
            cell.innerHTML = `${texts.redeeming}...`;
            redeemKey(key);
          } else {
            hasWaiting = true;
            break;
          }
        }
      }
      if (!hasWaiting) window.clearInterval(timer);
    }, 1e3 * WAITING_SECONDS);
  }
  function redeem(keys) {
    if (keys.length <= 0) return;
    if (!state.popupFlow) {
      document.querySelector('#buttonRedeem, #redeemKey')?.style.setProperty('display', 'none');
      document.querySelector('#inputKey')?.setAttribute('disabled', 'disabled');
    }
    let nowKey = 0;
    keys.forEach((key) => {
      nowKey++;
      if (nowKey <= AUTO_DIVIDE_NUM) {
        tableInsertKey(key);
        redeemKey(key);
      } else {
        tableWaitKey(key);
      }
    });
    if (nowKey > AUTO_DIVIDE_NUM) startTimer();
  }
  function redeemKeys(key) {
    const keys = key ? key.split(',').map((item) => item.trim())
      .filter(Boolean) : extractSteamKeys(document.querySelector('#inputKey')?.value.trim() || '');
    redeem(keys);
  }
  function registerSteamKeys(raw) {
    const setting = getSteamSettings();
    const keys = extractSteamKeys(raw);
    if (keys.length === 0) return;
    if (setting.asf) {
      const asfCommand = `!redeem ${setting.asfBot ? `${setting.asfBot} ` : ''}${keys.join(',')}`;
      asfRedeem(asfCommand);
    } else if (setting.newTab) {
      window.open(`https://store.steampowered.com/account/registerkey?key=${keys.join(',')}`, '_blank');
    } else {
      webRedeem(keys.join(','));
    }
  }
  function copyUnusedKeys() {
    GM_setClipboard(extractSteamKeys(queryRedeemRoot('#unusedKeys')?.textContent || '').join(','));
    showModal({ title: '复制成功！', icon: 'success' });
  }
  function toggleUnusedKeyArea() {
    if (!state.popupFlow) {
      const unusedKeyArea = queryRedeemRoot('#unusedKeyArea');
      if (unusedKeyArea) unusedKeyArea.style.display = unusedKeyArea.style.display === 'none' ? '' : 'none';
    }
  }
  function initSteamRedeemPage() {
    state.renderRoot = null;
    state.popupFlow = false;
    state.keyCount = 0;
    state.recvCount = 0;
    state.allUnusedKeys = [];
    getSessionID();
    const examples = document.querySelector('#registerkey_examples_text');
    if (examples) {
      examples.innerHTML = `
      <div class="notice_box_content" id="unusedKeyArea" style="display: none">
        <b>未使用的Key：</b>
        <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" id="copyUnuseKey"><span>提取未使用key</span></a><br>
        <div><ol id="unusedKeys"></ol></div>
      </div>
      <div class="table-responsive table-condensed">
        <table class="table table-hover" style="display: none">
          <caption><h2>激活记录</h2></caption>
          <thead><tr><th>No.</th><th>Key</th><th>结果</th><th>详情</th><th>Sub</th></tr></thead>
          <tbody></tbody>
        </table>
      </div><br>`;
      setRedeemRenderRoot(examples, false);
    }
    const inputBox = document.querySelector('.registerkey_input_box_text')?.parentElement;
    inputBox?.style.setProperty('float', 'none');
    inputBox?.insertAdjacentHTML('beforeend', '<textarea class="form-control" rows="3" id="inputKey" placeholder="支持批量激活，可以把整个网页文字复制过来&#10;若一次激活的Key的数量超过9个则会自动分批激活（等待20秒）&#10;激活多个SUB时每个SUB之间用英文逗号隔开" style="margin: 3px 0px 0px; width: 525px; height: 102px;"></textarea><br>');
    const keyFromUrl = new URL(window.location.href).searchParams.get('key');
    if (keyFromUrl) {
      const input = document.querySelector('#inputKey');
      if (input) input.value = keyFromUrl;
    }
    document.querySelectorAll('.registerkey_input_box_text,#purchase_confirm_ssa').forEach((el) => {
      el.style.display = 'none';
    });
    const registerButton = document.querySelector('#register_btn');
    registerButton?.parentElement?.style.setProperty('margin', '10px 0');
    registerButton?.parentElement?.insertAdjacentHTML('beforeend', `
    <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="margin-left:0" id="redeemKey"><span>激活key</span></a> &nbsp;&nbsp;
    <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="margin-left:0" id="redeemSub"><span>激活sub</span></a> &nbsp;&nbsp;
    <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="margin-left:0" id="changeCountry"><span>更换国家/地区</span></a> &nbsp;&nbsp;`);
    registerButton?.remove();
    document.querySelector('#copyUnuseKey')?.addEventListener('click', copyUnusedKeys);
    document.querySelector('#redeemKey')?.addEventListener('click', () => redeemKeys());
    if (keyFromUrl) redeem(extractSteamKeys(keyFromUrl));
    toggleUnusedKeyArea();
  }
  function bindCopySelectClickListeners() {
    const setting = getSteamSettings();
    if (setting.selectListen) {
      bindSelectListener();
    }
    if (!/https?:\/\/store\.steampowered\.com\/account\/registerkey/.test(window.location.href) && setting.copyListen) {
      window.addEventListener('copy', activateCopiedProduct, false);
    }
    if (setting.clickListen) {
      bindClickListener();
    }
  }
  function activateCopiedProduct(event) {
    const setting = getSteamSettings();
    const productKey = window.getSelection()?.toString()
      ?.trim() || event.target?.value || '';
    void navigator.clipboard?.writeText(productKey).catch(() => void 0);
    if (/^([\w\W]*)?([\d\w]{5}(-[\d\w]{5}){2}(\r|,|，)?){1,}/.test(productKey)) {
      if (!document.querySelector('div.rh-modal-overlay')) {
        showModal({ title: '检测到神秘key,是否激活？', icon: 'success', buttons: { confirm: '激活', cancel: '取消' } }).then((value) => {
          if (value) registerSteamKeys(productKey);
        });
      }
    } else if ((/^![\w\d]+\s+asf\s+.+/gi.test(productKey) || /^!ALA\s+.+/gi.test(productKey)) && setting.asf) {
      if (!document.querySelector('div.rh-modal-overlay')) {
        showModal({ closeOnClickOutside: false, className: 'swal-user', title: '检测到您复制了以下ASF指令，是否执行？', text: productKey, buttons: { confirm: '执行', cancel: '取消' } }).then((value) => {
          if (value) asfRedeem(productKey);
        });
      }
    }
  }
  function bindSelectListener() {
    const icon = document.createElement('div');
    icon.className = 'icon-div';
    icon.title = '激活';
    icon.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABsFBMVEVHcEz9/f3+/v8Tdaf///8LGTP+/v4NPWX+/v8GGDj8/f4OGzX///////////8ZJ1ALJ0oNGzf+/v4mOGXX2+T8/f3z9vkPH0UjMFj5+fr///8NGzMJG0ERHS8SKEgXW40Ubp8WY5Ula5ePnrb3+PlnhKUfQ3Q3R3C2vMvt8PRcZH7///8TgrMTgbITfa4YNmcPHDT///8JGj0HGT2rucxGWYJ0g6H///9aZYbGy9jFyNQhL1TO0dp5lbOTma39/f7///+Sl6br7O6SlqT///////8UY5UUY5UJGTgTc6QThLUTfa8VToETdKYQK1sRK1sUWowUY5X///+mq7tlc5MzWX7Mztl5gZuytcJPV3AjL08iLlEUTYAUPXATK10Tfa4FO3IVToHEz9wAL2fj5+5GUG4JFz1mbIC8wMsFFzYFGDwHGkILGTIJG0cLHUoFGD8RJFMUU4YUN2kOIE4TSHsUYJMUbqAUQnUVTYAQLWEUWowUPG8SKFoTZ5kRHDATfq8Tdqf///8IIFQUaJkeWYrA0N4JMmgHQndAc5wJTYIIVooGXpNllrdchanT3ui2xtaZV9eJAAAAaXRSTlMAj/j97/vmAtD8xzncwJvwJay59uHd/ObqgnBtlpgLPfz8Femx+/7s0vitXqVLf53k3VmE9fDr59vaxLSY/qmGRnxeXjI/lGy5MLbr+8A/cPuiqLzgfLHJhJfN17bjr6z8xfmu9cH4cHitMXlOAAACjUlEQVQ4y2XTh1faQBgA8IMGQqCiGPaQAgUE3OLeFTfurR120SYkAQSrQUABUSyOf7l3kQC+/i7JfXff9/Ly4DsAXuA4AG0qi02jsVlUbS/rRnCpsvXkqnpsKmGrnsZBy2KOyTGyHBrooWlpeAkMLAzDyBiRDIayvloFnKwMJSOoKgJGsghD9YsVOLASBEE3pKtz/8t34MBCEXQddbQ7O/trjKAiVB96BY630I2ow1BobjoUmjXQdAR+KRyL0Ug0VhWlD+c+jBkMxzNzM3BXgwrWog1oYyBgODr47adnpv2xSBT+HkDDRlgxz9H+wM/jgNkc8BvNBzGWtQLgNLAcy8JbGLFJs3HSZDJNmQzjpmaWM7SBviRXk2SbxyXGSQkCI1jAqUB/Mp6sYbfV6mGvWq2W7JOSPQ7urIPuJBsXccNbkNG7t7cf397aQQkrMLUPZLh4JoMushV5P0yS3vatUbSV+QwkytaRQbJQ4DOFwqiySQnBR1PTKAnTPCyY0ikUSoVrgPcOjihE2vYdPnPK8yTfDczytwKtbsQVhHOvTqcd4Hn+VMCvg2lM3itHMK3LMyiXD/UGPbeXkFBwuQacrh8Yhg1hiM8TxHxu/vT8UvQJtud3j/ubVKCXTrix8O15Xaob/hf21MlJOZiX5qXSvHvi+Tacqgmn7Kgfvl6E7+58ped8vpTyTdwlLkThi49CP9gTiZv7R/1juXxTerpPNEINA6/d9Eb6/kH/VNKXbtJ1G+kFsSk3zxyOv46Hh3KlclbjOJsHYleDzWKxmK1UskUkixSzxfnGc9f1DvkjQvHCq6OHL61eX1+/qYLR6tKrw4lKOr+sXFWtdNj/O99wiTs7uzqWlzu6Op14Pf0P2PD9NrHDeWsAAAAASUVORK5CYII=" class="icon-img" alt="激活图标">';
    document.documentElement.append(icon);
    document.addEventListener('selectionchange', () => {
      if (!window.getSelection()?.toString()
        ?.trim()) icon.style.display = 'none';
    });
    document.addEventListener('mouseup', (event) => {
      if (event.target === icon || icon.contains(event.target)) {
        event.preventDefault();
        return;
      }
      const text = window.getSelection()?.toString()
        ?.trim() || '';
      const productKey = text || event.target?.value || '';
      if (/[\d\w]{5}(-[\d\w]{5}){2}/.test(productKey) && text && icon.style.display === 'none') {
        icon.style.top = `${event.pageY + 12}px`;
        icon.style.left = `${event.pageX + 18}px`;
        icon.style.display = 'block';
      } else if (!text) {
        icon.style.display = 'none';
      }
    });
    icon.addEventListener('mousedown', (event) => event.preventDefault());
    icon.addEventListener('click', (event) => {
      const productKey = window.getSelection()?.toString()
        ?.trim() || event.target?.value || '';
      registerSteamKeys(productKey);
    });
  }
  function bindClickListener() {
    document.body?.addEventListener('click', (event) => {
      const htmlEl = event.target;
      if (!htmlEl || htmlEl.closest('.rh-modal-overlay') || ['A', 'BUTTON', 'TEXTAREA'].includes(htmlEl.tagName) || ['button', 'text'].includes(htmlEl.getAttribute('type') || '')) return;
      if (htmlEl.children.length > 0 && extractSteamKeys(Array.from(htmlEl.children).map((child) => child.textContent ?? '')
        .join('')).length > 0) return;
      const keys = extractSteamKeys(htmlEl.textContent ?? '');
      if (keys.length === 0) return;
      mouseClick(event);
      let html = htmlEl.innerHTML;
      keys.forEach((key) => {
        html = html.replace(new RegExp(key, 'gi'), `<a class="redee-key" href="javascript:void(0)" target="_self" data-key="${key}">${key}</a>`);
      });
      htmlEl.innerHTML = html;
      htmlEl.querySelectorAll('.redee-key').forEach((link) => {
        link.addEventListener('click', () => registerSteamKeys(link.dataset.key || ''));
      });
    });
  }
  function mouseClick(event) {
    const span = document.createElement('span');
    span.textContent = 'Steam Key';
    span.style.cssText = `z-index:2147483647;top:${event.pageY - 20}px;left:${event.pageX}px;position:absolute;font-weight:bold;color:#ff6651;transition:all 1.5s ease;`;
    document.body.append(span);
    requestAnimationFrame(() => {
      span.style.top = `${event.pageY - 180}px`;
      span.style.opacity = '0';
    });
    window.setTimeout(() => span.remove(), 1500);
  }

  // src/modules/steam/index.ts
  const STEAM_CSS = `
table.hclonely { font-family: verdana,arial,sans-serif; font-size: 11px; color: #333333; border-width: 1px; border-color: #999999; border-collapse: collapse; }
table.hclonely th { background-color: #c3dde0; border-width: 1px; padding: 8px; border-style: solid; border-color: #a9c6c9; }
table.hclonely tr { background-color: #d4e3e5; }
table.hclonely td { border-width: 1px; padding: 8px; border-style: solid; border-color: #a9c6c9; }
table.hclonely caption { padding-top: 8px; color: #808294; text-align: center; caption-side: top; background-color: #94d7df; }
table.hclonely h2 { margin: 0; font-size: 25px; }
.rh-modal.swal-user { width: 80%; }
table.hclonely a { color: #2196F3; }
table.hclonely .rh-modal-button { padding: 5px; }
#unusedKeyArea code { padding: 2px 4px; font-size: 90%; color: #c7254e; background-color: #f9f2f4; border-radius: 3px; }
.notice_box_content { border: 1px solid #a25024; border-radius: 3px; color: #acb2b8; font-size: 14px; font-family: "Motiva Sans", Sans-serif; font-weight: normal; padding: 15px 15px; margin-bottom: 15px; }
.notice_box_content b { font-weight: normal; color: #f47b20; float: left; }
#unusedKeys { margin:0 15px; }
#copyUnuseKey span { font-size: 15px; line-height: 20px; }
#unusedKeyArea li { white-space: nowrap; color: #007fff; }
.currency_change_option_ctn { vertical-align: top; margin: 0 6%; }
.currency_change_option_ctn:first-child { margin-bottom: 12px; }
.currency_change_option_ctn > p { font-size: 12px; margin: 8px 8px 0 8px; }
.currency_change_option { font-family: "Motiva Sans", Sans-serif; font-weight: 300; display: block; }
.currency_change_option > span { display: block; padding: 9px 19px; }
.currency_change_option .country { font-size: 20px; }
.currency_change_option .notes { font-size: 13px; line-height: 18px; }
.asf-class input[type="text"] { border: 1px solid #c2e9ee; width:180px; }
.asf-output { width:90%; min-height:150px; }
.switch-key { margin:0 15%; height:100px; }
.switch-key-left { float:left; }
.switch-key-right { float:right; }
.switch-key div { width: 50%; position: relative; cursor:default; }
.switch-key input { margin:10px 0; }
.switch-key p { font-size:25px; height:25px; color:black; margin:0; }
.rh-modal-content * { color:#000; }
.rh-modal-content textarea { background: #fff; }
#allKey { display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; user-select: none; background-image: none; border: 1px solid #ccc; border-radius: 4px; color: #333; background-color: #fff; }
#allKey:hover, #allKey:focus { color: #333; background-color: #e6e6e6; border-color: #adadad; text-decoration: none; }
.icon-img { position: absolute; width: 32px; height: 32px; margin: 0!important; }
.icon-div { width: 32px!important; height: 32px!important; display: none; background: #fff!important; border-radius: 16px!important; box-shadow: 4px 4px 8px #888!important; position: absolute!important; z-index: 2147483647!important; cursor: pointer; }
`;
  let initialized3 = false;
  function initSteam() {
    if (initialized3) return;
    initialized3 = true;
    try {
      GM_addStyle(STEAM_CSS);
      const url = window.location.href;
      if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey/.test(url)) {
        initSteamRedeemPage();
        document.querySelector('#redeemSub')?.addEventListener('click', redeemSubs);
        document.querySelector('#changeCountry')?.addEventListener('click', changeStoreCountryFlow);
        return;
      }
      if (/https?:\/\/steamdb\.info\/freepackages\//.test(url)) {
        bindSteamDBFreePackages();
        return;
      }
      if (/https?:\/\/store\.steampowered\.com\/account\/licenses\/(\?sub=[\w\W]{0,})?/.test(url)) {
        initSteamLicensesPage();
        return;
      }
      bindCopySelectClickListeners();
      bindStoreCountryShortcut();
      if (getSteamSettings().allKeyListen) {
        redeemAllPageKeys();
      }
    } catch (error) {
      showModal('AuTo Redeem Steamkey脚本执行出错，详情请查看控制台！', error.stack, 'error');
      console.error(error);
    }
  }
  function openSteamSettings() {
    openSteamSettingsDialog();
  }
  function runSteamASF() {
    openASFDialog();
  }
  function bindSteamDBFreePackages() {
    const interval = window.setInterval(() => {
      const freePackages = document.querySelector('#freepackages');
      if (!freePackages) return;
      freePackages.addEventListener('click', () => {
        const subs = Array.from(document.querySelectorAll('#freepackages span')).filter((span) => span.offsetParent !== null)
          .map((span) => span.dataset.subid || span.getAttribute('data-subid') || '')
          .filter(Boolean);
        window.open(`https://store.steampowered.com/account/licenses/?sub=${subs.join(',')}`, '_self');
      });
      window.clearInterval(interval);
    }, 1e3);
  }
  function initSteamLicensesPage() {
    document.querySelector('h2.pageheader')?.parentElement?.insertAdjacentHTML('beforeend', `
    <div style="float: left;">
      <textarea class="registerkey_input_box_text" rows="1" name="product_key" id="gameSub" placeholder="输入SUB,多个SUB之间用英文逗号连接" style="margin: 3px 0px 0px; width: 400px; height: 15px;background-color:#102634; padding: 6px 18px 6px 18px; font-weight:bold; color:#fff;"></textarea> &nbsp;
    </div>
    <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="width: 95px; height: 30px;" id="buttonSUB"><span>激活SUB</span></a>
    <a tabindex="300" class="btnv6_blue_hoverfade btn_medium" style="width: 125px; height: 30px;margin-left:5px" id="changeCountry-account"><span>更改国家/地区</span></a>`);
    document.querySelector('#buttonSUB')?.addEventListener('click', () => redeemSub());
    document.querySelector('#changeCountry-account')?.addEventListener('click', changeStoreCountryFlow);
    if (/https?:\/\/store\.steampowered\.com\/account\/licenses\/\?sub=([\d]+,)+/.test(window.location.href)) {
      window.setTimeout(() => redeemSub(window.location.href), 2e3);
    }
  }
  function bindStoreCountryShortcut() {
    if (!/https?:\/\/store\.steampowered\.com\//.test(window.location.href)) return;
    const accountPulldown = document.querySelector('#account_pulldown');
    if (!accountPulldown || document.querySelector('#changeCountry')) return;
    accountPulldown.insertAdjacentHTML('beforebegin', '<span id="changeCountry" style="cursor:pointer;display:inline-block;padding-left:4px;line-height:25px" class="global_action_link persona_name_text_content">更改国家/地区 |</span>');
    document.querySelector('#changeCountry')?.addEventListener('click', changeStoreCountryFlow);
  }
  function redeemAllPageKeys() {
    const div = document.createElement('div');
    div.id = 'keyDiv';
    div.style.cssText = 'position:fixed;left:5px;bottom:5px';
    const button = document.createElement('button');
    button.id = 'allKey';
    button.className = 'btn btn-default';
    button.style.display = 'none';
    button.style.zIndex = '9999';
    button.textContent = '激活本页面所有key(共0个)';
    div.append(button);
    document.body.append(div);
    let previousKeyList = '';
    window.setInterval(() => {
      const keys = extractSteamKeys(document.body.textContent || '');
      if (keys.length > 0) {
        const keyList = keys.join(',');
        if (previousKeyList !== keyList) {
          previousKeyList = keyList;
          button.dataset.key = keyList;
          button.textContent = `激活本页面所有key(共${keys.length}个)`;
          button.style.display = 'block';
        }
      } else if (button.style.display === 'block') {
        previousKeyList = '';
        button.style.display = 'none';
        button.textContent = '激活本页面所有key(共0个)';
      }
    }, 1e3);
    button.addEventListener('click', () => registerSteamKeys(button.dataset.key || ''));
  }

  // src/shared/menu.ts
  function registerMenus(handlers) {
    const wrapMenuHandler = (handler) => () => {
      if (window.self !== window.top) {
        return;
      }
      handler();
    };
    if (handlers.onOpenSettings) {
      GM_registerMenuCommand('⚙Steam设置', wrapMenuHandler(handlers.onOpenSettings));
    }
    if (handlers.onSteamASF) {
      GM_registerMenuCommand('执行ASF指令', wrapMenuHandler(handlers.onSteamASF));
    }
    if (handlers.onIGBatch) {
      GM_registerMenuCommand('入库所有IndieGala链接', wrapMenuHandler(handlers.onIGBatch));
    }
    if (handlers.onItchExtract) {
      GM_registerMenuCommand('入库所有ItchIo链接', wrapMenuHandler(handlers.onItchExtract));
    }
  }

  // src/main.ts
  function bootstrap() {
    initSteam();
    initIG();
    initItch();
    registerMenus({
      onOpenSettings: openSteamSettings,
      onSteamASF: runSteamASF,
      onIGBatch: runIGBatch,
      onItchExtract: runItchExtract
    });
  }
  bootstrap();
})();
