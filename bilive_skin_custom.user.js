// ==UserScript==
// @name         bilibili直播自定义皮肤背景
// @namespace    bilibili- ( ゜- ゜)つロ 乾杯~
// @version      1.1.2
// @description  自定义bilibili直播的皮肤和背景，仅自己可见！
// @author       HCLonely
// @include      /^https?:\/\/live.bilibili.com\/(blanc\/)?[\d]+/
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @require      https://greasyfork.org/scripts/388035-jquery/code/$jQuery.js?version=736625
// @homepage     https://blog.hclonely.com/posts/578f9be7/
// @supportURL   https://blog.hclonely.com/posts/578f9be7/
// @run-at       document-end
// @connect      *
// @compatible   chrome 没有测试其他浏览器的兼容性
// ==/UserScript==

(function($jq){
window.onload=function() {
    'use strict';

    if($jq('main.app-content').length<1) return;

    const backgroundImage=["background",{"id":1,"title":"纯色背景"},{"id":2,"title":"自定义背景"},{"id":3,"title":"默认背景①","url":"http://static.hdslb.com/live-static/images/bg/1.jpg"},{"id":4,"title":"默认背景②","url":"http://static.hdslb.com/live-static/images/bg/2.jpg"},{"id":5,"title":"默认背景③","url":"http://static.hdslb.com/live-static/images/bg/3.jpg"},{"id":6,"title":"默认背景④","url":"http://static.hdslb.com/live-static/images/bg/4.jpg"},{"id":7,"title":"默认背景⑤","url":"http://static.hdslb.com/live-static/images/bg/5.jpg"},{"id":8,"title":"默认背景⑥","url":"http://static.hdslb.com/live-static/images/bg/6.jpg"}];
    const skinArr=["skin",{"id":"default","name":"默认"},{"id":"transparent","name":"透明"},{"id":"customize","name":"自定义"}];

    GM_setValue('skin',null)
    let skin=GM_getValue('skinCache')||skinArr;

    start();
    function start(){
        $jq('body').append(`
<div name="sideBarLeft" class="side-bar-left">
    <div name="settingDiv" class="awarding-panel border-box a-scale-in-ease p-absolute awarding-panel-setting" style="display: none;">
        <h2 name="settingH2" class="title"></h2>
        <div name="settingInfoDiv" class="info-section p-relative" data-tag=""></div>
        <div name="customizeDiv" class="info-section p-relative color-info" style="display: none;">
            <h2 class="title">请输入颜色代码：</h2>
            <div class="code-div color-code-div">
                <input type="text" name="colorCode" placeholder="请输入颜色代码(☆▽☆)" title="请输入颜色代码(☆▽☆)" maxlength="10" class="v-middle-color">
                <button id="colorEnter" class="color-button">确认</button>
            </div>
        </div>
        <div name="customizeDiv" class="info-section p-relative url-info" style="display: none;">
            <h2 class="title">请输入自定义图片网址：</h2>
            <div class="code-div url-info-div">
                <input type="text" name="urlCode" placeholder="请输入图片网址(☆▽☆)" title="请输入图片网址(☆▽☆)" maxlength="100" class="v-middle-color">
                <button id="urlEnter" class="color-button">确认</button>
            </div>
        </div>
        <div name="customizeDiv" class="info-section p-relative skin-info" style="display: black;">
            <h2 class="title"><div class="code-div skin-code-div live-top-div">直播区顶部：
                <input id="headInfoBgPic" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" title="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div live-bottom-div">直播区底部：
                <input id="giftControlBgPic" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" title="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div chat-top-div">聊天区顶部：
                <input id="rankListBgPic" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" title="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div chat-middle-div">聊天区中部：
                <input id="danmakuBgPic" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" title="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div chat-bottom-div">聊天区底部：
                <input id="inputBgPic" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" title="请输入背景图片网址或颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div txt-color-div">字体颜色①：
                <input id="mainText" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入字体颜色代码，留空为默认(☆▽☆)" title="请输入字体颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div txt-color-div">字体颜色②：
                <input id="normalText" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入字体颜色代码，留空为默认(☆▽☆)" title="请输入字体颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div txt-color-div">背景颜色①：
                <input id="highlightContent" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景颜色代码，留空为默认(☆▽☆)" title="请输入背景颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title"><div class="code-div skin-code-div txt-color-div">背景颜色②：
                <input id="border" disabled="disabled" type="text" name="skinBgCode" placeholder="请输入背景颜色代码，留空为默认(☆▽☆)" title="请输入背景颜色代码，留空为默认(☆▽☆)" maxlength="100" class="v-middle-color">
            </div></h2>
            <h2 class="title" align="center" style='margin-top:10px;'><!--<button class="live-skin-highlight-button-bg get-config-button"><span class="txt save-txt">获取保存的配置</span></button>--><button class="live-skin-highlight-button-bg pre-button" disabled="disabled"><span class="txt save-txt">预览</span></h2>
        </div>
        <button name="closeBtn" class="close-btn p-absolute pointer ts-dot-4"><i class="icon-font icon-close"></i>
        </button>
        <div class="bottom-div">
            <button class="live-skin-highlight-button-bg save-button"><span class="txt save-txt">保存</span>
            </button>
        </div>
    </div>
    <div name="backgroundDiv" role="button" data-upgrade-intro="Background" class="side-bar-btn">
        <div class="side-bar-btn-cntr side-bar-btn-div">
<span class="side-bar-icon dp-i-block svg-icon svg-icon-span" style="background-position: 0px -54em;"></span>
            <p class="size-bar-text size-bar-text-p color-#0080c6" style="color: rgb(0, 128, 198);">更换背景</p>
        </div>
    </div>
    <div name="skinDiv" role="button" data-upgrade-intro="Skin" class="side-bar-btn">
        <div class="side-bar-btn-cntr side-bar-btn-div">
<span class="side-bar-icon dp-i-block svg-icon svg-icon-span" style="background-position: 0px -69em;"></span>
            <p class="size-bar-text size-bar-text-p color-#0080c6" style="color: rgb(0, 128, 198);">更换皮肤</p>
        </div>
    </div>
    <div name="updateDiv" role="button" data-upgrade-intro="Update" class="side-bar-btn">
        <div class="side-bar-btn-cntr side-bar-btn-div">
<span class="update" style="background-color: red;border-radius: 50%;height: 5px;width: 5px;display: none;position: absolute;"></span>
<span class="side-bar-icon dp-i-block svg-icon svg-icon-span" style="background-position: 0px -91em;"></span>
            <p class="size-bar-text size-bar-text-p color-#0080c6" style="color: rgb(0, 128, 198);">更新缓存</p>
        </div>
    </div>
    <div name="hideDiv" role="button" data-upgrade-intro="Hide" class="side-bar-btn">
        <div class="side-bar-btn-cntr side-bar-btn-div">
<span class="side-bar-icon dp-i-block svg-icon svg-icon-span" style="background-position: 0px -62em;"></span>
            <p class="size-bar-text size-bar-text-p color-#0080c6" style="color: rgb(0, 128, 198);">隐藏</p>
        </div>
    </div>
</div>
`);
        GM_xmlhttpRequest({
            method:'GET',
            url:`https://api.live.bilibili.com/room/v1/Skin/info?skin_platform=web&skin_version=1&id=${GM_getValue("skinCache").length-3}`,
            responseType:'json',
            onload:data=>{
                if(data.status==200&&data.response.code==0){
                    if(Object.prototype.toString.call(data.response.data) === '[object Object]'&&data.response.data.id+4>skin.length){
                        $jq('span.update').css('display','inline-block');
                        $jq('span.update').parent().attr('title','有新皮肤啦');
                    }
                }
            }
        });

        let sideBarLeft=$jq('[name="sideBarLeft"]');
        let settingDiv=$jq('[name="settingDiv"]');
        let settingH2=$jq('[name="settingH2"]');
        let settingInfoDiv=$jq('[name="settingInfoDiv"]');
        let closeBtn=$jq('[name="closeBtn"]');
        let backgroundDiv=$jq('[name="backgroundDiv"]');
        let hideDiv=$jq('[name="hideDiv"]');
        let skinDiv=$jq('[name="skinDiv"]');
        let updateDiv=$jq('[name="updateDiv"]');
        let saveBtn=$jq('.save-button');
        let preBtn=$jq('.pre-button');
        let getConfigBtn=$jq('.get-config-button');
        let skinInfo=$jq('.skin-info');
        let biInfo=set_info(backgroundImage);
        let skInfo=set_info(skin);

        closeBtn.click(()=>{
            settingDiv.hide();
        });
        backgroundDiv.click(()=>{
            if(settingInfoDiv.attr('data-tag')=='bg'&&settingDiv.css('display')=='none'){
                settingDiv.show();
            }else if(settingInfoDiv.attr('data-tag')=='bg'){
                settingDiv.hide();
            }else{
                settingInfoDiv.attr('data-tag','bg')
                settingH2.text('更换背景');
                settingInfoDiv.html(biInfo);
                $jq('.background-select').click(function(){
                    set_background($jq(this).attr('data-background-id'));
                });
                skinInfo.hide();
                settingDiv.show();
            }
        });
        skinDiv.click(()=>{
            if(settingInfoDiv.attr('data-tag')=='skin'&&settingDiv.css('display')=='none'){
                settingDiv.show();
                settingDiv.show();
            }else if(settingInfoDiv.attr('data-tag')=='skin'){
                settingDiv.show();
                settingDiv.hide();
            }else{
                settingInfoDiv.attr('data-tag','skin')
                settingH2.text('更换皮肤');
                settingInfoDiv.html('<select class="skin">'+skInfo+'</select>'+(GM_getValue('skinCache')?"":'首次使用请先<a id="updateA" href="javascript:void(0)" target="_self">更新</a>皮肤缓存'));
                $jq('.color-info').hide();
                $jq('.url-info').hide();
                $jq('select.skin').change(function(){
                    get_skin($jq(this).find('option:selected').val());
                });
                $jq("#updateA").click(()=>{updateSkin()});
                skinInfo.show();
                settingDiv.show();
            }
        });
        updateDiv.click(()=>{updateSkin()});
        hideDiv.click(()=>{
            sideBarLeft.hide();
        });
        saveBtn.click(()=>{
            let cache=get_setting();
            GM_setValue('mySetting',cache);
            msg('保存成功！');
        });
        preBtn.click(function(){
            let skin_config={};
            $jq.makeArray($jq('input[name="skinBgCode"]')).map(e=>{
                skin_config[$jq(e).attr('id')]=$jq(e).val();
            });
            set_skin('customize',skin_config);
        });

        $("head").bind("DOMNodeInserted", ()=>{
            let prevSetting=GM_getValue('mySetting')||[];
            let nowSetting=get_setting();
            if($('style[id^=skin-css-').length>1) $(`style[id^=skin-css-]:not([id=skin-css-${prevSetting[1].id}])`).remove();
            else if(($jq('div.room-bg[role="img"]').length>0?prevSetting[0]!=nowSetting[0]:false)||prevSetting[1].id!=nowSetting[1].id) set_all(prevSetting);
        });
        sideBarLeft.click(()=>{
            $("head").unbind("DOMNodeInserted");
        });

        function set_info(e){
            let info="";
            let type=e[0];
            let classType=e[0]=='skin'?'skin':'background';
            for(let i=1;i<e.length;i++){
                if(e[i]) type==='skin'?info+=`<option class="${classType}-select" value="${e[i].id}">${e[i].name}</option>`:info+=`<div data-${type}-id="${e[i].id}" class="${classType}-select" style="background-color: rgb(251, 114, 153);"><p class="hour-rank-info">${e[i].title}</p><!----></div>`;
            }
            return info;
        }
        function set_background(id){
            switch(id){
                case '1':
                    $jq('div.url-info').hide();
                    $jq('div.color-info').show();
                    $jq('#colorEnter').click(()=>{
                        if($jq('div.room-bg[role="img"]').length>0) $jq('div.room-bg[role="img"]').attr('style',`background-color: ${$jq('input[name="colorCode"]').val()};`);
                    });
                    break;
                case '2':
                    $jq('div.color-info').hide();
                    $jq('div.url-info').show();
                    $jq('#urlEnter').click(()=>{
                        if($jq('div.room-bg[role="img"]').length>0) $jq('div.room-bg[role="img"]').attr('style',`background-image: url("${$jq('input[name="urlCode"]').val()}");`);
                    });
                    break;
                default:
                    $jq('div.color-info').hide();
                    $jq('div.url-info').hide();
                    if($jq('div.room-bg[role="img"]').length>0) $jq('div.room-bg[role="img"]').attr('style',`background-image: url("${backgroundImage[id].url}");`);
                    break;
            }
        }
        function get_skin(id){
            $('.pre-button').attr("disabled",'disabled');
            switch(id){
                case 'default':
                    $('[name="skinBgCode"]').val('');
                    $('style[id^=skin-css-').remove();
                    $('head').append(`<style type="text/css" id="skin-css-default"></style>`);
                    break;
                case 'transparent':
                    $('[name="skinBgCode"]').val('');
                    set_skin(id,{headInfoBgPic:"#fff0",giftControlBgPic:"#fff0",rankListBgPic:"#fff0",danmakuBgPic:"#fff0",inputBgPic:"#fff0"});
                    $('#headInfoBgPic').val('#fff0');
                    $('#giftControlBgPic').val('#fff0');
                    $('#rankListBgPic').val('#fff0');
                    $('#danmakuBgPic').val('#fff0');
                    $('#inputBgPic').val('#fff0');
                    break;
                case 'customize':
                    $('input[name="skinBgCode"]').removeAttr('disabled');
                    $('.pre-button').removeAttr('disabled');
                    break;
                default:
                    $('[name="skinBgCode"]').val('');
                    //msg("正在获取皮肤设置...","info");
                    set_skin(id,eval("("+get_skin_conf(id,skin).skin_config.replace(/\#FF/g,"#")+")"));
                    /*
                    $jq.ajax({
                        type:'get',
                        url:'https://api.live.bilibili.com/room/v1/Skin/info?skin_platform=web&skin_version=1&id='+id,
                        success:data=>{
                            if(data.data){
                                let skin_config=eval("("+data.data.skin_config.replace(/\#FF/g,"#")+")");
                                msg("获取皮肤设置成功");
                                set_skin(id,skin_config);
                            }else if(data.message||data.msg||data.code){
                                let message=data.message||data.msg||data.code||'未知错误';
                                msg(message);
                            }
                        },
                        error:()=>{
                            msg('获取皮肤信息出错');
                        },
                    });*/
            }
        }
        function set_skin(id,skin_config){
            Object.keys(skin_config).forEach(function(key){
                $jq("#"+key).val(skin_config[key]);
            });
            let mainText=skin_config.mainText?`
  .live-skin-coloration-area
    .live-skin-main-text {
      color: ${skin_config.mainText}!important;
    }

  .live-skin-coloration-area
    .live-skin-main-a-text:link,.live-skin-main-a-text:visited {
      color: ${skin_config.mainText}!important;
    }
`:"";
        let normalText=skin_config.normalText?`
  .live-skin-coloration-area
    .live-skin-normal-text {
      color: ${skin_config.normalText}!important;
    }

  .live-skin-coloration-area
    .live-skin-normal-a-text {
      color: ${skin_config.normalText}!important;
    }

  .live-skin-coloration-area
    .live-skin-normal-a-text:link,.live-skin-normal-a-text:visited {
      color: ${skin_config.normalText}!important;
    }
`:"";
            let highlightContent=skin_config.highlightContent?`
  .live-skin-coloration-area
    .live-skin-main-a-text:hover,.live-skin-main-a-text:active {
      color: ${skin_config.highlightContent}!important;
    }

  .live-skin-coloration-area
    .live-skin-normal-a-text:hover,.live-skin-normal-a-text:active {
      color: ${skin_config.highlightContent}!important;
    }

  .live-skin-coloration-area
    .live-skin-highlight-text {
      color: ${skin_config.highlightContent}!important;
    }

  .live-skin-coloration-area
    .live-skin-highlight-bg {
      background-color: ${skin_config.highlightContent}!important;
    }

  .live-skin-coloration-area
    .live-skin-highlight-border {
      border-color: ${skin_config.highlightContent}!important;
    }

  .live-skin-coloration-area
    .live-skin-highlight-button-bg.bl-button--primary:not(:disabled) {
      background-color: ${skin_config.highlightContent};
    }

  .live-skin-coloration-area
    .live-skin-highlight-button-bg.bl-button--primary:hover:not(:disabled) {
      background-color: ${skin_config.highlightContent};
    }

  .live-skin-coloration-area
    .live-skin-highlight-button-bg.bl-button--primary:active:not(:disabled) {
      background-color: ${skin_config.highlightContent};
    }
`:"";
            let border=skin_config.border?`
  .live-skin-coloration-area
    .live-skin-separate-border {
      border-color: ${skin_config.border}!important;
    }

  .live-skin-coloration-area
    .live-skin-separate-area {
      background-color: ${skin_config.border}!important;
    }

  .live-skin-coloration-area
    .live-skin-separate-area-hover:hover {
      background-color: ${skin_config.border}!important;
    }
`:"";
            let headInfoBgPic=skin_config.headInfoBgPic;
            let giftControlBgPic=skin_config.giftControlBgPic;
            let rankListBgPic=/^\#/.test(skin_config.rankListBgPic)?`#rank-list-ctnr-box,#rank-list-vm {background-color: ${skin_config.rankListBgPic}!important}`:`#rank-list-ctnr-box {background-image: url(${skin_config.rankListBgPic})!important}`;
            let danmakuBgPic=skin_config.danmakuBgPic?`.chat-history-panel{${/^\#/.test(skin_config.danmakuBgPic)?`background-color: ${skin_config.danmakuBgPic}!important`:`background-image: url(${skin_config.danmakuBgPic})!important`};}`:"";
            let inputBgPic=skin_config.inputBgPic?`#chat-control-panel-vm{${/^\#/.test(skin_config.inputBgPic)?`background-color: ${skin_config.inputBgPic}!important`:`background-image: url(${skin_config.inputBgPic})!important`};}`:"";

            $('style[id^=skin-css-').remove();
            $('body').append(`
<style type="text/css" id="skin-css-${id}">${`
${mainText}
${normalText}
${highlightContent}
${border}
  #head-info-vm {
    ${/^\#/.test(headInfoBgPic)?`background-color: ${headInfoBgPic}!important`:`background-image: url(${headInfoBgPic})!important`};
  }

  #gift-control-vm {
    ${/^\#/.test(giftControlBgPic)?`background-color: ${giftControlBgPic}!important`:`background-image: url(${giftControlBgPic})!important`};
  }

${rankListBgPic}

  #head-info-vm,#gift-control-vm {
    border: none !important;
        box-sizing: border-box;
  }

  #aside-area-vm {
    border: none !important;
        width: 300px;
  }
${danmakuBgPic}
${inputBgPic}
`.trim()}</style>`);
        }
        function get_setting(){
            let cache=[];
            if($jq('div.room-bg[role="img"]').length>0) cache[0]=$jq('div.room-bg[role="img"]').attr('style');
            if($('style[id^=skin-css-').length>0){
                let skinId=$('style[id^=skin-css-').attr('id').replace('skin-css-','');
                cache[1]={'id':skinId,'style':$('style[id^=skin-css-').html()};
            }else{
                cache[1]={'id':'default'};
            }
            return cache;
        }
        function set_all(setting){
            if(setting[0]&&$jq('div.room-bg[role="img"]').length>0) $jq('div.room-bg[role="img"]').attr('style',setting[0]);
            if(setting[1]){
                $('style[id^=skin-css-').remove();
                $('head').append(`<style type="text/css" id="skin-css-${setting[1].id}">${setting[1].style}</style>`);
            }
        }
        function screen(){
            let skinId=$('style[id^=skin-css-').attr('id').replace('skin-css-','');
            switch($('div.bilibili-live-player').attr('data-player-state')){
                case "web-fullscreen":
                    sideBarLeft.hide();
                    if(!$('style[id^=skin-css-').html().includes("/*")) $('style[id^=skin-css-').html("/*"+$('style[id^=skin-css-').html()+"*/");
                    break;
                case "normal":
                    sideBarLeft.show();
                    if($('style[id^=skin-css-').html().includes("/*")) $('style[id^=skin-css-').html($('style[id^=skin-css-').html().replace(/\*\/|\/\*/g,""));
                    break;
                case "fullscreen":
                    sideBarLeft.hide();
                    break;
                default:
                    break;
            }
        }

        $jq(document).click(function(e){
            if($jq(e.target).attr('data-title')&&($jq(e.target).attr('data-title').includes('全屏'))) screen();
        });
        $jq(document).dblclick(screen);
        $jq(document).keydown(function(e){
            let keyArr=[13,27,108];
            if(keyArr.indexOf(e.keyCode)>-1) screen();
        });
        document.addEventListener("fullscreenchange", screen);

        function get_skin_conf(id,skin){
            for (let i in skin) {
                if (skin[i].hasOwnProperty("id") && (skin[i].id == id)) return skin[i];
            }
        }
        function updateSkin(id=1){
            let skinCache=GM_getValue('skinCache');
            if(!skinCache[id+3]){
            GM_xmlhttpRequest({
                method:'GET',
                url:'https://api.live.bilibili.com/room/v1/Skin/info?skin_platform=web&skin_version=1&id='+id,
                responseType:'json',
                onload:data=>{
                    let skinConfig=data.response.data;
                    if(data.status===200&&data.response.code===0&&Object.prototype.toString.call(skinConfig) === '[object Object]'&&skinConfig.id===id){
                        skin[skinConfig.id+3]={
                            'id':skinConfig.id,
                            'name':skinConfig.skin_name,
                            'skin_config':skinConfig.skin_config
                        };
                        console.log("皮肤"+skinConfig.id+"更新成功");
                        GM_setValue('skinCache',skin);
                        updateSkin(++id);
                    }else if(data.status===200&&data.response.code===0){
                        msg('皮肤缓存更新完成，刷新后可查看新皮肤');
                    }else{
                        console.log("皮肤"+id+"更新失败");
                        console.log(data);
                    }
                }
            });
            }else{
                updateSkin(++id);
            }
        }
        function msg(message='',status='success'){
            $jq('.link-toast').remove();
            $jq('body').append(`<div class="link-toast ${status}" style="left: ${document.documentElement.clientWidth/2-100}px; top: ${document.documentElement.clientHeight/2}px;"><span class="toast-text">${message}</span></div>`);
            setTimeout(()=>{$jq('.link-toast').remove()},4000);
        }
        GM_addStyle(`
.side-bar-left {
    height: 230px;
    position: fixed;
    left: 0;
    bottom: 30%;
    padding: 12px 4px;
    background-color: #fff;
    z-index: 1000000;
    border-radius: 0 12px 12px 0;
    -webkit-box-shadow: 0 0 20px 0 rgba(0,85,255,.1);
    box-shadow: 0 0 20px 0 rgba(0,85,255,.1);
    -webkit-transition: height .4s cubic-bezier(.22,.58,.12,.98);
    -o-transition: height cubic-bezier(.22,.58,.12,.98) .4s;
    transition: height .4s cubic-bezier(.22,.58,.12,.98);
    border: 1px solid #e9eaec;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

.side-bar-btn-div {
    width: 56px;
    height: 56px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 4px 0;
    cursor: pointer;
    text-align: center;
    padding: 5px 0;
}

.svg-icon-span {
    font-size: 26px !important;
    margin: 0 auto;
    width: 26px;
    height: 26px;
}

.size-bar-text-p {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 16px;
}

.awarding-panel-setting {
    left: 80px;
    bottom: -200px;
    -webkit-transform-origin: 0 100%;
    -ms-transform-origin: 0 100%;
    transform-origin: 0 100%;
    width: 500px;
    height: 500px;
    padding: 24px;
    font-size: 12px;
    color: #333;
    background-color: #fff;
    border: 1px solid #e9eaec;
    border-radius: 12px;
    z-index: 1;
}

.awarding-panel-setting .title {
    margin: 0;
    font-size: 18px;
    font-weight: 400;
    color: #23ade5;
}

.awarding-panel-setting .close-btn {
    padding: 0;
    top: 16px;
    right: 16px;
    font-size: 16px;
    color: #999;
    border: none;
    background-color: transparent;
}

.awarding-panel-setting .close-btn:hover {
    -webkit-transform: scale(1.1) rotate(180deg);
    -ms-transform: scale(1.1) rotate(180deg);
    transform: scale(1.1) rotate(180deg);
}

.awarding-panel-setting .close-btn {
    padding: 0;
    top: 16px;
    right: 16px;
    font-size: 16px;
    color: #999;
    border: none;
    background-color: transparent;
}

.awarding-panel-setting .info-section {
    margin-top: 24px;
}

.background-select,.skin-select {
    width: 22%;
    min-width: 70px;
    height: 20px;
    margin: 5px;
    border-radius: 30px;
    text-align: center;
    cursor: pointer;
    -webkit-transition: all 1s cubic-bezier(.22,.58,.12,.98);
    -o-transition: all 1s cubic-bezier(.22,.58,.12,.98);
    transition: all 1s cubic-bezier(.22,.58,.12,.98);
    vertical-align: middle;
    display: inline-block;
}

.hour-rank-info {
    line-height: 16px;
    padding: 2px 8px;
    margin: 0;
    font-size: 12px;
    color: #fff;
    -webkit-transition: width 3s cubic-bezier(.22,.58,.12,.98);
    -o-transition: width 3s cubic-bezier(.22,.58,.12,.98);
    transition: width 3s cubic-bezier(.22,.58,.12,.98);
    min-width: 70px;
    height: 20px;
    border-radius: 30px;
    text-align: center;
    cursor: pointer;
}

.code-div {
    background-color: hsla(0,0%,100%,.88);
    display: block;
    height: 32px;
    border-style: solid;
    border-radius: 4px;
    border-color: #e9f2f7;
    transition: background-color .2s;
    margin-top: 3px;
}

.v-middle-color {
    float: none;
    color: #222;
    font-size: 12px;
    overflow: hidden;
    height: 32px;
    line-height: 32px;
    padding: 0;
    border: 0;
    box-shadow: none;
    background-color: transparent;
}

.color-button {
    display: block;
    position: relative;
    right: 0;
    width: 48px;
    min-width: 0;
    cursor: pointer;
    height: 32px;
    margin: 0;
    padding: 0;
    border: 0;
    color: #00a4db;
}

.color-button:hover {
    color: #ff4e8e;
}

.color-code-div {
    width: 218px;
}

.url-code-div {
    width: 418px;
}

[name="colorCode"] {
    width: 146px;
}

[name="urlCode"] {
    width: 372px;
}

[name="skinBgCode"] {
    width: 63%;
    height: 22px;
}

.save-button,.pre-button,.get-config-button {
    min-width: 80px;
    height: 24px;
    font-size: 12px;
    background-color: #23ade5;
    color: #fff;
    border-radius: 4px;
    position: relative;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    line-height: 1;
    margin: 0;
    padding: 6px 12px;
    border: 0;
    cursor: pointer;
    outline: none;
    overflow: hidden;
    bottom: 10px;
}

.save-button:hover,.pre-button:hover,.get-config-button:hover {
    background-color: #39b5e7;
}

.save-txt {
    position: relative;
}

.bottom-div {
    position: absolute;
    left: 200px;
    bottom: 0;
}

.skin-btn,.skin-code-div {
    height: 22px;
}

.skin-btn {
    float: right;
}

button[disabled] {
    cursor: not-allowed;
    background-color:#e9eaec;
    color:#b4b4b4
}

.link-toast {
    z-index:99999999999999;
}
`);
        GM_registerMenuCommand('清空设置',()=>{GM_setValue('mySetting',null);});
        GM_registerMenuCommand('显示/隐藏设置菜单',()=>{sideBarLeft.toggle();});
    }
};
})($jQuery);
