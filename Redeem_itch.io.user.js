// ==UserScript==
// @name         Redeem itch.io
// @namespace    Redeem-itch.io
// @version      1.2.6
// @description  自动激活itch.io key链接和免费itch.io游戏
// @author       HCLonely
// @iconURL      https://itch.io/favicon.ico
// @include      *://*itch.io/*
// @include      *://keylol.com/*
// @include      *://www.steamgifts.com/discussion/*
// @include      *://www.reddit.com/r/*
// @supportURL   https://blog.hclonely.com/posts/578f9be7/
// @homepage     https://blog.hclonely.com/posts/578f9be7/
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@9
// @require      https://cdn.jsdelivr.net/npm/promise-polyfill@8.1.3/dist/polyfill.min.js
// @updateURL    https://github.com/HCLonely/user.js/raw/master/Redeem_itch.io.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @grant        unsafeWindow
// @run-at       document-end
// @connect      itch.io
// @connect      *.itch.io
// ==/UserScript==

/* global checkItchGame,MutationObserver */
/* eslint-disable camelcase */

(function () {
  'use strict'

  const closeWindow = true // 激活完成后自动关闭页面，改为'false'则为不自动关闭
  const url = window.location.href

  /** *************************自动激活itch.io游戏链接***************************/
  if (/^https?:\/\/[\w\W]{1,}\.itch\.io\/[\w]{1,}(-[\w]{1,}){0,}\/download\/[\w\W]{0,}/i.test(url)) {
    $('button.button').map(function (i, e) {
      if (/link|claim|链接/gim.test($(e).text())) e.click()
    })
    if ((/This page is linked|此页面已链接到帐户/gim.test($('div.inner_column').text()) || $('a.button.download_btn[data-upload_id]').length > 0) && closeWindow === 1) closePage()
  }

  /** *********************领取免费itch.io游戏***************************/
  if (/^https?:\/\/.*?itch\.io\/.*?\/purchase(\?.*?)?$/.test(url) && /No thanks, just take me to the downloads|不用了，请带我去下载页面/i.test($('a.direct_download_btn').text())) {
    $('a.direct_download_btn')[0].click()
  } else if ($('.purchase_banner_inner').length === 0 && (/0\.00/gim.test($('.button_message').eq(0).find('.dollars[itemprop]').text()) || /0\.00/gim.test($('.money_input').attr('placeholder')) || /自己出价|Name your own price/gim.test($('.button_message').eq(0).find('.buy_message').text()))) {
    window.open(url + '/purchase', '_self')
  }

  /** **********************限时免费游戏包*****************************/
  if (/https?:\/\/itch.io\/s\/[\d]{1,}\/[\w\W]{1,}/.test(url)) {
    $('.promotion_buy_row .buy_game_btn').after('<button id="redeem-itch-io" class="button" style="font-size:18px;letter-spacing:0.025em;line-height:36px;height:40px;padding:0 20px;margin:0 16px">后台激活</button>')
    $('#redeem-itch-io').click(async () => {
      const gameLink = $('.thumb_link.game_link')
      for (const e of gameLink) {
        await redeemGame(e)
      }
    })
  }

  /** **********************后台激活游戏*****************************/
  if (['keylol.com', 'www.steamgifts.com', 'www.reddit.com'].includes(window.location.hostname)) {
    addRedeemBtn()
    const observer = new MutationObserver(addRedeemBtn)
    observer.observe(document.documentElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    })
  }
  function addRedeemBtn () {
    for (const e of $('a[href*="itch.io"]:not(".redeem-itch-game")')) {
      $(e).addClass('redeem-itch-game').after(`<a data-itch-href="${$(e).attr('href')}" href="javascript:void(0)" onclick="redeemItchGame(this)" target="_self" style="margin-left:10px !important;">激活</a>`)
    }
  }
  GM_registerMenuCommand('提取所有链接', async () => {
    let gamesLink = []
    for (const e of $('a[href*="itch.io"]:not(".itch-io-game-link-owned")')) {
      const links = await getUrlLink(e)
      gamesLink = [...gamesLink, ...links]
    }
    gamesLink = [...new Set(gamesLink)]
    for (const e of gamesLink) {
      await isOwn(e)
    }
    log('全部激活完成！', 'success')
  })
  unsafeWindow.redeemItchGame = redeemGame
  function closePage () {
    window.close()
  }
  function log (e, c) {
    if (typeof e !== 'string') return console.log(e)
    Swal[$('.swal2-container').length > 0 ? 'update' : 'fire']({
      title: e,
      icon: c || 'info'
    })
    let color = 'color:'
    switch (c) {
      case 'success':
        color += 'green'
        break
      case 'warning':
        color += 'blue'
        break
      case 'info':
        color += 'yellow'
        break
      case 'error':
        color += 'red'
        break
      default:
        color += 'black'
    }
    console.log('%c' + e, color)
  }

  async function getUrlLink (e) {
    let url = ''
    if ($(e).attr('data-itch-href')) {
      url = $(e).attr('data-itch-href')
    } else {
      if ($(e).hasClass('itch-io-game-link-owned')) return []
      url = $(e).attr('href')
    }
    log('正在处理游戏/优惠包链接: ' + url)
    if (/https?:\/\/itch.io\/s\/[\d]+\/.+/.test(url)) {
      log('正在获取优惠包信息...')
      return await new Promise(resolve => {
        GM_xmlhttpRequest({
          url,
          method: 'get',
          onload: async data => {
            if (data.status === 200) {
              if (data.responseText.includes('not_active_notification')) {
                log('活动已结束！', 'error')
                resolve([])
              } else {
                const gamesLink = []
                const games = $(data.responseText).find('.game_grid_widget.promo_game_grid a.thumb_link.game_link')
                for (const e of games) {
                  gamesLink.push(e.href.replace(/\/$/, ''))
                }
                resolve(gamesLink)
              }
            } else {
              log('请求失败！', 'error')
              log(data)
              resolve([])
            }
          }
        })
      }).then(e => {
        return e
      }).catch(() => {
        return []
      })
    } else if (/^https?:\/\/.+?\.itch\.io\/[^/]+?(\/purchase)?$/.test(url)) {
      return [url.replace('/purchase', '').replace(/\/$/, '')]
    }
  }
  async function redeemGame (e) {
    let url = ''
    if ($(e).attr('data-itch-href')) {
      url = $(e).attr('data-itch-href')
    } else {
      if ($(e).hasClass('itch-io-game-link-owned')) return
      url = $(e).attr('href')
    }
    log('当前游戏/优惠包链接: ' + url)
    if (/https?:\/\/itch.io\/s\/[\d]+\/.+/.test(url)) {
      log('正在获取优惠包信息...')
      await new Promise(resolve => {
        GM_xmlhttpRequest({
          url,
          method: 'get',
          onload: async data => {
            if (data.status === 200) {
              if (data.responseText.includes('not_active_notification')) {
                log('活动已结束！', 'error')
                resolve()
              } else {
                const games = $(data.responseText).find('.game_grid_widget.promo_game_grid a.thumb_link.game_link')
                for (const e of games) {
                  await isOwn(e.href)
                }
                resolve()
              }
            } else {
              log('请求失败！', 'error')
              log(data)
              resolve()
            }
          }
        })
      }).then(() => {
        return true
      }).catch(() => {
        return false
      })
    } else if (/^https?:\/\/.+?\.itch\.io\/[^/]+?(\/purchase)?$/.test(url)) {
      await isOwn(url.replace('/purchase', ''))
    }
  }
  async function isOwn (url) {
    log('当前游戏链接: ' + url)
    log('正在检测游戏是否拥有...')
    await new Promise(resolve => {
      GM_xmlhttpRequest({
        url,
        method: 'get',
        onload: async data => {
          if (data.status === 200) {
            if (data.responseText.includes('purchase_banner_inner')) {
              log('游戏已拥有！', 'success')
              resolve()
            } else {
              await purchase(url)
              resolve()
            }
          } else {
            log('请求失败！', 'error')
            log(data)
            resolve()
          }
        }
      })
    }).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
  /*
  async function openPurchase (url) {
    log('已打开购买页面...')
    await new Promise(resolve => {
      const timer = setTimeout(() => {
        log('有的页面脚本不能自动关闭，请手动关闭！')
        resolve()
      }, 15000)
      const t = GM_openInTab(url + '/purchase', { active: true, setParent: true }).onclosed = () => {
        log('已关闭购买页面，如果是自动关闭的说明游戏已领取！')
        clearTimeout(timer)
        resolve()
      }
    }).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
  */
  async function purchase (url) {
    log('正在加载购买页面...')
    await new Promise(resolve => {
      GM_xmlhttpRequest({
        url: url + '/purchase',
        method: 'get',
        onload: async data => {
          if (data.status === 200) {
            const html = $(data.responseText)
            if (/0\.00/gim.test(html.find('.button_message:first .dollars[itemprop]').text()) || /0\.00/gim.test(html.find('.money_input').attr('placeholder')) || /自己出价|Name your own price/gim.test(html.find('.button_message:first .buy_message').text())) {
              const csrf_token = html.find('[name="csrf_token"]').val()
              await download(url, csrf_token)
              resolve()
            } else {
              log('价格不为 0, 可能活动已结束！', 'error')
              resolve()
            }
          } else {
            log('请求失败！', 'error')
            log(data)
            resolve()
          }
        }
      })
    }).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
  async function download (url, csrf_token) {
    log('正在请求下载页面...')
    await new Promise(resolve => {
      GM_xmlhttpRequest({
        url: url + '/download_url',
        method: 'post',
        data: { csrf_token },
        responseType: 'json',
        onload: async data => {
          if (data.status === 200 && data.response && data.response.url) {
            await loadDownload(data.response.url, url)
            resolve()
          } else {
            log('请求失败！', 'error')
            log(data)
            resolve()
          }
        }
      })
    }).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  async function loadDownload (e, referer) {
    log('正在加载下载页面...')
    await new Promise(resolve => {
      const url = new URL(e)
      GM_xmlhttpRequest({
        url: url.href,
        method: 'get',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          DNT: 1,
          Host: url.hostname,
          Referer: referer,
          'sec-ch-ua': '"\\\\Not;A\\"Brand";v="99", "Google Chrome";v="85", "Chromium";v="85"',
          'sec-ch-ua-mobile': '?0',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4164.2 Safari/537.36'
        },
        onload: async data => {
          if (data.status === 200 && data.responseText) {
            const html = $(data.responseText)
            const claimBtn = html.find('button.button:contains("Link"),button.button:contains("Claim"),button.button:contains("链接")')
            const form = html.find('form[action*="claim-key"]')
            if (/This page is linked|此页面已链接到帐户/gim.test(html.find('div.inner_column').text()) || html.find('a.button.download_btn[data-upload_id]').length > 0) {
              log('激活成功！', 'success')
            } else if (form.length > 0) {
              const url = form.attr('action')
              const csrf_token = form.find('input[name="csrf_token"]').val()
              await claimame(url, csrf_token, url.href)
            } else if (claimBtn.length > 0 && claimBtn.parents('form').length > 0) {
              const form = claimBtn.parents('form')
              const url = form.attr('action')
              const csrf_token = form.find('input[name="csrf_token"]').val()
              await claimame(url, csrf_token, url.href)
            } else {
              log('激活完成，结果未知！', 'success')
            }
          } else {
            log('请求失败！', 'error')
            log(data)
          }
          if (typeof checkItchGame === 'function') checkItchGame()
          resolve()
        }
      })
    }).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
  async function claimame (e, token, referer) {
    log('正在激活游戏...')
    await new Promise(resolve => {
      const url = new URL(e)
      GM_xmlhttpRequest({
        url: url.href,
        method: 'post',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Cache-Control': 'max-age=0',
          'Content-Type': 'application/x-www-form-urlencoded',
          DNT: 1,
          Host: url.hostname,
          Origin: url.origin,
          Referer: referer,
          'sec-ch-ua': '"\\\\Not;A\\"Brand";v="99", "Google Chrome";v="85", "Chromium";v="85"',
          'sec-ch-ua-mobile': '?0',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4164.2 Safari/537.36'
        },
        data: `csrf_token=${encodeURIComponent(token)}`,
        onload: async data => {
          if (data.status === 200 && data.responseText) {
            const html = $(data.responseText)
            if (/This page is linked|此页面已链接到帐户/gim.test(html.find('div.inner_column').text()) || html.find('a.button.download_btn[data-upload_id]').length > 0) {
              log('激活成功！', 'success')
            } else {
              log('激活完成，结果未知！', 'success')
            }
            resolve()
          } else {
            log('请求失败！', 'error')
            log(data)
            resolve()
          }
        }
      })
    }).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
})()
