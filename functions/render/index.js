var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});

// node_modules/@sveltejs/kit/dist/install-fetch.js
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_zlib = __toModule(require("zlib"));
var import_stream = __toModule(require("stream"));
var import_util = __toModule(require("util"));
var import_crypto = __toModule(require("crypto"));
var import_url = __toModule(require("url"));
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
var dataUriToBuffer$1 = src;
var { Readable } = import_stream.default;
var wm = new WeakMap();
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
var Blob = class {
  constructor(blobParts = [], options2 = {}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob) {
        buffer = element;
      } else {
        buffer = Buffer.from(typeof element === "string" ? element : String(element));
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });
    const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
    wm.set(this, {
      type: /[^\u0020-\u007E]/.test(type) ? "" : type,
      size,
      parts
    });
  }
  get size() {
    return wm.get(this).size;
  }
  get type() {
    return wm.get(this).type;
  }
  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    return Readable.from(read(wm.get(this).parts));
  }
  slice(start = 0, end = this.size, type = "") {
    const { size } = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) {
          break;
        }
      }
    }
    const blob = new Blob([], { type: String(type).toLowerCase() });
    Object.assign(wm.get(blob), { size: span, parts: blobParts });
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
};
Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var fetchBlob = Blob;
var Blob$1 = fetchBlob;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && object[NAME] === "AbortSignal";
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (import_util.types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof import_stream.default)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = import_stream.default.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof import_stream.default) {
      body.on("error", (err) => {
        const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
        this[INTERNALS$2].error = error3;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new Blob$1([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
    p1 = new import_stream.PassThrough({ highWaterMark });
    p2 = new import_stream.PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof import_stream.default) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request;
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2].boundary);
  }
  return null;
};
var writeToStream = (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    body.stream().pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
var validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw err;
  }
};
var validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const err = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
    throw err;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers) {
      const raw = init2.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback) {
    for (const name of this.keys()) {
      callback(this.get(name), name);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status || 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response(clone(this, this.highWaterMark), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response.prototype, {
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
};
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request = class extends Body {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal !== null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return (0, import_url.format)(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS];
  const headers = new Headers(request[INTERNALS].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
var AbortError = class extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}

// node_modules/@sveltejs/kit/dist/adapter-utils.js
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/ssr.js
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = headers["content-type"];
  const is_type_textual = isContentTypeTextual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4, request);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error3 = e;
          }
          if (loaded && !error3) {
            branch.push(loaded);
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      ...opts,
      page_config,
      status,
      error: error3,
      branch: branch.filter(Boolean)
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4, request);
    return await respond_with_error({
      ...opts,
      status: 500,
      error: error4
    });
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw || typeof raw !== "string")
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  switch (type) {
    case "text/plain":
      return raw;
    case "application/json":
      return JSON.parse(raw);
    case "application/x-www-form-urlencoded":
      return get_urlencoded(raw);
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(raw, boundary.slice("boundary=".length));
    }
    default:
      throw new Error(`Invalid Content-Type ${type}`);
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
function noop2() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal2(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$8 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$8);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => `<!DOCTYPE html>\r
<!-- yo, L6 here. Nice to have you checking out the source. I apologize for what you're gonna see lol -->\r
\r
<html lang="en">\r
<head>\r
	<!-- Google Tag Manager -->\r
	<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\r
		new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\r
		j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\r
		'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\r
	})(window,document,'script','dataLayer','GTM-TTZFTB7');<\/script>\r
	<!-- End Google Tag Manager -->\r
	<meta charset="utf-8" />\r
	<meta name="viewport" content="width=device-width, initial-scale=1" />\r
	\r
	` + head + `\r
	\r
	<link rel='icon' type='image/png' href='favicon.png'>\r
	<link rel='stylesheet' href='global.css'>\r
	<!-- <link rel='stylesheet' href='./build/bundle.css'> -->\r
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"\r
	/>\r
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/svelte-material-ui@4.0.0/bare.min.css"\r
	/>\r
	\r
	<link rel="alternate" type="application/json+oembed"\r
	href="http://asofter.space/oembed.json"\r
	title="A Softer Space's oEmbed Profile" />\r
	\r
	<meta name="twitter:card" content="summary_large_image"></meta>\r
	<meta name="twitter:site" content="@imjustlilith"></meta>\r
	<meta name="twitter:creator" content="@imjustlilith"></meta>\r
	<meta name="twitter:title" content="A Softer Space"></meta>\r
	<meta name="twitter:image" content="https://asofter.space/preview.gif"></meta>\r
	<meta name="og:image" content="https://asofter.space/preview.gif"></meta>\r
	<meta property="twitter:image:alt" content="A white sircle with a multicolored ring."></meta>\r
	<meta property="og:image:alt" content="A white sircle with a multicolored ring."></meta>\r
	<meta property="twitter:description" content="A Softer Space is a calming area to vent your thoughts, as if texting a friend."></meta>\r
	<meta property="og:description" content="A Softer Space is a calming area to vent your thoughts, as if texting a friend."></meta>\r
	\r
	<script defer src="p5/p5.min.js"><\/script>\r
	<script id='p5' defer src="p5/sketch.js"><\/script>\r
	<script id='p5' defer src="p5/sketch2.js"><\/script>\r
	\r
</head>\r
\r
<!-- Svelte inits here. Folding P5 around it \u2728 -->\r
<body>\r
	<!-- Google Tag Manager (noscript) -->\r
	<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TTZFTB7"\r
		height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\r
		<!-- End Google Tag Manager (noscript) -->\r
		\r
		<section id="p5Sketch" class='p5Sketch'></section>\r
		<section id="p5Sketch2" class='p5Sketch'></section>\r
		<div id="svelte">` + body + "</div>\r\n	</body>\r\n	</html>\r\n	";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings2 = default_settings) {
  set_paths(settings2.paths);
  set_prerendering(settings2.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/internal/start-458f0aa2.js",
      css: [assets + "/internal/assets/start-61d1577b.css"],
      js: [assets + "/internal/start-458f0aa2.js", assets + "/internal/chunks/vendor-eb0670e3.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/internal/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22, request) => {
      hooks.handleError({ error: error22, request });
      error22.stack = options.get_stack(error22);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings2.paths,
    prerender: true,
    read: settings2.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "CNAME", "size": 17, "type": null }, { "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "global.css", "size": 2253, "type": "text/css" }, { "file": "oembed.json", "size": 257, "type": "application/json" }, { "file": "p5/p5.min.js", "size": 813546, "type": "application/javascript" }, { "file": "p5/sketch.js", "size": 2087, "type": "application/javascript" }, { "file": "p5/sketch2.js", "size": 2232, "type": "application/javascript" }, { "file": "preview.gif", "size": 710690, "type": "image/gif" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/settings\/?$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/settings.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error22 }) => console.error(error22.stack)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/settings.svelte": () => Promise.resolve().then(function() {
    return settings;
  })
};
var metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-3c628a17.js", "css": [], "js": ["layout.svelte-3c628a17.js", "chunks/vendor-eb0670e3.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-9a23c624.js", "css": [], "js": ["error.svelte-9a23c624.js", "chunks/vendor-eb0670e3.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-3650ec41.js", "css": ["assets/pages/index.svelte-801dd32f.css", "assets/ThemeSwitcher.svelte_svelte&type=style&lang-82a975c8.css"], "js": ["pages/index.svelte-3650ec41.js", "chunks/vendor-eb0670e3.js", "chunks/ThemeSwitcher.svelte_svelte&type=style&lang-b19172a6.js"], "styles": [] }, "src/routes/settings.svelte": { "entry": "pages/settings.svelte-2937c58d.js", "css": ["assets/pages/settings.svelte-5ea7517b.css", "assets/ThemeSwitcher.svelte_svelte&type=style&lang-82a975c8.css"], "js": ["pages/settings.svelte-2937c58d.js", "chunks/vendor-eb0670e3.js", "chunks/ThemeSwitcher.svelte_svelte&type=style&lang-b19172a6.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/internal/" + entry,
    css: css2.map((dep) => assets + "/internal/" + dep),
    js: js.map((dep) => assets + "/internal/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var subscriber_queue2 = [];
function writable2(value, start = noop2) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal2(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue2.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop2;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
var toastStore = writable2([]);
var css$7 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}button.deep-blue.svelte-416q1l{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}button.deep-pink.svelte-416q1l{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}button.soft-blue.svelte-416q1l{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}button.soft-pink.svelte-416q1l{background-color:#e60073;color:white}#inputArea.svelte-416q1l{width:100%;display:grid;grid-template-rows:auto;grid-template-columns:repeat(6, 1fr)}#textInput.svelte-416q1l{grid-column:1/span 6}#submit.svelte-416q1l{color:purple;grid-column:7;border:none;text-decoration:none;width:100%}#sendButton.svelte-416q1l{vertical-align:top}",
  map: `{"version":3,"file":"Input.svelte","sources":["Input.svelte"],"sourcesContent":["<script lang='ts'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { createEventDispatcher } from 'svelte';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport themeStore from './ts/themeStore';\\r\\nimport { onMount } from 'svelte';\\r\\nexport let messageList;\\r\\nexport let timer = 0;\\r\\n// export const animateList = function(){}\\r\\nexport let chatName;\\r\\nexport let fileName;\\r\\nexport let theme = '';\\r\\nlet messageContent = '';\\r\\nlet dispatch = createEventDispatcher();\\r\\nlet appStorage;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    appStorage = window.localStorage;\\r\\n}));\\r\\nconst parseMessage = (messageContent) => {\\r\\n    // console.log(messageContent[0])\\r\\n    switch (messageContent[0]) {\\r\\n        case '/':\\r\\n            let command = messageContent\\r\\n                .slice(1)\\r\\n                .split(' ');\\r\\n            switch (command[0]) {\\r\\n                case 'switch':\\r\\n                    switch (command[1]) {\\r\\n                        case 'theme':\\r\\n                            console.log('%cswitching themes from chatbox', 'color:cyan');\\r\\n                            theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n                            Helpers.updateTheme(window.localStorage, theme);\\r\\n                            break;\\r\\n                        case 'listener':\\r\\n                            console.log('%cswitching listeners from chatbox', 'color:teal');\\r\\n                            let listener = Helpers.fetchTheme(appStorage, themeStore, 'listener');\\r\\n                            Helpers.updateListener(window.localStorage, listener);\\r\\n                            break;\\r\\n                        default:\\r\\n                            Helpers.notify('Invalid slash command :x', 500);\\r\\n                            break;\\r\\n                    }\\r\\n                    break;\\r\\n                case 'save':\\r\\n                    Helpers.saveChat(fileName, messageList);\\r\\n                    break;\\r\\n                case 'stash':\\r\\n                    Helpers.stashChat(window.localStorage, chatName, messageList);\\r\\n                    break;\\r\\n                case 'clear':\\r\\n                    console.log(command);\\r\\n                    switch (command[1]) {\\r\\n                        case 'stash':\\r\\n                            Helpers.clearStash(window.localStorage);\\r\\n                            break;\\r\\n                        case 'chat':\\r\\n                            messageList = [];\\r\\n                            break;\\r\\n                        default:\\r\\n                            Helpers.notify('Invalid slash command :x', 500);\\r\\n                    }\\r\\n                    break;\\r\\n                default:\\r\\n                    Helpers.notify('Invalid slash command :x', 500);\\r\\n            }\\r\\n            break;\\r\\n        default:\\r\\n            sendMessage(messageContent);\\r\\n    }\\r\\n};\\r\\nconst sendMessage = (message) => {\\r\\n    if (!message) {\\r\\n        return;\\r\\n    }\\r\\n    let date = new Date();\\r\\n    let localTime = date.toLocaleTimeString();\\r\\n    let localDate = date.toLocaleDateString()\\r\\n        .split('/')\\r\\n        .reverse()\\r\\n        .join('.');\\r\\n    messageList = [\\r\\n        ...messageList,\\r\\n        { content: message,\\r\\n            sender: 'user',\\r\\n            timestamp: \`\${localDate} - \${localTime}\`\\r\\n        }\\r\\n    ];\\r\\n    messageContent = '';\\r\\n    // dispatch('voidInvoked')\\r\\n    // animateList('messages')\\r\\n};\\r\\nconst keypressCheck = (event) => {\\r\\n    // console.log(event)\\r\\n    if (event.key.toLowerCase() == 'enter') {\\r\\n        parseMessage(messageContent);\\r\\n        messageContent = '';\\r\\n        // dispatch('voidInvoked')\\r\\n    }\\r\\n    timer = 7;\\r\\n};\\r\\n<\/script>\\r\\n\\r\\n<section id='inputArea' on:click|preventDefault>\\r\\n\\t<input id='textInput'\\r\\n\\tclass={theme}\\r\\n\\tbind:value={messageContent}\\r\\n\\ton:keypress='{keypressCheck.bind(messageContent)}'>\\r\\n\\t<div id='submit'>\\r\\n\\t\\t<!-- <Fab  -->\\r\\n\\t\\t\\t<button\\r\\n\\t\\t\\tclass={theme}\\r\\n\\t\\t\\tid='submitButton'\\r\\n\\t\\t\\ton:mousedown={(event)=> {\\r\\n\\t\\t\\t\\tparseMessage(messageContent)\\r\\n\\t\\t\\t\\tevent.preventDefault()\\r\\n\\t\\t\\t}}\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t<span id='sendButton' class=\\"material-icons\\">send</span>\\r\\n\\t\\t\\tSend\\r\\n\\t\\t</button>\\r\\n\\t\\t<!-- </Fab> -->\\r\\n\\t</div>\\r\\n</section>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\n#inputArea {\\n  width: 100%;\\n  display: grid;\\n  grid-template-rows: auto;\\n  grid-template-columns: repeat(6, 1fr);\\n}\\n\\n#textInput {\\n  grid-column: 1/span 6;\\n}\\n\\n#submit {\\n  color: purple;\\n  grid-column: 7;\\n  border: none;\\n  text-decoration: none;\\n  width: 100%;\\n}\\n\\n#sendButton {\\n  vertical-align: top;\\n}</style>"],"names":[],"mappings":"AAoI2B,cAAc,AAAE,CAAC,AAC1C,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACzQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAC3Q,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,cAAC,CAAC,AACV,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,kBAAkB,CAAE,IAAI,CACxB,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,AACvC,CAAC,AAED,UAAU,cAAC,CAAC,AACV,WAAW,CAAE,CAAC,CAAC,IAAI,CAAC,CAAC,AACvB,CAAC,AAED,OAAO,cAAC,CAAC,AACP,KAAK,CAAE,MAAM,CACb,WAAW,CAAE,CAAC,CACd,MAAM,CAAE,IAAI,CACZ,eAAe,CAAE,IAAI,CACrB,KAAK,CAAE,IAAI,AACb,CAAC,AAED,WAAW,cAAC,CAAC,AACX,cAAc,CAAE,GAAG,AACrB,CAAC"}`
};
var Input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { messageList } = $$props;
  let { timer = 0 } = $$props;
  let { chatName } = $$props;
  let { fileName } = $$props;
  let { theme = "" } = $$props;
  let messageContent = "";
  createEventDispatcher();
  if ($$props.messageList === void 0 && $$bindings.messageList && messageList !== void 0)
    $$bindings.messageList(messageList);
  if ($$props.timer === void 0 && $$bindings.timer && timer !== void 0)
    $$bindings.timer(timer);
  if ($$props.chatName === void 0 && $$bindings.chatName && chatName !== void 0)
    $$bindings.chatName(chatName);
  if ($$props.fileName === void 0 && $$bindings.fileName && fileName !== void 0)
    $$bindings.fileName(fileName);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$7);
  return `<section id="${"inputArea"}" class="${"svelte-416q1l"}"><input id="${"textInput"}" class="${escape2(null_to_empty(theme)) + " svelte-416q1l"}"${add_attribute("value", messageContent, 0)}>
	<div id="${"submit"}" class="${"svelte-416q1l"}">
			<button class="${escape2(null_to_empty(theme)) + " svelte-416q1l"}" id="${"submitButton"}"><span id="${"sendButton"}" class="${"material-icons svelte-416q1l"}">send</span>
			Send
		</button>
		</div>
</section>`;
});
var css$6 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}p.deep-blue.svelte-13eug5w{color:white}div.deep-blue.toastMessage.svelte-13eug5w{background-color:#d9ddf2}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}p.deep-pink.svelte-13eug5w{color:white}div.deep-pink.toastMessage.svelte-13eug5w{background-color:#f2d9f2}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}p.soft-blue.svelte-13eug5w{color:black}div.soft-blue.toastMessage.svelte-13eug5w{background-color:#d9eaf2}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}p.soft-pink.svelte-13eug5w{color:black}div.soft-pink.toastMessage.svelte-13eug5w{background-color:#f2d9e6}p.svelte-13eug5w{border-radius:2px;padding:1em;height:min-content;margin:0 0 0.5em;width:fit-content;display:flex;flex-direction:column}.user.svelte-13eug5w{text-align:end;float:right;background-color:white;color:black}.theVoid.svelte-13eug5w{text-align:start;float:left;background-color:black;color:white}.timestamp.svelte-13eug5w{font-size:0.85em;text-align:right;border:none}",
  map: `{"version":3,"file":"Message.svelte","sources":["Message.svelte"],"sourcesContent":["<script lang='ts'>import { fade, fly } from 'svelte/transition';\\r\\nexport let message;\\r\\nexport let theme = '';\\r\\n// transition:fly='{{y:50}}'\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"timestamp {theme}\\">\\r\\n\\t<span class=\\"timestamp\\">{message.timestamp}</span>\\r\\n</div>\\r\\n<p \\r\\nclass={message.sender}\\r\\n>\\r\\n{message.content}</p>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\np {\\n  border-radius: 2px;\\n  padding: 1em;\\n  height: min-content;\\n  margin: 0 0 0.5em;\\n  width: fit-content;\\n  display: flex;\\n  flex-direction: column;\\n}\\n\\n.user {\\n  text-align: end;\\n  float: right;\\n  background-color: white;\\n  color: black;\\n}\\n\\n.theVoid {\\n  text-align: start;\\n  float: left;\\n  background-color: black;\\n  color: white;\\n}\\n\\n.timestamp {\\n  font-size: 0.85em;\\n  text-align: right;\\n  border: none;\\n}</style>"],"names":[],"mappings":"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"}`
};
var Message = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { message } = $$props;
  let { theme = "" } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$6);
  return `<div class="${"timestamp " + escape2(theme) + " svelte-13eug5w"}"><span class="${"timestamp svelte-13eug5w"}">${escape2(message.timestamp)}</span></div>
<p class="${escape2(null_to_empty(message.sender)) + " svelte-13eug5w"}">${escape2(message.content)}</p>`;
});
var css$5 = {
  code: 'html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}button.deep-blue.svelte-54ztiu{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}button.deep-pink.svelte-54ztiu{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}button.soft-blue.svelte-54ztiu{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}button.soft-pink.svelte-54ztiu{background-color:#e60073;color:white}#stash-component.svelte-54ztiu{display:grid;grid-template-areas:"top top top top" "middle middle middle middle" "stash-chat save-chat clear-stash clear-chat";justify-items:stretch;width:100%;min-height:50px;gap:5px}#toggle-button.svelte-54ztiu{grid-area:top}#name.svelte-54ztiu{grid-area:middle}#stash-chat.svelte-54ztiu{grid-area:stash-chat}#save-chat.svelte-54ztiu{grid-area:save-chat}#clear-stash.svelte-54ztiu{grid-area:clear-stash}#clear-chat.svelte-54ztiu{grid-area:clear-chat}',
  map: `{"version":3,"file":"Stash.svelte","sources":["Stash.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { browser } from '$app/env';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nif (browser) {\\r\\n    const appStorage = window.localStorage;\\r\\n}\\r\\nconst currentDate = new Date();\\r\\nlet dateString = currentDate.toDateString().replace(/\\\\s/g, \\"-\\");\\r\\nlet showStashSave = false;\\r\\nexport let chatName = \\"\\";\\r\\nexport let messageList;\\r\\nexport let theme = '';\\r\\nconst toggle = (stashToggle) => {\\r\\n    stashToggle = !stashToggle;\\r\\n    console.log(stashToggle);\\r\\n    return stashToggle;\\r\\n};\\r\\n<\/script>\\r\\n\\r\\n<aside id=\\"stash-component\\">\\r\\n\\t<div id=\\"toggle-button\\">\\r\\n\\t\\t<button\\r\\n\\t\\tclass={theme}\\r\\n\\t\\ton:click={() => {\\r\\n\\t\\t\\tshowStashSave = toggle(showStashSave);\\r\\n\\t\\t}}\\r\\n\\t\\t>\\r\\n\\t\\tChat Options\\r\\n\\t</button>\\r\\n</div>\\r\\n{#if showStashSave == true}\\r\\n<input\\r\\nclass={theme}\\r\\nid=\\"name\\"\\r\\nplaceholder=\\"Name this chat, please c:\\"\\r\\nbind:value={chatName}\\r\\n/>\\r\\n{#if browser}\\r\\n<div id=\\"stash-chat\\">\\r\\n\\t<button\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tHelpers.stashChat(window.localStorage, chatName, messageList);\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Stash Chat</span>\\r\\n</button>\\r\\n</div>\\r\\n<div id=\\"save-chat\\">\\r\\n\\t<button\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tHelpers.saveChat(chatName, messageList);\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Save Chat</span>\\r\\n</button>\\r\\n</div>\\r\\n<div id=\\"clear-stash\\">\\r\\n\\t<button\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tHelpers.clearStash(window.localStorage);\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Clear Stash</span>\\r\\n</button>\\r\\n</div>\\r\\n{/if}\\r\\n<div id=\\"clear-chat\\">\\r\\n\\t<button\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tmessageList = []\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Clear Chat</span>\\r\\n</button>\\r\\n</div>\\r\\n{/if}\\r\\n</aside>\\r\\n\\r\\n<style lang=\\"scss\\">:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\n#stash-component {\\n  display: grid;\\n  grid-template-areas: \\"top top top top\\" \\"middle middle middle middle\\" \\"stash-chat save-chat clear-stash clear-chat\\";\\n  justify-items: stretch;\\n  width: 100%;\\n  min-height: 50px;\\n  gap: 5px;\\n}\\n\\n#toggle-button {\\n  grid-area: top;\\n}\\n\\n#name {\\n  grid-area: middle;\\n}\\n\\n#stash-chat {\\n  grid-area: stash-chat;\\n}\\n\\n#save-chat {\\n  grid-area: save-chat;\\n}\\n\\n#clear-stash {\\n  grid-area: clear-stash;\\n}\\n\\n#clear-chat {\\n  grid-area: clear-chat;\\n}</style>\\r\\n"],"names":[],"mappings":"AAiF2B,cAAc,AAAE,CAAC,AAC1C,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACzQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAC3Q,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAEO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBD,MAAM,UAAU,cAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,gBAAgB,cAAC,CAAC,AAChB,OAAO,CAAE,IAAI,CACb,mBAAmB,CAAE,iBAAiB,CAAC,6BAA6B,CAAC,6CAA6C,CAClH,aAAa,CAAE,OAAO,CACtB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IAAI,CAChB,GAAG,CAAE,GAAG,AACV,CAAC,AAED,cAAc,cAAC,CAAC,AACd,SAAS,CAAE,GAAG,AAChB,CAAC,AAED,KAAK,cAAC,CAAC,AACL,SAAS,CAAE,MAAM,AACnB,CAAC,AAED,WAAW,cAAC,CAAC,AACX,SAAS,CAAE,UAAU,AACvB,CAAC,AAED,UAAU,cAAC,CAAC,AACV,SAAS,CAAE,SAAS,AACtB,CAAC,AAED,YAAY,cAAC,CAAC,AACZ,SAAS,CAAE,WAAW,AACxB,CAAC,AAED,WAAW,cAAC,CAAC,AACX,SAAS,CAAE,UAAU,AACvB,CAAC"}`
};
var Stash = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const currentDate = new Date();
  currentDate.toDateString().replace(/\s/g, "-");
  let { chatName = "" } = $$props;
  let { messageList } = $$props;
  let { theme = "" } = $$props;
  if ($$props.chatName === void 0 && $$bindings.chatName && chatName !== void 0)
    $$bindings.chatName(chatName);
  if ($$props.messageList === void 0 && $$bindings.messageList && messageList !== void 0)
    $$bindings.messageList(messageList);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$5);
  return `<aside id="${"stash-component"}" class="${"svelte-54ztiu"}"><div id="${"toggle-button"}" class="${"svelte-54ztiu"}"><button class="${escape2(null_to_empty(theme)) + " svelte-54ztiu"}">Chat Options
	</button></div>
${``}
</aside>`;
});
var css$4 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}button#menuButton.deep-blue.svelte-1e8u23x.svelte-1e8u23x{color:white}nav.deep-blue.svelte-1e8u23x.svelte-1e8u23x{background-color:black}nav.deep-blue.svelte-1e8u23x a.svelte-1e8u23x{color:#99aaff}span.deep-blue.timestamp.svelte-1e8u23x.svelte-1e8u23x{color:white}button.deep-blue.svelte-1e8u23x.svelte-1e8u23x{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}button#menuButton.deep-pink.svelte-1e8u23x.svelte-1e8u23x{color:white}nav.deep-pink.svelte-1e8u23x.svelte-1e8u23x{background-color:black}nav.deep-pink.svelte-1e8u23x a.svelte-1e8u23x{color:#ff99ff}span.deep-pink.timestamp.svelte-1e8u23x.svelte-1e8u23x{color:white}button.deep-pink.svelte-1e8u23x.svelte-1e8u23x{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}button#menuButton.soft-blue.svelte-1e8u23x.svelte-1e8u23x{color:black}nav.soft-blue.svelte-1e8u23x.svelte-1e8u23x{background-color:white}nav.soft-blue.svelte-1e8u23x a.svelte-1e8u23x{color:#001a99}span.soft-blue.timestamp.svelte-1e8u23x.svelte-1e8u23x{color:black}button.soft-blue.svelte-1e8u23x.svelte-1e8u23x{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}button#menuButton.soft-pink.svelte-1e8u23x.svelte-1e8u23x{color:black}nav.soft-pink.svelte-1e8u23x.svelte-1e8u23x{background-color:white}nav.soft-pink.svelte-1e8u23x a.svelte-1e8u23x{color:#990000}span.soft-pink.timestamp.svelte-1e8u23x.svelte-1e8u23x{color:black}button.soft-pink.svelte-1e8u23x.svelte-1e8u23x{background-color:#e60073;color:white}nav.svelte-1e8u23x.svelte-1e8u23x,button.svelte-1e8u23x.svelte-1e8u23x{bottom:2vh;left:2vw;position:fixed;z-index:10;padding:0 5vw}#menuButton.svelte-1e8u23x.svelte-1e8u23x{left:0px;background:none;border:none;z-index:20;margin:none}#menuButtonText.svelte-1e8u23x.svelte-1e8u23x{vertical-align:top}nav.svelte-1e8u23x.svelte-1e8u23x{bottom:0vh;display:flex;flex-direction:column-reverse;height:100%;left:0px;line-height:2;margin:0;padding:0 5vw 10vh;text-align:left;width:5rem}ul.svelte-1e8u23x.svelte-1e8u23x{list-style:none;padding:0}li.svelte-1e8u23x.svelte-1e8u23x{text-decoration:none;list-style:none}@media(max-width: 500px){nav.svelte-1e8u23x.svelte-1e8u23x{min-width:30%}}@media(min-width: 1000px){nav.svelte-1e8u23x.svelte-1e8u23x{max-width:10%}}",
  map: `{"version":3,"file":"Menu.svelte","sources":["Menu.svelte"],"sourcesContent":["<script lang='ts'>import { fly } from 'svelte/transition';\\r\\nexport let theme = '';\\r\\nlet flyoutStatus = false;\\r\\n<\/script>\\r\\n\\r\\n<button\\r\\nid='menuButton'\\r\\nclass={theme}\\r\\non:click=\\"{() => flyoutStatus = !flyoutStatus}\\"\\r\\n>\\r\\n<span class='material-icons {theme}'>menu</span>\\r\\n<span class={theme} id='menuButtonText'>Menu</span>\\r\\n</button>\\r\\n\\r\\n{#if flyoutStatus}\\r\\n<nav\\r\\ntransition:fly='{{duration: 300, x: -200}}'\\r\\nclass={theme}>\\r\\n<ul>\\r\\n\\t<li>\\r\\n\\t\\t<a href=\\"/\\">Chat</a>\\r\\n\\t</li>\\r\\n\\t<li>\\r\\n\\t\\t<a href=\\"/settings\\">Settings</a>\\r\\n\\t</li>\\r\\n</ul>\\r\\n</nav>\\r\\n{/if}\\r\\n\\r\\n<style lang=\\"scss\\">:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nnav, button {\\n  bottom: 2vh;\\n  left: 2vw;\\n  position: fixed;\\n  z-index: 10;\\n  padding: 0 5vw;\\n}\\n\\n#menuButton {\\n  left: 0px;\\n  background: none;\\n  border: none;\\n  z-index: 20;\\n  margin: none;\\n}\\n\\n#menuButtonText {\\n  vertical-align: top;\\n}\\n\\nnav {\\n  bottom: 0vh;\\n  display: flex;\\n  flex-direction: column-reverse;\\n  height: 100%;\\n  left: 0px;\\n  line-height: 2;\\n  margin: 0;\\n  padding: 0 5vw 10vh;\\n  text-align: left;\\n  width: 5rem;\\n}\\n\\nul {\\n  list-style: none;\\n  padding: 0;\\n}\\n\\nli {\\n  text-decoration: none;\\n  list-style: none;\\n}\\n\\n@media (max-width: 500px) {\\n  nav {\\n    min-width: 30%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  nav {\\n    max-width: 10%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
};
var Menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { theme = "" } = $$props;
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$4);
  return `<button id="${"menuButton"}" class="${escape2(null_to_empty(theme)) + " svelte-1e8u23x"}"><span class="${"material-icons " + escape2(theme) + " svelte-1e8u23x"}">menu</span>
