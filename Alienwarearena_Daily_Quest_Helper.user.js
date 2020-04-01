// ==UserScript==
// @name         Alienwarearena Daily Quest Helper
// @namespace    Alienwarearena Daily Quest Helper
// @version      1.0.12
// @description  外星人网站自动Daily Quest
// @author       HCLonely
// @iconURL      https://blog.hclonely.com/img/avatar.jpg
// @supportURL   https://blog.hclonely.com/posts/578f9be7/
// @homepage     https://blog.hclonely.com/posts/578f9be7/
// @include      https://*.alienwarearena.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @run-at       document-end
// @connect      alienwarearena.com
// @require      https://greasyfork.org/scripts/388035-$jQuery/code/$jQuery.js?version=721233
// @require      https://greasyfork.org/scripts/376085-httpsend/code/httpSend.js?version=745978
// @require      https://cdn.bootcss.com/sweetalert/2.1.2/sweetalert.min.js
// @compatible   chrome 没有测试其他浏览器的兼容性
// ==/UserScript==

(function($) {
    'use strict';

    const i18n={
        zh:{
            loginPlease:'请先登录！',
            login:'登录',
            cancel:'取消',
            voting:'正在投票...',
            progress:'投票进度：',
            complete:'投票完成！',
            success:'投票成功：',
            error:'投票失败：',
            viewDetails:'查看详细信息',
            details:'详情',
            back:'返回',
            close:'关闭',
            result:'投票结果',
            status:'结果',
            post:'帖子',
            questStatus:'任务完成状态'
        },
        en:{
            loginPlease:'Login please!',
            login:'Login',
            cancel:'Cancel',
            voting:'Voting...',
            progress:'Progress: ',
            complete:'Complete!',
            success:'Success: ',
            error:'Error: ',
            viewDetails:'View details',
            details:'Details',
            back:'Back',
            close:'Close',
            result:'Result',
            status:'Status',
            post:'Post',
            questStatus:'Quest Status'
        }
    };

    let bowerLanguage=(navigator.language || navigator.browserLanguage).toLowerCase();
    let userLanguage=bowerLanguage.includes('zh')?'zh':'en';
    const jsText=i18n[userLanguage];

    GM_addStyle(`
table.hclonely {
    font-family: verdana,arial,sans-serif;
    font-size: 11px;
    color: #333333;
    border-width: 1px;
    border-color: #999999;
    border-collapse: collapse;
}

table.hclonely th {
    background-color: #c3dde0;
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #a9c6c9;
}

table.hclonely tr {
    background-color: #d4e3e5;
}

table.hclonely td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #a9c6c9;
}

table.hclonely a {
    color: #2196F3;
}

.user-swal{
    width:auto;
}

.advertisement-wrapper,.promo-wrapper {
    display:none !important;
}
`);

    $('#umCollapse').click(findTask);

    function findTask(){
        if(!/^Complete/gi.test($('.profile-arp-status .quest-item-progress:first').text())){
            $('.profile-arp-status .quest-title.text-info').css("cursor"," pointer");
            $('.profile-arp-status .quest-title.text-info').click(finishTask);
        }
    }

    let compare={
        strSimilarity2Number: function (s, t) {
            var n = s.length, m = t.length, d = [];
            var i, j, s_i, t_j, cost;
            if (n == 0) return m;
            if (m == 0) return n;
            for (i = 0; i <= n; i++) {
                d[i] = [];
                d[i][0] = i;
            }
            for (j = 0; j <= m; j++) {
                d[0][j] = j;
            }
            for (i = 1; i <= n; i++) {
                s_i = s.charAt(i - 1);
                for (j = 1; j <= m; j++) {
                    t_j = t.charAt(j - 1);
                    if (s_i == t_j) {
                        cost = 0;
                    } else {
                        cost = 1;
                    }
                    d[i][j] = this.Minimum(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
                }
            }
            return d[n][m];
        },
        //两个字符串的相似程度，并返回相似度百分比
        strSimilarity2Percent: function (s, t) {
            var l = s.length > t.length ? s.length : t.length;
            var d = this.strSimilarity2Number(s, t);
            return parseFloat((1 - d / l).toFixed(4));
        },
        Minimum: function (a, b, c) {
            return a < b ? (a < c ? a : c) : (b < c ? b : c);
        }
    }
    function toPercent(point){
        var str=Number(point*100).toFixed(2);
        str+="%";
        return str;
    }
    function finishTask(e){
        if(/^Complete/gi.test($('.profile-arp-status .quest-item-progress:first').text())){
            swal('任务已完成！','','success');
            return 0;
        }
        let text=e.target.innerText.trim();
        if(/Badge Swap/gim.test(text)){
            swal({
                closeOnClickOutside: false,
                title:"正在获取Badge列表...",
                icon:'info'
            })
            httpSend({
                type:'get',
                url:'/account/personalization',
                callback:(data)=>{
                    let badge=data.text.match(/(let|var).*?selectedBadges.*?=.*?\[([\d]+?\,)+?[\d]+?\]/gim)[0].replace(/(let|var).*?selectedBadges.*?= /g,'').trim();
                    let userid=data.text.match(/var user_id.*?=.*?[\d]+?\;/gim)[0].match(/[\d]+/g)[0];
                    if(badge&&userid){
                        swal({
                            closeOnClickOutside: false,
                            title:"正在更换Badge...",
                            icon:'info'
                        })
                        httpSend({
                            type:'post',
                            url:'/badges/update/'+userid,
                            data:badge,
                            callback:(data)=>{
                                isComplete();
                            }
                        });
                    }else{
                        swal({
                            closeOnClickOutside: false,
                            title:"获取Badge列表失败！",
                            icon:'error'
                        }).then(()=>{window.open('/account/personalization')});
                    }
                }
            });
        }else if(/Share|sharing/gim.test(text)){
            swal({
                closeOnClickOutside: false,
                title:"正在获取帖子列表...",
                icon:'info'
            })
            httpSend({
                type:'get',
                url:'/esi/featured-tile-data/Giveaway',
                callback:(data)=>{
                    let giveaway=data.json.data;
                    if(giveaway.length>0){
                        swal({
                            closeOnClickOutside: false,
                            title:"正在分享帖子...",
                            icon:'info'
                        })
                        httpSend({
                            type:'post',
                            url:'/arp/quests/share/'+giveaway[0].id,
                            callback:(data)=>{
                                isComplete();
                            }
                        });
                    }else{
                        swal({
                            closeOnClickOutside: false,
                            title:"获取帖子列表失败！",
                            icon:'error'
                        }).then(()=>{window.open('/ucf/Giveaway')});
                    }
                }
            });
        }else if(/border swap|Switcharoo/gim.test(text)){
            swal({
                closeOnClickOutside: false,
                title:"正在获取Border列表...",
                icon:'info'
            })
            httpSend({
                type:'get',
                url:'/account/personalization',
                callback:(data)=>{
                    let border=data.text.match(/(let|var).*?selectedBorder.*?=.*?[\d]+/gim)[0].replace(/(let|var).*?selectedBorder.*?= /g,'').trim();
                    if(border){
                        swal({
                            closeOnClickOutside: false,
                            title:"正在更换Border...",
                            icon:'info'
                        })
                        httpSend({
                            type:'post',
                            url:'/border/select',
                            data:'{"id":'+border+'}',
                            callback:()=>{
                                isComplete();
                            }
                        });
                    }else{
                        swal({
                            closeOnClickOutside: false,
                            title:"获取Border列表失败！",
                            icon:'error'
                        }).then(()=>{window.open('/account/personalization')});
                    }
                }
            });
        }else if(/(Change|new).*?Avatar|Avatar Swap/gim.test(text)){
            swal({
                closeOnClickOutside: false,
                title:"正在获取Avatar History列表...",
                icon:'info'
            })
            httpSend({
                type:'get',
                url:'/account/personalization',
                callback:(data)=>{
                    let avatar='';
                    try{
                        avatar=data.text.match(/data-avatar-id="([\w\d\-]+?)"/i)[1];
                    }catch(e){}
                    if(avatar){
                        swal({
                            closeOnClickOutside: false,
                            title:"正在更换Avatar...",
                            icon:'info'
                        });
                        httpSend({
                            type:'post',
                            url:'/account/profile/avatars/switch/'+avatar,
                            callback:()=>{
                                isComplete();
                            }
                        });
                    }else{
                        swal({
                            closeOnClickOutside: false,
                            title:"获取Avatar History列表失败！",
                            text:"可能没有历史头像，请手动上传！",
                            icon:'error',
                            buttons:{
                                confirm:"前往上传",
                                cancel:"关闭"
                            }
                        }).then(e=>{if(e) window.open('/account/personalization')});
                    }
                }
            });
        }else if(/update.*?about.*?me/gim.test(text)){
            let aboutText="";
            let aboutMeText=`Changing your username will log you out from all other computers/devices. Choose a strong password and don't reuse it on any other accounts.
Use atleast 8 characters / 1 upper case letter / 1 lower case letter / 1 special character / 1 number. Don't use a password from another site, or something too obvious like (33333333, 12345678, abcdefg, pet name, birthdates).`;
            swal({
                closeOnClickOutside: false,
                title:'正在获取accunt信息...',
                icon:'info'
            });
            httpSend({
                type:'get',
                url:'/account',
                callback:(data)=>{
                    let form=data.text.match(/<form.*?name="user_account_model".*?>[\w\W]*?<\/form>/gim)[0];
                    let formArray=$(form).serializeArray();
                    let formData={};
                    formArray.map(function(e,i){
                        e.name=="user_account_model[about]"?aboutText=e.value:formData[e.name]=e.value;
                    });
                    formData["user_account_model[about]"]=aboutMeText;
                    swal({
                        closeOnClickOutside: false,
                        title:'正在更新"About"内容...',
                        text:aboutMeText,
                        icon:'info'
                    });
                    httpSend({
                        type:'post',
                        url:'/account',
                        data:formData,
                        callback:(data)=>{
                            isComplete(function(e){
                                swal({
                                    closeOnClickOutside: false,
                                    title:'正在恢复"About"内容...',
                                    text:aboutText,
                                    icon:'info'
                                });
                                updateAbout(aboutMeText,function(data){
                                    if(data.status==200&&data.json.success){
                                        swal({
                                            closeOnClickOutside: false,
                                            title:"任务已完成！",
                                            text:"获得："+e+"ARP",
                                            icon:'success',
                                            buttons:{
                                                confirm:"刷新查看结果",
                                                cancel:"关闭"
                                            }
                                        }).then((value)=>{
                                            if(value) location.reload();
                                        });
                                    }else{
                                        swal({
                                            closeOnClickOutside: false,
                                            title:'任务已完成，但恢复"About"内容失败！',
                                            text:'原"About"内容: '+aboutText,
                                            icon:'error'
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
            function updateAbout(text,callback){
                httpSend({
                    type:'post',
                    url:'/account/about',
                    data:{'about': text},
                    callback:callback
                });
            }
        }else if(/trailer|video/gim.test(text)){
            const gameTrailer=["_Nwdy0Iyh3c","67lNLq9ExFA","at-oBQVptKA","ehjJ614QfeM","btvT_UN4hEg","YApuEWtG30w","fWdf1lET9-M","Zhfmz3rEehI","nMVLmvicHSI","lNUpyjezrCs","9s2jjR0A42Y","FBFEksuk5gQ","MBb88gLmJZY","Vg0y9i5E7nY","acM1wCApEj0","isVtXH7n9lI","qF6dEQNUndo","-p-0NlZ0UwE","BbSX0ahCyys","pYYfNmTS7ec","Kq5KWLqUewc","LDBojdBAjXU","04KPiGmC7Lc","_LTiEXMc5J0","TcMBFSGVi1c","d1GpIJ8Ui0c","2dnhh3nFksg","3DRARZQexW4&t=722s","NGmN6KXnXPM","fA1Mfh3LXs4","mTRbWwBwWok","d9Gu1PspA3Y","piIgkJWDuQg","86V_A5oyy3E","5kcdRBHM7kM&t=33s","JiEu23G4onM","uBYORdr_TY8","-awUli1XdZ4","o77MzDQT1cg","auAQ_A--c5I","BIuuLBhDt9s","JMBY3iDh4so","WtOcbZG5xA4","J7Ivdq5E-fs","CbMF8vNV6Yc","HQDddZFwbSU","LTqczRnNqDc","w-Xe8gLBc5I","4E1jVWUMQiA","lLfKgylPkm4","t-N2oBNU6P8","rlR4PJn8b8I","8939aURV9Dc","Fwq_2geuW-A","PT5yMfC9LQM","-junD46e9Iw","pj5xgz7tJlE","oZ0Pt4VUquw","BY-R6NcnkbE","k4MYqFw2KYg","hVSpac8wx3I","FBFEksuk5gQ","zlBIZEaiTKs","Rx8pbCN1OcU","pYC44YPb_5k","C9VPnI34dPw","jv7vqCmt6wY","pdPIljbUQuo","GUTtULUy_Bw","BLWt9MQLVgU","fYV6HlYw-_w","XpMBxfqc67A","G7uiuahKm3M","uODKrZnGk7g","auYLrFYo5RY","ZZ_LLawhUI4","tL6CldIRowc","OzHpcyqP_LE","YwzHXvEX46Y","KyNYbVPSs38","YKYh92oU-uA","AwMpGIm1Dyo","9ewiJJe_nYI","rrlxcTZAFJ8","nFBrgeSjj-0","b5W9t62t10I","gjeQxqFXnrU","FQ7WBnSvjIo","y-9_d3IT_yA","JfEfzko6iX8","ee1172yeqyE","YGzmdAVTtC0","tDpGS2ln19g","YfdGK_Pn_TM","UoTams2yc0s","QgW6xwr8AnU","39RfnI_yjjE"];
            const ingameMedia=["5ZmrVvFQgnI","5ZmrVvFQgnI","yYs4V-92pWw","yYs4V-92pWw","y34y3oCtGqk","y34y3oCtGqk","yvRuiXsfLHg","yvRuiXsfLHg","bPTC-5fyGDU","bPTC-5fyGDU","hK7Gm7xOcr8","hK7Gm7xOcr8","PMmuEjpTDWk","PMmuEjpTDWk","0_Cgxy7N-V0","0_Cgxy7N-V0","AfB5stadHtE","AfB5stadHtE","WtpZlhAZDHI","WtpZlhAZDHI","3TXuVb-7vAw","3TXuVb-7vAw","1wkWV1QjpV8","1wkWV1QjpV8","AKG7zUY1te4","AKG7zUY1te4","5L1ZUyFf1iw","5L1ZUyFf1iw","GWcYRJMqTUM","GWcYRJMqTUM","UmKhIRS9_Ns","UmKhIRS9_Ns","prxIBx_77gw","prxIBx_77gw","J63XvLI4fd4","J63XvLI4fd4","fpF8cFeUxoQ","fpF8cFeUxoQ","izPD0WSib0w","izPD0WSib0w","MycvZc-n31o","MycvZc-n31o","_uZ--MtA-Hc","_uZ--MtA-Hc","MvJc15I9wlo","MvJc15I9wlo","CW5oGRx9CLM","CW5oGRx9CLM","M5FqUyIVaVo","M5FqUyIVaVo","O8v5S1nhKzo","O8v5S1nhKzo","yM6-QVxIXTs","yM6-QVxIXTs","wHw3jSvZxNI","wHw3jSvZxNI","M1nAuPeLZpc","M1nAuPeLZpc","S8dmq5YIUoc","S8dmq5YIUoc","9RX31XDR1nA","9RX31XDR1nA","b87BdPVrTOk","b87BdPVrTOk","i3GmVHYoJNY","i3GmVHYoJNY","4tbDcf-n1Xs","4tbDcf-n1Xs","OZaFqY8UF6I","OZaFqY8UF6I","IlElgfH0Rb0","IlElgfH0Rb0","15pi8vrUx9c","15pi8vrUx9c","qFea5W8vvfI","qFea5W8vvfI","r-3iathMo7o","r-3iathMo7o","N6h6WZd1tEg","N6h6WZd1tEg","-uWQoVMidUg","-uWQoVMidUg","jwK4oKIKrts","jwK4oKIKrts","udCcUKevizI","udCcUKevizI","nJ8XTf8rEpk","nJ8XTf8rEpk","peRpJ4tqLsc","peRpJ4tqLsc","FBFEksuk5gQ","FBFEksuk5gQ","Pvakr7s7qc0","Pvakr7s7qc0","5b41BQ23cnI","5b41BQ23cnI","zu3wZ-_IKrM","zu3wZ-_IKrM","-8e8bkRQd-U"];
            const retroGame=["zNee4dmp-Y8","OFHc0L87Z2g","AqtHm205Qg4","WTPysEzM9l0","CswTcelqb2c","Gr1R7En94i4","IsKpymtTIO8","zAlXo9-dKTY","7jI9VadwaX0","Xtgt8peMEvk","pXvCRy5TrdA","fIksxvPsGS4","0_Cgxy7N-V0","Ay84t4cy-EM","R-2puqqmycM","hW6BpZuJnvw","e0-rL8xUzR8","qj_JRJW1CKk","EP65185uGiA","xUck7N42ig8","sUlGe_q1phc","_sHFL_ekYko","zn27YQMGclk","-3TdkGuWHrk","8p4-tPlRRGc","DRstQfJepec","sZDOlx0nH7A","b0yHp70LcuU","JDrMuMt4MDA","1or3YILu28M","M9r5tXG3EpU","fVFevr67AZY","zmpfs7mWeq8","9yUcLuib8RI","gSpe_YRAbVU","OH3ZAelQWOs","gCmB9angoRs","-xu8lb3tCPA","u2pJBgj6QcE","BkvDM8rbh1g","nzRXx534qHE","njC2RHo194Y","krbWHheju-Y","Q4deMw5hqh0","-TXgMNDB6jc","ydlWElCzLQY","W9X1kNTxJxg","-0NhVfm1TTs","Ii-hFpLAGc8","pfQeMqkJsrs"];
            const boardId=/add a trailer/gim.test(text)?441:464;
            function getApiKey(){
                swal({
                    closeOnClickOutside: false,
                    title:"正在获取token...",
                    icon:'info'
                });
                httpSend({
                    type:'get',
                    url:'/ucf/Video/new',
                    callback:(data)=>{
                        if(data.status==200){
                            let apiKey=data.text.match(/youtubeApiKey.*?=.*?\'(.*?)\'/gim);
                            let token=data.text.match(/<input.*?id="ucf_video__token".*?value=".*?" \/>/gim)
                            if(apiKey&&token){
                                let youtubeApiKey=apiKey[0].match(/\'(.*?)\'/);
                                let videoToken=token[0].match(/value="(.*?)"/);
                                if(youtubeApiKey&&youtubeApiKey[1]&&videoToken&&videoToken[1]){
                                    swal({
                                        closeOnClickOutside: false,
                                        title:"正在获取token成功！",
                                        icon:'success'
                                    });
                                    getVideos(youtubeApiKey[1],videoToken[1]);
                                }else{
                                    swal({
                                        closeOnClickOutside: false,
                                        title:"正在获取token失败！",
                                        text:apiKey[0]+" \n"+token[0],
                                        icon:'error'
                                    });
                                }
                            }else{
                                swal({
                                    closeOnClickOutside: false,
                                    title:"正在获取token失败！",
                                    text:data.text,
                                    icon:'error'
                                });
                            }
                        }else{
                            swal({
                                closeOnClickOutside: false,
                                title:"正在获取token失败！",
                                text:data.status,
                                icon:'error'
                            });
                        }
                    }
                });
            }
            function getVideos(youtubeApiKey,token){
                let ids=/add a trailer/gim.test(text)?gameTrailer:(/retro game/gim.test(text)?retroGame:ingameMedia);
                let id=ids[Math.floor(Math.random()*gameTrailer.length)];
                swal({
                    closeOnClickOutside: false,
                    title:"正在获取视频信息...",
                    text:"随机选取视频:"+id,
                    icon:'info'
                });
                httpSend({
                    type:'get',
                    url:'https://www.googleapis.com/youtube/v3/videos?id='+id+'&key='+youtubeApiKey+'&part=snippet,contentDetails',
                    callback:(data)=>{
                        if(data.status==200){
                            if(Object.prototype.toString.call(data.json) === '[object Object]'){
                                swal({
                                    closeOnClickOutside: false,
                                    title:"获取视频信息成功！",
                                    icon:'success'
                                });
                                let snippet=data.json.items[0].snippet;
                                postVideo(id,snippet.title,snippet.description,token);
                            }else{
                                swal({
                                    closeOnClickOutside: false,
                                    title:"获取视频信息失败！",
                                    text:data.text,
                                    icon:'error'
                                });
                            }
                        }else{
                            swal({
                                closeOnClickOutside: false,
                                title:"获取视频信息失败！",
                                text:data.status,
                                icon:'error'
                            });
                        }
                    }
                });
            }
            function postVideo(id,title,description,token){
                swal({
                    closeOnClickOutside: false,
                    title:"正在发布视频...",
                    icon:'info'
                });
                httpSend({
                    type:'post',
                    url:'/ucf/Video/new',
                    data:{
                        'ucf_video[youtubeLink]': 'https://www.youtube.com/watch?v='+id,
                        'ucf_video[title]': title,
                        'ucf_video[description]': description,
                        'ucf_video[board]': boardId,
                        'ucf_video[youtubeId]': id,
                        'ucf_video[_token]': token
                    },
                    callback:(data)=>{
                        if(data.status==200){
                            swal({
                                closeOnClickOutside: false,
                                title:"发布成功！",
                                icon:'success'
                            });
                            isComplete();
                        }else{
                            swal({
                                closeOnClickOutside: false,
                                title:"发布失败！",
                                text:data.status,
                                icon:'error'
                            });
                        }
                    }
                });
            }
            getApiKey();
        }else if(/read all about it|read me/gim.test(text)){
            let info=$('.quest-item-progress:first').text().split("/");
            if(!info[1]) info=[0,1];
            swal({
                closeOnClickOutside: false,
                title:"正在获取News列表...",
                icon:'info'
            })
            httpSend({
                type:'get',
                url:'/esi/featured-tile-data/News',
                callback:(data)=>{
                    if(data.json.data.length>0){
                        addNews(data.json.data,0,info);
                    }else{
                        swal({
                            closeOnClickOutside: false,
                            title:"获取News列表失败！",
                            icon:'error'
                        }).then(()=>{window.open('/ucf/News')});
                    }
                }
            });

            function addNews(newsId,i,info){
                if(i<(parseInt(info[1])-parseInt(info[0]))){
                    let j=i+1+parseInt(info[0]);
                    swal({
                        closeOnClickOutside: false,
                        title:"正在阅读News...",
                        text:'进度：'+j+"/"+info[1],
                        icon:'info'
                    })
                    httpSend({
                        type:'get',
                        url:newsId[i].url,
                        callback:(data)=>{
                            httpSend({
                                type:'post',
                                url:'/ucf/increment-views/'+newsId[i].id,
                                callback:(data)=>{
                                    i++;
                                    addNews(newsId,i,info)
                                }
                            });
                        }
                    });
                }else{
                    isComplete();
                }
            }
        }else{
            swal({
                closeOnClickOutside: false,
                title:"正在搜索任务相关帖子...",
                icon:'info'
            })
            httpSend({
                type:'get',
                url:'/forums/board/113/awa-on-topic',//?t='+new Date().getTime(),
                timeout:30,
                callback:(data)=>{
                    if(data.status==200){
                        let per={};
                        let html=$(`<div>${data.text.match(/\<div id=\"main\"[\w\W]*?\<\/footer\>/gim)[0]}</div>`);
                        //console.log(html.find('div'))
                        let daily=$.makeArray(html.find('.forums__topics-list .table-row .forums__topic-link')).map((e)=>{
                            let percent1=compare.strSimilarity2Percent((`[daily quest][non us]`+text).toUpperCase(),e.innerText.trim().toUpperCase());
                            let percent2=compare.strSimilarity2Percent((`[daily quest]`+text).toUpperCase(),e.innerText.trim().toUpperCase());
                            let percent=Math.max(percent1,percent2);
                            if(/DAILY.*?QUEST/gim.test(e.innerText)&&(new RegExp(text.match(/[\w\d]+/gm).join(".*?"),"gim").test(e.innerText)||/converse and be m(e|a)rry/gim.test(e.innerText)||percent>0.6)){
                                per[$(e).attr('data-topic-id')]=percent;
                                return parseInt($(e).attr('data-topic-id'));
                            }else{
                                return null;
                            }
                        });
                        let quest=[];
                        for(let i=0;i<daily.length;i++){
                            if(daily[i]!=null){
                                quest.push(daily[i]);
                            }
                        }
                        //console.log(daily);
                        //console.log(quest);
                        if(quest.length>0){
                            if(/converse and be merry/gim.test(text)){
                                const reply=['hi','hello','nice','thanks'];
                                let url='/comments/'+Math.max.apply(null,quest)+'/new/0';
                                let info=$('.quest-item-progress:first').text().split("/");
                                info[1]?comment(info,1):comment([0,1],1);
                                function comment(info,i){
                                    let num=i+parseInt(info[0]);
                                    if(num-1<parseInt(info[1])){
                                        let text=reply[num-1];
                                        swal({
                                            closeOnClickOutside: false,
                                            title:"已搜索到任务相关帖子！",
                                            text:'评论内容："'+text+'"',
                                            icon:'info'
                                        })
                                        $('.swal-title').html("已搜索到任务相关帖子！<br/>正在评论..."+num+"/"+info[1]);
                                        httpSend({
                                            type:'post',
                                            url:url,
                                            data:{
                                                'topic_post[content]': '<p>'+text+'</p>',
                                                'topic_post[quotedPostIds]': '',
                                                'topic_post[parentPost]': ''
                                            },
                                            callback:(data)=>{
                                                if(data.status==200){
                                                    if(data.json.success){
                                                        comment(info,++i);
                                                    }else if(data.json.message){
                                                        swal({
                                                            closeOnClickOutside: false,
                                                            title:"评论失败！",
                                                            text:data.json.message,
                                                            buttons:{
                                                                confirm:'打开帖子',
                                                                cancel:'关闭'
                                                            },
                                                            icon:'error'
                                                        }).then((value)=>{
                                                            if(value) window.open('/ucf/show/'+Math.max.apply(null,quest));
                                                        });
                                                    }
                                                }else{
                                                    swal({
                                                        closeOnClickOutside: false,
                                                        title:"评论失败！",
                                                        text:"状态码："+data.statusText+"("+data.status+")",
                                                        buttons:{
                                                            confirm:'打开帖子',
                                                            cancel:'关闭'
                                                        },
                                                        icon:'error'
                                                    }).then((value)=>{
                                                        if(value) window.open('/ucf/show/'+Math.max.apply(null,quest));
                                                    });
                                                }
                                            }
                                        });
                                    }else{
                                        isComplete();
                                    }
                                }
                            }else{
                                let len=quest.length;
                                let i=0;
                                swal({
                                    closeOnClickOutside: false,
                                    title:"已搜索到"+len+"个任务相关帖子！",
                                    text:"匹配度:",
                                    icon:'info'
                                })
                                $('.swal-title').html(`已搜索到${len}个任务相关帖子！<br/>正在查找第1/${len}个帖子中的可用链接...`);
                                find_post(quest,0);

                                function find_post(quest,i){
                                    //console.log(per);
                                    let ucfId=Math.max.apply(null,quest);
                                    $('.swal-text').html(`匹配度:${toPercent(per[String(ucfId)])}`);
                                    //console.log(ucfId);
                                    quest[quest.indexOf(ucfId)]=0;
                                    httpSend({
                                        mode:'gm',
                                        type:'get',
                                        url:'/ucf/show/'+ucfId+'?t='+new Date().getTime(),
                                        callback:(data)=>{
                                            if(data.status==200){
                                                let html=$(`<div>${data.text.match(/\<article[\w\W]*?\<\/article\>/gim)[0]}</div>`);
                                                let ucfContent=html.find('.ucf__content a[rel][href*="/ucf/show/"]').attr('href');
                                                let otherContent=html.find('.ucf__content a[rel]').attr('href');
                                                //console.log(html.find('article'));
                                                if(ucfContent){
                                                    swal({
                                                        closeOnClickOutside: false,
                                                        title:"已找到可用链接！",
                                                        text:ucfContent,
                                                        icon:'info'
                                                    })
                                                    let ucfId=ucfContent.match(/\/[\d]+?\//);
                                                    if(ucfId){
                                                        $('.swal-title').html("已找到可用链接！<br/>正在访问链接...");
                                                        httpSend({
                                                            mode:'gm',
                                                            type:'get',
                                                            url:ucfContent,
                                                            callback:(data)=>{
                                                                httpSend({
                                                                    type:'post',
                                                                    url:'/ucf/increment-views/'+ucfId[0].replace(/\//g,''),
                                                                    callback:(data)=>{
                                                                        isComplete();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }else{
                                                        $('.swal-title').html("已找到可用链接！<br/>已打开链接！");
                                                        GM_openInTab(ucfContent,{active:1,setParent:1}).onclose=isComplete;
                                                    }
                                                }else if(otherContent){
                                                    swal({
                                                        closeOnClickOutside: false,
                                                        title:"已找到可用链接！",
                                                        text:otherContent,
                                                        buttons:{
                                                            confirm:'查看结果',
                                                            cancel:'关闭'
                                                        },
                                                        icon:'info'
                                                    }).then(value=>{
                                                        if(value) isComplete();
                                                    });
                                                    $('.swal-title').html("已找到可用链接！<br/>已打开链接！");
                                                    GM_openInTab(otherContent,{active:1,setParent:1});
                                                }else{
                                                    if(++i<quest.length){
                                                        $('.swal-title').html(`已搜索到${len}个任务相关帖子！<br/>正在查找第${i+1}/${len}个帖子中的可用链接...`);
                                                        find_post(quest,i);
                                                    }else{
                                                        swal({
                                                            closeOnClickOutside: false,
                                                            title:"未找到可用链接！",
                                                            text:'可能还没有人完成任务或正确答案不是论坛链接',
                                                            buttons:{
                                                                confirm:'手动搜索',
                                                                cancel:'关闭'
                                                            },
                                                            icon:'warning'
                                                        }).then((value)=>{
                                                            if(value) window.open('/forums/board/113/awa-on-topic','_self');
                                                        });
                                                    }
                                                }
                                            }else{
                                                swal({
                                                    closeOnClickOutside: false,
                                                    title:"打开帖子失败:"+data.statusText+"("+data.status+")",
                                                    icon:'error',
                                                    buttons:{
                                                        confirm:'手动打开',
                                                        cancel:'关闭'
                                                    }
                                                }).then((value)=>{
                                                    if(value) window.open('/ucf/show/'+ucfId,'_blank');
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        }else{
                            swal({
                                closeOnClickOutside: false,
                                title:"没找到相关帖子！",
                                text:/converse and be merry/gim.test(text)?'可能还没有人发布相关帖子':'可能还没有人完成任务',
                                buttons:{
                                    confirm:'手动搜索',
                                    cancel:'关闭'
                                },
                                icon:'warning'
                            }).then((value)=>{
                                if(value) window.open('/forums/board/113/awa-on-topic','_self');
                            });
                        }
                    }else{
                        swal({
                            closeOnClickOutside: false,
                            title:'搜索"AWA On-Topic"版块失败！',
                            text:'错误码：'+data.statusText+"("+data.status+")",
                            icon:'error',
                            buttons:{
                                'again':'重试',
                                confirm:'手动搜索',
                                cancel:'关闭'
                            }
                        }).then((value)=>{
                            if(value==='again') finishTask(e);
                            else if(value) window.open('/forums/board/113/awa-on-topic','_self');
                        });
                    }
                }
            });
        }
    }
    function isComplete(callback=false){
        swal({
            closeOnClickOutside: false,
            title:"正在检查任务完成状态...",
            icon:'info'
        })
        httpSend({
            type:'get',
            url:'/',
            callback:(data)=>{
                let section=$(data.text.match(/\<section class=\"border-top profile-arp-status\"[\w\W]*?\<\/section\>/gim)[0]);
                let progress=section.find('.quest-item-progress');
                let progressHtml=$('.profile-arp-status .quest-item-progress');
                progressHtml.eq(0).text(progress.eq(0).text());
                progressHtml.eq(1).text(progress.eq(1).text());
                if(/^Complete/gim.test(progress.eq(0).text())){
                    swal({
                        closeOnClickOutside: false,
                        title:"任务已完成！",
                        text:"获得："+progress.eq(1).text()+"ARP",
                        icon:'success',
                        buttons:{
                            confirm:"刷新查看结果",
                            cancel:"关闭"
                        }
                    }).then((value)=>{
                        if(value) location.reload();
                    });
                    if(callback) callback(progress.eq(1).text());
                }else{
                    swal({
                        closeOnClickOutside: false,
                        title:"任务未完成！",
                        text:"可尝试手动完成",
                        icon:'error'
                    })
                }
            }
        });
    }

})($jQuery);
