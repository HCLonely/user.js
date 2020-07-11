// ==UserScript==
// @name         Giveaway Left Check
// @namespace    Giveaway-Left-Check
// @version      0.1
// @description  检测其乐论坛福利放送版块的赠key剩余数量
// @author       HCLonely
// @include      *://keylol.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      marvelousga.com
// @connect      grabfreegame.com
// @connect      bananagiveaway.com
// @connect      gamehag.com
// @connect      prys.revadike.com
// @connect      takekey.ru
// @connect      alienwarearena.com
// ==/UserScript==

(function () {
  'use strict'

  const leftTitle = $('.subforum_left_title_left_up a').eq(3)
  const leftTitleHref = leftTitle.length > 0 ? leftTitle.attr('href') : ''
  if ((leftTitleHref.includes('f319-1') || (leftTitleHref.includes('page=1') && leftTitleHref.includes('fid=319'))) && leftTitle.text() === '福利放送') {
    const marvelousgaLinks = $('a[href*="marvelousga.com"]')
    const grabfreegameLinks = $('a[href*="grabfreegame.com"],a[href*="bananagiveaway.com"]')
    const gamehagLinks = $('a[href*="gamehag.com"]')
    const prysLinks = $('a[href*="prys.revadike.com"]')
    const takekeyLinks = $('a[href*="takekey.ru"]')
    const alienwarearenaLinks = $('a[href*="alienwarearena.com"]')

    if (marvelousgaLinks.length > 0) {
      for (const e of marvelousgaLinks) {
        const test = $(e).attr('href').match(/https?:\/\/marvelousga\.com\/giveaway\/(.+)/)
        const id = test ? test[1] : false
        if (id) checkMarvelousga(id, e)
      }
    }
    if (grabfreegameLinks.length > 0) {
      for (const e of grabfreegameLinks) {
        const link = $(e).attr('href')
        if (/https?:\/\/www\.(grabfreegame|bananagiveaway)\.com\/giveaway\/.*/.test(link)) checkGrabfreegame(link, e)
      }
    }
    if (gamehagLinks.length > 0) {
      for (const e of gamehagLinks) {
        const link = $(e).attr('href')
        if (/https?:\/\/.*?gamehag\.com\/giveaway\/[\d]+.*?/.test(link)) checkGamehag(link, e)
      }
    }
    if (prysLinks.length > 0) {
      for (const e of prysLinks) {
        const link = $(e).attr('href')
        if (/https?:\/\/prys\.revadike\.com\/giveaway\/\?id=[\d]+/.test(link)) checkPrys(link, e)
      }
    }
    if (takekeyLinks.length > 0) {
      for (const e of takekeyLinks) {
        const link = $(e).attr('href')
        if (/https?:\/\/takekey\.ru\/distribution\/[\d]+/.test(link)) checkTakekey(link, e)
      }
    }
    if (alienwarearenaLinks.length > 0) {
      for (const e of alienwarearenaLinks) {
        const link = $(e).attr('href')
        if (/https?:\/\/.*?\.alienwarearena\.com\/ucf\/show\/[\d]+.*?/.test(link)) checkAlienwarearena(link, e)
      }
    }
  }
  function checkMarvelousga (id, e) {
    const thisEle = $('a[href="' + $(e).attr('href') + '"]')
    GM_xmlhttpRequest({
      method: 'get',
      url: 'https://marvelousga.com/',
      timeout: 30 * 1000,
      ontimeout: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求超时">timeout</font>')
      },
      onerror: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求失败">error</font>')
      },
      onload: response => {
        try {
          const a = $(`<div>${response.responseText}</div>`).find('a[href*="' + id + '"]')
          if (a.length > 0) {
            const leftKey = a.parent().children('small').text().trim().match(/[\d]+/)[0]
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(leftKey)}" title="剩余key数量">${leftKey}</font>`)
          } else {
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(0)}" title="剩余key数量">0</font>`)
          }
        } catch (err) {
          if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="获取数据失败">error</font>')
        }
      }
    })
  }
  function checkGrabfreegame (url, e) {
    const thisEle = $('a[href="' + $(e).attr('href') + '"]')
    GM_xmlhttpRequest({
      method: 'get',
      url,
      timeout: 30 * 1000,
      ontimeout: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求超时">timeout</font>')
      },
      onerror: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求失败">error</font>')
      },
      onload: response => {
        try {
          const counter = $(`<div>${response.responseText}</div>`).find('#giveaway .left>b')
          if (counter.length > 0) {
            const leftKey = counter.text().trim()
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(leftKey)}" title="剩余key数量">${leftKey}</font>`)
          } else {
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(0)}" title="剩余key数量">0</font>`)
          }
        } catch (err) {
          if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="获取数据失败">error</font>')
        }
      }
    })
  }
  function checkGamehag (url, e) {
    const thisEle = $('a[href="' + $(e).attr('href') + '"]')
    GM_xmlhttpRequest({
      method: 'get',
      url,
      timeout: 30 * 1000,
      ontimeout: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求超时">timeout</font>')
      },
      onerror: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求失败">error</font>')
      },
      onload: response => {
        try {
          const counter = $(`<div>${response.responseText}</div>`).find('div.giveaway-counter').not(':contains("day")').find('.strong')
          if (counter.length > 0) {
            const leftKey = counter.text().trim()
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(leftKey)}" title="剩余key数量">${leftKey}</font>`)
          } else {
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(0)}" title="剩余key数量">0</font>`)
          }
        } catch (err) {
          if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="获取数据失败">error</font>')
        }
      }
    })
  }
  function checkPrys (url, e) {
    const thisEle = $('a[href="' + $(e).attr('href') + '"]')
    GM_xmlhttpRequest({
      method: 'get',
      url,
      timeout: 30 * 1000,
      ontimeout: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求超时">timeout</font>')
      },
      onerror: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求失败">error</font>')
      },
      onload: response => {
        try {
          const counter = $(`<div>${response.responseText}</div>`).find('#header :contains("left")')
          if (counter.length > 0) {
            const leftKey = counter.text().trim().match(/\(([\d]+).*\)/)[1]
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(leftKey)}" title="剩余key数量">${leftKey}</font>`)
          } else {
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(0)}" title="剩余key数量">0</font>`)
          }
        } catch (err) {
          if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="获取数据失败">error</font>')
        }
      }
    })
  }
  function checkTakekey (url, e) {
    const thisEle = $('a[href="' + $(e).attr('href') + '"]')
    GM_xmlhttpRequest({
      method: 'get',
      url,
      timeout: 30 * 1000,
      ontimeout: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求超时">timeout</font>')
      },
      onerror: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求失败">error</font>')
      },
      onload: response => {
        try {
          const counter = $(`<div>${response.responseText}</div>`).find('span.text-muted:contains("Left")')
          if (counter.length > 0) {
            const leftKey = counter.text().trim().match(/[\d]+/)[0]

            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(leftKey)}" title="剩余key数量">${leftKey}</font>`)
          } else {
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(0)}" title="剩余key数量">0</font>`)
          }
        } catch (err) {
          if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="获取数据失败">error</font>')
        }
      }
    })
  }
  function checkAlienwarearena (url, e) {
    const thisEle = $('a[href="' + $(e).attr('href') + '"]')
    GM_xmlhttpRequest({
      method: 'get',
      url,
      timeout: 30 * 1000,
      ontimeout: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求超时">timeout</font>')
      },
      onerror: () => {
        if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="请求失败">error</font>')
      },
      onload: response => {
        try {
          let userCountry = response.responseText.match(/user_country.*?=.*?"([\w]+)"/)
          userCountry = userCountry ? userCountry[1] : ''
          let prestigeLevel = response.responseText.match(/prestige_level.*?=.*?([\d]+)/)
          prestigeLevel = prestigeLevel ? parseInt(prestigeLevel[1]) : 0
          let fullLevel = response.responseText.match(/full_level.*?=.*?([\d]+)/)
          fullLevel = fullLevel ? parseInt(fullLevel[1]) : 0
          let countryKeys = response.responseText.match(/countryKeys.*?=.*?(\{.+\});/)
          countryKeys = countryKeys ? JSON.parse(countryKeys[1]) : {}

          const keyType = prestigeLevel ? 'prestige' : 'normal'
          let userCountryKeys = countryKeys[userCountry][keyType]

          let lowestLevelWithKeys
          let highestKeysForUser
          let keysForUser = false

          for (const level in userCountryKeys) {
            if (userCountryKeys[level] > 0) {
              if (!lowestLevelWithKeys) { lowestLevelWithKeys = level }
              if (fullLevel >= level) {
                if (!highestKeysForUser || userCountryKeys[level] > highestKeysForUser) { highestKeysForUser = userCountryKeys[level] }
              }
            }
          }

          if (!highestKeysForUser && keyType === 'prestige') {
            userCountryKeys = countryKeys[userCountry].normal

            for (var level in userCountryKeys) {
              if (userCountryKeys[level] > 0) {
                if (!lowestLevelWithKeys) { lowestLevelWithKeys = level }
                if (fullLevel >= level) {
                  if (!highestKeysForUser || userCountryKeys[level] > highestKeysForUser) { highestKeysForUser = userCountryKeys[level] }
                }
              }
            }
          }
          if (highestKeysForUser) {
            if (!thisEle.next().hasClass('left-keys')) thisEle.after(`<font class="left-keys ${getClass(highestKeysForUser)}" title="剩余key数量">${highestKeysForUser}</font>`)
            keysForUser = true
          }

          if (!keysForUser) {
            if (lowestLevelWithKeys) {
              if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="等级不足">等级不足</font>')
            } else {
              if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="剩余key数量">0</font>')
            }
          }
        } catch (err) {
          if (!thisEle.next().hasClass('left-keys')) thisEle.after('<font class="left-keys lk-red" title="获取数据失败">error</font>')
        }
      }
    })
  }
  function getClass (left) {
    const leftKey = parseInt(left)
    if (leftKey >= 100) {
      return 'lk-green'
    } else if (leftKey > 0 && leftKey < 100) {
      return 'lk-yellow'
    } else {
      return 'lk-red'
    }
  }
  GM_addStyle(`
.left-keys{
  color: #fff;
  border-radius: 10px;
  padding: 0 5px;
  margin-left: 5px;
}
.lk-green{
  background-color: #5cb85c;
}
.lk-yelow{
  background-color: #f0ad4e;
}
.lk-red{
  background-color: #d9534f;
}
  `)
})()