<span class="${escape2(null_to_empty(theme)) + " svelte-1e8u23x"}" id="${"menuButtonText"}">Menu</span></button>

${``}`;
});
var css$3 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}div.deep-blue.toastMessage.svelte-a0gv4k{background-color:#d9ddf2}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}div.deep-pink.toastMessage.svelte-a0gv4k{background-color:#f2d9f2}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}div.soft-blue.toastMessage.svelte-a0gv4k{background-color:#d9eaf2}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}div.soft-pink.toastMessage.svelte-a0gv4k{background-color:#f2d9e6}#toastContainer.svelte-a0gv4k{position:absolute;transform:translateX(50%);top:1vh;left:0px;overflow:visible;height:2vh;margin:auto;width:50%}.toastMessage.svelte-a0gv4k{background-color:white;height:3em;width:10em;border:thin solid grey;border-radius:2px;padding:1em;height:min-content;margin:auto;text-align:center;color:black}",
  map: `{"version":3,"file":"Toast.svelte","sources":["Toast.svelte"],"sourcesContent":["<script lang='ts'>import { toastStore } from './ts/toastStore';\\r\\nimport { browser } from '$app/env';\\r\\nimport { onMount } from 'svelte';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport { fly, fade, slide } from 'svelte/transition';\\r\\nexport let theme = '';\\r\\nlet currentToastQueue;\\r\\nlet currentToast;\\r\\nlet index = 0;\\r\\nlet toasterOccupied = false;\\r\\ntoastStore.subscribe((toastQueue) => {\\r\\n    if (toastQueue) {\\r\\n        // console.log(toastQueue)\\r\\n        currentToastQueue = toastQueue;\\r\\n        // let popup = toastQueue[toastQueue.length - 1]\\r\\n        // duration = popup?.duration\\r\\n        // toast = popup?.message\\r\\n        // console.log(popup)\\r\\n    }\\r\\n});\\r\\nfunction serveToast(toast) {\\r\\n    toasterOccupied = true;\\r\\n    console.log('now serving');\\r\\n    currentToast = currentToastQueue.filter(slice => toast.id == slice.id)[0];\\r\\n    let index = currentToastQueue.indexOf(toast);\\r\\n    setTimeout(() => {\\r\\n        console.log('loading next toast');\\r\\n        // toast = currentToast[0].message\\r\\n        currentToastQueue = currentToastQueue.filter(slice => toast.id !== slice.id);\\r\\n        toastStore.update(() => {\\r\\n            return currentToastQueue;\\r\\n        });\\r\\n        toasterOccupied = false;\\r\\n    }, currentToast.duration * 2);\\r\\n    return toast.message;\\r\\n}\\r\\n<\/script>\\r\\n\\r\\n\\r\\n{#if currentToastQueue?.length > 0}\\r\\n<div out:fade='{{duration:200}}' class={theme} id='toastContainer'>\\r\\n\\t<!-- {serveToast()} -->\\r\\n\\t{#each currentToastQueue as toast}\\r\\n\\t{#if !toasterOccupied}\\r\\n\\t<div class='toastMessage {theme}'\\r\\n\\tin:fly='{{duration: 300, y: -100}}'\\r\\n\\tout:fade='{{duration:200}}'\\r\\n\\t>\\r\\n\\t\\t{serveToast(toast)}\\r\\n\\t</div>\\r\\n\\t{/if}\\r\\n\\t{/each}\\r\\n</div>\\r\\n\\t{/if}\\r\\n\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\n#toastContainer {\\n  position: absolute;\\n  transform: translateX(50%);\\n  top: 1vh;\\n  left: 0px;\\n  overflow: visible;\\n  height: 2vh;\\n  margin: auto;\\n  width: 50%;\\n}\\n\\n.toastMessage {\\n  background-color: white;\\n  height: 3em;\\n  width: 10em;\\n  border: thin solid grey;\\n  border-radius: 2px;\\n  padding: 1em;\\n  height: min-content;\\n  margin: auto;\\n  text-align: center;\\n  color: black;\\n}</style>"],"names":[],"mappings":"AAwD2B,cAAc,AAAE,CAAC,AAC1C,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACzQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBD,GAAG,UAAU,aAAa,cAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAOO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAC3Q,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBD,GAAG,UAAU,aAAa,cAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAOO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBD,GAAG,UAAU,aAAa,cAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAOO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBD,GAAG,UAAU,aAAa,cAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAOD,eAAe,cAAC,CAAC,AACf,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,WAAW,GAAG,CAAC,CAC1B,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,QAAQ,CAAE,OAAO,CACjB,MAAM,CAAE,GAAG,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,GAAG,AACZ,CAAC,AAED,aAAa,cAAC,CAAC,AACb,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CAAC,KAAK,CAAC,IAAI,CACvB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WAAW,CACnB,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,KAAK,AACd,CAAC"}`
};
var Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { theme = "" } = $$props;
  let currentToastQueue;
  let currentToast;
  let toasterOccupied = false;
  toastStore.subscribe((toastQueue) => {
    if (toastQueue) {
      currentToastQueue = toastQueue;
    }
  });
  function serveToast(toast) {
    toasterOccupied = true;
    console.log("now serving");
    currentToast = currentToastQueue.filter((slice) => toast.id == slice.id)[0];
    currentToastQueue.indexOf(toast);
    setTimeout(() => {
      console.log("loading next toast");
      currentToastQueue = currentToastQueue.filter((slice) => toast.id !== slice.id);
      toastStore.update(() => {
        return currentToastQueue;
      });
      toasterOccupied = false;
    }, currentToast.duration * 2);
    return toast.message;
  }
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$3);
  return `${(currentToastQueue == null ? void 0 : currentToastQueue.length) > 0 ? `<div class="${escape2(null_to_empty(theme)) + " svelte-a0gv4k"}" id="${"toastContainer"}">
	${each(currentToastQueue, (toast) => `${!toasterOccupied ? `<div class="${"toastMessage " + escape2(theme) + " svelte-a0gv4k"}">${escape2(serveToast(toast))}
	</div>` : ``}`)}</div>` : ``}`;
});
var css$2 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}div.deep-blue.toastMessage.svelte-1g4s2t1{background-color:#d9ddf2}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}div.deep-pink.toastMessage.svelte-1g4s2t1{background-color:#f2d9f2}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}div.soft-blue.toastMessage.svelte-1g4s2t1{background-color:#d9eaf2}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}div.soft-pink.toastMessage.svelte-1g4s2t1{background-color:#f2d9e6}",
  map: `{"version":3,"file":"ThemeSwitcher.svelte","sources":["ThemeSwitcher.svelte"],"sourcesContent":["<script lang='ts'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport themeStore from './ts/themeStore';\\r\\nimport { browser } from '$app/env';\\r\\nimport { onMount } from 'svelte';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport Toast from './Toast.svelte';\\r\\nlet themes = ['deep-blue',\\r\\n    'deep-pink',\\r\\n    'soft-blue',\\r\\n    'soft-pink'\\r\\n];\\r\\nexport let theme = '';\\r\\nlet appStorage;\\r\\nlet listener;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    listener = Helpers.fetchTheme(appStorage, themeStore, 'listener');\\r\\n    themeStore.subscribe((newTheme) => {\\r\\n        theme = newTheme;\\r\\n    });\\r\\n}));\\r\\n<\/script>\\r\\n\\r\\n<div class={theme}>\\r\\n\\t{#if browser}\\r\\n\\t<p>current theme: {theme.replace('-', ' ')}</p>\\r\\n\\t<button on:click={() => Helpers.updateTheme(window.localStorage, theme)}>\\r\\n\\t\\t<span>Switch Theme</span>\\r\\n\\t</button>\\r\\n\\t<p>current listener: {listener}</p>\\r\\n\\t<button on:click={() => listener = Helpers.updateListener(window.localStorage, listener)}>\\r\\n\\t\\t<span>Switch Listener</span>\\r\\n\\t</button>\\r\\n\\t{/if}\\r\\n\\t<Toast {theme}></Toast>\\r\\n</div>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}</style>"],"names":[],"mappings":"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"}`
};
var ThemeSwitcher = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { theme = "" } = $$props;
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$2);
  return `<div class="${escape2(null_to_empty(theme)) + " svelte-1g4s2t1"}">${``}
	${validate_component(Toast, "Toast").$$render($$result, { theme }, {}, {})}
