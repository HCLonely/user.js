// ==UserScript==
// @name               gistSync
// @namespace          gistSync
// @version            1.0.2
// @description        使用gist进行数据同步
// @author             HCLonely
// @license            MIT

// @include            *://*/*
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_listValues
// @grant              GM_xmlhttpRequest
// @grant              GM_registerMenuCommand

// @require            https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @require            https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.7/runtime.min.js
// @require            https://cdn.jsdelivr.net/npm/sweetalert2@9
// @require            https://cdn.jsdelivr.net/npm/promise-polyfill@8.1.3/dist/polyfill.min.js
// @require            https://greasyfork.org/scripts/418102-tm-request/code/TM_request.js?version=902218
// @connect            api.github.com
// @run-at             document-end
// ==/UserScript==

/* global Swal,TM_request, GM_setValue, GM_getValue, GM_listValues */
/*
const { TOKEN, GIST_ID, FILE_NAME, AUTO_SYNC } = GM_getValue('gistConf') || { TOKEN: '', GIST_ID: '', FILE_NAME: '' }
if (TOKEN && GIST_ID && FILE_NAME && AUTO_SYNC){

}
*/
function setGistData (token, gistId, fileName, content) {
  const data = JSON.stringify({
    files: {
      [fileName]: {
        content: JSON.stringify(content)
      }
    }
  })
  return TM_request({
    url: 'https://api.github.com/gists/' + gistId,
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: 'token ' + token
    },
    data: data,
    responseType: 'json',
    method: 'POST',
    timeout: 30000,
    retry: 3
  }).then(response => {
    if (response.status === 200 && response.response?.files?.[fileName]?.content === JSON.stringify(content)) {
      return true
    } else {
      console.error(response)
      return false
    }
  }).catch(error => {
    console.error(error)
    return false
  })
}
function getGistData (token, gistId, fileName) {
  return TM_request({
    url: 'https://api.github.com/gists/' + gistId,
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: 'token ' + token
    },
    responseType: 'json',
    method: 'GET',
    timeout: 30000,
    retry: 3
  }).then(response => {
    if (response.status === 200) {
      return JSON.parse(response.response?.files?.[fileName]?.content || null)
    } else {
      console.error(response)
      return false
    }
  }).catch(error => {
    console.error(error)
    return false
  })
}

function setting () {
  const { TOKEN, GIST_ID, FILE_NAME/*, AUTO_SYNC */ } = GM_getValue('gistConf') || { TOKEN: '', GIST_ID: '', FILE_NAME: '' }
  Swal.fire({
    title: 'Gist 设置',
    html:
      '<p>Github Token<input id="github-token" class="swal2-input" placeholder="Github Token" value="' + TOKEN + '"></p>' +
      '<p>Gist ID<input id="gist-id" class="swal2-input" placeholder="Gist ID" value="' + GIST_ID + '"></p>' +
      '<p>文件名<input id="file-name" class="swal2-input" placeholder="文件名" value="' + FILE_NAME + '"></p>' +
      // '<p><input id="auto-sync" type="checkbox" ' + (AUTO_SYNC ? 'checked="checked"' : '') + '><span class="swal2-label">自动同步</span></p>' +
      '<p>' +
      '<button id="upload-data" type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;">同步到Gist</button>' +
      '<button id="download-data" type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;">从Gist同步</button>' +
      '</p>',
    focusConfirm: false,
    showLoaderOnConfirm: true,
    footer: '<a href="https://github.com/HCLonely/IG-Helper/blob/master/README.md" target-"_blank" class>帮助？</a>',
    preConfirm: async () => {
      const token = document.getElementById('github-token').value
      const gistId = document.getElementById('gist-id').value
      const fileName = document.getElementById('file-name').value
      // const autoSync = document.getElementById('auto-sync').checked
      GM_setValue('gistConf', { TOKEN: token, GIST_ID: gistId, FILE_NAME: fileName/* , AUTO_SYNC: autoSync */ })
      return await getGistData(token, gistId, fileName)
    },
    allowOutsideClick: () => !Swal.isLoading(),
    confirmButtonText: '保存配置并测试',
    showCancelButton: true,
    cancelButtonText: '关闭'
  }).then(({ value }) => {
    if (value) {
      Swal.fire({
        icon: 'success',
        title: '测试成功！'
      }).then(() => {
        setting()
      })
    } else if (value !== undefined) {
      Swal.fire({
        icon: 'error',
        title: '测试失败！'
      }).then(() => {
        setting()
      })
    }
  })
  $('#upload-data').click(async () => {
    const { TOKEN, GIST_ID, FILE_NAME } = GM_getValue('gistConf') || { }
    if (!(TOKEN && GIST_ID && FILE_NAME)) {
      return Swal.fire({
        icon: 'error',
        title: '请先保存配置并测试！'
      }).then(() => {
        setting()
      })
    }
    Swal.fire({
      icon: 'info',
      title: '正在处理数据...'
    })
    const data = {}
    const names = GM_listValues()
    for (const name of names) {
      data[name] = GM_getValue(name)
    }
    Swal.update({
      icon: 'info',
      title: '正在上传数据...'
    })
    if (await setGistData(TOKEN, GIST_ID, FILE_NAME, data)) {
      Swal.fire({
        icon: 'success',
        title: '同步数据成功！'
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: '同步数据失败，请在控制台查看错误信息！'
      })
    }
  })
  $('#download-data').click(async () => {
    const { TOKEN, GIST_ID, FILE_NAME } = GM_getValue('gistConf') || {}
    if (!(TOKEN && GIST_ID && FILE_NAME)) {
      return Swal.fire({
        icon: 'error',
        title: '请先保存配置并测试！'
      }).then(() => {
        setting()
      })
    }
    Swal.fire({
      icon: 'info',
      title: '正在下载数据...'
    })
    const data = await getGistData(TOKEN, GIST_ID, FILE_NAME)
    if (!data) {
      return Swal.fire({
        icon: 'error',
        title: '没有检测到远程数据，请确认配置是否正确！'
      }).then(() => {
        setting()
      })
    }
    Swal.update({
      icon: 'info',
      title: '正在保存数据...'
    })
    for (const [name, value] of Object.entries(data)) {
      GM_setValue(name, value)
    }
    Swal.fire({
      icon: 'success',
      title: '同步数据成功！'
    })
  })
}
GM_registerMenuCommand('数据同步设置', setting)
