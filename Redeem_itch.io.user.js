// ==UserScript==
// @name         Redeem itch.io
// @namespace    Redeem-itch.io
// @version      1.1.6
// @description  自动激活itch.io key链接和免费itch.io游戏
// @author       HCLonely
// @include      *://*itch.io/*
// @include      *://keylol.com/*
// @include      *://www.steamgifts.com/discussions/*
// @include      *://www.reddit.com/r/*
// @supportURL   https://blog.hclonely.com/posts/578f9be7/
// @homepage     https://blog.hclonely.com/posts/578f9be7/
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @run-at       document-end
// @connect      itch.io
// @connect      *.itch.io
// ==/UserScript==

(function() {
    'use strict';

    var closeWindow=true;//激活完成后自动关闭页面，改为'false'则为不自动关闭
    var url = location.href;

    function closePage(){
        window.close();
        /*
        if (navigator.userAgent.includes("Firefox") || navigator.userAgent.includes("Chrome")) {
            window.location.href="about:blank";
            window.close();
        } else {
            window.opener = null;
            window.open("", "_self");
            window.close();
        }
        */
    }

    /***************************自动激活itch.io游戏链接***************************/
    if (/^https?:\/\/[\w\W]{1,}\.itch\.io\/[\w]{1,}(-[\w]{1,}){0,}\/download\/[\w\W]{0,}/i.test(url)){
        $("button.button").map(function(i,e){
            if(/link|claim|链接至/gim.test($(e).text())) e.click();
        });
        if((/This page is linked|此页面已链接到帐户/gim.test($("div.inner_column").text())||$("a.button.download_btn[data-upload_id]").length>0)&&closeWindow==1) closePage();
    }

    /***********************领取免费itch.io游戏***************************/
    if(/^https?:\/\/.*?itch\.io\/.*?\/purchase(\?.*?)?$/.test(url)&&/No thanks\, just take me to the downloads|不用了，请带我去下载页面/i.test($("a.direct_download_btn").text())){
        $("a.direct_download_btn")[0].click();
    }else if($(".purchase_banner_inner").length===0&&(/0\.00/gim.test($(".button_message").eq(0).find(".dollars[itemprop]").text())||/Name your own price/gim.test($(".button_message").eq(0).find(".buy_message").text()))){
        window.open(url+"/purchase","_self")
    }

    /************************限时免费游戏包*****************************/
    if(/https?:\/\/itch.io\/s\/[\d]{1,}\/[\w\W]{1,}/.test(url)){
        let gameLink=document.getElementsByClassName("thumb_link game_link");
        for(var x=0,y=gameLink.length;x<y;x++){
            if(x!==y-1){
                window.open(gameLink[x].href+"/purchase","_blank");
            }else{
                window.open(gameLink[x].href+"/purchase","_self");
            }
        }
    }
    if(['keylol.com', 'www.steamgifts.com', 'www.reddit.com'].includes(window.location.hostname)){
        function log(e,c){
            console.log('%c'+e, 'color:'+c)
        }
        async function redeemGame(url){
            log('当前游戏/优惠包链接: '+url)
            if (/https?:\/\/itch.io\/s\/[\d]+\/.+/.test(url)){
                log('正在获取游戏信息...')
                await new Promise(resolve => {
                    GM_xmlhttpRequest({
                        url,
                        method:'get',
                        onload:async data=>{
                            if (data.status ===200){
                                if(data.responseText.includes('not_active_notification')) {
                                    log('活动已结束！','red')
                                    resolve()
                                }else{
                                    let games=$(data.responseText).find('.game_grid_widget.promo_game_grid a.thumb_link.game_link')
                                    for(let e of games){
                                        await isOwn(e.href)
                                    }
                                    resolve()
                                }
                            }else{
                                log('请求失败！', 'red')
                                resolve()
                            }
                        }
                    })
                }).then(()=>{
                    return true
                }).catch(()=>{
                    return false
                })
            } else if (/^https?:\/\/.+?\.itch\.io\/[^/]+?(\/purchase)?$/.test(url)){
                await isOwn(url.replace('/purchase',''))
            }
        }
        async function isOwn(url){
            log('当前游戏链接: '+url)
            log('正在检测游戏是否拥有...')
            await new Promise(resolve => {
                GM_xmlhttpRequest({
                    url,
                    method: 'get',
                    onload: async data => {
                        if (data.status === 200) {
                            if (data.responseText.includes('purchase_banner_inner')) {
                                log('游戏已拥有！', 'green')
                                resolve()
                            } else {
                                // await purchase(url)
                                await openPurchase(url)
                                resolve()
                            }
                        } else {
                            log('请求失败！', 'red')
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
        async function openPurchase(url) {
            log('已打开购买页面...')
            await new Promise(resolve => {
                let timer=setTimeout(() => {
                    log('有的页面脚本不能自动关闭，请手动关闭！')
                    resolve()
                }, 15000)
                let t=GM_openInTab(url + '/purchase', { active: true, setParent: true }).onclosed = () => {
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
        async function purchase(url){
            log('正在加载购买页面...')
            await new Promise(resolve => {
                GM_xmlhttpRequest({
                    url: url + '/purchase',
                    method: 'get',
                    onload: async data => {
                        if (data.status === 200) {
                            if (/0\.00/gim.test($(data.responseText).find(".button_message:first .dollars[itemprop]").text()) || /Name your own price/gim.test($(data.responseText).find(".button_message:first .buy_message").text())) {
                                let csrf_token=$(data.responseText).find('[name="csrf_token"]').val()
                                await download(url, csrf_token)
                                resolve()
                            } else {
                                log('价格不为 0, 可能活动已结束！', 'red')
                                resolve()
                            }
                        } else {
                            log('请求失败！', 'red')
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
        async function download(url, csrf_token) {
            log('正在请求下载页面...')
            await new Promise(resolve => {
                GM_xmlhttpRequest({
                    url: url + '/download_url',
                    method: 'post',
                    data: {csrf_token},
                    responseType:'json',
                    onload: async data => {
                        if (data.status === 200 && data.response && data.response.url ) {
                            // await loadDownload(data.response.url)
                            resolve()
                        } else {
                            log('请求失败！', 'red')
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

        async function loadDownload(url) {
            log('正在加载下载页面...')
            await new Promise(resolve => {
                GM_xmlhttpRequest({
                    url: url,
                    method: 'get',
                    onload: async data => {
                        if (data.status === 200 && data.response && data.response.url) {

                        } else {
                            log('请求失败！', 'red')
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
        GM_registerMenuCommand('提取所有链接',async ()=>{
            for(let e of $('a[href*="itch.io"]')){
                await redeemGame(e.href)
            }
        });
    }
})();
