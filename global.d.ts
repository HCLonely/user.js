declare global {
  const unsafeWindow: {
    [name: string]: any
  };

  interface MonkeyXhrResponse {
    finalUrl: string
    readyState: number
    status: number
    statusText: string
    responseHeaders: any
    response: any
    responseXML: Document
    responseText: string
  }
  interface MonkeyXhrBasicDetails {
    method: 'GET' | 'POST' | 'HEAD' | 'DELETE'
    url: string
    headers?: { [name: string]: string },
    data?: string
    binary?: boolean
    timeout?: number
    nochche?: boolean
    context?: any
    responseType?: 'arraybuffer' | 'blob' | 'json'
    overrideMimeType?: string
    anonymous?: boolean
    fetch?: boolean
    username?: string
    password?: string
  }
  interface MonkeyXhrDetails extends MonkeyXhrBasicDetails {
    onabort?: (response: MonkeyXhrResponse) => void
    onerror?: (response: MonkeyXhrResponse) => void
    onloadstart?: (response: MonkeyXhrResponse) => void
    onprogress?: (response: MonkeyXhrResponse) => void
    onreadystatechange?: (response: MonkeyXhrResponse) => void
    ontimeout?: (response: MonkeyXhrResponse) => void
    onload?: (response: MonkeyXhrResponse) => void
  }
  interface gmInfo {
    scriptHandler: string
    version: string
    script: {
      version: string
      name: string
      'run-at': string
    }
  }
  /* eslint-disable camelcase */
  const GM_info: gmInfo;
  function GM_xmlhttpRequest(details: MonkeyXhrDetails): { abort: () => void }
  function GM_addStyle(style: string): HTMLElement
  function GM_setValue(name: string, value: any): void
  function GM_getValue<T>(name: string, defaultValue?: T): undefined | T
  function GM_listValues(): Array<string>
  function GM_deleteValue(name: string): void
  function GM_registerMenuCommand(name: string, callback: () => void): void
  function GM_setClipboard(text: string, type?: string): void
  function GM_getResourceText(name: string): string
  function GM_openInTab(url: string, options?: {
    active?: boolean
    insert?: boolean
    setParent?: boolean
    incognito?: boolean
  }): {
    close: () => void
    onclose: () => void
    closed: boolean
  }
}

export { };
