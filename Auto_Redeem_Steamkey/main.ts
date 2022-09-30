import ASF from './asf';

GM_addStyle(GM_getResourceText('style'));
GM_registerMenuCommand('Test', () => {
  unsafeWindow.asf = new ASF();
})
