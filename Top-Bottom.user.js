// ==UserScript==
// @name         置顶-置底
// @namespace    top-bottom
// @version      0.3
// @description  拉姆置顶，蕾姆置底
// @author       HCLonely
// @include      *://*/*
// @run-at       document-end
// @compatible   chrome 没有测试其他浏览器的兼容性
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

(function () {
  const options = GM_getValue('options') || {};

  // 创建容器
  const updown = document.createElement('div');
  updown.id = 'updown';

  // 创建蕾姆角色
  const leimu = document.createElement('div');
  leimu.className = 'sidebar_wo';
  leimu.id = 'leimu';

  const leimuImg = document.createElement('img');
  leimuImg.src = GM_getResourceURL('leimuA');
  leimuImg.alt = '蕾姆';
  leimuImg.onmouseover = () => leimuImg.src = GM_getResourceURL('leimuB');
  leimuImg.onmouseout = () => leimuImg.src = GM_getResourceURL('leimuA');

  leimu.appendChild(leimuImg);
  updown.appendChild(leimu);

  // 创建拉姆角色
  const lamu = document.createElement('div');
  lamu.className = 'sidebar_wo';
  lamu.id = 'lamu';

  const lamuImg = document.createElement('img');
  lamuImg.src = GM_getResourceURL('lamuA');
  lamuImg.alt = '拉姆';
  lamuImg.onmouseover = () => lamuImg.src = GM_getResourceURL('lamuB');
  lamuImg.onmouseout = () => lamuImg.src = GM_getResourceURL('lamuA');

  lamu.appendChild(lamuImg);
  updown.appendChild(lamu);

  // 添加到文档
  document.body.appendChild(updown);

  // 滚动功能封装
  const scrollToPosition = (top, smooth = true) => {
    const targets = [
      document.documentElement,
      document.body,
      ...document.querySelectorAll('embed[type="application/pdf"]')
    ];

    targets.forEach((target) => {
      if (target && target.scrollHeight > target.clientHeight) {
        if (smooth) {
          target.scrollTo({
            top: top === 'bottom' ? target.scrollHeight : top,
            behavior: 'smooth'
          });
        } else {
          target.scrollTop = top === 'bottom' ? target.scrollHeight : top;
        }
      }
    });
  };

  // 绑定拉姆事件
  lamuImg.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToPosition(0);
  });

  lamuImg.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    scrollToPosition(0, false);
  });

  // 绑定蕾姆事件
  leimuImg.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToPosition('bottom');
  });

  leimuImg.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    scrollToPosition('bottom', false);
  });

  // 显示/隐藏控制
  if (options.keyCheck) {
    updown.style.display = 'none';

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Control') {
        updown.style.display = 'block';
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        updown.style.display = 'none';
      }
    });
  }

  // 菜单命令功能
  let alwaysShow; let keyCheck;

  const alwaysShowCallback = () => {
    options.keyCheck = true;
    GM_unregisterMenuCommand(alwaysShow);
    GM_setValue('options', options);
    updown.style.display = 'none';

    keyCheck = GM_registerMenuCommand('按 Ctrl 键显示图标', keyCheckCallback, {
      autoClose: false
    });
  };

  const keyCheckCallback = () => {
    options.keyCheck = false;
    GM_unregisterMenuCommand(keyCheck);
    GM_setValue('options', options);
    updown.style.display = 'block';

    alwaysShow = GM_registerMenuCommand('总是显示图标', alwaysShowCallback, {
      autoClose: false
    });
  };

  // 初始菜单注册
  if (options.keyCheck) {
    keyCheck = GM_registerMenuCommand('按 Ctrl 键显示图标', keyCheckCallback, {
      autoClose: false
    });
  } else {
    alwaysShow = GM_registerMenuCommand('总是显示图标', alwaysShowCallback, {
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
}());
