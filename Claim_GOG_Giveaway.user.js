// ==UserScript==
// @name               自动领取GOG首页限免游戏
// @name:en            Claim_GOG_Giveaway
// @namespace          Claim_GOG_Giveaway
// @version            1.0.1
// @description        自动领取GOG首页限免游戏
// @author             HCLonely
// @license            MIT
// @run-at             document-end
// @homepage           https://github.com/HCLonely/user.js
// @supportURL         https://github.com/HCLonely/user.js/issues
// @updateURL          https://github.com/HCLonely/user.js/blob/master/Claim_GOG_Giveaway.user.js?raw=true
// @installURL         https://github.com/HCLonely/user.js/blob/master/Claim_GOG_Giveaway.user.js?raw=true
// @downloadURL        https://github.com/HCLonely/user.js/blob/master/Claim_GOG_Giveaway.user.js?raw=true

// @include            *://www.gog.com/
// @grant              GM_xmlhttpRequest
// @connect            cdn.jsdelivr.net
// @connect            www.gog.com
// @require            https://cdn.jsdelivr.net/npm/axios@0.27.2/dist/axios.min.js
// @noframes
// ==/UserScript==

(() => {
  if (document.querySelector('#giveaway')) {
    axios.get('https://www.gog.com/giveaway/consent')
      .then((response) => {
        if (response.data.consentStatus === 'all_given') {
          document.querySelector('.giveaway-banner--with-consent__content').style.display = 'none';
          document.querySelector('.giveaway-banner__success').style.display = 'flex';
          console.log('已领取');
          return;
        }
        axios.post('https://www.gog.com/giveaway/claim', '{}', {
          validateStatus: (status) => status >= 200 && status < 500
        })
          .then((response) => {
            if (response.status === 201 || (response.status === 409 && response.data?.message === 'Already claimed')) {
              document.querySelector('.giveaway-banner--with-consent__content').style.display = 'none';
              document.querySelector('.giveaway-banner__success').style.display = 'flex';
              console.log('领取成功');
            } else {
              document.querySelector('.giveaway-banner--with-consent__content').style.display = 'flex';
              document.querySelector('.giveaway-banner__text').style.display = 'block';
              document.querySelector('.giveaway-banner__success').style.display = 'none';
              console.log('领取失败', response);
            }
          });
      });
  }
})();
