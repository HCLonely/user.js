interface MyTexts {
  fail: string;
  success: string;
  network: string;
  line: string;
  nothing: string;
  others: string;
  unknown: string;
  redeeming: string;
  waiting: string;
  showUnusedKey: string;
  hideUnusedKey: string;
}

interface Setting {
  newTab: boolean;
  copyListen: boolean;
  selectListen: boolean;
  clickListen: boolean;
  allKeyListen: boolean;
  asf: boolean;
  asfProtocol: string;
  asfHost: string;
  asfPort: string;
  asfPassword: string;
  asfBot: string;
}

interface GlobalThis {
  url: string;
  defaultSetting: {
    newTab: boolean;
    copyListen: boolean;
    selectListen: boolean;
    clickListen: boolean;
    allKeyListen: boolean;
    asf: boolean;
    asfProtocol: string;
    asfHost: string;
    asfPort: number;
    asfPassword: string;
    asfBot: string;
  };
  sessionID: string;
  allUnusedKeys: string[];
  selecter: string;
  myTexts: MyTexts;
  autoDivideNum: number;
  waitingSeconds: number;
  keyCount: number;
  recvCount: number;
}

interface Window {
  DEBUG?: boolean;
  TRACE?: boolean;
}

interface GMRequestDetails {
  /** HTTP method, e.g., GET, POST, etc. */
  method?: string;
  /** Destination URL or a Blob/File (v5.4.6226+). */
  url: string | URL | File | Blob;
  /** Request headers. */
  headers?: Record<string, string>;
  /** Data to send with POST request. */
  data?: string | Blob | File | object | any[] | FormData | URLSearchParams;
  /** Redirect handling: 'follow', 'error', 'manual' (build 6180+). */
  redirect?: 'follow' | 'error' | 'manual';
  /** Cookie string to include. */
  cookie?: string;
  /** Cookie partition key (v5.2+). */
  cookiePartition?: object;
  /** Top-level site for partitioned cookies. */
  topLevelSite?: string;
  /** Send data in binary mode. */
  binary?: boolean;
  /** Disable caching. */
  nocache?: boolean;
  /** Revalidate cached content. */
  revalidate?: boolean;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Context added to the response object. */
  context?: any;
  /** Type of response data expected. */
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'stream';
  dataType?: 'arraybuffer' | 'blob' | 'json' | 'stream';
  /** Override MIME type. */
  overrideMimeType?: string;
  /** Do not send cookies (enforces fetch). */
  anonymous?: boolean;
  /** Use fetch instead of XHR (affects timeout/events in Chrome). */
  fetch?: boolean;
  /** Username for authentication. */
  user?: string;
  /** Password for authentication. */
  password?: string;
  /** Callback when request is aborted. */
  onabort?: (response: GMResponse) => void;
  /** Callback on request error. */
  onerror?: (response: GMResponse) => void;
  /** Callback on load start (provides stream if responseType='stream'). */
  onloadstart?: (response: GMResponse) => void;
  /** Callback on progress. */
  onprogress?: (response: GMResponse) => void;
  /** Callback on readyState change. */
  onreadystatechange?: (response: GMResponse) => void;
  /** Callback on timeout. */
  ontimeout?: (response: GMResponse) => void;
  /** Callback when request completes. */
  onload?: (response: GMResponse) => void;
}

interface GMResponse {
  /** Final URL after redirects. */
  finalUrl: string;
  /** Ready state of the request. */
  readyState: number;
  /** HTTP status code. */
  status: number;
  /** HTTP status text. */
  statusText: string;
  /** Response headers. */
  responseHeaders: Record<string, string>;
  /** Response data (type depends on responseType). */
  response?: any;
  /** Response as XML document. */
  responseXML?: Document;
  /** Response as text. */
  responseText?: string;
  /** Custom context from details.context. */
  context?: any;
}

interface GMRequestObject {
  /** Aborts the ongoing request. */
  abort: () => void;
}

/**
 * Sends an HTTP request via userscript. Returns an object with an abort method.
 */
declare function GM_xmlhttpRequest(details: GMRequestDetails): GMRequestObject;

/**
 * Represents the types that can be stored using GM_setValue.
 */
type Serializable = string | number | boolean | null | undefined | object | any[];

/**
 * Sets a value in the userscript's storage.
 * @param key The key under which to store the value.
 * @param value The value to store. Can be a string, number, boolean, null, undefined, object, or array.
 */
declare function GM_setValue(key: string, value: Serializable): void;

/**
 * Retrieves a value from the userscript's storage.
 * @param key The key to retrieve.
 * @param defaultValue The default value if the key does not exist.
 * @returns The stored value, or the defaultValue if the key does not exist.
 */
declare function GM_getValue<T>(key: string, defaultValue?: T): T;

/**
 * Deletes a key from the userscript's storage.
 * @param key The key to delete.
 */
declare function GM_deleteValue(key: string): void;

/**
 * Options for clipboard operations
 */
interface ClipboardInfo {
  /** Type of clipboard content - 'text' or 'html' */
  type: 'text' | 'html';
  /** Optional MIME type specification */
  mimetype?: string;
}

/**
 * Sets clipboard content with optional callback
 * @param data The text/HTML content to set to clipboard
 * @param info Type specification (string or object format)
 * @param cb Optional callback when operation completes
 */
declare function GM_setClipboard(
  data: string,
  info?: 'text' | 'html' | ClipboardInfo,
  cb?: () => void
): void;

/**
 * Injects CSS into the document and returns the created style element.
 * @param css CSS string to inject
 */
declare function GM_addStyle(css: string): HTMLStyleElement;

/**
 * Options for registering menu commands (v4.20+)
 */
interface MenuCommandOptions {
  /** Unique identifier for updating existing commands (v5.0+) */
  id?: number | string;
  /** Keyboard shortcut when menu is open */
  accessKey?: string;
  /** Whether to close menu after click (default: true) */
  autoClose?: boolean;
  /** Tooltip text for menu item (v5.0+) */
  title?: string;
}

/**
 * Registers a userscript menu command with callback
 */
declare function GM_registerMenuCommand(
  name: string,
  callback: (event: MouseEvent | KeyboardEvent) => void,
  options?: MenuCommandOptions
): number | string;

declare namespace GM {
  /**
   * Promise-based HTTP request. Returns a promise with an abort method.
   */
  function xmlHttpRequest(details: GMRequestDetails): Promise<GMResponse> & { abort: () => void };

  /**
   * Asynchronously sets a value in the userscript's storage.
   * @param key The key under which to store the value.
   * @param value The value to store. Can be a string, number, boolean, null, undefined, object, or array.
   * @returns A promise that resolves when the value is set.
   */
  function setValue(key: string, value: Serializable): Promise<void>;

  /**
   * Asynchronously retrieves a value from the userscript's storage.
   * @param key The key to retrieve.
   * @param defaultValue The default value if the key does not exist.
   * @returns A promise that resolves to the stored value, or the defaultValue if the key does not exist.
   */
  function getValue<T>(key: string, defaultValue?: T): Promise<T>;

  /**
   * Asynchronously deletes a key from the userscript's storage.
   * @param key The key to delete.
   * @returns A promise that resolves when the key is deleted.
   */
  function deleteValue(key: string): Promise<void>;

  /**
     * Promise-based clipboard setting
     * @param data The content to set to clipboard
     * @param info Type specification (string or object format)
     * @returns Promise that resolves when operation completes
     */
  function setClipboard(
    data: string,
    info?: 'text' | 'html' | ClipboardInfo
  ): Promise<void>;
}

declare const g_sessionID: string;