</div>`;
});
var css$1 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.svelte-db4yyq.svelte-db4yyq{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}#messages.svelte-db4yyq.svelte-db4yyq{display:flex;flex-direction:column-reverse;height:75vh;min-height:1px;overflow:scroll;-webkit-mask-image:linear-gradient(to top, black 0%, transparent 80%);mask-image:linear-gradient(to top, black 0%, transparent 80%);scrollbar-width:none}#animatedList.svelte-db4yyq.svelte-db4yyq{display:flex;flex-direction:column}#animatedList.svelte-db4yyq>p.svelte-db4yyq{color:white}#messages.svelte-db4yyq.svelte-db4yyq::-webkit-scrollbar{display:none}@media(min-width: 500px){main.svelte-db4yyq.svelte-db4yyq{max-width:60%}}@media(min-width: 1000px){main.svelte-db4yyq.svelte-db4yyq{max-width:30%}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space</title>\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Input from '../components/Input.svelte';\\r\\nimport Message from '../components/Message.svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport ThemeSwitcher from '../components/ThemeSwitcher.svelte';\\r\\nimport themeStore from '../components/ts/themeStore';\\r\\nimport Toast from '../components/Toast.svelte';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nlet theme = 'soft-blue';\\r\\nlet date = new Date();\\r\\nexport let messageList = [], timer = 8;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    try {\\r\\n        let stash = JSON.parse(appStorage.getItem('chats'));\\r\\n        messageList = stash || messageList;\\r\\n        console.log(stash);\\r\\n    }\\r\\n    catch (error) {\\r\\n        console.warn(error);\\r\\n    }\\r\\n    Helpers.setListenerOpacity(100);\\r\\n}));\\r\\n// export let name: string;\\r\\nlet chatName = '';\\r\\nlet fileName = '';\\r\\nconst removeMessage = (list) => {\\r\\n    console.log(list);\\r\\n    switch (list.length > 0) {\\r\\n        case true:\\r\\n            return list.slice(0, -1);\\r\\n        case false:\\r\\n        default:\\r\\n            return list;\\r\\n    }\\r\\n};\\r\\nconst responses = [\`I'm just here to listen. :)\`,\\r\\n    \`Your feelings are valid. Keep talking. It's okay.\`,\\r\\n    'Keep going. :)',\\r\\n    '*nods* Okay...'\\r\\n];\\r\\nlet voidFlag = 0;\\r\\nconst voidResponse = (timer, listofResponses, messages, voidFlag, innerVoidFlag) => {\\r\\n    if (voidFlag !== innerVoidFlag) {\\r\\n        return messageList;\\r\\n    }\\r\\n    switch (timer) {\\r\\n        case (8):\\r\\n            break;\\r\\n        case (0):\\r\\n            let multiplier = Math.random();\\r\\n            let index = (100 * multiplier) % 4;\\r\\n            index = Math.floor(index);\\r\\n            console.log(listofResponses[index]);\\r\\n            let date = new Date();\\r\\n            let localTime = date.toLocaleTimeString();\\r\\n            let localDate = date.toLocaleDateString()\\r\\n                .split('/')\\r\\n                .reverse()\\r\\n                .join('.');\\r\\n            messageList = [...messages,\\r\\n                { content: listofResponses[index],\\r\\n                    sender: 'theVoid',\\r\\n                    timestamp: \`\${localDate} - \${localTime}\`\\r\\n                }\\r\\n            ];\\r\\n            voidFlag = 0;\\r\\n            timer = 8;\\r\\n            return messageList;\\r\\n        default:\\r\\n            voidFlag = 1;\\r\\n            setTimeout(() => {\\r\\n                console.log('void called');\\r\\n                timer = timer - 1;\\r\\n                voidResponse(timer, listofResponses, messages, voidFlag, 1);\\r\\n            }, 1000);\\r\\n    }\\r\\n};\\r\\nconst invokeVoid = (event) => {\\r\\n    console.log(event);\\r\\n    messageList = voidResponse(timer, responses, messageList, voidFlag, voidFlag);\\r\\n};\\r\\n// setInterval(function() {\\r\\n// \\tmessageList = removeMessage(messageList)\\r\\n// }.bind(messageList),\\r\\n// \\t3000)\\r\\n<\/script>\\r\\n\\t\\r\\n\\t<Menu {theme}></Menu>\\r\\n\\t\\r\\n\\t<main class={theme}>\\r\\n\\t\\t<div id='messages'>\\r\\n\\t\\t\\t<section id='animatedList'>\\r\\n\\t\\t\\t\\t{#if messageList.length !== 0}\\r\\n\\t\\t\\t\\t{#each messageList as message}\\r\\n\\t\\t\\t\\t<span\\r\\n\\t\\t\\t\\ttransition:slide='{{ duration: 200 }}'>\\r\\n\\t\\t\\t\\t<Message {theme} {message}></Message>\\r\\n\\t\\t\\t</span>\\r\\n\\t\\t\\t{/each}\\r\\n\\t\\t\\t{:else}\\r\\n\\t\\t\\t<p transition:fade|local>Talk to me.</p>\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t</section>\\r\\n\\t</div>\\r\\n\\t<Input\\r\\n\\t{theme}\\r\\n\\ton:click='{()=> {\\r\\n\\t\\tconsole.log('click')\\r\\n}}'\\r\\n\\ton:voidInvoked='{invokeVoid.bind(timer,responses,messageList)}'\\r\\n\\tbind:messageList\\r\\n\\tbind:timer\\r\\n\\tbind:chatName\\r\\n\\tbind:fileName></Input>\\r\\n\\t<Stash\\r\\n\\t{theme}\\r\\n\\tbind:messageList\\r\\n\\tbind:chatName></Stash>\\r\\n\\t\\r\\n<Toast {theme}></Toast>\\r\\n\\t\\r\\n\\t\\r\\n</main>\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  /* min-width: 400px; */\\n  max-width: 85%;\\n  /* width:100px; */\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\n#messages {\\n  display: flex;\\n  /* align-items:flex-end; */\\n  flex-direction: column-reverse;\\n  /* justify-content: flex-end; */\\n  height: 75vh;\\n  min-height: 1px;\\n  overflow: scroll;\\n  -webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);\\n  mask-image: linear-gradient(to top, black 0%, transparent 80%);\\n  scrollbar-width: none;\\n  /* border: thin solid white; */\\n}\\n\\n#animatedList {\\n  display: flex;\\n  flex-direction: column;\\n}\\n\\n#animatedList > p {\\n  color: white;\\n}\\n\\n#messages::-webkit-scrollbar {\\n  display: none;\\n}\\n\\n/* h1 {\\n\\tcolor: #fff;\\n\\ttext-transform: lowercase;\\n\\tfont-size: 3em;\\n\\tfont-weight: 600;\\n} */\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let theme = "soft-blue";
  let { messageList = [], timer = 8 } = $$props;
  let chatName = "";
  let fileName = "";
  if ($$props.messageList === void 0 && $$bindings.messageList && messageList !== void 0)
    $$bindings.messageList(messageList);
  if ($$props.timer === void 0 && $$bindings.timer && timer !== void 0)
    $$bindings.timer(timer);
  $$result.css.add(css$1);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>a softer space</title>`, ""}`, ""}


	
	${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}
	
	<main class="${escape2(null_to_empty(theme)) + " svelte-db4yyq"}"><div id="${"messages"}" class="${"svelte-db4yyq"}"><section id="${"animatedList"}" class="${"svelte-db4yyq"}">${messageList.length !== 0 ? `${each(messageList, (message) => `<span>${validate_component(Message, "Message").$$render($$result, { theme, message }, {}, {})}
			</span>`)}` : `<p class="${"svelte-db4yyq"}">Talk to me.</p>`}</section></div>
	${validate_component(Input, "Input").$$render($$result, {
      theme,
      messageList,
      timer,
      chatName,
      fileName
    }, {
      messageList: ($$value) => {
        messageList = $$value;
        $$settled = false;
      },
      timer: ($$value) => {
        timer = $$value;
        $$settled = false;
      },
      chatName: ($$value) => {
        chatName = $$value;
        $$settled = false;
      },
      fileName: ($$value) => {
        fileName = $$value;
        $$settled = false;
      }
    }, {})}
	${validate_component(Stash, "Stash").$$render($$result, { theme, messageList, chatName }, {
      messageList: ($$value) => {
        messageList = $$value;
        $$settled = false;
      },
      chatName: ($$value) => {
        chatName = $$value;
        $$settled = false;
      }
    }, {})}
	
${validate_component(Toast, "Toast").$$render($$result, { theme }, {}, {})}
	
	
</main>`;
  } while (!$$settled);
  return $$rendered;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var css = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.svelte-rn813p{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}@media(min-width: 500px){main.svelte-rn813p{max-width:60%}}@media(min-width: 1000px){main.svelte-rn813p{max-width:30%}}",
  map: `{"version":3,"file":"settings.svelte","sources":["settings.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space :: settings</title>\\r\\n\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch.js\\"><\/script> -->\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch2.js\\"><\/script> -->\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport ThemeSwitcher from '../components/ThemeSwitcher.svelte';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nlet date = new Date();\\r\\nexport let theme = '';\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    Helpers.setListenerOpacity(25);\\r\\n}));\\r\\n// export let name: string;\\r\\n<\/script>\\r\\n\\r\\n<Menu {theme}></Menu>\\r\\n\\r\\n\\r\\n<main class={theme}>\\r\\n\\t<ThemeSwitcher bind:theme></ThemeSwitcher>\\r\\n\\t<section id=\\"p5Sketch\\"></section>\\r\\n\\t<section id=\\"p5Sketch2\\"></section>\\r\\n</main>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue {\\n  color: white;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\np.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink {\\n  color: white;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\np.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue {\\n  color: black;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\np.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink {\\n  color: black;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\np.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  /* min-width: 400px; */\\n  max-width: 85%;\\n  /* width:100px; */\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\n/* h1 {\\n\\tcolor: #fff;\\n\\ttext-transform: lowercase;\\n\\tfont-size: 3em;\\n\\tfont-weight: 600;\\n} */\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
};
var Settings = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  let { theme = "" } = $$props;
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>a softer space :: settings</title>`, ""}`, ""}



${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}


<main class="${escape2(null_to_empty(theme)) + " svelte-rn813p"}">${validate_component(ThemeSwitcher, "ThemeSwitcher").$$render($$result, { theme }, {
      theme: ($$value) => {
        theme = $$value;
        $$settled = false;
      }
    }, {})}
	<section id="${"p5Sketch"}"></section>
	<section id="${"p5Sketch2"}"></section>
</main>`;
  } while (!$$settled);
  return $$rendered;
});
var settings = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Settings
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const type = headers["content-type"];
  const rawBody = type && isContentTypeTextual(type) ? isBase64Encoded ? Buffer.from(body, "base64").toString() : body : new TextEncoder("base64").encode(body);
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
