
import Swal from 'sweetalert2';
import asfCommands from './asfCommands';

interface options {
  protocol: 'http' | 'https' | 'ws' | 'wss'
  host: string
  port: `${number}`
  password: string
  botName?: string
}
class ASF {
  options!: options
  status: boolean

  constructor() {
    const { asfProtocol: protocol, asfHost: host, asfPort: port, asfPassword: password, asfBot: botName } = GM_getValue('setting') || {};
    if (!(protocol && host && port && password)) {
      this.status = false;
      Swal.fire('请配置ASF设置！', '', 'warning');
      return this;
    }
    this.options = { protocol, host, port, password, botName };
    this.status = true;
    return this;
  }
  #showAllCommand() {
    Swal.fire({
      allowOutsideClick: false,
      title: 'ASF指令',
      html: asfCommands,
      showCancelButton: true,
      confirmButtonText: '返回',
      cancelButtonText: '关闭',
    }).then(({ isConfirmed }) => {
      if (isConfirmed) this.sendCommandPre();
    });
    $('table.hclonely button.swal-button').on('click', (event) => {
      const botName = this.options.botName;
      const command = $(event.target).parent()
        .next()
        .text()
        .trim();
      this.sendCommandPre(botName ? command.replace(/<Bots>/gi, botName) : command);
    });
  }
  sendCommandPre(text?: string): void {
    if (!this.status) {
      Swal.fire({
        allowOutsideClick: false,
        icon: 'warning',
        title: '此功能需要在设置中配置ASF IPC并开启ASF功能！'
      });
      return;
    }
    Swal.fire({
      allowOutsideClick: false,
      title: '请在下方输入要执行的ASF指令：',
      html: `<input id="asf-command" class="swal2-input"${text ? ` value=${text}` : ''}>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="stats">连接测试</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="pause">暂停挂卡</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="resume">恢复挂卡</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="2fa">获取令牌</button>
      <button type="button" class="swal2-confirm swal2-styled auto-redeem-key" style="display: inline-block;" data-command="more">更多ASF指令</button>`,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '运行命令',
      denyButtonText: '激活key',
      cancelButtonText: '取消',
      preConfirm: () => {
        return $('#asf-command').val();
      }
    })
      .then(({ value }) => this.#sendCommand(value as string))
      .catch(() => null)

    $('.auto-redeem-key').on('click', (event) => {
      const subCommand = $(event.target).attr('data-command');
      if (subCommand === 'more') {
        this.#showAllCommand();
        return;
      }
      $('#asf-command').val(`!${subCommand} ${this.options.botName || ''}`)
    });
  }
  async #sendCommand(command: string) {
    if (!command) {
      Swal.fire({
        allowOutsideClick: false,
        title: 'ASF指令不能为空！',
        icon: 'warning'
      })
        .then(() => this.sendCommandPre())
      return;
    }
    console.log(command);
  }
}

export default ASF;
