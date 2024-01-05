// ==UserScript==
// @name         置顶-置底
// @namespace    top-bottom
// @version      0.2
// @description  拉姆置顶，蕾姆置底
// @author       HCLonely
// @include      *://*/*
// @run-at       document-end
// @compatible   chrome 没有测试其他浏览器的兼容性
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
// @resource leimuA       https://cdn.jsdelivr.net/gh/HCLonely/blog.hclonely.com@1.2.3/img/TopLamuLeimu/leimuA.png
// @resource leimuB       https://cdn.jsdelivr.net/gh/HCLonely/blog.hclonely.com@1.2.3/img/TopLamuLeimu/leimuB.png
// @resource lamuA       https://cdn.jsdelivr.net/gh/HCLonely/blog.hclonely.com@1.2.3/img/TopLamuLeimu/lamuA.png
// @resource lamuB       https://cdn.jsdelivr.net/gh/HCLonely/blog.hclonely.com@1.2.3/img/TopLamuLeimu/lamuB.png
// @grant        GM_getResourceURL
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

$(function () {
  const options = GM_getValue('options') || {};
  $('body').append(`
<div id="updown">
  <div class="sidebar_wo" id="leimu">
    <img src="${GM_getResourceURL('leimuA')}" alt="蕾姆" onmouseover="this.src='${GM_getResourceURL('leimuB')}'" onmouseout="this.src=${GM_getResourceURL('leimuA')}'">
  </div>
  <div class="sidebar_wo" id="lamu">
      <img src="${GM_getResourceURL('lamuA')}" alt="拉姆" onmouseover="this.src='${GM_getResourceURL('lamuB')}'" onmouseout="this.src='${GM_getResourceURL('lamuA')}'">
  </div>
</div>`);
  /*
  document.addEventListener('contextmenu',function(e){
      if ($(e.target).attr('alt') === '拉姆') {
          $("html,body").scrollTop(0);
          e.preventDefault();
          return;
      }
      if ($(e.target).attr('alt') === '蕾姆') {
          $("html,body").scrollTop($(document).height());
          e.preventDefault();
          return;
      }
  });
  */
  $("#updown > #lamu img").eq(0).click(function () {
    $('html,body,embed[type="application/pdf"]').animate({
      scrollTop: 0
    }, 800);
    return false;
  });
  $("#updown > #lamu img").eq(0).bind('contextmenu', function () {
    $('html,body,embed[type="application/pdf"]').scrollTop(0);
    return false;
  })
  $("#updown > #lamu img").eq(0).mouseover(function () {
    $("#updown > #lamu img").eq(0).attr('src', GM_getResourceURL('lamuB'));
    return false;
  });
  $("#updown > #lamu img").eq(0).mouseout(function () {
    $("#updown > #lamu img").eq(0).attr('src', GM_getResourceURL('lamuA'));
    return false;
  });
  $("#updown > #leimu img").eq(0).click(function () {
    $('html,body,embed[type="application/pdf"]').animate({
      scrollTop: $(document).height()
    }, 800);
    return false;
  });
  $("#updown > #leimu img").eq(0).bind('contextmenu', function () {
    $('html,body,embed[type="application/pdf"]').scrollTop($(document).height());
    return false;
  })
  $("#updown > #leimu img").eq(0).mouseover(function () {
    $("#updown > #leimu img").eq(0).attr('src', GM_getResourceURL('leimuB'));
    return false;
  });
  $("#updown > #leimu img").eq(0).mouseout(function () {
    $("#updown > #leimu img").eq(0).attr('src', GM_getResourceURL('leimuA'));
    return false;
  });
  if (options.keyCheck) {
    $('#updown').hide();
    document.addEventListener('keydown', function (e) {
      const event = e || window.event;
      if (event.keyCode === 17) {
        $('#updown').show();
        return;
      }
    });
    document.addEventListener('keyup', function (e) {
      const event = e || window.event;
      if (event.keyCode === 17) {
        $('#updown').hide();
        return;
      }
    });
  }
  let alwaysShow, keyCheck;
  function alwaysShowCallback() {
    options.keyCheck = true;
    GM_unregisterMenuCommand(alwaysShow);
    GM_setValue('options', options);
    $('#updown').hide();

    keyCheck = GM_registerMenuCommand("按 Ctrl 键显示图标", keyCheckCallback, {
      autoClose: false
    });
  }
  function keyCheckCallback() {
    options.keyCheck = false;
    GM_unregisterMenuCommand(keyCheck);
    GM_setValue('options', options);
    $('#updown').show();

    alwaysShow = GM_registerMenuCommand("总是显示图标", alwaysShowCallback, {
      autoClose: false
    });
  }
  if (options.keyCheck) {
    keyCheck = GM_registerMenuCommand("按 Ctrl 键显示图标", keyCheckCallback, {
      autoClose: false
    });
  } else {
    alwaysShow = GM_registerMenuCommand("总是显示图标", alwaysShowCallback, {
      autoClose: false
    });
  }

  GM_addStyle(`
.sidebar_wo {
  position: fixed;
  line-height: 0;
  bottom: 0;
  z-index: 2000;
}

#leimu {
  left: 0;
  -webkit-transition: all .3s ease-in-out;
  transition: all .3s ease-in-out;
  -webkit-transform: translate(-7px, 7px);
  -ms-transform: translate(-7px, 7px);
  transform: translate(-7px, 7px);
}

#lamu {
  -webkit-transition: all .3s ease-in-out;
  transition: all .3s ease-in-out;
  -webkit-transform: translate(7px, 7px);
  -ms-transform: translate(7px, 7px);
  transform: translate(7px, 7px);
  right: 0;
}

#leimu:hover {
  -webkit-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  transform: translate(0, 0);
}

#lamu:hover {
  -webkit-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  transform: translate(0, 0);
}

#updown img {
  cursor: pointer;
  width: 75px;
}

.topButton {
  display: none;
}

@media only screen and (max-width:900px) {
  .sidebar_wo {
    display: none;
  }

  .topButton {
    display: block;
  }
}
`);
});
