// ==UserScript==
// @name        AuTo Redeemer Steamkey（自动激活Steamkey）1.X版本
// @namespace   HCLonely
// @description 复制网页中的Steamkey后自动打开激活页面并激活
// @include     *://*/*
// @version     1.1.6
// @supportURL  https://blog.hclonely.com/forums/topic/226
// @homepage    https://blog.hclonely.com/forums/topic/226
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==
(function () {
  var url = window.location.href;

  var iconSize = 24;
  var translationTestSize = 16;
  var icon = document.createElement('div');
  var style = '' +
    'width:16px;' +
    'height:16px;' +
    'margin:0px!important;' +
    '';
  icon.innerHTML = '' +
    '<img src="//store.steampowered.com/favicon.ico" href="javascript:void(0)" style="' + style + '" "width="16" height="16">' +
    '<font id="redeem" style="font-size:16px;position:absolute;top:-2px;color:#fb7801;font-weight:999">激活</font>' +
    '';
  icon.setAttribute('style', '' +
    'width:48px!important;' +
    'height:18px!important;' +
    'display:none!important;' +
    'background:#66ccff!important;' +
    'border-radius:2px!important;' +
    'box-shadow:4px 4px 8px #888!important;' +
    'position:absolute!important;' +
    'z-index:2147483647!important;' +
    'cursor:pointer;' +
    '');

  // 添加激活图标到 DOM
  document.documentElement.appendChild(icon);
  // 鼠标事件：防止选中的文本消失
  document.addEventListener('mousedown', function (e) {
    if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon) || (e.target.parentNode.parentNode && e.target.parentNode.parentNode == icon)) {// 点击了激活图标
      e.preventDefault();
    }
  });
  // 选中变化事件：当点击已经选中的文本的时候，隐藏激活图标和激活面板（此时浏览器动作是：选中的文本已经取消选中了）
  document.addEventListener("selectionchange", function () {
    if (!window.getSelection().toString().trim()) {
      icon.style.display = 'none';
    }
  });
  // 鼠标事件：防止选中的文本消失；显示、隐藏激活图标
  document.addEventListener('mouseup', function (e) {
    if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon) || (e.target.parentNode.parentNode && e.target.parentNode.parentNode == icon)) {// 点击了激活图标
      e.preventDefault();
      return;
    }
    var text = window.getSelection().toString().trim();
    var productKey = window.getSelection().toString().trim() || e.target.value;
    if (/^([\w\W]*)?([\d\w]{5}(\-[\d\w]{5}){2}(\r||,||，)?){1,}/.test(productKey) && text && icon.style.display == 'none') {
      icon.style.top = e.pageY + 12 + 'px';
      icon.style.left = e.pageX + 'px';
      icon.style.display = 'block';
    } else if (!text) {
      icon.style.display = 'none';
    }
  });
  // 激活图标点击事件
  icon.addEventListener('click', function (e) {
    var productKey = window.getSelection().toString().trim() || e.target.value;
    productKey = productKey.replace(/\r\n/g, ",");
    productKey = productKey.replace(/\n/g, ",");
    window.open("https://store.steampowered.com/account/registerkey?key=" + productKey, "_blank");
  });


  function copyRedeem() {
    var activateProduct = function (e) {
      var productKey = window.getSelection().toString().trim() || e.target.value;
      if (!/https?:\/\/store\.steampowered\.com\/account\/registerkey[\w\W]{0,}/.test(url)) {
        if (/^([\w\W]*)?([\d\w]{5}(\-[\d\w]{5}){2}(\r||,||，)?){1,}/.test(productKey)) {
          if (confirm("检测到神秘key,是否进入steam激活页面并激活？")) {
            var productKey1 = productKey.replace(/\r\n/g, ",");
            var productKey2 = productKey1.replace(/\n/g, ",");
            window.open("https://store.steampowered.com/account/registerkey?key=" + productKey2, "_blank");
          }
        }
      }
    };
    window.addEventListener("copy", activateProduct, false);
  }
  copyRedeem();

  if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey*/.test(url)) {

    var autoDivideNum = 9;
    var waitingSeconds = 20;
    var ajaxTimeout = 15;

    var keyCount = 0;
    var recvCount = 0;
    var timer;

    var allUnusedKeys = [];

    var failureDetail = {
      14: '无效激活码',
      15: '重复激活',
      53: '次数上限',
      13: '地区限制',
      9: '已拥有',
      24: '缺少主游戏',
      36: '需要PS3?',
      50: '这是充值码',
    };

    var myTexts = {
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
      hideUnusedKey: '隐藏未使用的Key',
    };

    var unusedKeyReasons = [
      '次数上限',
      '地区限制',
      '已拥有',
      '缺少主游戏',
      '其他错误',
      '未知错误',
      '网络错误或超时',
    ];

    function redeemKey(key) {
      jQuery.ajax({
        url: 'https://store.steampowered.com/account/ajaxregisterkey/',
        data: {
          product_key: key,
          sessionid: g_sessionID
        },
        type: 'post',
        dataType: 'json',
        timeout: 1000 * ajaxTimeout,
        beforeSend: function () {
          if (jQuery('table').is(':hidden')) {
            jQuery('table').fadeIn();
          }
        },
        complete: function () {
        },
        error: function () {
          tableUpdateKey(key, myTexts.fail, myTexts.network, 0, myTexts.nothing);
          return;
        },
        success: function (data) {
          //console.log(data);

          if (data.success == 1) {
            tableUpdateKey(key, myTexts.success, myTexts.line,
              data.purchase_receipt_info.line_items[0].packageid,
              data.purchase_receipt_info.line_items[0].line_item_description);
            return;
          } else if (data.purchase_result_details !== undefined && data.purchase_receipt_info) {
            if (!data.purchase_receipt_info.line_items[0]) {
              tableUpdateKey(key, myTexts.fail,
                failureDetail[data.purchase_result_details] ? failureDetail[data.purchase_result_details] : myTexts.others,
                0, myTexts.nothing);
            } else {
              tableUpdateKey(key, myTexts.fail,
                failureDetail[data.purchase_result_details] ? failureDetail[data.purchase_result_details] : myTexts.others,
                data.purchase_receipt_info.line_items[0].packageid,
                data.purchase_receipt_info.line_items[0].line_item_description);
            }
            return;
          }
          tableUpdateKey(key, myTexts.fail, myTexts.nothing, 0, myTexts.nothing);
        }
      });
    }

    function setUnusedKeys(key, success, reason, subId, subName) {
      if (success && allUnusedKeys.includes(key)) {
        allUnusedKeys = allUnusedKeys.filter(function (keyItem) {
          return keyItem != key;
        });

        var listObjects = jQuery('li');
        for (var i = 0; i < listObjects.length; i++) {
          var listElement = listObjects[i];
          var listObject = jQuery(listElement);

          if (listElement.innerHTML.includes(key)) {
            listObject.remove();
          }
        }
      } else if (!success && !allUnusedKeys.includes(key) &&
        unusedKeyReasons.includes(reason)) {
        var listObject = jQuery('<li></li>');
        listObject.html(key + ' ( ' + reason +
          (subId != 0 ? (': <code>' + subId + '</code> ' + subName) : '') +
          ' )');
        jQuery('#unusedKeys').append(listObject);

        allUnusedKeys.push(key);
      }
    }

    function tableInsertKey(key) {
      keyCount++;
      var row = jQuery('<tr></tr>');
      // number
      row.append('<td class="nobr">' + keyCount + '</td>');
      //key
      row.append('<td class="nobr"><code>' + key + '</code></td>');
      //redeeming...
      row.append('<td colspan="3">' + myTexts.redeeming + '...</td>');

      jQuery('tbody').prepend(row);
    }

    function tableWaitKey(key) {
      keyCount++;
      var row = jQuery('<tr></tr>');
      // number
      row.append('<td class="nobr">' + keyCount + '</td>');
      //key
      row.append('<td class="nobr"><code>' + key + '</code></td>');
      //waiting...
      row.append('<td colspan="3">' + myTexts.waiting +
        ' (' + waitingSeconds + '秒)...</td>');

      jQuery('tbody').prepend(row);
    }

    function tableUpdateKey(key, result, detail, subId, subName) {
      setUnusedKeys(key, result === myTexts.success, detail, subId, subName);

      recvCount++;
      if (recvCount == keyCount) {
        jQuery('#buttonRedeem').fadeIn();
        jQuery('#inputKey').removeAttr('disabled');
      }

      var rowObjects = jQuery('tr');
      for (var i = 1; i < rowObjects.length; i++) {
        var rowElement = rowObjects[i];
        var rowObject = jQuery(rowElement);

        if (rowObject.children()[1].innerHTML.includes(key) &&
          rowObject.children()[2].innerHTML.includes(myTexts.redeeming)) {
          rowObject.children()[2].remove();

          // result
          if (result == myTexts.fail) rowObject.append('<td class="nobr" style="color:red">' + result + '</td>');
          else rowObject.append('<td class="nobr" style="color:green">' + result + '</td>');
          // detail
          rowObject.append('<td class="nobr">' + detail + '</td>');
          // sub
          if (subId === 0) {
            rowObject.append('<td>——</td>');
          } else {
            rowObject.append('<td><code>' + subId + '</code> <a href="https://steamdb.info/sub/' +
              subId + '/" target="_blank">' + subName + '</a></td>');
          }
          break;
        }
      }
    }

    function getKeysByRE(text) {
      text = text.trim().toUpperCase();
      var reg = new RegExp('([0-9,A-Z]{5}-){2,4}[0-9,A-Z]{5}', 'g');
      var keys = [];

      var result = void 0;
      while (result = reg.exec(text)) {
        keys.push(result[0]);
      }

      return keys;
    }

    function startTimer() {
      timer = setInterval(function () {
        var flag = false;
        var nowKey = 0;

        var rowObjects = jQuery('tr');
        for (var i = rowObjects.length - 1; i >= 1; i--) {
          var rowElement = rowObjects[i];
          var rowObject = jQuery(rowElement);
          if (rowObject.children()[2].innerHTML.includes(myTexts.waiting)) {
            nowKey++;
            if (nowKey <= autoDivideNum) {
              var key = rowObject.children()[1].innerHTML.substring(6);
              key = key.substring(0, key.indexOf('</code>'));
              rowObject.children()[2].innerHTML = '<td colspan="3">' + myTexts.redeeming + '...</td>';
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
      }, 1000 * waitingSeconds);
    }

    function redeemKeys() {
      var keys = getKeysByRE(jQuery('#inputKey').val().trim());
      if (keys.length <= 0) {
        return;
      }

      jQuery('#buttonRedeem').hide();
      jQuery('#inputKey').attr('disabled', 'disabled');

      var nowKey = 0;
      keys.forEach(function (key) {
        nowKey++;
        if (nowKey <= autoDivideNum) {
          tableInsertKey(key);
          redeemKey(key);
        } else {
          tableWaitKey(key);
        }
      });

      if (nowKey > autoDivideNum) {
        startTimer();
      }
    }

    function toggleUnusedKeyArea() {
      if (jQuery('#unusedKeyArea').is(':hidden')) {
        jQuery('#unusedKeyArea').fadeIn();
      } else {
        jQuery('#unusedKeyArea').hide();
      }
    }

    jQuery('#registerkey_examples_text').html(
      '<div class="notice_box_content" id="unusedKeyArea" style="display: none">' +
      '<b>未使用的Key：</b><br>' +
      '<div><ol id="unusedKeys">' +
      '</ol></div>' +
      '</div>' +

      '<div class="table-responsive table-condensed">' +
      '<table class="table table-hover" style="display: none">' +
      '<caption><h2>激活记录</h2></caption><thead><th>No.</th><th>Key</th>' +
      '<th>结果</th><th>详情</th><th>Sub</th></thead><tbody></tbody>' +
      '</table></div><br>');


    if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey\?key\=([\w\W]*)?([\d\w]{5}(\-[\d\w]{5}){2}(\r||,||，)?){1,}/.test(url)) {

      jQuery('.registerkey_input_box_text').parent().append('<textarea class="form-control" rows="3"' +
        ' id="inputKey" placeholder="支持批量激活，可以把整个网页文字复制过来&#10;' +
        '若一次激活的Key的数量超过9个则会自动分批激活（等待20秒）"' +
        ' style="margin: 3px 0px 0px; width: 525px; height: 102px;"></textarea><br>');
      var mykeys = document.getElementById("product_key").value;
      document.getElementById("inputKey").value = mykeys;
      jQuery('.registerkey_input_box_text').hide();
      jQuery('#purchase_confirm_ssa').hide();

      //jQuery('#register_btn').removeAttr('href').attr('href', 'javascript:redeemKeys()');
      //jQuery('#register_btn').parent().append('<button class="btnv6_blue_hoverfade btn_medium" id="buttonRedeem">激活！</button>');
      jQuery('#register_btn').parent().append('<a tabindex="300" class="btnv6_blue_hoverfade btn_medium"' +
        ' id="buttonRedeem"><span>激活！</span></a>' + ' &nbsp;&nbsp;' +
        '<a tabindex="300" class="btnv6_blue_hoverfade btn_medium"' + '</span></a>');
      jQuery('#register_btn').remove();
      redeemKeys();
      jQuery('#buttonRedeem').click(function () {
        redeemKeys();
      });
    }
    if (/^https?:\/\/store\.steampowered\.com\/account\/registerkey(\?key\=)?$/.test(url)) {

      jQuery('.registerkey_input_box_text').parent().append('<textarea class="form-control" rows="3"' +
        ' id="inputKey" placeholder="支持批量激活，可以把整个网页文字复制过来&#10;' +
        '若一次激活的Key的数量超过9个则会自动分批激活（等待20秒）"' +
        ' style="margin: 3px 0px 0px; width: 525px; height: 102px;"></textarea><br>');
      jQuery('.registerkey_input_box_text').hide();
      jQuery('#purchase_confirm_ssa').hide();

      //jQuery('#register_btn').removeAttr('href').attr('href', 'javascript:redeemKeys()');
      //jQuery('#register_btn').parent().append('<button class="btnv6_blue_hoverfade btn_medium" id="buttonRedeem">激活！</button>');
      jQuery('#register_btn').parent().append('<a tabindex="300" class="btnv6_blue_hoverfade btn_medium"' +
        ' id="buttonRedeem"><span>激活！</span></a>' + ' &nbsp;&nbsp;' + '</span></a>');
      jQuery('#register_btn').remove();
      jQuery('#buttonRedeem').click(function () {
        redeemKeys();
      });
    }
    toggleUnusedKeyArea();
    function copyKey() {
      var infoHtml = jQuery("#unusedKeys>li");
      var stmcnInfo = "";
      if (infoHtml) {
        if (infoHtml.length == 0) {
          return "没有未使用的key";
        } else {
          for (var i = 0; i < infoHtml.length; i++) {
            var info = infoHtml[i].innerHTML;
            if (/已拥有/gim.test(info)) {
              var key = info.match(/[\w\d]{5}(-[\w\d]{5}){2}/gim)[0];
              var code = info.match(/<code>[\d]+?<\/code>/gim)[0];
              code = code.replace(/<\/?code>/gim, "");
              var name = info.match(/<\/code>[\w\W]*?\)/gim)[0];
              name = name.replace(/<\/code>|\)/gim, "");
              name = name.replace(/(^\s*)|(\s*$)/g, "");
              stmcnInfo = stmcnInfo + "[url=https://store.steampowered.com/account/registerkey?key=" + key + "]" + key + "[/url]        [url=https://steamdb.info/sub/" + code + "]" + name + "[/url] \n";
            } else {
              return "没有已拥有的key";
            }
          }
        }
      } else {
        return "没有未使用的key";
      }
      if (stmcnInfo == "") {
      }
      return stmcnInfo;
    }
    jQuery("head").append('<style>table a {color: pink;}td {white-space: nowrap;overflow: hidden;}code {padding:2px 4px;font-size:90%;color:#c7254e;background-color:#f9f2f4;border-radius:3px}' +
      '.notice_box_content {border: 1px solid #a25024;border-radius: 3px;width: 525px;color: #acb2b8;font-size: 14px;font-family: "Motiva Sans", Sans-serif;font-weight: normal;padding: 15px 15px;margin-bottom: 15px;}' +
      '.notice_box_content b {font-weight: normal;color: #f47b20;}li {white-space: nowrap;overflow: hidden;}' +
      '.link-toast{position:absolute;padding:12px 24px;font-size:15px;border-radius:8px;white-space:nowrap;color:#fff;-webkit-animation:h cubic-bezier(.22,.58,.12,.98) .4s;animation:h cubic-bezier(.22,.58,.12,.98) .4s;z-index:10000}' +
      '.link-toast.info{background-color:#48bbf8;-webkit-box-shadow:0 .2em .1em .1em rgba(72,187,248,.2);box-shadow:0 .2em .1em .1em rgba(72,187,248,.2)}' +
      '.link-toast.success{background-color:#47d279;-webkit-box-shadow:0 .2em .1em .1em rgba(71,210,121,.2);box-shadow:0 .2em .1em .1em rgba(71,210,121,.2)}</style>');
    jQuery("body").append('<div id="suc" class="link-toast success" style="position:fixed;top:300px;left:600px;display:none">复制成功！</div>' +
      '<div id="copyInfo" class="link-toast info" style="position:fixed;top:300px;left:600px;display:none"></div>');
    jQuery("#unusedKeyArea>b").after('<button id="copy" class="btnv6_blue_hoverfade btn_medium">提取已拥有key(steamcn论坛格式)</button>');
    jQuery("#copy").click(function () {
      var unk = copyKey();
      if (unk == "没有未使用的key") {
        jQuery("#copyInfo").html("没有未使用的key");
        jQuery("#copyInfo").show();
        setTimeout(function () {
          jQuery("#copyInfo").fadeOut();
        }, 2000);
      } else if (unk == "没有已拥有的key") {
        jQuery("#copyInfo").html("没有已拥有的key");
        jQuery("#copyInfo").show();
        setTimeout(function () {
          jQuery("#copyInfo").fadeOut();
        }, 2000);
      } else {
        GM_setClipboard(unk);
        jQuery("#suc").show();
        setTimeout(function () {
          jQuery("#suc").fadeOut();
        }, 2000);
      }
    });
  }



  ////////<<<<<<-------------steamdb.info代码此处开始------------------///////
  if (/https?:\/\/steamdb\.info\/freepackages\//.test(url)) {
    let activateConsole = function (e) {
      document.execCommand("Copy");
      let jsText = window.getSelection().toString().trim() || e.target.value;
      if (/\(function\(\)[\w\W]{0,}let freePackages \=[\w\W]{0,}\}\(\)\)\;/.test(jsText)) {
        if (confirm("代码已复制,是否前往steam账户许可页面并激活？")) {
          let freePackages = jsText.match(/[\d]{2,},[\s]\/\/ \[REMOVE\]/g).join("-").match(/[\d]{2,},/g).join("");
          window.open("https://store.steampowered.com/account/licenses/?sub=" + freePackages, "_self");
        }
      }
    };
    let fp = setInterval(() => {
      if (document.getElementById("freepackages")) {
        document.getElementById("freepackages").onclick = activateConsole;
        clearInterval(fp);
      }
    }, 1000);
  }
  if (/https?:\/\/store\.steampowered\.com\/account\/licenses\/(\?sub\=[\w\W]{0,})?/.test(url)) {
    function redeemSub(e) {
      let subText = e || document.getElementById("gameSub").value;
      if (subText) {
        let ownedPackages = {};
        jQuery('.account_table a').each(function (i, el) {
          let match = el.href.match(/javascript:RemoveFreeLicense\( ([0-9]+), '/);
          if (match !== null) {
            ownedPackages[+match[1]] = true;
          }
        });
        let freePackages = subText.match(/[\d]{2,}/g);
        let i = 0,
          loaded = 0,
          packae = 0,
          total = freePackages.length,
          modal = ShowBlockingWaitDialog('Executing…',
            'Please wait until all requests finish. Ignore all the errors, let it finish.');
        for (; i < total; i++) {
          packae = freePackages[i];
          if (ownedPackages[packae]) {
            loaded++;
            continue;
          }
          jQuery.post(
            '//store.steampowered.com/checkout/addfreelicense',
            {
              action: 'add_to_cart',
              sessionid: g_sessionID,
              subid: packae
            }
          ).always(function () {
            loaded++;
            modal.Dismiss();
            if (loaded >= total) {
              window.open("https://store.steampowered.com/account/licenses/", "_self");
            }
            else {
              modal = ShowBlockingWaitDialog('Executing…',
                'Loaded <b>' + loaded + '</b>/' + total + '.');
            }
          }
          );
        }
      }
    }
    function cc() {
      jQuery.ajax({
        url: "//store.steampowered.com/cart/",
        type: "get",
        success: function (data) {
          if (data.match(/id\=\"usercountrycurrency_trigger\"[\w\W]*?\>[w\W]*?\<\/a/gim)) {
            let c = data.match(/id\=\"usercountrycurrency_trigger\"[\w\W]*?\>[w\W]*?\<\/a/gim)[0].replace(/id\=\"usercountrycurrency_trigger\"[\w\W]*?\>|\<\/a/g, "");
            let thisC = data.match(/id\=\"usercountrycurrency\"[\w\W]*?value=\".*?\"/gim)[0].match(/value=\".*?\"/gim)[0].replace(/value=\"|\"/g, "");
            let div = data.match(/\<div class=\"currency_change_options\"\>[\w\W]*?\<p/gim)[0].replace(/[\s]*?\<p/gim, "") + "</div>";
            jQuery("body").append(`<div id="ccDiv" style="position:fixed;margin:auto;z-index: 1000;width:629px;height:228px;top:20px;bottom:20px;left:20px;right:20px;background-color:#232b34"><div class="newmodal_header_border"><div class="newmodal_header"><div class="newmodal_close"></div><div id="nowCountry" class="ellipsis" data-country="${thisC}" style="font-size:20px;">转换商店和钱包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当前国家/地区：${c}</div></div></div><div style="padding:20px">${div}</div></div>`);
            jQuery(".currency_change_option").click(function () {
              changeCountry(jQuery(this).attr("data-country"));
            });
            jQuery(".newmodal_close").click(function () {
              jQuery("#ccDiv").remove();
            });
          } else {
            alert("需要挂相应地区的梯子！");
          }
        },
        error: () => {
          alert("获取当前国家/地区失败！");
        }
      });
    }
    function changeCountry(country) {
      jQuery.ajax({
        url: "//store.steampowered.com/account/setcountry",
        type: "post",
        data: {
          sessionid: document.cookie.match(/sessionid\=.*?\;/gim)[0].replace(/sessionid\=|\;/g, ""),
          "cc": country
        },
        complete: function (data) {
          jQuery.ajax({
            url: "//store.steampowered.com/cart/",
            type: "get",
            success: function (data) {
              let c = data.match(/id\=\"usercountrycurrency_trigger\"[\w\W]*?\>[w\W]*?\<\/a/gim)[0].replace(/id\=\"usercountrycurrency_trigger\"[\w\W]*?\>|\<\/a/g, "");
              let thisC = data.match(/id\=\"usercountrycurrency\"[\w\W]*?value=\".*?\"/gim)[0].match(/value=\".*?\"/gim)[0].replace(/value=\"|\"/g, "");
              let div = data.match(/\<div class=\"currency_change_options\"\>[\w\W]*?\<p/gim)[0].replace(/[\s]*?\<p/gim, "") + "</div>";
              jQuery("#ccDiv").html(`<div class="newmodal_header_border"><div class="newmodal_header"><div class="newmodal_close"></div><div id="nowCountry" class="ellipsis" data-country="${thisC}" style="font-size:20px;">转换商店和钱包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当前国家/地区：${c}</div></div></div><div style="padding:20px">${div}</div>`);
              jQuery(".currency_change_option").click(function () {
                changeCountry(jQuery(this).attr("data-country"));
              });
              jQuery(".newmodal_close").click(function () {
                jQuery("#ccDiv").remove();
              });
              if (thisC === country) {
                alert("更换成功！");
              } else {
                alert("更换失败！");
              }
            },
            error: () => {
              alert("获取当前国家/地区失败！");
            }
          });
        }
      });
    }
    jQuery('.pageheader').parent().append('<div style="float: left;";>' +
      '<textarea class="registerkey_input_box_text" rows="1"' + 'name="product_key"' +
      ' id="gameSub" placeholder="输入SUB,多个SUB之间用英文逗号连接"' + 'value=""' + 'color:#fff;' +
      ' style="margin: 3px 0px 0px; width: 400px; height: 15px;background-color:#102634; padding: 6px 18px 6px 18px; font-weight:bold; color:#fff;"></textarea>' +
      ' &nbsp ' + '</div>' + '<a tabindex="300" class="btnv6_blue_hoverfade btn_medium"' +
      ' style="width: 95px; height: 30px;"' +
      ' id="buttonSUB"><span>激活SUB</span></a>' + '<a tabindex="300" class="btnv6_blue_hoverfade btn_medium"' +
      ' style="width: 125px; height: 30px;"' +
      ' id="changeCountry"><span>更改国家/地区</span></a>');
    jQuery('#buttonSUB').click(() => { redeemSub() });
    jQuery('#changeCountry').click(cc);
    if (/https?:\/\/store\.steampowered\.com\/account\/licenses\/\?sub\=([\d]{1,},){1,}/.test(url)) {
      setTimeout(() => { redeemSub(url) }, 2000);
    }
  }
  ///////-------------------steamdb.info代码此处结束-------------->>>>>>>//////

}());
