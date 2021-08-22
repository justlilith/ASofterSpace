var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// node_modules/@sveltejs/kit/dist/install-fetch.js
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
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
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
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob2, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob2 = class {
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
          } else if (element instanceof Blob2) {
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
        const blob = new Blob2([], { type: String(type).toLowerCase() });
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
    Object.defineProperties(Blob2.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob2;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
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
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
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
    clone = (instance, highWaterMark) => {
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
    extractContentType = (body, request) => {
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
    getTotalBytes = (request) => {
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
    writeToStream = (dest, { body }) => {
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
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
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
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
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
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
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
    getNodeRequestOptions = (request) => {
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
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/@supabase/supabase-js/dist/main/lib/version.js
var require_version = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/lib/version.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = void 0;
    exports.version = "1.22.2";
  }
});

// node_modules/@supabase/supabase-js/dist/main/lib/constants.js
var require_constants = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/lib/constants.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_HEADERS = void 0;
    var version_1 = require_version();
    exports.DEFAULT_HEADERS = { "X-Client-Info": `supabase-js/${version_1.version}` };
  }
});

// node_modules/node-fetch/lib/index.js
var require_lib = __commonJS({
  "node_modules/node-fetch/lib/index.js"(exports, module2) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var Stream2 = _interopDefault(require("stream"));
    var http2 = _interopDefault(require("http"));
    var Url = _interopDefault(require("url"));
    var https2 = _interopDefault(require("https"));
    var zlib2 = _interopDefault(require("zlib"));
    var Readable2 = Stream2.Readable;
    var BUFFER = Symbol("buffer");
    var TYPE = Symbol("type");
    var Blob3 = class {
      constructor() {
        this[TYPE] = "";
        const blobParts = arguments[0];
        const options2 = arguments[1];
        const buffers = [];
        let size = 0;
        if (blobParts) {
          const a = blobParts;
          const length = Number(a.length);
          for (let i = 0; i < length; i++) {
            const element = a[i];
            let buffer;
            if (element instanceof Buffer) {
              buffer = element;
            } else if (ArrayBuffer.isView(element)) {
              buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
            } else if (element instanceof ArrayBuffer) {
              buffer = Buffer.from(element);
            } else if (element instanceof Blob3) {
              buffer = element[BUFFER];
            } else {
              buffer = Buffer.from(typeof element === "string" ? element : String(element));
            }
            size += buffer.length;
            buffers.push(buffer);
          }
        }
        this[BUFFER] = Buffer.concat(buffers);
        let type = options2 && options2.type !== void 0 && String(options2.type).toLowerCase();
        if (type && !/[^\u0020-\u007E]/.test(type)) {
          this[TYPE] = type;
        }
      }
      get size() {
        return this[BUFFER].length;
      }
      get type() {
        return this[TYPE];
      }
      text() {
        return Promise.resolve(this[BUFFER].toString());
      }
      arrayBuffer() {
        const buf = this[BUFFER];
        const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        return Promise.resolve(ab);
      }
      stream() {
        const readable = new Readable2();
        readable._read = function() {
        };
        readable.push(this[BUFFER]);
        readable.push(null);
        return readable;
      }
      toString() {
        return "[object Blob]";
      }
      slice() {
        const size = this.size;
        const start = arguments[0];
        const end = arguments[1];
        let relativeStart, relativeEnd;
        if (start === void 0) {
          relativeStart = 0;
        } else if (start < 0) {
          relativeStart = Math.max(size + start, 0);
        } else {
          relativeStart = Math.min(start, size);
        }
        if (end === void 0) {
          relativeEnd = size;
        } else if (end < 0) {
          relativeEnd = Math.max(size + end, 0);
        } else {
          relativeEnd = Math.min(end, size);
        }
        const span = Math.max(relativeEnd - relativeStart, 0);
        const buffer = this[BUFFER];
        const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
        const blob = new Blob3([], { type: arguments[2] });
        blob[BUFFER] = slicedBuffer;
        return blob;
      }
    };
    Object.defineProperties(Blob3.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Object.defineProperty(Blob3.prototype, Symbol.toStringTag, {
      value: "Blob",
      writable: false,
      enumerable: false,
      configurable: true
    });
    function FetchError2(message, type, systemError) {
      Error.call(this, message);
      this.message = message;
      this.type = type;
      if (systemError) {
        this.code = this.errno = systemError.code;
      }
      Error.captureStackTrace(this, this.constructor);
    }
    FetchError2.prototype = Object.create(Error.prototype);
    FetchError2.prototype.constructor = FetchError2;
    FetchError2.prototype.name = "FetchError";
    var convert;
    try {
      convert = require("encoding").convert;
    } catch (e) {
    }
    var INTERNALS2 = Symbol("Body internals");
    var PassThrough2 = Stream2.PassThrough;
    function Body2(body) {
      var _this = this;
      var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$size = _ref.size;
      let size = _ref$size === void 0 ? 0 : _ref$size;
      var _ref$timeout = _ref.timeout;
      let timeout = _ref$timeout === void 0 ? 0 : _ref$timeout;
      if (body == null) {
        body = null;
      } else if (isURLSearchParams(body)) {
        body = Buffer.from(body.toString());
      } else if (isBlob2(body))
        ;
      else if (Buffer.isBuffer(body))
        ;
      else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
        body = Buffer.from(body);
      } else if (ArrayBuffer.isView(body)) {
        body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
      } else if (body instanceof Stream2)
        ;
      else {
        body = Buffer.from(String(body));
      }
      this[INTERNALS2] = {
        body,
        disturbed: false,
        error: null
      };
      this.size = size;
      this.timeout = timeout;
      if (body instanceof Stream2) {
        body.on("error", function(err) {
          const error3 = err.name === "AbortError" ? err : new FetchError2(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
          _this[INTERNALS2].error = error3;
        });
      }
    }
    Body2.prototype = {
      get body() {
        return this[INTERNALS2].body;
      },
      get bodyUsed() {
        return this[INTERNALS2].disturbed;
      },
      arrayBuffer() {
        return consumeBody2.call(this).then(function(buf) {
          return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        });
      },
      blob() {
        let ct = this.headers && this.headers.get("content-type") || "";
        return consumeBody2.call(this).then(function(buf) {
          return Object.assign(new Blob3([], {
            type: ct.toLowerCase()
          }), {
            [BUFFER]: buf
          });
        });
      },
      json() {
        var _this2 = this;
        return consumeBody2.call(this).then(function(buffer) {
          try {
            return JSON.parse(buffer.toString());
          } catch (err) {
            return Body2.Promise.reject(new FetchError2(`invalid json response body at ${_this2.url} reason: ${err.message}`, "invalid-json"));
          }
        });
      },
      text() {
        return consumeBody2.call(this).then(function(buffer) {
          return buffer.toString();
        });
      },
      buffer() {
        return consumeBody2.call(this);
      },
      textConverted() {
        var _this3 = this;
        return consumeBody2.call(this).then(function(buffer) {
          return convertBody(buffer, _this3.headers);
        });
      }
    };
    Object.defineProperties(Body2.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    Body2.mixIn = function(proto) {
      for (const name of Object.getOwnPropertyNames(Body2.prototype)) {
        if (!(name in proto)) {
          const desc = Object.getOwnPropertyDescriptor(Body2.prototype, name);
          Object.defineProperty(proto, name, desc);
        }
      }
    };
    function consumeBody2() {
      var _this4 = this;
      if (this[INTERNALS2].disturbed) {
        return Body2.Promise.reject(new TypeError(`body used already for: ${this.url}`));
      }
      this[INTERNALS2].disturbed = true;
      if (this[INTERNALS2].error) {
        return Body2.Promise.reject(this[INTERNALS2].error);
      }
      let body = this.body;
      if (body === null) {
        return Body2.Promise.resolve(Buffer.alloc(0));
      }
      if (isBlob2(body)) {
        body = body.stream();
      }
      if (Buffer.isBuffer(body)) {
        return Body2.Promise.resolve(body);
      }
      if (!(body instanceof Stream2)) {
        return Body2.Promise.resolve(Buffer.alloc(0));
      }
      let accum = [];
      let accumBytes = 0;
      let abort = false;
      return new Body2.Promise(function(resolve2, reject) {
        let resTimeout;
        if (_this4.timeout) {
          resTimeout = setTimeout(function() {
            abort = true;
            reject(new FetchError2(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, "body-timeout"));
          }, _this4.timeout);
        }
        body.on("error", function(err) {
          if (err.name === "AbortError") {
            abort = true;
            reject(err);
          } else {
            reject(new FetchError2(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, "system", err));
          }
        });
        body.on("data", function(chunk) {
          if (abort || chunk === null) {
            return;
          }
          if (_this4.size && accumBytes + chunk.length > _this4.size) {
            abort = true;
            reject(new FetchError2(`content size at ${_this4.url} over limit: ${_this4.size}`, "max-size"));
            return;
          }
          accumBytes += chunk.length;
          accum.push(chunk);
        });
        body.on("end", function() {
          if (abort) {
            return;
          }
          clearTimeout(resTimeout);
          try {
            resolve2(Buffer.concat(accum, accumBytes));
          } catch (err) {
            reject(new FetchError2(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, "system", err));
          }
        });
      });
    }
    function convertBody(buffer, headers) {
      if (typeof convert !== "function") {
        throw new Error("The package `encoding` must be installed to use the textConverted() function");
      }
      const ct = headers.get("content-type");
      let charset = "utf-8";
      let res, str;
      if (ct) {
        res = /charset=([^;]*)/i.exec(ct);
      }
      str = buffer.slice(0, 1024).toString();
      if (!res && str) {
        res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
      }
      if (!res && str) {
        res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
        if (!res) {
          res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
          if (res) {
            res.pop();
          }
        }
        if (res) {
          res = /charset=(.*)/i.exec(res.pop());
        }
      }
      if (!res && str) {
        res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
      }
      if (res) {
        charset = res.pop();
        if (charset === "gb2312" || charset === "gbk") {
          charset = "gb18030";
        }
      }
      return convert(buffer, "UTF-8", charset).toString();
    }
    function isURLSearchParams(obj) {
      if (typeof obj !== "object" || typeof obj.append !== "function" || typeof obj.delete !== "function" || typeof obj.get !== "function" || typeof obj.getAll !== "function" || typeof obj.has !== "function" || typeof obj.set !== "function") {
        return false;
      }
      return obj.constructor.name === "URLSearchParams" || Object.prototype.toString.call(obj) === "[object URLSearchParams]" || typeof obj.sort === "function";
    }
    function isBlob2(obj) {
      return typeof obj === "object" && typeof obj.arrayBuffer === "function" && typeof obj.type === "string" && typeof obj.stream === "function" && typeof obj.constructor === "function" && typeof obj.constructor.name === "string" && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
    }
    function clone2(instance) {
      let p1, p2;
      let body = instance.body;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof Stream2 && typeof body.getBoundary !== "function") {
        p1 = new PassThrough2();
        p2 = new PassThrough2();
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS2].body = p1;
        body = p2;
      }
      return body;
    }
    function extractContentType2(body) {
      if (body === null) {
        return null;
      } else if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      } else if (isURLSearchParams(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      } else if (isBlob2(body)) {
        return body.type || null;
      } else if (Buffer.isBuffer(body)) {
        return null;
      } else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
        return null;
      } else if (ArrayBuffer.isView(body)) {
        return null;
      } else if (typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      } else if (body instanceof Stream2) {
        return null;
      } else {
        return "text/plain;charset=UTF-8";
      }
    }
    function getTotalBytes2(instance) {
      const body = instance.body;
      if (body === null) {
        return 0;
      } else if (isBlob2(body)) {
        return body.size;
      } else if (Buffer.isBuffer(body)) {
        return body.length;
      } else if (body && typeof body.getLengthSync === "function") {
        if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || body.hasKnownLength && body.hasKnownLength()) {
          return body.getLengthSync();
        }
        return null;
      } else {
        return null;
      }
    }
    function writeToStream2(dest, instance) {
      const body = instance.body;
      if (body === null) {
        dest.end();
      } else if (isBlob2(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    }
    Body2.Promise = global.Promise;
    var invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
    var invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
    function validateName(name) {
      name = `${name}`;
      if (invalidTokenRegex.test(name) || name === "") {
        throw new TypeError(`${name} is not a legal HTTP header name`);
      }
    }
    function validateValue(value) {
      value = `${value}`;
      if (invalidHeaderCharRegex.test(value)) {
        throw new TypeError(`${value} is not a legal HTTP header value`);
      }
    }
    function find(map, name) {
      name = name.toLowerCase();
      for (const key in map) {
        if (key.toLowerCase() === name) {
          return key;
        }
      }
      return void 0;
    }
    var MAP = Symbol("map");
    var Headers2 = class {
      constructor() {
        let init2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
        this[MAP] = Object.create(null);
        if (init2 instanceof Headers2) {
          const rawHeaders = init2.raw();
          const headerNames = Object.keys(rawHeaders);
          for (const headerName of headerNames) {
            for (const value of rawHeaders[headerName]) {
              this.append(headerName, value);
            }
          }
          return;
        }
        if (init2 == null)
          ;
        else if (typeof init2 === "object") {
          const method = init2[Symbol.iterator];
          if (method != null) {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            const pairs = [];
            for (const pair of init2) {
              if (typeof pair !== "object" || typeof pair[Symbol.iterator] !== "function") {
                throw new TypeError("Each header pair must be iterable");
              }
              pairs.push(Array.from(pair));
            }
            for (const pair of pairs) {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              this.append(pair[0], pair[1]);
            }
          } else {
            for (const key of Object.keys(init2)) {
              const value = init2[key];
              this.append(key, value);
            }
          }
        } else {
          throw new TypeError("Provided initializer must be an object");
        }
      }
      get(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key === void 0) {
          return null;
        }
        return this[MAP][key].join(", ");
      }
      forEach(callback) {
        let thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
        let pairs = getHeaders(this);
        let i = 0;
        while (i < pairs.length) {
          var _pairs$i = pairs[i];
          const name = _pairs$i[0], value = _pairs$i[1];
          callback.call(thisArg, value, name, this);
          pairs = getHeaders(this);
          i++;
        }
      }
      set(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        this[MAP][key !== void 0 ? key : name] = [value];
      }
      append(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          this[MAP][key].push(value);
        } else {
          this[MAP][name] = [value];
        }
      }
      has(name) {
        name = `${name}`;
        validateName(name);
        return find(this[MAP], name) !== void 0;
      }
      delete(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          delete this[MAP][key];
        }
      }
      raw() {
        return this[MAP];
      }
      keys() {
        return createHeadersIterator(this, "key");
      }
      values() {
        return createHeadersIterator(this, "value");
      }
      [Symbol.iterator]() {
        return createHeadersIterator(this, "key+value");
      }
    };
    Headers2.prototype.entries = Headers2.prototype[Symbol.iterator];
    Object.defineProperty(Headers2.prototype, Symbol.toStringTag, {
      value: "Headers",
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Headers2.prototype, {
      get: { enumerable: true },
      forEach: { enumerable: true },
      set: { enumerable: true },
      append: { enumerable: true },
      has: { enumerable: true },
      delete: { enumerable: true },
      keys: { enumerable: true },
      values: { enumerable: true },
      entries: { enumerable: true }
    });
    function getHeaders(headers) {
      let kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "key+value";
      const keys = Object.keys(headers[MAP]).sort();
      return keys.map(kind === "key" ? function(k) {
        return k.toLowerCase();
      } : kind === "value" ? function(k) {
        return headers[MAP][k].join(", ");
      } : function(k) {
        return [k.toLowerCase(), headers[MAP][k].join(", ")];
      });
    }
    var INTERNAL = Symbol("internal");
    function createHeadersIterator(target, kind) {
      const iterator = Object.create(HeadersIteratorPrototype);
      iterator[INTERNAL] = {
        target,
        kind,
        index: 0
      };
      return iterator;
    }
    var HeadersIteratorPrototype = Object.setPrototypeOf({
      next() {
        if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
          throw new TypeError("Value of `this` is not a HeadersIterator");
        }
        var _INTERNAL = this[INTERNAL];
        const target = _INTERNAL.target, kind = _INTERNAL.kind, index2 = _INTERNAL.index;
        const values = getHeaders(target, kind);
        const len = values.length;
        if (index2 >= len) {
          return {
            value: void 0,
            done: true
          };
        }
        this[INTERNAL].index = index2 + 1;
        return {
          value: values[index2],
          done: false
        };
      }
    }, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));
    Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
      value: "HeadersIterator",
      writable: false,
      enumerable: false,
      configurable: true
    });
    function exportNodeCompatibleHeaders(headers) {
      const obj = Object.assign({ __proto__: null }, headers[MAP]);
      const hostHeaderKey = find(headers[MAP], "Host");
      if (hostHeaderKey !== void 0) {
        obj[hostHeaderKey] = obj[hostHeaderKey][0];
      }
      return obj;
    }
    function createHeadersLenient(obj) {
      const headers = new Headers2();
      for (const name of Object.keys(obj)) {
        if (invalidTokenRegex.test(name)) {
          continue;
        }
        if (Array.isArray(obj[name])) {
          for (const val of obj[name]) {
            if (invalidHeaderCharRegex.test(val)) {
              continue;
            }
            if (headers[MAP][name] === void 0) {
              headers[MAP][name] = [val];
            } else {
              headers[MAP][name].push(val);
            }
          }
        } else if (!invalidHeaderCharRegex.test(obj[name])) {
          headers[MAP][name] = [obj[name]];
        }
      }
      return headers;
    }
    var INTERNALS$12 = Symbol("Response internals");
    var STATUS_CODES = http2.STATUS_CODES;
    var Response2 = class {
      constructor() {
        let body = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        Body2.call(this, body, opts);
        const status = opts.status || 200;
        const headers = new Headers2(opts.headers);
        if (body != null && !headers.has("Content-Type")) {
          const contentType = extractContentType2(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$12] = {
          url: opts.url,
          status,
          statusText: opts.statusText || STATUS_CODES[status],
          headers,
          counter: opts.counter
        };
      }
      get url() {
        return this[INTERNALS$12].url || "";
      }
      get status() {
        return this[INTERNALS$12].status;
      }
      get ok() {
        return this[INTERNALS$12].status >= 200 && this[INTERNALS$12].status < 300;
      }
      get redirected() {
        return this[INTERNALS$12].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$12].statusText;
      }
      get headers() {
        return this[INTERNALS$12].headers;
      }
      clone() {
        return new Response2(clone2(this), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected
        });
      }
    };
    Body2.mixIn(Response2.prototype);
    Object.defineProperties(Response2.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    Object.defineProperty(Response2.prototype, Symbol.toStringTag, {
      value: "Response",
      writable: false,
      enumerable: false,
      configurable: true
    });
    var INTERNALS$22 = Symbol("Request internals");
    var parse_url = Url.parse;
    var format_url = Url.format;
    var streamDestructionSupported = "destroy" in Stream2.Readable.prototype;
    function isRequest2(input) {
      return typeof input === "object" && typeof input[INTERNALS$22] === "object";
    }
    function isAbortSignal2(signal) {
      const proto = signal && typeof signal === "object" && Object.getPrototypeOf(signal);
      return !!(proto && proto.constructor.name === "AbortSignal");
    }
    var Request2 = class {
      constructor(input) {
        let init2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        let parsedURL;
        if (!isRequest2(input)) {
          if (input && input.href) {
            parsedURL = parse_url(input.href);
          } else {
            parsedURL = parse_url(`${input}`);
          }
          input = {};
        } else {
          parsedURL = parse_url(input.url);
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest2(input) && input.body !== null) && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        let inputBody = init2.body != null ? init2.body : isRequest2(input) && input.body !== null ? clone2(input) : null;
        Body2.call(this, inputBody, {
          timeout: init2.timeout || input.timeout || 0,
          size: init2.size || input.size || 0
        });
        const headers = new Headers2(init2.headers || input.headers || {});
        if (inputBody != null && !headers.has("Content-Type")) {
          const contentType = extractContentType2(inputBody);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest2(input) ? input.signal : null;
        if ("signal" in init2)
          signal = init2.signal;
        if (signal != null && !isAbortSignal2(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS$22] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow !== void 0 ? init2.follow : input.follow !== void 0 ? input.follow : 20;
        this.compress = init2.compress !== void 0 ? init2.compress : input.compress !== void 0 ? input.compress : true;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
      }
      get method() {
        return this[INTERNALS$22].method;
      }
      get url() {
        return format_url(this[INTERNALS$22].parsedURL);
      }
      get headers() {
        return this[INTERNALS$22].headers;
      }
      get redirect() {
        return this[INTERNALS$22].redirect;
      }
      get signal() {
        return this[INTERNALS$22].signal;
      }
      clone() {
        return new Request2(this);
      }
    };
    Body2.mixIn(Request2.prototype);
    Object.defineProperty(Request2.prototype, Symbol.toStringTag, {
      value: "Request",
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Request2.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    function getNodeRequestOptions2(request) {
      const parsedURL = request[INTERNALS$22].parsedURL;
      const headers = new Headers2(request[INTERNALS$22].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      if (!parsedURL.protocol || !parsedURL.hostname) {
        throw new TypeError("Only absolute URLs are supported");
      }
      if (!/^https?:$/.test(parsedURL.protocol)) {
        throw new TypeError("Only HTTP(S) protocols are supported");
      }
      if (request.signal && request.body instanceof Stream2.Readable && !streamDestructionSupported) {
        throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");
      }
      let contentLengthValue = null;
      if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body != null) {
        const totalBytes = getTotalBytes2(request);
        if (typeof totalBytes === "number") {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate");
      }
      let agent = request.agent;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      return Object.assign({}, parsedURL, {
        method: request.method,
        headers: exportNodeCompatibleHeaders(headers),
        agent
      });
    }
    function AbortError2(message) {
      Error.call(this, message);
      this.type = "aborted";
      this.message = message;
      Error.captureStackTrace(this, this.constructor);
    }
    AbortError2.prototype = Object.create(Error.prototype);
    AbortError2.prototype.constructor = AbortError2;
    AbortError2.prototype.name = "AbortError";
    var PassThrough$1 = Stream2.PassThrough;
    var resolve_url = Url.resolve;
    function fetch2(url, opts) {
      if (!fetch2.Promise) {
        throw new Error("native promise missing, set fetch.Promise to your favorite alternative");
      }
      Body2.Promise = fetch2.Promise;
      return new fetch2.Promise(function(resolve2, reject) {
        const request = new Request2(url, opts);
        const options2 = getNodeRequestOptions2(request);
        const send = (options2.protocol === "https:" ? https2 : http2).request;
        const signal = request.signal;
        let response = null;
        const abort = function abort2() {
          let error3 = new AbortError2("The user aborted a request.");
          reject(error3);
          if (request.body && request.body instanceof Stream2.Readable) {
            request.body.destroy(error3);
          }
          if (!response || !response.body)
            return;
          response.body.emit("error", error3);
        };
        if (signal && signal.aborted) {
          abort();
          return;
        }
        const abortAndFinalize = function abortAndFinalize2() {
          abort();
          finalize();
        };
        const req = send(options2);
        let reqTimeout;
        if (signal) {
          signal.addEventListener("abort", abortAndFinalize);
        }
        function finalize() {
          req.abort();
          if (signal)
            signal.removeEventListener("abort", abortAndFinalize);
          clearTimeout(reqTimeout);
        }
        if (request.timeout) {
          req.once("socket", function(socket) {
            reqTimeout = setTimeout(function() {
              reject(new FetchError2(`network timeout at: ${request.url}`, "request-timeout"));
              finalize();
            }, request.timeout);
          });
        }
        req.on("error", function(err) {
          reject(new FetchError2(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
          finalize();
        });
        req.on("response", function(res) {
          clearTimeout(reqTimeout);
          const headers = createHeadersLenient(res.headers);
          if (fetch2.isRedirect(res.statusCode)) {
            const location = headers.get("Location");
            const locationURL = location === null ? null : resolve_url(request.url, location);
            switch (request.redirect) {
              case "error":
                reject(new FetchError2(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
                finalize();
                return;
              case "manual":
                if (locationURL !== null) {
                  try {
                    headers.set("Location", locationURL);
                  } catch (err) {
                    reject(err);
                  }
                }
                break;
              case "follow":
                if (locationURL === null) {
                  break;
                }
                if (request.counter >= request.follow) {
                  reject(new FetchError2(`maximum redirect reached at: ${request.url}`, "max-redirect"));
                  finalize();
                  return;
                }
                const requestOpts = {
                  headers: new Headers2(request.headers),
                  follow: request.follow,
                  counter: request.counter + 1,
                  agent: request.agent,
                  compress: request.compress,
                  method: request.method,
                  body: request.body,
                  signal: request.signal,
                  timeout: request.timeout,
                  size: request.size
                };
                if (res.statusCode !== 303 && request.body && getTotalBytes2(request) === null) {
                  reject(new FetchError2("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
                  finalize();
                  return;
                }
                if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === "POST") {
                  requestOpts.method = "GET";
                  requestOpts.body = void 0;
                  requestOpts.headers.delete("content-length");
                }
                resolve2(fetch2(new Request2(locationURL, requestOpts)));
                finalize();
                return;
            }
          }
          res.once("end", function() {
            if (signal)
              signal.removeEventListener("abort", abortAndFinalize);
          });
          let body = res.pipe(new PassThrough$1());
          const response_options = {
            url: request.url,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers,
            size: request.size,
            timeout: request.timeout,
            counter: request.counter
          };
          const codings = headers.get("Content-Encoding");
          if (!request.compress || request.method === "HEAD" || codings === null || res.statusCode === 204 || res.statusCode === 304) {
            response = new Response2(body, response_options);
            resolve2(response);
            return;
          }
          const zlibOptions = {
            flush: zlib2.Z_SYNC_FLUSH,
            finishFlush: zlib2.Z_SYNC_FLUSH
          };
          if (codings == "gzip" || codings == "x-gzip") {
            body = body.pipe(zlib2.createGunzip(zlibOptions));
            response = new Response2(body, response_options);
            resolve2(response);
            return;
          }
          if (codings == "deflate" || codings == "x-deflate") {
            const raw = res.pipe(new PassThrough$1());
            raw.once("data", function(chunk) {
              if ((chunk[0] & 15) === 8) {
                body = body.pipe(zlib2.createInflate());
              } else {
                body = body.pipe(zlib2.createInflateRaw());
              }
              response = new Response2(body, response_options);
              resolve2(response);
            });
            return;
          }
          if (codings == "br" && typeof zlib2.createBrotliDecompress === "function") {
            body = body.pipe(zlib2.createBrotliDecompress());
            response = new Response2(body, response_options);
            resolve2(response);
            return;
          }
          response = new Response2(body, response_options);
          resolve2(response);
        });
        writeToStream2(req, request);
      });
    }
    fetch2.isRedirect = function(code) {
      return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
    };
    fetch2.Promise = global.Promise;
    module2.exports = exports = fetch2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = exports;
    exports.Headers = Headers2;
    exports.Request = Request2;
    exports.Response = Response2;
    exports.FetchError = FetchError2;
  }
});

// node_modules/cross-fetch/dist/node-ponyfill.js
var require_node_ponyfill = __commonJS({
  "node_modules/cross-fetch/dist/node-ponyfill.js"(exports, module2) {
    init_shims();
    var nodeFetch = require_lib();
    var realFetch = nodeFetch.default || nodeFetch;
    var fetch2 = function(url, options2) {
      if (/^\/\//.test(url)) {
        url = "https:" + url;
      }
      return realFetch.call(this, url, options2);
    };
    fetch2.ponyfill = true;
    module2.exports = exports = fetch2;
    exports.fetch = fetch2;
    exports.Headers = nodeFetch.Headers;
    exports.Request = nodeFetch.Request;
    exports.Response = nodeFetch.Response;
    exports.default = fetch2;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/lib/fetch.js
var require_fetch = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/lib/fetch.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.remove = exports.put = exports.post = exports.get = void 0;
    var cross_fetch_1 = __importDefault(require_node_ponyfill());
    var _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    var handleError = (error3, reject) => {
      if (typeof error3.json !== "function") {
        return reject(error3);
      }
      error3.json().then((err) => {
        return reject({
          message: _getErrorMessage(err),
          status: (error3 === null || error3 === void 0 ? void 0 : error3.status) || 500
        });
      });
    };
    var _getRequestParams = (method, options2, body) => {
      const params = { method, headers: (options2 === null || options2 === void 0 ? void 0 : options2.headers) || {} };
      if (method === "GET") {
        return params;
      }
      params.headers = Object.assign({ "Content-Type": "text/plain;charset=UTF-8" }, options2 === null || options2 === void 0 ? void 0 : options2.headers);
      params.body = JSON.stringify(body);
      return params;
    };
    function _handleRequest(method, url, options2, body) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve2, reject) => {
          cross_fetch_1.default(url, _getRequestParams(method, options2, body)).then((result) => {
            if (!result.ok)
              throw result;
            if (options2 === null || options2 === void 0 ? void 0 : options2.noResolveJson)
              return resolve2;
            return result.json();
          }).then((data) => resolve2(data)).catch((error3) => handleError(error3, reject));
        });
      });
    }
    function get(url, options2) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("GET", url, options2);
      });
    }
    exports.get = get;
    function post(url, body, options2) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("POST", url, options2, body);
      });
    }
    exports.post = post;
    function put(url, body, options2) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("PUT", url, options2, body);
      });
    }
    exports.put = put;
    function remove(url, body, options2) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("DELETE", url, options2, body);
      });
    }
    exports.remove = remove;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/lib/constants.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COOKIE_OPTIONS = exports.STORAGE_KEY = exports.EXPIRY_MARGIN = exports.DEFAULT_HEADERS = exports.AUDIENCE = exports.GOTRUE_URL = void 0;
    exports.GOTRUE_URL = "http://localhost:9999";
    exports.AUDIENCE = "";
    exports.DEFAULT_HEADERS = {};
    exports.EXPIRY_MARGIN = 60 * 1e3;
    exports.STORAGE_KEY = "supabase.auth.token";
    exports.COOKIE_OPTIONS = {
      name: "sb:token",
      lifetime: 60 * 60 * 8,
      domain: "",
      path: "/",
      sameSite: "lax"
    };
  }
});

// node_modules/@supabase/gotrue-js/dist/main/lib/cookies.js
var require_cookies = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/lib/cookies.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deleteCookie = exports.setCookie = exports.setCookies = void 0;
    function serialize(name, val, options2) {
      const opt = options2 || {};
      const enc = encodeURIComponent;
      const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      const value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      let str = name + "=" + value;
      if (opt.maxAge != null) {
        const maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function isSecureEnvironment(req) {
      if (!req || !req.headers || !req.headers.host) {
        throw new Error('The "host" request header is not available');
      }
      const host = req.headers.host.indexOf(":") > -1 && req.headers.host.split(":")[0] || req.headers.host;
      if (["localhost", "127.0.0.1"].indexOf(host) > -1 || host.endsWith(".local")) {
        return false;
      }
      return true;
    }
    function serializeCookie(cookie, secure) {
      var _a, _b, _c;
      return serialize(cookie.name, cookie.value, {
        maxAge: cookie.maxAge,
        expires: new Date(Date.now() + cookie.maxAge * 1e3),
        httpOnly: true,
        secure,
        path: (_a = cookie.path) !== null && _a !== void 0 ? _a : "/",
        domain: (_b = cookie.domain) !== null && _b !== void 0 ? _b : "",
        sameSite: (_c = cookie.sameSite) !== null && _c !== void 0 ? _c : "lax"
      });
    }
    function setCookies(req, res, cookies) {
      const strCookies = cookies.map((c) => serializeCookie(c, isSecureEnvironment(req)));
      const previousCookies = res.getHeader("Set-Cookie");
      if (previousCookies) {
        if (previousCookies instanceof Array) {
          Array.prototype.push.apply(strCookies, previousCookies);
        } else if (typeof previousCookies === "string") {
          strCookies.push(previousCookies);
        }
      }
      res.setHeader("Set-Cookie", strCookies);
    }
    exports.setCookies = setCookies;
    function setCookie(req, res, cookie) {
      setCookies(req, res, [cookie]);
    }
    exports.setCookie = setCookie;
    function deleteCookie(req, res, name) {
      setCookie(req, res, {
        name,
        value: "",
        maxAge: -1
      });
    }
    exports.deleteCookie = deleteCookie;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/lib/helpers.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalStorage = exports.getParameterByName = exports.isBrowser = exports.uuid = exports.expiresAt = void 0;
    function expiresAt(expiresIn) {
      const timeNow = Math.round(Date.now() / 1e3);
      return timeNow + expiresIn;
    }
    exports.expiresAt = expiresAt;
    function uuid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
    exports.uuid = uuid;
    exports.isBrowser = () => typeof window !== "undefined";
    function getParameterByName(name, url) {
      if (!url)
        url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&#]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
      if (!results)
        return null;
      if (!results[2])
        return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    var LocalStorage = class {
      constructor(localStorage) {
        this.localStorage = localStorage || globalThis.localStorage;
      }
      clear() {
        return this.localStorage.clear();
      }
      key(index2) {
        return this.localStorage.key(index2);
      }
      setItem(key, value) {
        return this.localStorage.setItem(key, value);
      }
      getItem(key) {
        return this.localStorage.getItem(key);
      }
      removeItem(key) {
        return this.localStorage.removeItem(key);
      }
    };
    exports.LocalStorage = LocalStorage;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/GoTrueApi.js
var require_GoTrueApi = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/GoTrueApi.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var fetch_1 = require_fetch();
    var constants_1 = require_constants2();
    var cookies_1 = require_cookies();
    var helpers_1 = require_helpers();
    var GoTrueApi = class {
      constructor({ url = "", headers = {}, cookieOptions }) {
        this.url = url;
        this.headers = headers;
        this.cookieOptions = Object.assign(Object.assign({}, constants_1.COOKIE_OPTIONS), cookieOptions);
      }
      signUpWithEmail(email, password, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            let queryString = "";
            if (options2.redirectTo) {
              queryString = "?redirect_to=" + encodeURIComponent(options2.redirectTo);
            }
            const data = yield fetch_1.post(`${this.url}/signup${queryString}`, { email, password }, { headers });
            let session = Object.assign({}, data);
            if (session.expires_in)
              session.expires_at = helpers_1.expiresAt(data.expires_in);
            return { data: session, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      signInWithEmail(email, password, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            let queryString = "?grant_type=password";
            if (options2.redirectTo) {
              queryString += "&redirect_to=" + encodeURIComponent(options2.redirectTo);
            }
            const data = yield fetch_1.post(`${this.url}/token${queryString}`, { email, password }, { headers });
            let session = Object.assign({}, data);
            if (session.expires_in)
              session.expires_at = helpers_1.expiresAt(data.expires_in);
            return { data: session, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      signUpWithPhone(phone, password) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            const data = yield fetch_1.post(`${this.url}/signup`, { phone, password }, { headers });
            let session = Object.assign({}, data);
            if (session.expires_in)
              session.expires_at = helpers_1.expiresAt(data.expires_in);
            return { data: session, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      signInWithPhone(phone, password) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            let queryString = "?grant_type=password";
            const data = yield fetch_1.post(`${this.url}/token${queryString}`, { phone, password }, { headers });
            let session = Object.assign({}, data);
            if (session.expires_in)
              session.expires_at = helpers_1.expiresAt(data.expires_in);
            return { data: session, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      sendMagicLinkEmail(email, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            let queryString = "";
            if (options2.redirectTo) {
              queryString += "?redirect_to=" + encodeURIComponent(options2.redirectTo);
            }
            const data = yield fetch_1.post(`${this.url}/magiclink${queryString}`, { email }, { headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      sendMobileOTP(phone) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            const data = yield fetch_1.post(`${this.url}/otp`, { phone }, { headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      verifyMobileOTP(phone, token, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            const data = yield fetch_1.post(`${this.url}/verify`, { phone, token, type: "sms", redirect_to: options2.redirectTo }, { headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      inviteUserByEmail(email, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            let queryString = "";
            if (options2.redirectTo) {
              queryString += "?redirect_to=" + encodeURIComponent(options2.redirectTo);
            }
            const data = yield fetch_1.post(`${this.url}/invite${queryString}`, { email }, { headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      resetPasswordForEmail(email, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let headers = Object.assign({}, this.headers);
            let queryString = "";
            if (options2.redirectTo) {
              queryString += "?redirect_to=" + encodeURIComponent(options2.redirectTo);
            }
            const data = yield fetch_1.post(`${this.url}/recover${queryString}`, { email }, { headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      _createRequestHeaders(jwt) {
        const headers = Object.assign({}, this.headers);
        headers["Authorization"] = `Bearer ${jwt}`;
        return headers;
      }
      signOut(jwt) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            yield fetch_1.post(`${this.url}/logout`, {}, { headers: this._createRequestHeaders(jwt), noResolveJson: true });
            return { error: null };
          } catch (error3) {
            return { error: error3 };
          }
        });
      }
      getUrlForProvider(provider, options2) {
        let urlParams = [`provider=${encodeURIComponent(provider)}`];
        if (options2 === null || options2 === void 0 ? void 0 : options2.redirectTo) {
          urlParams.push(`redirect_to=${encodeURIComponent(options2.redirectTo)}`);
        }
        if (options2 === null || options2 === void 0 ? void 0 : options2.scopes) {
          urlParams.push(`scopes=${encodeURIComponent(options2.scopes)}`);
        }
        return `${this.url}/authorize?${urlParams.join("&")}`;
      }
      getUser(jwt) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.get(`${this.url}/user`, { headers: this._createRequestHeaders(jwt) });
            return { user: data, data, error: null };
          } catch (error3) {
            return { user: null, data: null, error: error3 };
          }
        });
      }
      updateUser(jwt, attributes) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.put(`${this.url}/user`, attributes, {
              headers: this._createRequestHeaders(jwt)
            });
            return { user: data, data, error: null };
          } catch (error3) {
            return { user: null, data: null, error: error3 };
          }
        });
      }
      deleteUser(uid, jwt) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.remove(`${this.url}/admin/users/${uid}`, {}, {
              headers: this._createRequestHeaders(jwt)
            });
            return { user: data, data, error: null };
          } catch (error3) {
            return { user: null, data: null, error: error3 };
          }
        });
      }
      refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.post(`${this.url}/token?grant_type=refresh_token`, { refresh_token: refreshToken }, { headers: this.headers });
            let session = Object.assign({}, data);
            if (session.expires_in)
              session.expires_at = helpers_1.expiresAt(data.expires_in);
            return { data: session, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      setAuthCookie(req, res) {
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          res.status(405).end("Method Not Allowed");
        }
        const { event, session } = req.body;
        if (!event)
          throw new Error("Auth event missing!");
        if (event === "SIGNED_IN") {
          if (!session)
            throw new Error("Auth session missing!");
          cookies_1.setCookie(req, res, {
            name: this.cookieOptions.name,
            value: session.access_token,
            domain: this.cookieOptions.domain,
            maxAge: this.cookieOptions.lifetime,
            path: this.cookieOptions.path,
            sameSite: this.cookieOptions.sameSite
          });
        }
        if (event === "SIGNED_OUT")
          cookies_1.deleteCookie(req, res, this.cookieOptions.name);
        res.status(200).json({});
      }
      getUserByCookie(req) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (!req.cookies)
              throw new Error("Not able to parse cookies! When using Express make sure the cookie-parser middleware is in use!");
            if (!req.cookies[this.cookieOptions.name])
              throw new Error("No cookie found!");
            const token = req.cookies[this.cookieOptions.name];
            const { user, error: error3 } = yield this.getUser(token);
            if (error3)
              throw error3;
            return { user, data: user, error: null };
          } catch (error3) {
            return { user: null, data: null, error: error3 };
          }
        });
      }
      generateLink(type, email, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.post(`${this.url}/admin/generate_link`, {
              type,
              email,
              password: options2.password,
              data: options2.data,
              redirect_to: options2.redirectTo
            }, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
    };
    exports.default = GoTrueApi;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/lib/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/lib/polyfills.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.polyfillGlobalThis = void 0;
    function polyfillGlobalThis() {
      if (typeof globalThis === "object")
        return;
      try {
        Object.defineProperty(Object.prototype, "__magic__", {
          get: function() {
            return this;
          },
          configurable: true
        });
        __magic__.globalThis = __magic__;
        delete Object.prototype.__magic__;
      } catch (e) {
        if (typeof self !== "undefined") {
          self.globalThis = self;
        }
      }
    }
    exports.polyfillGlobalThis = polyfillGlobalThis;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/GoTrueClient.js
var require_GoTrueClient = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/GoTrueClient.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var GoTrueApi_1 = __importDefault(require_GoTrueApi());
    var helpers_1 = require_helpers();
    var constants_1 = require_constants2();
    var polyfills_1 = require_polyfills();
    polyfills_1.polyfillGlobalThis();
    var DEFAULT_OPTIONS = {
      url: constants_1.GOTRUE_URL,
      autoRefreshToken: true,
      persistSession: true,
      localStorage: globalThis.localStorage,
      detectSessionInUrl: true,
      headers: constants_1.DEFAULT_HEADERS
    };
    var GoTrueClient = class {
      constructor(options2) {
        this.stateChangeEmitters = new Map();
        const settings2 = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options2);
        this.currentUser = null;
        this.currentSession = null;
        this.autoRefreshToken = settings2.autoRefreshToken;
        this.persistSession = settings2.persistSession;
        this.localStorage = new helpers_1.LocalStorage(settings2.localStorage);
        this.api = new GoTrueApi_1.default({
          url: settings2.url,
          headers: settings2.headers,
          cookieOptions: settings2.cookieOptions
        });
        this._recoverSession();
        this._recoverAndRefresh();
        try {
          if (settings2.detectSessionInUrl && helpers_1.isBrowser() && !!helpers_1.getParameterByName("access_token")) {
            this.getSessionFromUrl({ storeSession: true });
          }
        } catch (error3) {
          console.log("Error getting session from URL.");
        }
      }
      signUp({ email, password, phone }, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            this._removeSession();
            const { data, error: error3 } = phone && password ? yield this.api.signUpWithPhone(phone, password) : yield this.api.signUpWithEmail(email, password, {
              redirectTo: options2.redirectTo
            });
            if (error3) {
              throw error3;
            }
            if (!data) {
              throw "An error occurred on sign up.";
            }
            let session = null;
            let user = null;
            if (data.access_token) {
              session = data;
              user = session.user;
              this._saveSession(session);
              this._notifyAllSubscribers("SIGNED_IN");
            }
            if (data.id) {
              user = data;
            }
            return { data, user, session, error: null };
          } catch (error3) {
            return { data: null, user: null, session: null, error: error3 };
          }
        });
      }
      signIn({ email, phone, password, refreshToken, provider }, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            this._removeSession();
            if (email && !password) {
              const { error: error3 } = yield this.api.sendMagicLinkEmail(email, {
                redirectTo: options2.redirectTo
              });
              return { data: null, user: null, session: null, error: error3 };
            }
            if (email && password) {
              return this._handleEmailSignIn(email, password, {
                redirectTo: options2.redirectTo
              });
            }
            if (phone && !password) {
              const { error: error3 } = yield this.api.sendMobileOTP(phone);
              return { data: null, user: null, session: null, error: error3 };
            }
            if (phone && password) {
              return this._handlePhoneSignIn(phone, password);
            }
            if (refreshToken) {
              const { error: error3 } = yield this._callRefreshToken(refreshToken);
              if (error3)
                throw error3;
              return {
                data: this.currentSession,
                user: this.currentUser,
                session: this.currentSession,
                error: null
              };
            }
            if (provider) {
              return this._handleProviderSignIn(provider, {
                redirectTo: options2.redirectTo,
                scopes: options2.scopes
              });
            }
            throw new Error(`You must provide either an email, phone number or a third-party provider.`);
          } catch (error3) {
            return { data: null, user: null, session: null, error: error3 };
          }
        });
      }
      verifyOTP({ phone, token }, options2 = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            this._removeSession();
            const { data, error: error3 } = yield this.api.verifyMobileOTP(phone, token, options2);
            if (error3) {
              throw error3;
            }
            if (!data) {
              throw "An error occurred on token verification.";
            }
            let session = null;
            let user = null;
            if (data.access_token) {
              session = data;
              user = session.user;
              this._saveSession(session);
              this._notifyAllSubscribers("SIGNED_IN");
            }
            if (data.id) {
              user = data;
            }
            return { data, user, session, error: null };
          } catch (error3) {
            return { data: null, user: null, session: null, error: error3 };
          }
        });
      }
      user() {
        return this.currentUser;
      }
      session() {
        return this.currentSession;
      }
      refreshSession() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
              throw new Error("Not logged in.");
            const { error: error3 } = yield this._callRefreshToken();
            if (error3)
              throw error3;
            return { data: this.currentSession, user: this.currentUser, error: null };
          } catch (error3) {
            return { data: null, user: null, error: error3 };
          }
        });
      }
      update(attributes) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
              throw new Error("Not logged in.");
            const { user, error: error3 } = yield this.api.updateUser(this.currentSession.access_token, attributes);
            if (error3)
              throw error3;
            if (!user)
              throw Error("Invalid user data.");
            const session = Object.assign(Object.assign({}, this.currentSession), { user });
            this._saveSession(session);
            this._notifyAllSubscribers("USER_UPDATED");
            return { data: user, user, error: null };
          } catch (error3) {
            return { data: null, user: null, error: error3 };
          }
        });
      }
      setSession(refresh_token) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (!refresh_token) {
              throw new Error("No current session.");
            }
            const { data, error: error3 } = yield this.api.refreshAccessToken(refresh_token);
            if (error3) {
              return { session: null, error: error3 };
            }
            if (!data) {
              return {
                session: null,
                error: { name: "Invalid refresh_token", message: "JWT token provided is Invalid" }
              };
            }
            this._saveSession(data);
            this._notifyAllSubscribers("SIGNED_IN");
            return { session: data, error: null };
          } catch (error3) {
            return { error: error3, session: null };
          }
        });
      }
      setAuth(access_token) {
        this.currentSession = Object.assign(Object.assign({}, this.currentSession), { access_token, token_type: "bearer", user: null });
        return this.currentSession;
      }
      getSessionFromUrl(options2) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (!helpers_1.isBrowser())
              throw new Error("No browser detected.");
            const error_description = helpers_1.getParameterByName("error_description");
            if (error_description)
              throw new Error(error_description);
            const provider_token = helpers_1.getParameterByName("provider_token");
            const access_token = helpers_1.getParameterByName("access_token");
            if (!access_token)
              throw new Error("No access_token detected.");
            const expires_in = helpers_1.getParameterByName("expires_in");
            if (!expires_in)
              throw new Error("No expires_in detected.");
            const refresh_token = helpers_1.getParameterByName("refresh_token");
            if (!refresh_token)
              throw new Error("No refresh_token detected.");
            const token_type = helpers_1.getParameterByName("token_type");
            if (!token_type)
              throw new Error("No token_type detected.");
            const timeNow = Math.round(Date.now() / 1e3);
            const expires_at = timeNow + parseInt(expires_in);
            const { user, error: error3 } = yield this.api.getUser(access_token);
            if (error3)
              throw error3;
            const session = {
              provider_token,
              access_token,
              expires_in: parseInt(expires_in),
              expires_at,
              refresh_token,
              token_type,
              user
            };
            if (options2 === null || options2 === void 0 ? void 0 : options2.storeSession) {
              this._saveSession(session);
              this._notifyAllSubscribers("SIGNED_IN");
              if (helpers_1.getParameterByName("type") === "recovery") {
                this._notifyAllSubscribers("PASSWORD_RECOVERY");
              }
            }
            window.location.hash = "";
            return { data: session, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      signOut() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const accessToken = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token;
          this._removeSession();
          this._notifyAllSubscribers("SIGNED_OUT");
          if (accessToken) {
            const { error: error3 } = yield this.api.signOut(accessToken);
            if (error3)
              return { error: error3 };
          }
          return { error: null };
        });
      }
      onAuthStateChange(callback) {
        try {
          const id = helpers_1.uuid();
          const self2 = this;
          const subscription = {
            id,
            callback,
            unsubscribe: () => {
              self2.stateChangeEmitters.delete(id);
            }
          };
          this.stateChangeEmitters.set(id, subscription);
          return { data: subscription, error: null };
        } catch (error3) {
          return { data: null, error: error3 };
        }
      }
      _handleEmailSignIn(email, password, options2 = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const { data, error: error3 } = yield this.api.signInWithEmail(email, password, {
              redirectTo: options2.redirectTo
            });
            if (error3 || !data)
              return { data: null, user: null, session: null, error: error3 };
            if (((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.confirmed_at) || ((_b = data === null || data === void 0 ? void 0 : data.user) === null || _b === void 0 ? void 0 : _b.email_confirmed_at)) {
              this._saveSession(data);
              this._notifyAllSubscribers("SIGNED_IN");
            }
            return { data, user: data.user, session: data, error: null };
          } catch (error3) {
            return { data: null, user: null, session: null, error: error3 };
          }
        });
      }
      _handlePhoneSignIn(phone, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const { data, error: error3 } = yield this.api.signInWithPhone(phone, password);
            if (error3 || !data)
              return { data: null, user: null, session: null, error: error3 };
            if ((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.phone_confirmed_at) {
              this._saveSession(data);
              this._notifyAllSubscribers("SIGNED_IN");
            }
            return { data, user: data.user, session: data, error: null };
          } catch (error3) {
            return { data: null, user: null, session: null, error: error3 };
          }
        });
      }
      _handleProviderSignIn(provider, options2 = {}) {
        const url = this.api.getUrlForProvider(provider, {
          redirectTo: options2.redirectTo,
          scopes: options2.scopes
        });
        try {
          if (helpers_1.isBrowser()) {
            window.location.href = url;
          }
          return { provider, url, data: null, session: null, user: null, error: null };
        } catch (error3) {
          if (!!url)
            return { provider, url, data: null, session: null, user: null, error: null };
          return { data: null, user: null, session: null, error: error3 };
        }
      }
      _recoverSession() {
        var _a;
        try {
          const json = helpers_1.isBrowser() && ((_a = this.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(constants_1.STORAGE_KEY));
          if (!json || typeof json !== "string") {
            return null;
          }
          const data = JSON.parse(json);
          const { currentSession, expiresAt } = data;
          const timeNow = Math.round(Date.now() / 1e3);
          if (expiresAt >= timeNow && (currentSession === null || currentSession === void 0 ? void 0 : currentSession.user)) {
            this._saveSession(currentSession);
            this._notifyAllSubscribers("SIGNED_IN");
          }
        } catch (error3) {
          console.log("error", error3);
        }
      }
      _recoverAndRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const json = helpers_1.isBrowser() && (yield this.localStorage.getItem(constants_1.STORAGE_KEY));
            if (!json) {
              return null;
            }
            const data = JSON.parse(json);
            const { currentSession, expiresAt } = data;
            const timeNow = Math.round(Date.now() / 1e3);
            if (expiresAt < timeNow) {
              if (this.autoRefreshToken && currentSession.refresh_token) {
                const { error: error3 } = yield this._callRefreshToken(currentSession.refresh_token);
                if (error3) {
                  console.log(error3.message);
                  yield this._removeSession();
                }
              } else {
                this._removeSession();
              }
            } else if (!currentSession || !currentSession.user) {
              console.log("Current session is missing data.");
              this._removeSession();
            } else {
              this._saveSession(currentSession);
              this._notifyAllSubscribers("SIGNED_IN");
            }
          } catch (err) {
            console.error(err);
            return null;
          }
        });
      }
      _callRefreshToken(refresh_token) {
        var _a;
        if (refresh_token === void 0) {
          refresh_token = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.refresh_token;
        }
        return __awaiter(this, void 0, void 0, function* () {
          try {
            if (!refresh_token) {
              throw new Error("No current session.");
            }
            const { data, error: error3 } = yield this.api.refreshAccessToken(refresh_token);
            if (error3)
              throw error3;
            if (!data)
              throw Error("Invalid session data.");
            this._saveSession(data);
            this._notifyAllSubscribers("SIGNED_IN");
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      _notifyAllSubscribers(event) {
        this.stateChangeEmitters.forEach((x) => x.callback(event, this.currentSession));
      }
      _saveSession(session) {
        this.currentSession = session;
        this.currentUser = session.user;
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const timeNow = Math.round(Date.now() / 1e3);
          const expiresIn = expiresAt - timeNow;
          const refreshDurationBeforeExpires = expiresIn > 60 ? 60 : 0.5;
          this._startAutoRefreshToken((expiresIn - refreshDurationBeforeExpires) * 1e3);
        }
        if (this.persistSession && session.expires_at) {
          this._persistSession(this.currentSession);
        }
      }
      _persistSession(currentSession) {
        const data = { currentSession, expiresAt: currentSession.expires_at };
        helpers_1.isBrowser() && this.localStorage.setItem(constants_1.STORAGE_KEY, JSON.stringify(data));
      }
      _removeSession() {
        return __awaiter(this, void 0, void 0, function* () {
          this.currentSession = null;
          this.currentUser = null;
          if (this.refreshTokenTimer)
            clearTimeout(this.refreshTokenTimer);
          helpers_1.isBrowser() && (yield this.localStorage.removeItem(constants_1.STORAGE_KEY));
        });
      }
      _startAutoRefreshToken(value) {
        if (this.refreshTokenTimer)
          clearTimeout(this.refreshTokenTimer);
        if (value <= 0 || !this.autoRefreshToken)
          return;
        this.refreshTokenTimer = setTimeout(() => this._callRefreshToken(), value);
        if (typeof this.refreshTokenTimer.unref === "function")
          this.refreshTokenTimer.unref();
      }
    };
    exports.default = GoTrueClient;
  }
});

// node_modules/@supabase/gotrue-js/dist/main/lib/types.js
var require_types = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/lib/types.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@supabase/gotrue-js/dist/main/index.js
var require_main = __commonJS({
  "node_modules/@supabase/gotrue-js/dist/main/index.js"(exports) {
    init_shims();
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoTrueClient = exports.GoTrueApi = void 0;
    var GoTrueApi_1 = __importDefault(require_GoTrueApi());
    exports.GoTrueApi = GoTrueApi_1.default;
    var GoTrueClient_1 = __importDefault(require_GoTrueClient());
    exports.GoTrueClient = GoTrueClient_1.default;
    __exportStar(require_types(), exports);
  }
});

// node_modules/@supabase/supabase-js/dist/main/lib/SupabaseAuthClient.js
var require_SupabaseAuthClient = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/lib/SupabaseAuthClient.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseAuthClient = void 0;
    var gotrue_js_1 = require_main();
    var SupabaseAuthClient = class extends gotrue_js_1.GoTrueClient {
      constructor(options2) {
        super(options2);
      }
    };
    exports.SupabaseAuthClient = SupabaseAuthClient;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/lib/types.js
var require_types2 = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/lib/types.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostgrestBuilder = void 0;
    var cross_fetch_1 = __importDefault(require_node_ponyfill());
    var PostgrestBuilder = class {
      constructor(builder) {
        Object.assign(this, builder);
      }
      throwOnError() {
        this.shouldThrowOnError = true;
        return this;
      }
      then(onfulfilled, onrejected) {
        if (typeof this.schema === "undefined") {
        } else if (["GET", "HEAD"].includes(this.method)) {
          this.headers["Accept-Profile"] = this.schema;
        } else {
          this.headers["Content-Profile"] = this.schema;
        }
        if (this.method !== "GET" && this.method !== "HEAD") {
          this.headers["Content-Type"] = "application/json";
        }
        return cross_fetch_1.default(this.url.toString(), {
          method: this.method,
          headers: this.headers,
          body: JSON.stringify(this.body)
        }).then((res) => __awaiter(this, void 0, void 0, function* () {
          var _a, _b, _c;
          let error3 = null;
          let data = null;
          let count = null;
          if (res.ok) {
            const isReturnMinimal = (_a = this.headers["Prefer"]) === null || _a === void 0 ? void 0 : _a.split(",").includes("return=minimal");
            if (this.method !== "HEAD" && !isReturnMinimal) {
              const text = yield res.text();
              if (!text) {
              } else if (this.headers["Accept"] === "text/csv") {
                data = text;
              } else {
                data = JSON.parse(text);
              }
            }
            const countHeader = (_b = this.headers["Prefer"]) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
            const contentRange = (_c = res.headers.get("content-range")) === null || _c === void 0 ? void 0 : _c.split("/");
            if (countHeader && contentRange && contentRange.length > 1) {
              count = parseInt(contentRange[1]);
            }
          } else {
            error3 = yield res.json();
            if (error3 && this.shouldThrowOnError) {
              throw error3;
            }
          }
          const postgrestResponse = {
            error: error3,
            data,
            count,
            status: res.status,
            statusText: res.statusText,
            body: data
          };
          return postgrestResponse;
        })).then(onfulfilled, onrejected);
      }
    };
    exports.PostgrestBuilder = PostgrestBuilder;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestTransformBuilder.js
var require_PostgrestTransformBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestTransformBuilder.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var types_1 = require_types2();
    var PostgrestTransformBuilder = class extends types_1.PostgrestBuilder {
      select(columns = "*") {
        let quoted = false;
        const cleanedColumns = columns.split("").map((c) => {
          if (/\s/.test(c) && !quoted) {
            return "";
          }
          if (c === '"') {
            quoted = !quoted;
          }
          return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        return this;
      }
      order(column, { ascending = true, nullsFirst = false, foreignTable } = {}) {
        const key = typeof foreignTable === "undefined" ? "order" : `${foreignTable}.order`;
        const existingOrder = this.url.searchParams.get(key);
        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}.${nullsFirst ? "nullsfirst" : "nullslast"}`);
        return this;
      }
      limit(count, { foreignTable } = {}) {
        const key = typeof foreignTable === "undefined" ? "limit" : `${foreignTable}.limit`;
        this.url.searchParams.set(key, `${count}`);
        return this;
      }
      range(from, to, { foreignTable } = {}) {
        const keyOffset = typeof foreignTable === "undefined" ? "offset" : `${foreignTable}.offset`;
        const keyLimit = typeof foreignTable === "undefined" ? "limit" : `${foreignTable}.limit`;
        this.url.searchParams.set(keyOffset, `${from}`);
        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
        return this;
      }
      single() {
        this.headers["Accept"] = "application/vnd.pgrst.object+json";
        return this;
      }
      maybeSingle() {
        this.headers["Accept"] = "application/vnd.pgrst.object+json";
        const _this = new PostgrestTransformBuilder(this);
        _this.then = (onfulfilled, onrejected) => this.then((res) => {
          var _a;
          if ((_a = res.error) === null || _a === void 0 ? void 0 : _a.details.includes("Results contain 0 rows")) {
            return onfulfilled({
              error: null,
              data: null,
              count: res.count,
              status: 200,
              statusText: "OK",
              body: null
            });
          }
          return onfulfilled(res);
        }, onrejected);
        return _this;
      }
      csv() {
        this.headers["Accept"] = "text/csv";
        return this;
      }
    };
    exports.default = PostgrestTransformBuilder;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestFilterBuilder.js
var require_PostgrestFilterBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestFilterBuilder.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var PostgrestTransformBuilder_1 = __importDefault(require_PostgrestTransformBuilder());
    var PostgrestFilterBuilder = class extends PostgrestTransformBuilder_1.default {
      constructor() {
        super(...arguments);
        this.cs = this.contains;
        this.cd = this.containedBy;
        this.sl = this.rangeLt;
        this.sr = this.rangeGt;
        this.nxl = this.rangeGte;
        this.nxr = this.rangeLte;
        this.adj = this.rangeAdjacent;
        this.ov = this.overlaps;
      }
      not(column, operator, value) {
        this.url.searchParams.append(`${column}`, `not.${operator}.${value}`);
        return this;
      }
      or(filters, { foreignTable } = {}) {
        const key = typeof foreignTable === "undefined" ? "or" : `${foreignTable}.or`;
        this.url.searchParams.append(key, `(${filters})`);
        return this;
      }
      eq(column, value) {
        this.url.searchParams.append(`${column}`, `eq.${value}`);
        return this;
      }
      neq(column, value) {
        this.url.searchParams.append(`${column}`, `neq.${value}`);
        return this;
      }
      gt(column, value) {
        this.url.searchParams.append(`${column}`, `gt.${value}`);
        return this;
      }
      gte(column, value) {
        this.url.searchParams.append(`${column}`, `gte.${value}`);
        return this;
      }
      lt(column, value) {
        this.url.searchParams.append(`${column}`, `lt.${value}`);
        return this;
      }
      lte(column, value) {
        this.url.searchParams.append(`${column}`, `lte.${value}`);
        return this;
      }
      like(column, pattern) {
        this.url.searchParams.append(`${column}`, `like.${pattern}`);
        return this;
      }
      ilike(column, pattern) {
        this.url.searchParams.append(`${column}`, `ilike.${pattern}`);
        return this;
      }
      is(column, value) {
        this.url.searchParams.append(`${column}`, `is.${value}`);
        return this;
      }
      in(column, values) {
        const cleanedValues = values.map((s2) => {
          if (typeof s2 === "string" && new RegExp("[,()]").test(s2))
            return `"${s2}"`;
          else
            return `${s2}`;
        }).join(",");
        this.url.searchParams.append(`${column}`, `in.(${cleanedValues})`);
        return this;
      }
      contains(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(`${column}`, `cs.${value}`);
        } else if (Array.isArray(value)) {
          this.url.searchParams.append(`${column}`, `cs.{${value.join(",")}}`);
        } else {
          this.url.searchParams.append(`${column}`, `cs.${JSON.stringify(value)}`);
        }
        return this;
      }
      containedBy(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(`${column}`, `cd.${value}`);
        } else if (Array.isArray(value)) {
          this.url.searchParams.append(`${column}`, `cd.{${value.join(",")}}`);
        } else {
          this.url.searchParams.append(`${column}`, `cd.${JSON.stringify(value)}`);
        }
        return this;
      }
      rangeLt(column, range) {
        this.url.searchParams.append(`${column}`, `sl.${range}`);
        return this;
      }
      rangeGt(column, range) {
        this.url.searchParams.append(`${column}`, `sr.${range}`);
        return this;
      }
      rangeGte(column, range) {
        this.url.searchParams.append(`${column}`, `nxl.${range}`);
        return this;
      }
      rangeLte(column, range) {
        this.url.searchParams.append(`${column}`, `nxr.${range}`);
        return this;
      }
      rangeAdjacent(column, range) {
        this.url.searchParams.append(`${column}`, `adj.${range}`);
        return this;
      }
      overlaps(column, value) {
        if (typeof value === "string") {
          this.url.searchParams.append(`${column}`, `ov.${value}`);
        } else {
          this.url.searchParams.append(`${column}`, `ov.{${value.join(",")}}`);
        }
        return this;
      }
      textSearch(column, query, { config, type = null } = {}) {
        let typePart = "";
        if (type === "plain") {
          typePart = "pl";
        } else if (type === "phrase") {
          typePart = "ph";
        } else if (type === "websearch") {
          typePart = "w";
        }
        const configPart = config === void 0 ? "" : `(${config})`;
        this.url.searchParams.append(`${column}`, `${typePart}fts${configPart}.${query}`);
        return this;
      }
      fts(column, query, { config } = {}) {
        const configPart = typeof config === "undefined" ? "" : `(${config})`;
        this.url.searchParams.append(`${column}`, `fts${configPart}.${query}`);
        return this;
      }
      plfts(column, query, { config } = {}) {
        const configPart = typeof config === "undefined" ? "" : `(${config})`;
        this.url.searchParams.append(`${column}`, `plfts${configPart}.${query}`);
        return this;
      }
      phfts(column, query, { config } = {}) {
        const configPart = typeof config === "undefined" ? "" : `(${config})`;
        this.url.searchParams.append(`${column}`, `phfts${configPart}.${query}`);
        return this;
      }
      wfts(column, query, { config } = {}) {
        const configPart = typeof config === "undefined" ? "" : `(${config})`;
        this.url.searchParams.append(`${column}`, `wfts${configPart}.${query}`);
        return this;
      }
      filter(column, operator, value) {
        this.url.searchParams.append(`${column}`, `${operator}.${value}`);
        return this;
      }
      match(query) {
        Object.keys(query).forEach((key) => {
          this.url.searchParams.append(`${key}`, `eq.${query[key]}`);
        });
        return this;
      }
    };
    exports.default = PostgrestFilterBuilder;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestQueryBuilder.js
var require_PostgrestQueryBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestQueryBuilder.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var types_1 = require_types2();
    var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
    var PostgrestQueryBuilder = class extends types_1.PostgrestBuilder {
      constructor(url, { headers = {}, schema } = {}) {
        super({});
        this.url = new URL(url);
        this.headers = Object.assign({}, headers);
        this.schema = schema;
      }
      select(columns = "*", { head = false, count = null } = {}) {
        this.method = "GET";
        let quoted = false;
        const cleanedColumns = columns.split("").map((c) => {
          if (/\s/.test(c) && !quoted) {
            return "";
          }
          if (c === '"') {
            quoted = !quoted;
          }
          return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        if (count) {
          this.headers["Prefer"] = `count=${count}`;
        }
        if (head) {
          this.method = "HEAD";
        }
        return new PostgrestFilterBuilder_1.default(this);
      }
      insert(values, { upsert = false, onConflict, returning = "representation", count = null } = {}) {
        this.method = "POST";
        const prefersHeaders = [`return=${returning}`];
        if (upsert)
          prefersHeaders.push("resolution=merge-duplicates");
        if (upsert && onConflict !== void 0)
          this.url.searchParams.set("on_conflict", onConflict);
        this.body = values;
        if (count) {
          prefersHeaders.push(`count=${count}`);
        }
        this.headers["Prefer"] = prefersHeaders.join(",");
        if (Array.isArray(values)) {
          const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
          if (columns.length > 0) {
            const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
            this.url.searchParams.set("columns", uniqueColumns.join(","));
          }
        }
        return new PostgrestFilterBuilder_1.default(this);
      }
      upsert(values, { onConflict, returning = "representation", count = null, ignoreDuplicates = false } = {}) {
        this.method = "POST";
        const prefersHeaders = [
          `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`,
          `return=${returning}`
        ];
        if (onConflict !== void 0)
          this.url.searchParams.set("on_conflict", onConflict);
        this.body = values;
        if (count) {
          prefersHeaders.push(`count=${count}`);
        }
        this.headers["Prefer"] = prefersHeaders.join(",");
        return new PostgrestFilterBuilder_1.default(this);
      }
      update(values, { returning = "representation", count = null } = {}) {
        this.method = "PATCH";
        const prefersHeaders = [`return=${returning}`];
        this.body = values;
        if (count) {
          prefersHeaders.push(`count=${count}`);
        }
        this.headers["Prefer"] = prefersHeaders.join(",");
        return new PostgrestFilterBuilder_1.default(this);
      }
      delete({ returning = "representation", count = null } = {}) {
        this.method = "DELETE";
        const prefersHeaders = [`return=${returning}`];
        if (count) {
          prefersHeaders.push(`count=${count}`);
        }
        this.headers["Prefer"] = prefersHeaders.join(",");
        return new PostgrestFilterBuilder_1.default(this);
      }
    };
    exports.default = PostgrestQueryBuilder;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestRpcBuilder.js
var require_PostgrestRpcBuilder = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/lib/PostgrestRpcBuilder.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var types_1 = require_types2();
    var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
    var PostgrestRpcBuilder = class extends types_1.PostgrestBuilder {
      constructor(url, { headers = {}, schema } = {}) {
        super({});
        this.url = new URL(url);
        this.headers = Object.assign({}, headers);
        this.schema = schema;
      }
      rpc(params, { count = null } = {}) {
        this.method = "POST";
        this.body = params;
        if (count) {
          if (this.headers["Prefer"] !== void 0)
            this.headers["Prefer"] += `,count=${count}`;
          else
            this.headers["Prefer"] = `count=${count}`;
        }
        return new PostgrestFilterBuilder_1.default(this);
      }
    };
    exports.default = PostgrestRpcBuilder;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/PostgrestClient.js
var require_PostgrestClient = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/PostgrestClient.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var PostgrestQueryBuilder_1 = __importDefault(require_PostgrestQueryBuilder());
    var PostgrestRpcBuilder_1 = __importDefault(require_PostgrestRpcBuilder());
    var PostgrestClient = class {
      constructor(url, { headers = {}, schema } = {}) {
        this.url = url;
        this.headers = headers;
        this.schema = schema;
      }
      auth(token) {
        this.headers["Authorization"] = `Bearer ${token}`;
        return this;
      }
      from(table) {
        const url = `${this.url}/${table}`;
        return new PostgrestQueryBuilder_1.default(url, { headers: this.headers, schema: this.schema });
      }
      rpc(fn, params, { count = null } = {}) {
        const url = `${this.url}/rpc/${fn}`;
        return new PostgrestRpcBuilder_1.default(url, {
          headers: this.headers,
          schema: this.schema
        }).rpc(params, { count });
      }
    };
    exports.default = PostgrestClient;
  }
});

// node_modules/@supabase/postgrest-js/dist/main/index.js
var require_main2 = __commonJS({
  "node_modules/@supabase/postgrest-js/dist/main/index.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostgrestFilterBuilder = exports.PostgrestQueryBuilder = exports.PostgrestBuilder = exports.PostgrestClient = void 0;
    var PostgrestClient_1 = __importDefault(require_PostgrestClient());
    exports.PostgrestClient = PostgrestClient_1.default;
    var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
    exports.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
    var PostgrestQueryBuilder_1 = __importDefault(require_PostgrestQueryBuilder());
    exports.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
    var types_1 = require_types2();
    Object.defineProperty(exports, "PostgrestBuilder", { enumerable: true, get: function() {
      return types_1.PostgrestBuilder;
    } });
  }
});

// node_modules/@supabase/realtime-js/dist/main/lib/transformers.js
var require_transformers = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/transformers.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toTimestampString = exports.toArray = exports.toJson = exports.toIntRange = exports.toInt = exports.toFloat = exports.toDateRange = exports.toDate = exports.toBoolean = exports.convertCell = exports.convertColumn = exports.convertChangeData = exports.PostgresTypes = void 0;
    var PostgresTypes;
    (function(PostgresTypes2) {
      PostgresTypes2["abstime"] = "abstime";
      PostgresTypes2["bool"] = "bool";
      PostgresTypes2["date"] = "date";
      PostgresTypes2["daterange"] = "daterange";
      PostgresTypes2["float4"] = "float4";
      PostgresTypes2["float8"] = "float8";
      PostgresTypes2["int2"] = "int2";
      PostgresTypes2["int4"] = "int4";
      PostgresTypes2["int4range"] = "int4range";
      PostgresTypes2["int8"] = "int8";
      PostgresTypes2["int8range"] = "int8range";
      PostgresTypes2["json"] = "json";
      PostgresTypes2["jsonb"] = "jsonb";
      PostgresTypes2["money"] = "money";
      PostgresTypes2["numeric"] = "numeric";
      PostgresTypes2["oid"] = "oid";
      PostgresTypes2["reltime"] = "reltime";
      PostgresTypes2["time"] = "time";
      PostgresTypes2["timestamp"] = "timestamp";
      PostgresTypes2["timestamptz"] = "timestamptz";
      PostgresTypes2["timetz"] = "timetz";
      PostgresTypes2["tsrange"] = "tsrange";
      PostgresTypes2["tstzrange"] = "tstzrange";
    })(PostgresTypes = exports.PostgresTypes || (exports.PostgresTypes = {}));
    exports.convertChangeData = (columns, records, options2 = {}) => {
      let result = {};
      let skipTypes = typeof options2.skipTypes !== "undefined" ? options2.skipTypes : [];
      Object.entries(records).map(([key, value]) => {
        result[key] = exports.convertColumn(key, columns, records, skipTypes);
      });
      return result;
    };
    exports.convertColumn = (columnName, columns, records, skipTypes) => {
      let column = columns.find((x) => x.name == columnName);
      if (!column || skipTypes.includes(column.type)) {
        return noop3(records[columnName]);
      } else {
        return exports.convertCell(column.type, records[columnName]);
      }
    };
    exports.convertCell = (type, stringValue) => {
      try {
        if (stringValue === null)
          return null;
        if (type.charAt(0) === "_") {
          let arrayValue = type.slice(1, type.length);
          return exports.toArray(stringValue, arrayValue);
        }
        switch (type) {
          case PostgresTypes.abstime:
            return noop3(stringValue);
          case PostgresTypes.bool:
            return exports.toBoolean(stringValue);
          case PostgresTypes.date:
            return noop3(stringValue);
          case PostgresTypes.daterange:
            return exports.toDateRange(stringValue);
          case PostgresTypes.float4:
            return exports.toFloat(stringValue);
          case PostgresTypes.float8:
            return exports.toFloat(stringValue);
          case PostgresTypes.int2:
            return exports.toInt(stringValue);
          case PostgresTypes.int4:
            return exports.toInt(stringValue);
          case PostgresTypes.int4range:
            return exports.toIntRange(stringValue);
          case PostgresTypes.int8:
            return exports.toInt(stringValue);
          case PostgresTypes.int8range:
            return exports.toIntRange(stringValue);
          case PostgresTypes.json:
            return exports.toJson(stringValue);
          case PostgresTypes.jsonb:
            return exports.toJson(stringValue);
          case PostgresTypes.money:
            return exports.toFloat(stringValue);
          case PostgresTypes.numeric:
            return exports.toFloat(stringValue);
          case PostgresTypes.oid:
            return exports.toInt(stringValue);
          case PostgresTypes.reltime:
            return noop3(stringValue);
          case PostgresTypes.time:
            return noop3(stringValue);
          case PostgresTypes.timestamp:
            return exports.toTimestampString(stringValue);
          case PostgresTypes.timestamptz:
            return noop3(stringValue);
          case PostgresTypes.timetz:
            return noop3(stringValue);
          case PostgresTypes.tsrange:
            return exports.toDateRange(stringValue);
          case PostgresTypes.tstzrange:
            return exports.toDateRange(stringValue);
          default:
            return noop3(stringValue);
        }
      } catch (error3) {
        console.log(`Could not convert cell of type ${type} and value ${stringValue}`);
        console.log(`This is the error: ${error3}`);
        return stringValue;
      }
    };
    var noop3 = (stringValue) => {
      return stringValue;
    };
    exports.toBoolean = (stringValue) => {
      switch (stringValue) {
        case "t":
          return true;
        case "f":
          return false;
        default:
          return null;
      }
    };
    exports.toDate = (stringValue) => {
      return new Date(stringValue);
    };
    exports.toDateRange = (stringValue) => {
      let arr = JSON.parse(stringValue);
      return [new Date(arr[0]), new Date(arr[1])];
    };
    exports.toFloat = (stringValue) => {
      return parseFloat(stringValue);
    };
    exports.toInt = (stringValue) => {
      return parseInt(stringValue);
    };
    exports.toIntRange = (stringValue) => {
      let arr = JSON.parse(stringValue);
      return [parseInt(arr[0]), parseInt(arr[1])];
    };
    exports.toJson = (stringValue) => {
      return JSON.parse(stringValue);
    };
    exports.toArray = (stringValue, type) => {
      let stringEnriched = stringValue.slice(1, stringValue.length - 1);
      let stringArray = stringEnriched.length > 0 ? stringEnriched.split(",") : [];
      let array = stringArray.map((string) => {
        return exports.convertCell(type, string);
      });
      return array;
    };
    exports.toTimestampString = (stringValue) => {
      return stringValue.replace(" ", "T");
    };
  }
});

// node_modules/@supabase/realtime-js/dist/main/lib/constants.js
var require_constants3 = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/constants.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TRANSPORTS = exports.CHANNEL_EVENTS = exports.CHANNEL_STATES = exports.SOCKET_STATES = exports.WS_CLOSE_NORMAL = exports.DEFAULT_TIMEOUT = exports.VSN = void 0;
    exports.VSN = "1.0.0";
    exports.DEFAULT_TIMEOUT = 1e4;
    exports.WS_CLOSE_NORMAL = 1e3;
    var SOCKET_STATES;
    (function(SOCKET_STATES2) {
      SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
      SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
      SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
      SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
    })(SOCKET_STATES = exports.SOCKET_STATES || (exports.SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function(CHANNEL_STATES2) {
      CHANNEL_STATES2["closed"] = "closed";
      CHANNEL_STATES2["errored"] = "errored";
      CHANNEL_STATES2["joined"] = "joined";
      CHANNEL_STATES2["joining"] = "joining";
      CHANNEL_STATES2["leaving"] = "leaving";
    })(CHANNEL_STATES = exports.CHANNEL_STATES || (exports.CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function(CHANNEL_EVENTS2) {
      CHANNEL_EVENTS2["close"] = "phx_close";
      CHANNEL_EVENTS2["error"] = "phx_error";
      CHANNEL_EVENTS2["join"] = "phx_join";
      CHANNEL_EVENTS2["reply"] = "phx_reply";
      CHANNEL_EVENTS2["leave"] = "phx_leave";
    })(CHANNEL_EVENTS = exports.CHANNEL_EVENTS || (exports.CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function(TRANSPORTS2) {
      TRANSPORTS2["websocket"] = "websocket";
    })(TRANSPORTS = exports.TRANSPORTS || (exports.TRANSPORTS = {}));
  }
});

// node_modules/@supabase/realtime-js/dist/main/lib/timer.js
var require_timer = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/timer.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Timer = class {
      constructor(callback, timerCalc) {
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = void 0;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
      }
      reset() {
        this.tries = 0;
        clearTimeout(this.timer);
      }
      scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.tries = this.tries + 1;
          this.callback();
        }, this.timerCalc(this.tries + 1));
      }
    };
    exports.default = Timer;
  }
});

// node_modules/@supabase/realtime-js/dist/main/lib/push.js
var require_push = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/push.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var constants_1 = require_constants3();
    var Push = class {
      constructor(channel, event, payload = {}, timeout = constants_1.DEFAULT_TIMEOUT) {
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = void 0;
        this.ref = "";
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
      }
      resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = "";
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
      }
      send() {
        if (this._hasReceived("timeout")) {
          return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
          topic: this.channel.topic,
          event: this.event,
          payload: this.payload,
          ref: this.ref
        });
      }
      receive(status, callback) {
        var _a;
        if (this._hasReceived(status)) {
          callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
        }
        this.recHooks.push({ status, callback });
        return this;
      }
      startTimeout() {
        if (this.timeoutTimer) {
          return;
        }
        this.ref = this.channel.socket.makeRef();
        this.refEvent = this.channel.replyEventName(this.ref);
        this.channel.on(this.refEvent, (payload) => {
          this._cancelRefEvent();
          this._cancelTimeout();
          this.receivedResp = payload;
          this._matchReceive(payload);
        });
        this.timeoutTimer = setTimeout(() => {
          this.trigger("timeout", {});
        }, this.timeout);
      }
      trigger(status, response) {
        if (this.refEvent)
          this.channel.trigger(this.refEvent, { status, response });
      }
      destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
      }
      _cancelRefEvent() {
        if (!this.refEvent) {
          return;
        }
        this.channel.off(this.refEvent);
      }
      _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = void 0;
      }
      _matchReceive({ status, response }) {
        this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
      }
      _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
      }
    };
    exports.default = Push;
  }
});

// node_modules/@supabase/realtime-js/dist/main/RealtimeSubscription.js
var require_RealtimeSubscription = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/RealtimeSubscription.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var constants_1 = require_constants3();
    var push_1 = __importDefault(require_push());
    var timer_1 = __importDefault(require_timer());
    var RealtimeSubscription = class {
      constructor(topic, params = {}, socket) {
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = [];
        this.state = constants_1.CHANNEL_STATES.closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.timeout = this.socket.timeout;
        this.joinPush = new push_1.default(this, constants_1.CHANNEL_EVENTS.join, this.params, this.timeout);
        this.rejoinTimer = new timer_1.default(() => this.rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive("ok", () => {
          this.state = constants_1.CHANNEL_STATES.joined;
          this.rejoinTimer.reset();
          this.pushBuffer.forEach((pushEvent) => pushEvent.send());
          this.pushBuffer = [];
        });
        this.onClose(() => {
          this.rejoinTimer.reset();
          this.socket.log("channel", `close ${this.topic} ${this.joinRef()}`);
          this.state = constants_1.CHANNEL_STATES.closed;
          this.socket.remove(this);
        });
        this.onError((reason) => {
          if (this.isLeaving() || this.isClosed()) {
            return;
          }
          this.socket.log("channel", `error ${this.topic}`, reason);
          this.state = constants_1.CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive("timeout", () => {
          if (!this.isJoining()) {
            return;
          }
          this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
          this.state = constants_1.CHANNEL_STATES.errored;
          this.rejoinTimer.scheduleTimeout();
        });
        this.on(constants_1.CHANNEL_EVENTS.reply, (payload, ref) => {
          this.trigger(this.replyEventName(ref), payload);
        });
      }
      rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
          this.rejoin();
        }
      }
      subscribe(timeout = this.timeout) {
        if (this.joinedOnce) {
          throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
        } else {
          this.joinedOnce = true;
          this.rejoin(timeout);
          return this.joinPush;
        }
      }
      onClose(callback) {
        this.on(constants_1.CHANNEL_EVENTS.close, callback);
      }
      onError(callback) {
        this.on(constants_1.CHANNEL_EVENTS.error, (reason) => callback(reason));
      }
      on(event, callback) {
        this.bindings.push({ event, callback });
      }
      off(event) {
        this.bindings = this.bindings.filter((bind) => bind.event !== event);
      }
      canPush() {
        return this.socket.isConnected() && this.isJoined();
      }
      push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
          throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        }
        let pushEvent = new push_1.default(this, event, payload, timeout);
        if (this.canPush()) {
          pushEvent.send();
        } else {
          pushEvent.startTimeout();
          this.pushBuffer.push(pushEvent);
        }
        return pushEvent;
      }
      unsubscribe(timeout = this.timeout) {
        this.state = constants_1.CHANNEL_STATES.leaving;
        let onClose = () => {
          this.socket.log("channel", `leave ${this.topic}`);
          this.trigger(constants_1.CHANNEL_EVENTS.close, "leave", this.joinRef());
        };
        this.joinPush.destroy();
        let leavePush = new push_1.default(this, constants_1.CHANNEL_EVENTS.leave, {}, timeout);
        leavePush.receive("ok", () => onClose()).receive("timeout", () => onClose());
        leavePush.send();
        if (!this.canPush()) {
          leavePush.trigger("ok", {});
        }
        return leavePush;
      }
      onMessage(event, payload, ref) {
        return payload;
      }
      isMember(topic) {
        return this.topic === topic;
      }
      joinRef() {
        return this.joinPush.ref;
      }
      sendJoin(timeout) {
        this.state = constants_1.CHANNEL_STATES.joining;
        this.joinPush.resend(timeout);
      }
      rejoin(timeout = this.timeout) {
        if (this.isLeaving()) {
          return;
        }
        this.sendJoin(timeout);
      }
      trigger(event, payload, ref) {
        let { close, error: error3, leave, join } = constants_1.CHANNEL_EVENTS;
        let events = [close, error3, leave, join];
        if (ref && events.indexOf(event) >= 0 && ref !== this.joinRef()) {
          return;
        }
        let handledPayload = this.onMessage(event, payload, ref);
        if (payload && !handledPayload) {
          throw "channel onMessage callbacks must return the payload, modified or unmodified";
        }
        this.bindings.filter((bind) => {
          if (bind.event === "*") {
            return event === (payload === null || payload === void 0 ? void 0 : payload.type);
          } else {
            return bind.event === event;
          }
        }).map((bind) => bind.callback(handledPayload, ref));
      }
      replyEventName(ref) {
        return `chan_reply_${ref}`;
      }
      isClosed() {
        return this.state === constants_1.CHANNEL_STATES.closed;
      }
      isErrored() {
        return this.state === constants_1.CHANNEL_STATES.errored;
      }
      isJoined() {
        return this.state === constants_1.CHANNEL_STATES.joined;
      }
      isJoining() {
        return this.state === constants_1.CHANNEL_STATES.joining;
      }
      isLeaving() {
        return this.state === constants_1.CHANNEL_STATES.leaving;
      }
    };
    exports.default = RealtimeSubscription;
  }
});

// node_modules/websocket/node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/websocket/node_modules/ms/index.js"(exports, module2) {
    init_shims();
    var s2 = 1e3;
    var m = s2 * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    module2.exports = function(val, options2) {
      options2 = options2 || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isNaN(val) === false) {
        return options2.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s2;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + "d";
      }
      if (ms >= h) {
        return Math.round(ms / h) + "h";
      }
      if (ms >= m) {
        return Math.round(ms / m) + "m";
      }
      if (ms >= s2) {
        return Math.round(ms / s2) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s2, "second") || ms + " ms";
    }
    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + " " + name;
      }
      return Math.ceil(ms / n) + " " + name + "s";
    }
  }
});

// node_modules/websocket/node_modules/debug/src/debug.js
var require_debug = __commonJS({
  "node_modules/websocket/node_modules/debug/src/debug.js"(exports, module2) {
    init_shims();
    exports = module2.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = require_ms();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash2 = 0, i;
      for (i in namespace) {
        hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
        hash2 |= 0;
      }
      return exports.colors[Math.abs(hash2) % exports.colors.length];
    }
    function createDebug(namespace) {
      function debug() {
        if (!debug.enabled)
          return;
        var self2 = debug;
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        var index2 = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format2) {
          if (match === "%%")
            return match;
          index2++;
          var formatter = exports.formatters[format2];
          if (typeof formatter === "function") {
            var val = args[index2];
            match = formatter.call(self2, val);
            args.splice(index2, 1);
            index2--;
          }
          return match;
        });
        exports.formatArgs.call(self2, args);
        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);
      if (typeof exports.init === "function") {
        exports.init(debug);
      }
      return debug;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i])
          continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error)
        return val.stack || val.message;
      return val;
    }
  }
});

// node_modules/websocket/node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/websocket/node_modules/debug/src/browser.js"(exports, module2) {
    init_shims();
    exports = module2.exports = require_debug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load2;
    exports.useColors = useColors;
    exports.storage = typeof chrome != "undefined" && typeof chrome.storage != "undefined" ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2)
        return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index2 = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if (match === "%%")
          return;
        index2++;
        if (match === "%c") {
          lastC = index2;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return typeof console === "object" && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (namespaces == null) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load2() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports.enable(load2());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  }
});

// node_modules/websocket/node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/websocket/node_modules/debug/src/node.js"(exports, module2) {
    init_shims();
    var tty = require("tty");
    var util = require("util");
    exports = module2.exports = require_debug();
    exports.init = init2;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load2;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val))
        val = true;
      else if (/^(no|off|false|disabled)$/i.test(val))
        val = false;
      else if (val === "null")
        val = null;
      else
        val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (fd !== 1 && fd !== 2) {
      util.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = fd === 1 ? process.stdout : fd === 2 ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  [3" + c + ";1m" + name + " [0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("[3" + c + "m+" + exports.humanize(this.diff) + "[0m");
      } else {
        args[0] = new Date().toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (namespaces == null) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load2() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs = require("fs");
          stream2 = new fs.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require("net");
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init2(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    exports.enable(load2());
  }
});

// node_modules/websocket/node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/websocket/node_modules/debug/src/index.js"(exports, module2) {
    init_shims();
    if (typeof process !== "undefined" && process.type === "renderer") {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/websocket/lib/utils.js
var require_utils = __commonJS({
  "node_modules/websocket/lib/utils.js"(exports) {
    init_shims();
    var noop3 = exports.noop = function() {
    };
    exports.extend = function extend(dest, source) {
      for (var prop in source) {
        dest[prop] = source[prop];
      }
    };
    exports.eventEmitterListenerCount = require("events").EventEmitter.listenerCount || function(emitter, type) {
      return emitter.listeners(type).length;
    };
    exports.bufferAllocUnsafe = Buffer.allocUnsafe ? Buffer.allocUnsafe : function oldBufferAllocUnsafe(size) {
      return new Buffer(size);
    };
    exports.bufferFromString = Buffer.from ? Buffer.from : function oldBufferFromString(string, encoding) {
      return new Buffer(string, encoding);
    };
    exports.BufferingLogger = function createBufferingLogger(identifier, uniqueID) {
      var logFunction = require_src()(identifier);
      if (logFunction.enabled) {
        var logger = new BufferingLogger(identifier, uniqueID, logFunction);
        var debug = logger.log.bind(logger);
        debug.printOutput = logger.printOutput.bind(logger);
        debug.enabled = logFunction.enabled;
        return debug;
      }
      logFunction.printOutput = noop3;
      return logFunction;
    };
    function BufferingLogger(identifier, uniqueID, logFunction) {
      this.logFunction = logFunction;
      this.identifier = identifier;
      this.uniqueID = uniqueID;
      this.buffer = [];
    }
    BufferingLogger.prototype.log = function() {
      this.buffer.push([new Date(), Array.prototype.slice.call(arguments)]);
      return this;
    };
    BufferingLogger.prototype.clear = function() {
      this.buffer = [];
      return this;
    };
    BufferingLogger.prototype.printOutput = function(logFunction) {
      if (!logFunction) {
        logFunction = this.logFunction;
      }
      var uniqueID = this.uniqueID;
      this.buffer.forEach(function(entry) {
        var date = entry[0].toLocaleString();
        var args = entry[1].slice();
        var formatString = args[0];
        if (formatString !== void 0 && formatString !== null) {
          formatString = "%s - %s - " + formatString.toString();
          args.splice(0, 1, formatString, date, uniqueID);
          logFunction.apply(global, args);
        }
      });
    };
  }
});

// node_modules/node-gyp-build/index.js
var require_node_gyp_build = __commonJS({
  "node_modules/node-gyp-build/index.js"(exports, module2) {
    init_shims();
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    var vars = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var abi = process.versions.modules;
    var runtime = isElectron() ? "electron" : "node";
    var arch = os.arch();
    var platform = os.platform();
    var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
    var uv = (process.versions.uv || "").split(".")[0];
    module2.exports = load2;
    function load2(dir) {
      return runtimeRequire(load2.path(dir));
    }
    load2.path = function(dir) {
      dir = path.resolve(dir || ".");
      try {
        var name = runtimeRequire(path.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
        if (process.env[name + "_PREBUILD"])
          dir = process.env[name + "_PREBUILD"];
      } catch (err) {
      }
      if (!prebuildsOnly) {
        var release = getFirst(path.join(dir, "build/Release"), matchBuild);
        if (release)
          return release;
        var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
        if (debug)
          return debug;
      }
      var prebuild = resolve2(dir);
      if (prebuild)
        return prebuild;
      var nearby = resolve2(path.dirname(process.execPath));
      if (nearby)
        return nearby;
      var target = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions && process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
      ].filter(Boolean).join(" ");
      throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
      function resolve2(dir2) {
        var prebuilds = path.join(dir2, "prebuilds", platform + "-" + arch);
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner)
          return path.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTags(file) {
      var arr = file.split(".");
      var extension = arr.pop();
      var tags = { file, specificity: 0 };
      if (extension !== "node")
        return;
      for (var i = 0; i < arr.length; i++) {
        var tag = arr[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null)
          return false;
        if (tags.runtime !== runtime2 && !runtimeAgnostic(tags))
          return false;
        if (tags.abi !== abi2 && !tags.napi)
          return false;
        if (tags.uv && tags.uv !== uv)
          return false;
        if (tags.armv && tags.armv !== armv)
          return false;
        if (tags.libc && tags.libc !== libc)
          return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isElectron() {
      if (process.versions && process.versions.electron)
        return true;
      if (process.env.ELECTRON_RUN_AS_NODE)
        return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isAlpine(platform2) {
      return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
    }
    load2.parseTags = parseTags;
    load2.matchTags = matchTags;
    load2.compareTags = compareTags;
  }
});

// node_modules/bufferutil/fallback.js
var require_fallback = __commonJS({
  "node_modules/bufferutil/fallback.js"(exports, module2) {
    init_shims();
    "use strict";
    var mask = (source, mask2, output, offset, length) => {
      for (var i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask2[i & 3];
      }
    };
    var unmask = (buffer, mask2) => {
      const length = buffer.length;
      for (var i = 0; i < length; i++) {
        buffer[i] ^= mask2[i & 3];
      }
    };
    module2.exports = { mask, unmask };
  }
});

// node_modules/bufferutil/index.js
var require_bufferutil = __commonJS({
  "node_modules/bufferutil/index.js"(exports, module2) {
    init_shims();
    "use strict";
    try {
      module2.exports = require_node_gyp_build()(__dirname);
    } catch (e) {
      module2.exports = require_fallback();
    }
  }
});

// node_modules/websocket/lib/WebSocketFrame.js
var require_WebSocketFrame = __commonJS({
  "node_modules/websocket/lib/WebSocketFrame.js"(exports, module2) {
    init_shims();
    var bufferUtil = require_bufferutil();
    var bufferAllocUnsafe = require_utils().bufferAllocUnsafe;
    var DECODE_HEADER = 1;
    var WAITING_FOR_16_BIT_LENGTH = 2;
    var WAITING_FOR_64_BIT_LENGTH = 3;
    var WAITING_FOR_MASK_KEY = 4;
    var WAITING_FOR_PAYLOAD = 5;
    var COMPLETE = 6;
    function WebSocketFrame(maskBytes, frameHeader, config) {
      this.maskBytes = maskBytes;
      this.frameHeader = frameHeader;
      this.config = config;
      this.maxReceivedFrameSize = config.maxReceivedFrameSize;
      this.protocolError = false;
      this.frameTooLarge = false;
      this.invalidCloseFrameLength = false;
      this.parseState = DECODE_HEADER;
      this.closeStatus = -1;
    }
    WebSocketFrame.prototype.addData = function(bufferList) {
      if (this.parseState === DECODE_HEADER) {
        if (bufferList.length >= 2) {
          bufferList.joinInto(this.frameHeader, 0, 0, 2);
          bufferList.advance(2);
          var firstByte = this.frameHeader[0];
          var secondByte = this.frameHeader[1];
          this.fin = Boolean(firstByte & 128);
          this.rsv1 = Boolean(firstByte & 64);
          this.rsv2 = Boolean(firstByte & 32);
          this.rsv3 = Boolean(firstByte & 16);
          this.mask = Boolean(secondByte & 128);
          this.opcode = firstByte & 15;
          this.length = secondByte & 127;
          if (this.opcode >= 8) {
            if (this.length > 125) {
              this.protocolError = true;
              this.dropReason = "Illegal control frame longer than 125 bytes.";
              return true;
            }
            if (!this.fin) {
              this.protocolError = true;
              this.dropReason = "Control frames must not be fragmented.";
              return true;
            }
          }
          if (this.length === 126) {
            this.parseState = WAITING_FOR_16_BIT_LENGTH;
          } else if (this.length === 127) {
            this.parseState = WAITING_FOR_64_BIT_LENGTH;
          } else {
            this.parseState = WAITING_FOR_MASK_KEY;
          }
        }
      }
      if (this.parseState === WAITING_FOR_16_BIT_LENGTH) {
        if (bufferList.length >= 2) {
          bufferList.joinInto(this.frameHeader, 2, 0, 2);
          bufferList.advance(2);
          this.length = this.frameHeader.readUInt16BE(2);
          this.parseState = WAITING_FOR_MASK_KEY;
        }
      } else if (this.parseState === WAITING_FOR_64_BIT_LENGTH) {
        if (bufferList.length >= 8) {
          bufferList.joinInto(this.frameHeader, 2, 0, 8);
          bufferList.advance(8);
          var lengthPair = [
            this.frameHeader.readUInt32BE(2),
            this.frameHeader.readUInt32BE(2 + 4)
          ];
          if (lengthPair[0] !== 0) {
            this.protocolError = true;
            this.dropReason = "Unsupported 64-bit length frame received";
            return true;
          }
          this.length = lengthPair[1];
          this.parseState = WAITING_FOR_MASK_KEY;
        }
      }
      if (this.parseState === WAITING_FOR_MASK_KEY) {
        if (this.mask) {
          if (bufferList.length >= 4) {
            bufferList.joinInto(this.maskBytes, 0, 0, 4);
            bufferList.advance(4);
            this.parseState = WAITING_FOR_PAYLOAD;
          }
        } else {
          this.parseState = WAITING_FOR_PAYLOAD;
        }
      }
      if (this.parseState === WAITING_FOR_PAYLOAD) {
        if (this.length > this.maxReceivedFrameSize) {
          this.frameTooLarge = true;
          this.dropReason = "Frame size of " + this.length.toString(10) + " bytes exceeds maximum accepted frame size";
          return true;
        }
        if (this.length === 0) {
          this.binaryPayload = bufferAllocUnsafe(0);
          this.parseState = COMPLETE;
          return true;
        }
        if (bufferList.length >= this.length) {
          this.binaryPayload = bufferList.take(this.length);
          bufferList.advance(this.length);
          if (this.mask) {
            bufferUtil.unmask(this.binaryPayload, this.maskBytes);
          }
          if (this.opcode === 8) {
            if (this.length === 1) {
              this.binaryPayload = bufferAllocUnsafe(0);
              this.invalidCloseFrameLength = true;
            }
            if (this.length >= 2) {
              this.closeStatus = this.binaryPayload.readUInt16BE(0);
              this.binaryPayload = this.binaryPayload.slice(2);
            }
          }
          this.parseState = COMPLETE;
          return true;
        }
      }
      return false;
    };
    WebSocketFrame.prototype.throwAwayPayload = function(bufferList) {
      if (bufferList.length >= this.length) {
        bufferList.advance(this.length);
        this.parseState = COMPLETE;
        return true;
      }
      return false;
    };
    WebSocketFrame.prototype.toBuffer = function(nullMask) {
      var maskKey;
      var headerLength = 2;
      var data;
      var outputPos;
      var firstByte = 0;
      var secondByte = 0;
      if (this.fin) {
        firstByte |= 128;
      }
      if (this.rsv1) {
        firstByte |= 64;
      }
      if (this.rsv2) {
        firstByte |= 32;
      }
      if (this.rsv3) {
        firstByte |= 16;
      }
      if (this.mask) {
        secondByte |= 128;
      }
      firstByte |= this.opcode & 15;
      if (this.opcode === 8) {
        this.length = 2;
        if (this.binaryPayload) {
          this.length += this.binaryPayload.length;
        }
        data = bufferAllocUnsafe(this.length);
        data.writeUInt16BE(this.closeStatus, 0);
        if (this.length > 2) {
          this.binaryPayload.copy(data, 2);
        }
      } else if (this.binaryPayload) {
        data = this.binaryPayload;
        this.length = data.length;
      } else {
        this.length = 0;
      }
      if (this.length <= 125) {
        secondByte |= this.length & 127;
      } else if (this.length > 125 && this.length <= 65535) {
        secondByte |= 126;
        headerLength += 2;
      } else if (this.length > 65535) {
        secondByte |= 127;
        headerLength += 8;
      }
      var output = bufferAllocUnsafe(this.length + headerLength + (this.mask ? 4 : 0));
      output[0] = firstByte;
      output[1] = secondByte;
      outputPos = 2;
      if (this.length > 125 && this.length <= 65535) {
        output.writeUInt16BE(this.length, outputPos);
        outputPos += 2;
      } else if (this.length > 65535) {
        output.writeUInt32BE(0, outputPos);
        output.writeUInt32BE(this.length, outputPos + 4);
        outputPos += 8;
      }
      if (this.mask) {
        maskKey = nullMask ? 0 : Math.random() * 4294967295 >>> 0;
        this.maskBytes.writeUInt32BE(maskKey, 0);
        this.maskBytes.copy(output, outputPos);
        outputPos += 4;
        if (data) {
          bufferUtil.mask(data, this.maskBytes, output, outputPos, this.length);
        }
      } else if (data) {
        data.copy(output, outputPos);
      }
      return output;
    };
    WebSocketFrame.prototype.toString = function() {
      return "Opcode: " + this.opcode + ", fin: " + this.fin + ", length: " + this.length + ", hasPayload: " + Boolean(this.binaryPayload) + ", masked: " + this.mask;
    };
    module2.exports = WebSocketFrame;
  }
});

// node_modules/websocket/vendor/FastBufferList.js
var require_FastBufferList = __commonJS({
  "node_modules/websocket/vendor/FastBufferList.js"(exports, module2) {
    init_shims();
    var Buffer2 = require("buffer").Buffer;
    var EventEmitter = require("events").EventEmitter;
    var bufferAllocUnsafe = require_utils().bufferAllocUnsafe;
    module2.exports = BufferList;
    module2.exports.BufferList = BufferList;
    function BufferList(opts) {
      if (!(this instanceof BufferList))
        return new BufferList(opts);
      EventEmitter.call(this);
      var self2 = this;
      if (typeof opts == "undefined")
        opts = {};
      self2.encoding = opts.encoding;
      var head = { next: null, buffer: null };
      var last = { next: null, buffer: null };
      var length = 0;
      self2.__defineGetter__("length", function() {
        return length;
      });
      var offset = 0;
      self2.write = function(buf) {
        if (!head.buffer) {
          head.buffer = buf;
          last = head;
        } else {
          last.next = { next: null, buffer: buf };
          last = last.next;
        }
        length += buf.length;
        self2.emit("write", buf);
        return true;
      };
      self2.end = function(buf) {
        if (Buffer2.isBuffer(buf))
          self2.write(buf);
      };
      self2.push = function() {
        var args = [].concat.apply([], arguments);
        args.forEach(self2.write);
        return self2;
      };
      self2.forEach = function(fn) {
        if (!head.buffer)
          return bufferAllocUnsafe(0);
        if (head.buffer.length - offset <= 0)
          return self2;
        var firstBuf = head.buffer.slice(offset);
        var b = { buffer: firstBuf, next: head.next };
        while (b && b.buffer) {
          var r = fn(b.buffer);
          if (r)
            break;
          b = b.next;
        }
        return self2;
      };
      self2.join = function(start, end) {
        if (!head.buffer)
          return bufferAllocUnsafe(0);
        if (start == void 0)
          start = 0;
        if (end == void 0)
          end = self2.length;
        var big = bufferAllocUnsafe(end - start);
        var ix = 0;
        self2.forEach(function(buffer) {
          if (start < ix + buffer.length && ix < end) {
            buffer.copy(big, Math.max(0, ix - start), Math.max(0, start - ix), Math.min(buffer.length, end - ix));
          }
          ix += buffer.length;
          if (ix > end)
            return true;
        });
        return big;
      };
      self2.joinInto = function(targetBuffer, targetStart, sourceStart, sourceEnd) {
        if (!head.buffer)
          return new bufferAllocUnsafe(0);
        if (sourceStart == void 0)
          sourceStart = 0;
        if (sourceEnd == void 0)
          sourceEnd = self2.length;
        var big = targetBuffer;
        if (big.length - targetStart < sourceEnd - sourceStart) {
          throw new Error("Insufficient space available in target Buffer.");
        }
        var ix = 0;
        self2.forEach(function(buffer) {
          if (sourceStart < ix + buffer.length && ix < sourceEnd) {
            buffer.copy(big, Math.max(targetStart, targetStart + ix - sourceStart), Math.max(0, sourceStart - ix), Math.min(buffer.length, sourceEnd - ix));
          }
          ix += buffer.length;
          if (ix > sourceEnd)
            return true;
        });
        return big;
      };
      self2.advance = function(n) {
        offset += n;
        length -= n;
        while (head.buffer && offset >= head.buffer.length) {
          offset -= head.buffer.length;
          head = head.next ? head.next : { buffer: null, next: null };
        }
        if (head.buffer === null)
          last = { next: null, buffer: null };
        self2.emit("advance", n);
        return self2;
      };
      self2.take = function(n, encoding) {
        if (n == void 0)
          n = self2.length;
        else if (typeof n !== "number") {
          encoding = n;
          n = self2.length;
        }
        var b = head;
        if (!encoding)
          encoding = self2.encoding;
        if (encoding) {
          var acc = "";
          self2.forEach(function(buffer) {
            if (n <= 0)
              return true;
            acc += buffer.toString(encoding, 0, Math.min(n, buffer.length));
            n -= buffer.length;
          });
          return acc;
        } else {
          return self2.join(0, n);
        }
      };
      self2.toString = function() {
        return self2.take("binary");
      };
    }
    require("util").inherits(BufferList, EventEmitter);
  }
});

// node_modules/utf-8-validate/fallback.js
var require_fallback2 = __commonJS({
  "node_modules/utf-8-validate/fallback.js"(exports, module2) {
    init_shims();
    "use strict";
    function isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    module2.exports = isValidUTF8;
  }
});

// node_modules/utf-8-validate/index.js
var require_utf_8_validate = __commonJS({
  "node_modules/utf-8-validate/index.js"(exports, module2) {
    init_shims();
    "use strict";
    try {
      module2.exports = require_node_gyp_build()(__dirname);
    } catch (e) {
      module2.exports = require_fallback2();
    }
  }
});

// node_modules/websocket/lib/WebSocketConnection.js
var require_WebSocketConnection = __commonJS({
  "node_modules/websocket/lib/WebSocketConnection.js"(exports, module2) {
    init_shims();
    var util = require("util");
    var utils = require_utils();
    var EventEmitter = require("events").EventEmitter;
    var WebSocketFrame = require_WebSocketFrame();
    var BufferList = require_FastBufferList();
    var isValidUTF8 = require_utf_8_validate();
    var bufferAllocUnsafe = utils.bufferAllocUnsafe;
    var bufferFromString = utils.bufferFromString;
    var STATE_OPEN = "open";
    var STATE_PEER_REQUESTED_CLOSE = "peer_requested_close";
    var STATE_ENDING = "ending";
    var STATE_CLOSED = "closed";
    var setImmediateImpl = "setImmediate" in global ? global.setImmediate.bind(global) : process.nextTick.bind(process);
    var idCounter = 0;
    function WebSocketConnection(socket, extensions, protocol, maskOutgoingPackets, config) {
      this._debug = utils.BufferingLogger("websocket:connection", ++idCounter);
      this._debug("constructor");
      if (this._debug.enabled) {
        instrumentSocketForDebugging(this, socket);
      }
      EventEmitter.call(this);
      this._pingListenerCount = 0;
      this.on("newListener", function(ev) {
        if (ev === "ping") {
          this._pingListenerCount++;
        }
      }).on("removeListener", function(ev) {
        if (ev === "ping") {
          this._pingListenerCount--;
        }
      });
      this.config = config;
      this.socket = socket;
      this.protocol = protocol;
      this.extensions = extensions;
      this.remoteAddress = socket.remoteAddress;
      this.closeReasonCode = -1;
      this.closeDescription = null;
      this.closeEventEmitted = false;
      this.maskOutgoingPackets = maskOutgoingPackets;
      this.maskBytes = bufferAllocUnsafe(4);
      this.frameHeader = bufferAllocUnsafe(10);
      this.bufferList = new BufferList();
      this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      this.fragmentationSize = 0;
      this.frameQueue = [];
      this.connected = true;
      this.state = STATE_OPEN;
      this.waitingForCloseResponse = false;
      this.receivedEnd = false;
      this.closeTimeout = this.config.closeTimeout;
      this.assembleFragments = this.config.assembleFragments;
      this.maxReceivedMessageSize = this.config.maxReceivedMessageSize;
      this.outputBufferFull = false;
      this.inputPaused = false;
      this.receivedDataHandler = this.processReceivedData.bind(this);
      this._closeTimerHandler = this.handleCloseTimer.bind(this);
      this.socket.setNoDelay(this.config.disableNagleAlgorithm);
      this.socket.setTimeout(0);
      if (this.config.keepalive && !this.config.useNativeKeepalive) {
        if (typeof this.config.keepaliveInterval !== "number") {
          throw new Error("keepaliveInterval must be specified and numeric if keepalive is true.");
        }
        this._keepaliveTimerHandler = this.handleKeepaliveTimer.bind(this);
        this.setKeepaliveTimer();
        if (this.config.dropConnectionOnKeepaliveTimeout) {
          if (typeof this.config.keepaliveGracePeriod !== "number") {
            throw new Error("keepaliveGracePeriod  must be specified and numeric if dropConnectionOnKeepaliveTimeout is true.");
          }
          this._gracePeriodTimerHandler = this.handleGracePeriodTimer.bind(this);
        }
      } else if (this.config.keepalive && this.config.useNativeKeepalive) {
        if (!("setKeepAlive" in this.socket)) {
          throw new Error("Unable to use native keepalive: unsupported by this version of Node.");
        }
        this.socket.setKeepAlive(true, this.config.keepaliveInterval);
      }
      this.socket.removeAllListeners("error");
    }
    WebSocketConnection.CLOSE_REASON_NORMAL = 1e3;
    WebSocketConnection.CLOSE_REASON_GOING_AWAY = 1001;
    WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR = 1002;
    WebSocketConnection.CLOSE_REASON_UNPROCESSABLE_INPUT = 1003;
    WebSocketConnection.CLOSE_REASON_RESERVED = 1004;
    WebSocketConnection.CLOSE_REASON_NOT_PROVIDED = 1005;
    WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006;
    WebSocketConnection.CLOSE_REASON_INVALID_DATA = 1007;
    WebSocketConnection.CLOSE_REASON_POLICY_VIOLATION = 1008;
    WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
    WebSocketConnection.CLOSE_REASON_EXTENSION_REQUIRED = 1010;
    WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011;
    WebSocketConnection.CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015;
    WebSocketConnection.CLOSE_DESCRIPTIONS = {
      1e3: "Normal connection closure",
      1001: "Remote peer is going away",
      1002: "Protocol error",
      1003: "Unprocessable input",
      1004: "Reserved",
      1005: "Reason not provided",
      1006: "Abnormal closure, no further detail available",
      1007: "Invalid data received",
      1008: "Policy violation",
      1009: "Message too big",
      1010: "Extension requested by client is required",
      1011: "Internal Server Error",
      1015: "TLS Handshake Failed"
    };
    function validateCloseReason(code) {
      if (code < 1e3) {
        return false;
      }
      if (code >= 1e3 && code <= 2999) {
        return [1e3, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015].indexOf(code) !== -1;
      }
      if (code >= 3e3 && code <= 3999) {
        return true;
      }
      if (code >= 4e3 && code <= 4999) {
        return true;
      }
      if (code >= 5e3) {
        return false;
      }
    }
    util.inherits(WebSocketConnection, EventEmitter);
    WebSocketConnection.prototype._addSocketEventListeners = function() {
      this.socket.on("error", this.handleSocketError.bind(this));
      this.socket.on("end", this.handleSocketEnd.bind(this));
      this.socket.on("close", this.handleSocketClose.bind(this));
      this.socket.on("drain", this.handleSocketDrain.bind(this));
      this.socket.on("pause", this.handleSocketPause.bind(this));
      this.socket.on("resume", this.handleSocketResume.bind(this));
      this.socket.on("data", this.handleSocketData.bind(this));
    };
    WebSocketConnection.prototype.setKeepaliveTimer = function() {
      this._debug("setKeepaliveTimer");
      if (!this.config.keepalive || this.config.useNativeKeepalive) {
        return;
      }
      this.clearKeepaliveTimer();
      this.clearGracePeriodTimer();
      this._keepaliveTimeoutID = setTimeout(this._keepaliveTimerHandler, this.config.keepaliveInterval);
    };
    WebSocketConnection.prototype.clearKeepaliveTimer = function() {
      if (this._keepaliveTimeoutID) {
        clearTimeout(this._keepaliveTimeoutID);
      }
    };
    WebSocketConnection.prototype.handleKeepaliveTimer = function() {
      this._debug("handleKeepaliveTimer");
      this._keepaliveTimeoutID = null;
      this.ping();
      if (this.config.dropConnectionOnKeepaliveTimeout) {
        this.setGracePeriodTimer();
      } else {
        this.setKeepaliveTimer();
      }
    };
    WebSocketConnection.prototype.setGracePeriodTimer = function() {
      this._debug("setGracePeriodTimer");
      this.clearGracePeriodTimer();
      this._gracePeriodTimeoutID = setTimeout(this._gracePeriodTimerHandler, this.config.keepaliveGracePeriod);
    };
    WebSocketConnection.prototype.clearGracePeriodTimer = function() {
      if (this._gracePeriodTimeoutID) {
        clearTimeout(this._gracePeriodTimeoutID);
      }
    };
    WebSocketConnection.prototype.handleGracePeriodTimer = function() {
      this._debug("handleGracePeriodTimer");
      this._gracePeriodTimeoutID = null;
      this.drop(WebSocketConnection.CLOSE_REASON_ABNORMAL, "Peer not responding.", true);
    };
    WebSocketConnection.prototype.handleSocketData = function(data) {
      this._debug("handleSocketData");
      this.setKeepaliveTimer();
      this.bufferList.write(data);
      this.processReceivedData();
    };
    WebSocketConnection.prototype.processReceivedData = function() {
      this._debug("processReceivedData");
      if (!this.connected) {
        return;
      }
      if (this.inputPaused) {
        return;
      }
      var frame = this.currentFrame;
      if (!frame.addData(this.bufferList)) {
        this._debug("-- insufficient data for frame");
        return;
      }
      var self2 = this;
      if (frame.protocolError) {
        this._debug("-- protocol error");
        process.nextTick(function() {
          self2.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, frame.dropReason);
        });
        return;
      } else if (frame.frameTooLarge) {
        this._debug("-- frame too large");
        process.nextTick(function() {
          self2.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG, frame.dropReason);
        });
        return;
      }
      if (frame.rsv1 || frame.rsv2 || frame.rsv3) {
        this._debug("-- illegal rsv flag");
        process.nextTick(function() {
          self2.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, "Unsupported usage of rsv bits without negotiated extension.");
        });
        return;
      }
      if (!this.assembleFragments) {
        this._debug("-- emitting frame");
        process.nextTick(function() {
          self2.emit("frame", frame);
        });
      }
      process.nextTick(function() {
        self2.processFrame(frame);
      });
      this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      if (this.bufferList.length > 0) {
        setImmediateImpl(this.receivedDataHandler);
      }
    };
    WebSocketConnection.prototype.handleSocketError = function(error3) {
      this._debug("handleSocketError: %j", error3);
      if (this.state === STATE_CLOSED) {
        this._debug("  --- Socket 'error' after 'close'");
        return;
      }
      this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
      this.closeDescription = "Socket Error: " + error3.syscall + " " + error3.code;
      this.connected = false;
      this.state = STATE_CLOSED;
      this.fragmentationSize = 0;
      if (utils.eventEmitterListenerCount(this, "error") > 0) {
        this.emit("error", error3);
      }
      this.socket.destroy();
      this._debug.printOutput();
    };
    WebSocketConnection.prototype.handleSocketEnd = function() {
      this._debug("handleSocketEnd: received socket end.  state = %s", this.state);
      this.receivedEnd = true;
      if (this.state === STATE_CLOSED) {
        this._debug("  --- Socket 'end' after 'close'");
        return;
      }
      if (this.state !== STATE_PEER_REQUESTED_CLOSE && this.state !== STATE_ENDING) {
        this._debug("  --- UNEXPECTED socket end.");
        this.socket.end();
      }
    };
    WebSocketConnection.prototype.handleSocketClose = function(hadError) {
      this._debug("handleSocketClose: received socket close");
      this.socketHadError = hadError;
      this.connected = false;
      this.state = STATE_CLOSED;
      if (this.closeReasonCode === -1) {
        this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
        this.closeDescription = "Connection dropped by remote peer.";
      }
      this.clearCloseTimer();
      this.clearKeepaliveTimer();
      this.clearGracePeriodTimer();
      if (!this.closeEventEmitted) {
        this.closeEventEmitted = true;
        this._debug("-- Emitting WebSocketConnection close event");
        this.emit("close", this.closeReasonCode, this.closeDescription);
      }
    };
    WebSocketConnection.prototype.handleSocketDrain = function() {
      this._debug("handleSocketDrain: socket drain event");
      this.outputBufferFull = false;
      this.emit("drain");
    };
    WebSocketConnection.prototype.handleSocketPause = function() {
      this._debug("handleSocketPause: socket pause event");
      this.inputPaused = true;
      this.emit("pause");
    };
    WebSocketConnection.prototype.handleSocketResume = function() {
      this._debug("handleSocketResume: socket resume event");
      this.inputPaused = false;
      this.emit("resume");
      this.processReceivedData();
    };
    WebSocketConnection.prototype.pause = function() {
      this._debug("pause: pause requested");
      this.socket.pause();
    };
    WebSocketConnection.prototype.resume = function() {
      this._debug("resume: resume requested");
      this.socket.resume();
    };
    WebSocketConnection.prototype.close = function(reasonCode, description) {
      if (this.connected) {
        this._debug("close: Initating clean WebSocket close sequence.");
        if (typeof reasonCode !== "number") {
          reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
        }
        if (!validateCloseReason(reasonCode)) {
          throw new Error("Close code " + reasonCode + " is not valid.");
        }
        if (typeof description !== "string") {
          description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
        }
        this.closeReasonCode = reasonCode;
        this.closeDescription = description;
        this.setCloseTimer();
        this.sendCloseFrame(this.closeReasonCode, this.closeDescription);
        this.state = STATE_ENDING;
        this.connected = false;
      }
    };
    WebSocketConnection.prototype.drop = function(reasonCode, description, skipCloseFrame) {
      this._debug("drop");
      if (typeof reasonCode !== "number") {
        reasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
      }
      if (typeof description !== "string") {
        description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
      }
      this._debug("Forcefully dropping connection. skipCloseFrame: %s, code: %d, description: %s", skipCloseFrame, reasonCode, description);
      this.closeReasonCode = reasonCode;
      this.closeDescription = description;
      this.frameQueue = [];
      this.fragmentationSize = 0;
      if (!skipCloseFrame) {
        this.sendCloseFrame(reasonCode, description);
      }
      this.connected = false;
      this.state = STATE_CLOSED;
      this.clearCloseTimer();
      this.clearKeepaliveTimer();
      this.clearGracePeriodTimer();
      if (!this.closeEventEmitted) {
        this.closeEventEmitted = true;
        this._debug("Emitting WebSocketConnection close event");
        this.emit("close", this.closeReasonCode, this.closeDescription);
      }
      this._debug("Drop: destroying socket");
      this.socket.destroy();
    };
    WebSocketConnection.prototype.setCloseTimer = function() {
      this._debug("setCloseTimer");
      this.clearCloseTimer();
      this._debug("Setting close timer");
      this.waitingForCloseResponse = true;
      this.closeTimer = setTimeout(this._closeTimerHandler, this.closeTimeout);
    };
    WebSocketConnection.prototype.clearCloseTimer = function() {
      this._debug("clearCloseTimer");
      if (this.closeTimer) {
        this._debug("Clearing close timer");
        clearTimeout(this.closeTimer);
        this.waitingForCloseResponse = false;
        this.closeTimer = null;
      }
    };
    WebSocketConnection.prototype.handleCloseTimer = function() {
      this._debug("handleCloseTimer");
      this.closeTimer = null;
      if (this.waitingForCloseResponse) {
        this._debug("Close response not received from client.  Forcing socket end.");
        this.waitingForCloseResponse = false;
        this.state = STATE_CLOSED;
        this.socket.end();
      }
    };
    WebSocketConnection.prototype.processFrame = function(frame) {
      this._debug("processFrame");
      this._debug(" -- frame: %s", frame);
      if (this.frameQueue.length !== 0 && (frame.opcode > 0 && frame.opcode < 8)) {
        this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, "Illegal frame opcode 0x" + frame.opcode.toString(16) + " received in middle of fragmented message.");
        return;
      }
      switch (frame.opcode) {
        case 2:
          this._debug("-- Binary Frame");
          if (this.assembleFragments) {
            if (frame.fin) {
              this._debug("---- Emitting 'message' event");
              this.emit("message", {
                type: "binary",
                binaryData: frame.binaryPayload
              });
            } else {
              this.frameQueue.push(frame);
              this.fragmentationSize = frame.length;
            }
          }
          break;
        case 1:
          this._debug("-- Text Frame");
          if (this.assembleFragments) {
            if (frame.fin) {
              if (!isValidUTF8(frame.binaryPayload)) {
                this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA, "Invalid UTF-8 Data Received");
                return;
              }
              this._debug("---- Emitting 'message' event");
              this.emit("message", {
                type: "utf8",
                utf8Data: frame.binaryPayload.toString("utf8")
              });
            } else {
              this.frameQueue.push(frame);
              this.fragmentationSize = frame.length;
            }
          }
          break;
        case 0:
          this._debug("-- Continuation Frame");
          if (this.assembleFragments) {
            if (this.frameQueue.length === 0) {
              this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, "Unexpected Continuation Frame");
              return;
            }
            this.fragmentationSize += frame.length;
            if (this.fragmentationSize > this.maxReceivedMessageSize) {
              this.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG, "Maximum message size exceeded.");
              return;
            }
            this.frameQueue.push(frame);
            if (frame.fin) {
              var bytesCopied = 0;
              var binaryPayload = bufferAllocUnsafe(this.fragmentationSize);
              var opcode = this.frameQueue[0].opcode;
              this.frameQueue.forEach(function(currentFrame) {
                currentFrame.binaryPayload.copy(binaryPayload, bytesCopied);
                bytesCopied += currentFrame.binaryPayload.length;
              });
              this.frameQueue = [];
              this.fragmentationSize = 0;
              switch (opcode) {
                case 2:
                  this.emit("message", {
                    type: "binary",
                    binaryData: binaryPayload
                  });
                  break;
                case 1:
                  if (!isValidUTF8(binaryPayload)) {
                    this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA, "Invalid UTF-8 Data Received");
                    return;
                  }
                  this.emit("message", {
                    type: "utf8",
                    utf8Data: binaryPayload.toString("utf8")
                  });
                  break;
                default:
                  this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, "Unexpected first opcode in fragmentation sequence: 0x" + opcode.toString(16));
                  return;
              }
            }
          }
          break;
        case 9:
          this._debug("-- Ping Frame");
          if (this._pingListenerCount > 0) {
            var cancelled = false;
            var cancel = function() {
              cancelled = true;
            };
            this.emit("ping", cancel, frame.binaryPayload);
            if (!cancelled) {
              this.pong(frame.binaryPayload);
            }
          } else {
            this.pong(frame.binaryPayload);
          }
          break;
        case 10:
          this._debug("-- Pong Frame");
          this.emit("pong", frame.binaryPayload);
          break;
        case 8:
          this._debug("-- Close Frame");
          if (this.waitingForCloseResponse) {
            this._debug("---- Got close response from peer.  Completing closing handshake.");
            this.clearCloseTimer();
            this.waitingForCloseResponse = false;
            this.state = STATE_CLOSED;
            this.socket.end();
            return;
          }
          this._debug("---- Closing handshake initiated by peer.");
          this.state = STATE_PEER_REQUESTED_CLOSE;
          var respondCloseReasonCode;
          if (frame.invalidCloseFrameLength) {
            this.closeReasonCode = 1005;
            respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
          } else if (frame.closeStatus === -1 || validateCloseReason(frame.closeStatus)) {
            this.closeReasonCode = frame.closeStatus;
            respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
          } else {
            this.closeReasonCode = frame.closeStatus;
            respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
          }
          if (frame.binaryPayload.length > 1) {
            if (!isValidUTF8(frame.binaryPayload)) {
              this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA, "Invalid UTF-8 Data Received");
              return;
            }
            this.closeDescription = frame.binaryPayload.toString("utf8");
          } else {
            this.closeDescription = WebSocketConnection.CLOSE_DESCRIPTIONS[this.closeReasonCode];
          }
          this._debug("------ Remote peer %s - code: %d - %s - close frame payload length: %d", this.remoteAddress, this.closeReasonCode, this.closeDescription, frame.length);
          this._debug("------ responding to remote peer's close request.");
          this.sendCloseFrame(respondCloseReasonCode, null);
          this.connected = false;
          break;
        default:
          this._debug("-- Unrecognized Opcode %d", frame.opcode);
          this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, "Unrecognized Opcode: 0x" + frame.opcode.toString(16));
          break;
      }
    };
    WebSocketConnection.prototype.send = function(data, cb) {
      this._debug("send");
      if (Buffer.isBuffer(data)) {
        this.sendBytes(data, cb);
      } else if (typeof data["toString"] === "function") {
        this.sendUTF(data, cb);
      } else {
        throw new Error("Data provided must either be a Node Buffer or implement toString()");
      }
    };
    WebSocketConnection.prototype.sendUTF = function(data, cb) {
      data = bufferFromString(data.toString(), "utf8");
      this._debug("sendUTF: %d bytes", data.length);
      var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      frame.opcode = 1;
      frame.binaryPayload = data;
      this.fragmentAndSend(frame, cb);
    };
    WebSocketConnection.prototype.sendBytes = function(data, cb) {
      this._debug("sendBytes");
      if (!Buffer.isBuffer(data)) {
        throw new Error("You must pass a Node Buffer object to WebSocketConnection.prototype.sendBytes()");
      }
      var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      frame.opcode = 2;
      frame.binaryPayload = data;
      this.fragmentAndSend(frame, cb);
    };
    WebSocketConnection.prototype.ping = function(data) {
      this._debug("ping");
      var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      frame.opcode = 9;
      frame.fin = true;
      if (data) {
        if (!Buffer.isBuffer(data)) {
          data = bufferFromString(data.toString(), "utf8");
        }
        if (data.length > 125) {
          this._debug("WebSocket: Data for ping is longer than 125 bytes.  Truncating.");
          data = data.slice(0, 124);
        }
        frame.binaryPayload = data;
      }
      this.sendFrame(frame);
    };
    WebSocketConnection.prototype.pong = function(binaryPayload) {
      this._debug("pong");
      var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      frame.opcode = 10;
      if (Buffer.isBuffer(binaryPayload) && binaryPayload.length > 125) {
        this._debug("WebSocket: Data for pong is longer than 125 bytes.  Truncating.");
        binaryPayload = binaryPayload.slice(0, 124);
      }
      frame.binaryPayload = binaryPayload;
      frame.fin = true;
      this.sendFrame(frame);
    };
    WebSocketConnection.prototype.fragmentAndSend = function(frame, cb) {
      this._debug("fragmentAndSend");
      if (frame.opcode > 7) {
        throw new Error("You cannot fragment control frames.");
      }
      var threshold = this.config.fragmentationThreshold;
      var length = frame.binaryPayload.length;
      if (!this.config.fragmentOutgoingMessages || frame.binaryPayload && length <= threshold) {
        frame.fin = true;
        this.sendFrame(frame, cb);
        return;
      }
      var numFragments = Math.ceil(length / threshold);
      var sentFragments = 0;
      var sentCallback = function fragmentSentCallback(err) {
        if (err) {
          if (typeof cb === "function") {
            cb(err);
            cb = null;
          }
          return;
        }
        ++sentFragments;
        if (sentFragments === numFragments && typeof cb === "function") {
          cb();
        }
      };
      for (var i = 1; i <= numFragments; i++) {
        var currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        currentFrame.opcode = i === 1 ? frame.opcode : 0;
        currentFrame.fin = i === numFragments;
        var currentLength = i === numFragments ? length - threshold * (i - 1) : threshold;
        var sliceStart = threshold * (i - 1);
        currentFrame.binaryPayload = frame.binaryPayload.slice(sliceStart, sliceStart + currentLength);
        this.sendFrame(currentFrame, sentCallback);
      }
    };
    WebSocketConnection.prototype.sendCloseFrame = function(reasonCode, description, cb) {
      if (typeof reasonCode !== "number") {
        reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
      }
      this._debug("sendCloseFrame state: %s, reasonCode: %d, description: %s", this.state, reasonCode, description);
      if (this.state !== STATE_OPEN && this.state !== STATE_PEER_REQUESTED_CLOSE) {
        return;
      }
      var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
      frame.fin = true;
      frame.opcode = 8;
      frame.closeStatus = reasonCode;
      if (typeof description === "string") {
        frame.binaryPayload = bufferFromString(description, "utf8");
      }
      this.sendFrame(frame, cb);
      this.socket.end();
    };
    WebSocketConnection.prototype.sendFrame = function(frame, cb) {
      this._debug("sendFrame");
      frame.mask = this.maskOutgoingPackets;
      var flushed = this.socket.write(frame.toBuffer(), cb);
      this.outputBufferFull = !flushed;
      return flushed;
    };
    module2.exports = WebSocketConnection;
    function instrumentSocketForDebugging(connection, socket) {
      if (!connection._debug.enabled) {
        return;
      }
      var originalSocketEmit = socket.emit;
      socket.emit = function(event) {
        connection._debug("||| Socket Event  '%s'", event);
        originalSocketEmit.apply(this, arguments);
      };
      for (var key in socket) {
        if (typeof socket[key] !== "function") {
          continue;
        }
        if (["emit"].indexOf(key) !== -1) {
          continue;
        }
        (function(key2) {
          var original = socket[key2];
          if (key2 === "on") {
            socket[key2] = function proxyMethod__EventEmitter__On() {
              connection._debug("||| Socket method called:  %s (%s)", key2, arguments[0]);
              return original.apply(this, arguments);
            };
            return;
          }
          socket[key2] = function proxyMethod() {
            connection._debug("||| Socket method called:  %s", key2);
            return original.apply(this, arguments);
          };
        })(key);
      }
    }
  }
});

// node_modules/websocket/lib/WebSocketRequest.js
var require_WebSocketRequest = __commonJS({
  "node_modules/websocket/lib/WebSocketRequest.js"(exports, module2) {
    init_shims();
    var crypto = require("crypto");
    var util = require("util");
    var url = require("url");
    var EventEmitter = require("events").EventEmitter;
    var WebSocketConnection = require_WebSocketConnection();
    var headerValueSplitRegExp = /,\s*/;
    var headerParamSplitRegExp = /;\s*/;
    var headerSanitizeRegExp = /[\r\n]/g;
    var xForwardedForSeparatorRegExp = /,\s*/;
    var separators = [
      "(",
      ")",
      "<",
      ">",
      "@",
      ",",
      ";",
      ":",
      "\\",
      '"',
      "/",
      "[",
      "]",
      "?",
      "=",
      "{",
      "}",
      " ",
      String.fromCharCode(9)
    ];
    var controlChars = [String.fromCharCode(127)];
    for (i = 0; i < 31; i++) {
      controlChars.push(String.fromCharCode(i));
    }
    var i;
    var cookieNameValidateRegEx = /([\x00-\x20\x22\x28\x29\x2c\x2f\x3a-\x3f\x40\x5b-\x5e\x7b\x7d\x7f])/;
    var cookieValueValidateRegEx = /[^\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]/;
    var cookieValueDQuoteValidateRegEx = /^"[^"]*"$/;
    var controlCharsAndSemicolonRegEx = /[\x00-\x20\x3b]/g;
    var cookieSeparatorRegEx = /[;,] */;
    var httpStatusDescriptions = {
      100: "Continue",
      101: "Switching Protocols",
      200: "OK",
      201: "Created",
      203: "Non-Authoritative Information",
      204: "No Content",
      205: "Reset Content",
      206: "Partial Content",
      300: "Multiple Choices",
      301: "Moved Permanently",
      302: "Found",
      303: "See Other",
      304: "Not Modified",
      305: "Use Proxy",
      307: "Temporary Redirect",
      400: "Bad Request",
      401: "Unauthorized",
      402: "Payment Required",
      403: "Forbidden",
      404: "Not Found",
      406: "Not Acceptable",
      407: "Proxy Authorization Required",
      408: "Request Timeout",
      409: "Conflict",
      410: "Gone",
      411: "Length Required",
      412: "Precondition Failed",
      413: "Request Entity Too Long",
      414: "Request-URI Too Long",
      415: "Unsupported Media Type",
      416: "Requested Range Not Satisfiable",
      417: "Expectation Failed",
      426: "Upgrade Required",
      500: "Internal Server Error",
      501: "Not Implemented",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
      505: "HTTP Version Not Supported"
    };
    function WebSocketRequest(socket, httpRequest, serverConfig) {
      EventEmitter.call(this);
      this.socket = socket;
      this.httpRequest = httpRequest;
      this.resource = httpRequest.url;
      this.remoteAddress = socket.remoteAddress;
      this.remoteAddresses = [this.remoteAddress];
      this.serverConfig = serverConfig;
      this._socketIsClosing = false;
      this._socketCloseHandler = this._handleSocketCloseBeforeAccept.bind(this);
      this.socket.on("end", this._socketCloseHandler);
      this.socket.on("close", this._socketCloseHandler);
      this._resolved = false;
    }
    util.inherits(WebSocketRequest, EventEmitter);
    WebSocketRequest.prototype.readHandshake = function() {
      var self2 = this;
      var request = this.httpRequest;
      this.resourceURL = url.parse(this.resource, true);
      this.host = request.headers["host"];
      if (!this.host) {
        throw new Error("Client must provide a Host header.");
      }
      this.key = request.headers["sec-websocket-key"];
      if (!this.key) {
        throw new Error("Client must provide a value for Sec-WebSocket-Key.");
      }
      this.webSocketVersion = parseInt(request.headers["sec-websocket-version"], 10);
      if (!this.webSocketVersion || isNaN(this.webSocketVersion)) {
        throw new Error("Client must provide a value for Sec-WebSocket-Version.");
      }
      switch (this.webSocketVersion) {
        case 8:
        case 13:
          break;
        default:
          var e = new Error("Unsupported websocket client version: " + this.webSocketVersion + "Only versions 8 and 13 are supported.");
          e.httpCode = 426;
          e.headers = {
            "Sec-WebSocket-Version": "13"
          };
          throw e;
      }
      if (this.webSocketVersion === 13) {
        this.origin = request.headers["origin"];
      } else if (this.webSocketVersion === 8) {
        this.origin = request.headers["sec-websocket-origin"];
      }
      var protocolString = request.headers["sec-websocket-protocol"];
      this.protocolFullCaseMap = {};
      this.requestedProtocols = [];
      if (protocolString) {
        var requestedProtocolsFullCase = protocolString.split(headerValueSplitRegExp);
        requestedProtocolsFullCase.forEach(function(protocol) {
          var lcProtocol = protocol.toLocaleLowerCase();
          self2.requestedProtocols.push(lcProtocol);
          self2.protocolFullCaseMap[lcProtocol] = protocol;
        });
      }
      if (!this.serverConfig.ignoreXForwardedFor && request.headers["x-forwarded-for"]) {
        var immediatePeerIP = this.remoteAddress;
        this.remoteAddresses = request.headers["x-forwarded-for"].split(xForwardedForSeparatorRegExp);
        this.remoteAddresses.push(immediatePeerIP);
        this.remoteAddress = this.remoteAddresses[0];
      }
      if (this.serverConfig.parseExtensions) {
        var extensionsString = request.headers["sec-websocket-extensions"];
        this.requestedExtensions = this.parseExtensions(extensionsString);
      } else {
        this.requestedExtensions = [];
      }
      if (this.serverConfig.parseCookies) {
        var cookieString = request.headers["cookie"];
        this.cookies = this.parseCookies(cookieString);
      } else {
        this.cookies = [];
      }
    };
    WebSocketRequest.prototype.parseExtensions = function(extensionsString) {
      if (!extensionsString || extensionsString.length === 0) {
        return [];
      }
      var extensions = extensionsString.toLocaleLowerCase().split(headerValueSplitRegExp);
      extensions.forEach(function(extension, index2, array) {
        var params = extension.split(headerParamSplitRegExp);
        var extensionName = params[0];
        var extensionParams = params.slice(1);
        extensionParams.forEach(function(rawParam, index3, array2) {
          var arr = rawParam.split("=");
          var obj2 = {
            name: arr[0],
            value: arr[1]
          };
          array2.splice(index3, 1, obj2);
        });
        var obj = {
          name: extensionName,
          params: extensionParams
        };
        array.splice(index2, 1, obj);
      });
      return extensions;
    };
    WebSocketRequest.prototype.parseCookies = function(str) {
      if (!str || typeof str !== "string") {
        return [];
      }
      var cookies = [];
      var pairs = str.split(cookieSeparatorRegEx);
      pairs.forEach(function(pair) {
        var eq_idx = pair.indexOf("=");
        if (eq_idx === -1) {
          cookies.push({
            name: pair,
            value: null
          });
          return;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] === '"') {
          val = val.slice(1, -1);
        }
        cookies.push({
          name: key,
          value: decodeURIComponent(val)
        });
      });
      return cookies;
    };
    WebSocketRequest.prototype.accept = function(acceptedProtocol, allowedOrigin, cookies) {
      this._verifyResolution();
      var protocolFullCase;
      if (acceptedProtocol) {
        protocolFullCase = this.protocolFullCaseMap[acceptedProtocol.toLocaleLowerCase()];
        if (typeof protocolFullCase === "undefined") {
          protocolFullCase = acceptedProtocol;
        }
      } else {
        protocolFullCase = acceptedProtocol;
      }
      this.protocolFullCaseMap = null;
      var sha1 = crypto.createHash("sha1");
      sha1.update(this.key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
      var acceptKey = sha1.digest("base64");
      var response = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + acceptKey + "\r\n";
      if (protocolFullCase) {
        for (var i2 = 0; i2 < protocolFullCase.length; i2++) {
          var charCode = protocolFullCase.charCodeAt(i2);
          var character = protocolFullCase.charAt(i2);
          if (charCode < 33 || charCode > 126 || separators.indexOf(character) !== -1) {
            this.reject(500);
            throw new Error('Illegal character "' + String.fromCharCode(character) + '" in subprotocol.');
          }
        }
        if (this.requestedProtocols.indexOf(acceptedProtocol) === -1) {
          this.reject(500);
          throw new Error("Specified protocol was not requested by the client.");
        }
        protocolFullCase = protocolFullCase.replace(headerSanitizeRegExp, "");
        response += "Sec-WebSocket-Protocol: " + protocolFullCase + "\r\n";
      }
      this.requestedProtocols = null;
      if (allowedOrigin) {
        allowedOrigin = allowedOrigin.replace(headerSanitizeRegExp, "");
        if (this.webSocketVersion === 13) {
          response += "Origin: " + allowedOrigin + "\r\n";
        } else if (this.webSocketVersion === 8) {
          response += "Sec-WebSocket-Origin: " + allowedOrigin + "\r\n";
        }
      }
      if (cookies) {
        if (!Array.isArray(cookies)) {
          this.reject(500);
          throw new Error('Value supplied for "cookies" argument must be an array.');
        }
        var seenCookies = {};
        cookies.forEach(function(cookie) {
          if (!cookie.name || !cookie.value) {
            this.reject(500);
            throw new Error('Each cookie to set must at least provide a "name" and "value"');
          }
          cookie.name = cookie.name.replace(controlCharsAndSemicolonRegEx, "");
          cookie.value = cookie.value.replace(controlCharsAndSemicolonRegEx, "");
          if (seenCookies[cookie.name]) {
            this.reject(500);
            throw new Error("You may not specify the same cookie name twice.");
          }
          seenCookies[cookie.name] = true;
          var invalidChar = cookie.name.match(cookieNameValidateRegEx);
          if (invalidChar) {
            this.reject(500);
            throw new Error("Illegal character " + invalidChar[0] + " in cookie name");
          }
          if (cookie.value.match(cookieValueDQuoteValidateRegEx)) {
            invalidChar = cookie.value.slice(1, -1).match(cookieValueValidateRegEx);
          } else {
            invalidChar = cookie.value.match(cookieValueValidateRegEx);
          }
          if (invalidChar) {
            this.reject(500);
            throw new Error("Illegal character " + invalidChar[0] + " in cookie value");
          }
          var cookieParts = [cookie.name + "=" + cookie.value];
          if (cookie.path) {
            invalidChar = cookie.path.match(controlCharsAndSemicolonRegEx);
            if (invalidChar) {
              this.reject(500);
              throw new Error("Illegal character " + invalidChar[0] + " in cookie path");
            }
            cookieParts.push("Path=" + cookie.path);
          }
          if (cookie.domain) {
            if (typeof cookie.domain !== "string") {
              this.reject(500);
              throw new Error("Domain must be specified and must be a string.");
            }
            invalidChar = cookie.domain.match(controlCharsAndSemicolonRegEx);
            if (invalidChar) {
              this.reject(500);
              throw new Error("Illegal character " + invalidChar[0] + " in cookie domain");
            }
            cookieParts.push("Domain=" + cookie.domain.toLowerCase());
          }
          if (cookie.expires) {
            if (!(cookie.expires instanceof Date)) {
              this.reject(500);
              throw new Error('Value supplied for cookie "expires" must be a vaild date object');
            }
            cookieParts.push("Expires=" + cookie.expires.toGMTString());
          }
          if (cookie.maxage) {
            var maxage = cookie.maxage;
            if (typeof maxage === "string") {
              maxage = parseInt(maxage, 10);
            }
            if (isNaN(maxage) || maxage <= 0) {
              this.reject(500);
              throw new Error('Value supplied for cookie "maxage" must be a non-zero number');
            }
            maxage = Math.round(maxage);
            cookieParts.push("Max-Age=" + maxage.toString(10));
          }
          if (cookie.secure) {
            if (typeof cookie.secure !== "boolean") {
              this.reject(500);
              throw new Error('Value supplied for cookie "secure" must be of type boolean');
            }
            cookieParts.push("Secure");
          }
          if (cookie.httponly) {
            if (typeof cookie.httponly !== "boolean") {
              this.reject(500);
              throw new Error('Value supplied for cookie "httponly" must be of type boolean');
            }
            cookieParts.push("HttpOnly");
          }
          response += "Set-Cookie: " + cookieParts.join(";") + "\r\n";
        }.bind(this));
      }
      this._resolved = true;
      this.emit("requestResolved", this);
      response += "\r\n";
      var connection = new WebSocketConnection(this.socket, [], acceptedProtocol, false, this.serverConfig);
      connection.webSocketVersion = this.webSocketVersion;
      connection.remoteAddress = this.remoteAddress;
      connection.remoteAddresses = this.remoteAddresses;
      var self2 = this;
      if (this._socketIsClosing) {
        cleanupFailedConnection(connection);
      } else {
        this.socket.write(response, "ascii", function(error3) {
          if (error3) {
            cleanupFailedConnection(connection);
            return;
          }
          self2._removeSocketCloseListeners();
          connection._addSocketEventListeners();
        });
      }
      this.emit("requestAccepted", connection);
      return connection;
    };
    WebSocketRequest.prototype.reject = function(status, reason, extraHeaders) {
      this._verifyResolution();
      this._resolved = true;
      this.emit("requestResolved", this);
      if (typeof status !== "number") {
        status = 403;
      }
      var response = "HTTP/1.1 " + status + " " + httpStatusDescriptions[status] + "\r\nConnection: close\r\n";
      if (reason) {
        reason = reason.replace(headerSanitizeRegExp, "");
        response += "X-WebSocket-Reject-Reason: " + reason + "\r\n";
      }
      if (extraHeaders) {
        for (var key in extraHeaders) {
          var sanitizedValue = extraHeaders[key].toString().replace(headerSanitizeRegExp, "");
          var sanitizedKey = key.replace(headerSanitizeRegExp, "");
          response += sanitizedKey + ": " + sanitizedValue + "\r\n";
        }
      }
      response += "\r\n";
      this.socket.end(response, "ascii");
      this.emit("requestRejected", this);
    };
    WebSocketRequest.prototype._handleSocketCloseBeforeAccept = function() {
      this._socketIsClosing = true;
      this._removeSocketCloseListeners();
    };
    WebSocketRequest.prototype._removeSocketCloseListeners = function() {
      this.socket.removeListener("end", this._socketCloseHandler);
      this.socket.removeListener("close", this._socketCloseHandler);
    };
    WebSocketRequest.prototype._verifyResolution = function() {
      if (this._resolved) {
        throw new Error("WebSocketRequest may only be accepted or rejected one time.");
      }
    };
    function cleanupFailedConnection(connection) {
      process.nextTick(function() {
        connection.drop(1006, "TCP connection lost before handshake completed.", true);
      });
    }
    module2.exports = WebSocketRequest;
  }
});

// node_modules/websocket/lib/WebSocketServer.js
var require_WebSocketServer = __commonJS({
  "node_modules/websocket/lib/WebSocketServer.js"(exports, module2) {
    init_shims();
    var extend = require_utils().extend;
    var utils = require_utils();
    var util = require("util");
    var debug = require_src()("websocket:server");
    var EventEmitter = require("events").EventEmitter;
    var WebSocketRequest = require_WebSocketRequest();
    var WebSocketServer = function WebSocketServer2(config) {
      EventEmitter.call(this);
      this._handlers = {
        upgrade: this.handleUpgrade.bind(this),
        requestAccepted: this.handleRequestAccepted.bind(this),
        requestResolved: this.handleRequestResolved.bind(this)
      };
      this.connections = [];
      this.pendingRequests = [];
      if (config) {
        this.mount(config);
      }
    };
    util.inherits(WebSocketServer, EventEmitter);
    WebSocketServer.prototype.mount = function(config) {
      this.config = {
        httpServer: null,
        maxReceivedFrameSize: 65536,
        maxReceivedMessageSize: 1048576,
        fragmentOutgoingMessages: true,
        fragmentationThreshold: 16384,
        keepalive: true,
        keepaliveInterval: 2e4,
        dropConnectionOnKeepaliveTimeout: true,
        keepaliveGracePeriod: 1e4,
        useNativeKeepalive: false,
        assembleFragments: true,
        autoAcceptConnections: false,
        ignoreXForwardedFor: false,
        parseCookies: true,
        parseExtensions: true,
        disableNagleAlgorithm: true,
        closeTimeout: 5e3
      };
      extend(this.config, config);
      if (this.config.httpServer) {
        if (!Array.isArray(this.config.httpServer)) {
          this.config.httpServer = [this.config.httpServer];
        }
        var upgradeHandler = this._handlers.upgrade;
        this.config.httpServer.forEach(function(httpServer) {
          httpServer.on("upgrade", upgradeHandler);
        });
      } else {
        throw new Error("You must specify an httpServer on which to mount the WebSocket server.");
      }
    };
    WebSocketServer.prototype.unmount = function() {
      var upgradeHandler = this._handlers.upgrade;
      this.config.httpServer.forEach(function(httpServer) {
        httpServer.removeListener("upgrade", upgradeHandler);
      });
    };
    WebSocketServer.prototype.closeAllConnections = function() {
      this.connections.forEach(function(connection) {
        connection.close();
      });
      this.pendingRequests.forEach(function(request) {
        process.nextTick(function() {
          request.reject(503);
        });
      });
    };
    WebSocketServer.prototype.broadcast = function(data) {
      if (Buffer.isBuffer(data)) {
        this.broadcastBytes(data);
      } else if (typeof data.toString === "function") {
        this.broadcastUTF(data);
      }
    };
    WebSocketServer.prototype.broadcastUTF = function(utfData) {
      this.connections.forEach(function(connection) {
        connection.sendUTF(utfData);
      });
    };
    WebSocketServer.prototype.broadcastBytes = function(binaryData) {
      this.connections.forEach(function(connection) {
        connection.sendBytes(binaryData);
      });
    };
    WebSocketServer.prototype.shutDown = function() {
      this.unmount();
      this.closeAllConnections();
    };
    WebSocketServer.prototype.handleUpgrade = function(request, socket) {
      var self2 = this;
      var wsRequest = new WebSocketRequest(socket, request, this.config);
      try {
        wsRequest.readHandshake();
      } catch (e) {
        wsRequest.reject(e.httpCode ? e.httpCode : 400, e.message, e.headers);
        debug("Invalid handshake: %s", e.message);
        this.emit("upgradeError", e);
        return;
      }
      this.pendingRequests.push(wsRequest);
      wsRequest.once("requestAccepted", this._handlers.requestAccepted);
      wsRequest.once("requestResolved", this._handlers.requestResolved);
      socket.once("close", function() {
        self2._handlers.requestResolved(wsRequest);
      });
      if (!this.config.autoAcceptConnections && utils.eventEmitterListenerCount(this, "request") > 0) {
        this.emit("request", wsRequest);
      } else if (this.config.autoAcceptConnections) {
        wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
      } else {
        wsRequest.reject(404, "No handler is configured to accept the connection.");
      }
    };
    WebSocketServer.prototype.handleRequestAccepted = function(connection) {
      var self2 = this;
      connection.once("close", function(closeReason, description) {
        self2.handleConnectionClose(connection, closeReason, description);
      });
      this.connections.push(connection);
      this.emit("connect", connection);
    };
    WebSocketServer.prototype.handleConnectionClose = function(connection, closeReason, description) {
      var index2 = this.connections.indexOf(connection);
      if (index2 !== -1) {
        this.connections.splice(index2, 1);
      }
      this.emit("close", connection, closeReason, description);
    };
    WebSocketServer.prototype.handleRequestResolved = function(request) {
      var index2 = this.pendingRequests.indexOf(request);
      if (index2 !== -1) {
        this.pendingRequests.splice(index2, 1);
      }
    };
    module2.exports = WebSocketServer;
  }
});

// node_modules/websocket/lib/WebSocketClient.js
var require_WebSocketClient = __commonJS({
  "node_modules/websocket/lib/WebSocketClient.js"(exports, module2) {
    init_shims();
    var utils = require_utils();
    var extend = utils.extend;
    var util = require("util");
    var EventEmitter = require("events").EventEmitter;
    var http2 = require("http");
    var https2 = require("https");
    var url = require("url");
    var crypto = require("crypto");
    var WebSocketConnection = require_WebSocketConnection();
    var bufferAllocUnsafe = utils.bufferAllocUnsafe;
    var protocolSeparators = [
      "(",
      ")",
      "<",
      ">",
      "@",
      ",",
      ";",
      ":",
      "\\",
      '"',
      "/",
      "[",
      "]",
      "?",
      "=",
      "{",
      "}",
      " ",
      String.fromCharCode(9)
    ];
    var excludedTlsOptions = ["hostname", "port", "method", "path", "headers"];
    function WebSocketClient(config) {
      EventEmitter.call(this);
      this.config = {
        maxReceivedFrameSize: 1048576,
        maxReceivedMessageSize: 8388608,
        fragmentOutgoingMessages: true,
        fragmentationThreshold: 16384,
        webSocketVersion: 13,
        assembleFragments: true,
        disableNagleAlgorithm: true,
        closeTimeout: 5e3,
        tlsOptions: {}
      };
      if (config) {
        var tlsOptions;
        if (config.tlsOptions) {
          tlsOptions = config.tlsOptions;
          delete config.tlsOptions;
        } else {
          tlsOptions = {};
        }
        extend(this.config, config);
        extend(this.config.tlsOptions, tlsOptions);
      }
      this._req = null;
      switch (this.config.webSocketVersion) {
        case 8:
        case 13:
          break;
        default:
          throw new Error("Requested webSocketVersion is not supported. Allowed values are 8 and 13.");
      }
    }
    util.inherits(WebSocketClient, EventEmitter);
    WebSocketClient.prototype.connect = function(requestUrl, protocols, origin, headers, extraRequestOptions) {
      var self2 = this;
      if (typeof protocols === "string") {
        if (protocols.length > 0) {
          protocols = [protocols];
        } else {
          protocols = [];
        }
      }
      if (!(protocols instanceof Array)) {
        protocols = [];
      }
      this.protocols = protocols;
      this.origin = origin;
      if (typeof requestUrl === "string") {
        this.url = url.parse(requestUrl);
      } else {
        this.url = requestUrl;
      }
      if (!this.url.protocol) {
        throw new Error("You must specify a full WebSocket URL, including protocol.");
      }
      if (!this.url.host) {
        throw new Error("You must specify a full WebSocket URL, including hostname. Relative URLs are not supported.");
      }
      this.secure = this.url.protocol === "wss:";
      this.protocols.forEach(function(protocol) {
        for (var i2 = 0; i2 < protocol.length; i2++) {
          var charCode = protocol.charCodeAt(i2);
          var character = protocol.charAt(i2);
          if (charCode < 33 || charCode > 126 || protocolSeparators.indexOf(character) !== -1) {
            throw new Error('Protocol list contains invalid character "' + String.fromCharCode(charCode) + '"');
          }
        }
      });
      var defaultPorts = {
        "ws:": "80",
        "wss:": "443"
      };
      if (!this.url.port) {
        this.url.port = defaultPorts[this.url.protocol];
      }
      var nonce = bufferAllocUnsafe(16);
      for (var i = 0; i < 16; i++) {
        nonce[i] = Math.round(Math.random() * 255);
      }
      this.base64nonce = nonce.toString("base64");
      var hostHeaderValue = this.url.hostname;
      if (this.url.protocol === "ws:" && this.url.port !== "80" || this.url.protocol === "wss:" && this.url.port !== "443") {
        hostHeaderValue += ":" + this.url.port;
      }
      var reqHeaders = {};
      if (this.secure && this.config.tlsOptions.hasOwnProperty("headers")) {
        extend(reqHeaders, this.config.tlsOptions.headers);
      }
      if (headers) {
        extend(reqHeaders, headers);
      }
      extend(reqHeaders, {
        "Upgrade": "websocket",
        "Connection": "Upgrade",
        "Sec-WebSocket-Version": this.config.webSocketVersion.toString(10),
        "Sec-WebSocket-Key": this.base64nonce,
        "Host": reqHeaders.Host || hostHeaderValue
      });
      if (this.protocols.length > 0) {
        reqHeaders["Sec-WebSocket-Protocol"] = this.protocols.join(", ");
      }
      if (this.origin) {
        if (this.config.webSocketVersion === 13) {
          reqHeaders["Origin"] = this.origin;
        } else if (this.config.webSocketVersion === 8) {
          reqHeaders["Sec-WebSocket-Origin"] = this.origin;
        }
      }
      var pathAndQuery;
      if (this.url.pathname) {
        pathAndQuery = this.url.path;
      } else if (this.url.path) {
        pathAndQuery = "/" + this.url.path;
      } else {
        pathAndQuery = "/";
      }
      function handleRequestError(error3) {
        self2._req = null;
        self2.emit("connectFailed", error3);
      }
      var requestOptions = {
        agent: false
      };
      if (extraRequestOptions) {
        extend(requestOptions, extraRequestOptions);
      }
      extend(requestOptions, {
        hostname: this.url.hostname,
        port: this.url.port,
        method: "GET",
        path: pathAndQuery,
        headers: reqHeaders
      });
      if (this.secure) {
        var tlsOptions = this.config.tlsOptions;
        for (var key in tlsOptions) {
          if (tlsOptions.hasOwnProperty(key) && excludedTlsOptions.indexOf(key) === -1) {
            requestOptions[key] = tlsOptions[key];
          }
        }
      }
      var req = this._req = (this.secure ? https2 : http2).request(requestOptions);
      req.on("upgrade", function handleRequestUpgrade(response, socket, head) {
        self2._req = null;
        req.removeListener("error", handleRequestError);
        self2.socket = socket;
        self2.response = response;
        self2.firstDataChunk = head;
        self2.validateHandshake();
      });
      req.on("error", handleRequestError);
      req.on("response", function(response) {
        self2._req = null;
        if (utils.eventEmitterListenerCount(self2, "httpResponse") > 0) {
          self2.emit("httpResponse", response, self2);
          if (response.socket) {
            response.socket.end();
          }
        } else {
          var headerDumpParts = [];
          for (var headerName in response.headers) {
            headerDumpParts.push(headerName + ": " + response.headers[headerName]);
          }
          self2.failHandshake("Server responded with a non-101 status: " + response.statusCode + " " + response.statusMessage + "\nResponse Headers Follow:\n" + headerDumpParts.join("\n") + "\n");
        }
      });
      req.end();
    };
    WebSocketClient.prototype.validateHandshake = function() {
      var headers = this.response.headers;
      if (this.protocols.length > 0) {
        this.protocol = headers["sec-websocket-protocol"];
        if (this.protocol) {
          if (this.protocols.indexOf(this.protocol) === -1) {
            this.failHandshake("Server did not respond with a requested protocol.");
            return;
          }
        } else {
          this.failHandshake("Expected a Sec-WebSocket-Protocol header.");
          return;
        }
      }
      if (!(headers["connection"] && headers["connection"].toLocaleLowerCase() === "upgrade")) {
        this.failHandshake("Expected a Connection: Upgrade header from the server");
        return;
      }
      if (!(headers["upgrade"] && headers["upgrade"].toLocaleLowerCase() === "websocket")) {
        this.failHandshake("Expected an Upgrade: websocket header from the server");
        return;
      }
      var sha1 = crypto.createHash("sha1");
      sha1.update(this.base64nonce + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
      var expectedKey = sha1.digest("base64");
      if (!headers["sec-websocket-accept"]) {
        this.failHandshake("Expected Sec-WebSocket-Accept header from server");
        return;
      }
      if (headers["sec-websocket-accept"] !== expectedKey) {
        this.failHandshake("Sec-WebSocket-Accept header from server didn't match expected value of " + expectedKey);
        return;
      }
      this.succeedHandshake();
    };
    WebSocketClient.prototype.failHandshake = function(errorDescription) {
      if (this.socket && this.socket.writable) {
        this.socket.end();
      }
      this.emit("connectFailed", new Error(errorDescription));
    };
    WebSocketClient.prototype.succeedHandshake = function() {
      var connection = new WebSocketConnection(this.socket, [], this.protocol, true, this.config);
      connection.webSocketVersion = this.config.webSocketVersion;
      connection._addSocketEventListeners();
      this.emit("connect", connection);
      if (this.firstDataChunk.length > 0) {
        connection.handleSocketData(this.firstDataChunk);
      }
      this.firstDataChunk = null;
    };
    WebSocketClient.prototype.abort = function() {
      if (this._req) {
        this._req.abort();
      }
    };
    module2.exports = WebSocketClient;
  }
});

// node_modules/websocket/lib/WebSocketRouterRequest.js
var require_WebSocketRouterRequest = __commonJS({
  "node_modules/websocket/lib/WebSocketRouterRequest.js"(exports, module2) {
    init_shims();
    var util = require("util");
    var EventEmitter = require("events").EventEmitter;
    function WebSocketRouterRequest(webSocketRequest, resolvedProtocol) {
      EventEmitter.call(this);
      this.webSocketRequest = webSocketRequest;
      if (resolvedProtocol === "____no_protocol____") {
        this.protocol = null;
      } else {
        this.protocol = resolvedProtocol;
      }
      this.origin = webSocketRequest.origin;
      this.resource = webSocketRequest.resource;
      this.resourceURL = webSocketRequest.resourceURL;
      this.httpRequest = webSocketRequest.httpRequest;
      this.remoteAddress = webSocketRequest.remoteAddress;
      this.webSocketVersion = webSocketRequest.webSocketVersion;
      this.requestedExtensions = webSocketRequest.requestedExtensions;
      this.cookies = webSocketRequest.cookies;
    }
    util.inherits(WebSocketRouterRequest, EventEmitter);
    WebSocketRouterRequest.prototype.accept = function(origin, cookies) {
      var connection = this.webSocketRequest.accept(this.protocol, origin, cookies);
      this.emit("requestAccepted", connection);
      return connection;
    };
    WebSocketRouterRequest.prototype.reject = function(status, reason, extraHeaders) {
      this.webSocketRequest.reject(status, reason, extraHeaders);
      this.emit("requestRejected", this);
    };
    module2.exports = WebSocketRouterRequest;
  }
});

// node_modules/websocket/lib/WebSocketRouter.js
var require_WebSocketRouter = __commonJS({
  "node_modules/websocket/lib/WebSocketRouter.js"(exports, module2) {
    init_shims();
    var extend = require_utils().extend;
    var util = require("util");
    var EventEmitter = require("events").EventEmitter;
    var WebSocketRouterRequest = require_WebSocketRouterRequest();
    function WebSocketRouter(config) {
      EventEmitter.call(this);
      this.config = {
        server: null
      };
      if (config) {
        extend(this.config, config);
      }
      this.handlers = [];
      this._requestHandler = this.handleRequest.bind(this);
      if (this.config.server) {
        this.attachServer(this.config.server);
      }
    }
    util.inherits(WebSocketRouter, EventEmitter);
    WebSocketRouter.prototype.attachServer = function(server) {
      if (server) {
        this.server = server;
        this.server.on("request", this._requestHandler);
      } else {
        throw new Error("You must specify a WebSocketServer instance to attach to.");
      }
    };
    WebSocketRouter.prototype.detachServer = function() {
      if (this.server) {
        this.server.removeListener("request", this._requestHandler);
        this.server = null;
      } else {
        throw new Error("Cannot detach from server: not attached.");
      }
    };
    WebSocketRouter.prototype.mount = function(path, protocol, callback) {
      if (!path) {
        throw new Error("You must specify a path for this handler.");
      }
      if (!protocol) {
        protocol = "____no_protocol____";
      }
      if (!callback) {
        throw new Error("You must specify a callback for this handler.");
      }
      path = this.pathToRegExp(path);
      if (!(path instanceof RegExp)) {
        throw new Error("Path must be specified as either a string or a RegExp.");
      }
      var pathString = path.toString();
      protocol = protocol.toLocaleLowerCase();
      if (this.findHandlerIndex(pathString, protocol) !== -1) {
        throw new Error("You may only mount one handler per path/protocol combination.");
      }
      this.handlers.push({
        "path": path,
        "pathString": pathString,
        "protocol": protocol,
        "callback": callback
      });
    };
    WebSocketRouter.prototype.unmount = function(path, protocol) {
      var index2 = this.findHandlerIndex(this.pathToRegExp(path).toString(), protocol);
      if (index2 !== -1) {
        this.handlers.splice(index2, 1);
      } else {
        throw new Error("Unable to find a route matching the specified path and protocol.");
      }
    };
    WebSocketRouter.prototype.findHandlerIndex = function(pathString, protocol) {
      protocol = protocol.toLocaleLowerCase();
      for (var i = 0, len = this.handlers.length; i < len; i++) {
        var handler2 = this.handlers[i];
        if (handler2.pathString === pathString && handler2.protocol === protocol) {
          return i;
        }
      }
      return -1;
    };
    WebSocketRouter.prototype.pathToRegExp = function(path) {
      if (typeof path === "string") {
        if (path === "*") {
          path = /^.*$/;
        } else {
          path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
          path = new RegExp("^" + path + "$");
        }
      }
      return path;
    };
    WebSocketRouter.prototype.handleRequest = function(request) {
      var requestedProtocols = request.requestedProtocols;
      if (requestedProtocols.length === 0) {
        requestedProtocols = ["____no_protocol____"];
      }
      for (var i = 0; i < requestedProtocols.length; i++) {
        var requestedProtocol = requestedProtocols[i].toLocaleLowerCase();
        for (var j = 0, len = this.handlers.length; j < len; j++) {
          var handler2 = this.handlers[j];
          if (handler2.path.test(request.resourceURL.pathname)) {
            if (requestedProtocol === handler2.protocol || handler2.protocol === "*") {
              var routerRequest = new WebSocketRouterRequest(request, requestedProtocol);
              handler2.callback(routerRequest);
              return;
            }
          }
        }
      }
      request.reject(404, "No handler is available for the given request.");
    };
    module2.exports = WebSocketRouter;
  }
});

// node_modules/is-typedarray/index.js
var require_is_typedarray = __commonJS({
  "node_modules/is-typedarray/index.js"(exports, module2) {
    init_shims();
    module2.exports = isTypedArray;
    isTypedArray.strict = isStrictTypedArray;
    isTypedArray.loose = isLooseTypedArray;
    var toString = Object.prototype.toString;
    var names = {
      "[object Int8Array]": true,
      "[object Int16Array]": true,
      "[object Int32Array]": true,
      "[object Uint8Array]": true,
      "[object Uint8ClampedArray]": true,
      "[object Uint16Array]": true,
      "[object Uint32Array]": true,
      "[object Float32Array]": true,
      "[object Float64Array]": true
    };
    function isTypedArray(arr) {
      return isStrictTypedArray(arr) || isLooseTypedArray(arr);
    }
    function isStrictTypedArray(arr) {
      return arr instanceof Int8Array || arr instanceof Int16Array || arr instanceof Int32Array || arr instanceof Uint8Array || arr instanceof Uint8ClampedArray || arr instanceof Uint16Array || arr instanceof Uint32Array || arr instanceof Float32Array || arr instanceof Float64Array;
    }
    function isLooseTypedArray(arr) {
      return names[toString.call(arr)];
    }
  }
});

// node_modules/typedarray-to-buffer/index.js
var require_typedarray_to_buffer = __commonJS({
  "node_modules/typedarray-to-buffer/index.js"(exports, module2) {
    init_shims();
    var isTypedArray = require_is_typedarray().strict;
    module2.exports = function typedarrayToBuffer(arr) {
      if (isTypedArray(arr)) {
        var buf = Buffer.from(arr.buffer);
        if (arr.byteLength !== arr.buffer.byteLength) {
          buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
        }
        return buf;
      } else {
        return Buffer.from(arr);
      }
    };
  }
});

// node_modules/yaeti/lib/EventTarget.js
var require_EventTarget = __commonJS({
  "node_modules/yaeti/lib/EventTarget.js"(exports, module2) {
    init_shims();
    module2.exports = _EventTarget;
    function _EventTarget() {
      if (typeof this.addEventListener === "function") {
        return;
      }
      this._listeners = {};
      this.addEventListener = _addEventListener;
      this.removeEventListener = _removeEventListener;
      this.dispatchEvent = _dispatchEvent;
    }
    Object.defineProperties(_EventTarget.prototype, {
      listeners: {
        get: function() {
          return this._listeners;
        }
      }
    });
    function _addEventListener(type, newListener) {
      var listenersType, i, listener;
      if (!type || !newListener) {
        return;
      }
      listenersType = this._listeners[type];
      if (listenersType === void 0) {
        this._listeners[type] = listenersType = [];
      }
      for (i = 0; !!(listener = listenersType[i]); i++) {
        if (listener === newListener) {
          return;
        }
      }
      listenersType.push(newListener);
    }
    function _removeEventListener(type, oldListener) {
      var listenersType, i, listener;
      if (!type || !oldListener) {
        return;
      }
      listenersType = this._listeners[type];
      if (listenersType === void 0) {
        return;
      }
      for (i = 0; !!(listener = listenersType[i]); i++) {
        if (listener === oldListener) {
          listenersType.splice(i, 1);
          break;
        }
      }
      if (listenersType.length === 0) {
        delete this._listeners[type];
      }
    }
    function _dispatchEvent(event) {
      var type, listenersType, dummyListener, stopImmediatePropagation = false, i, listener;
      if (!event || typeof event.type !== "string") {
        throw new Error("`event` must have a valid `type` property");
      }
      if (event._yaeti) {
        event.target = this;
        event.cancelable = true;
      }
      try {
        event.stopImmediatePropagation = function() {
          stopImmediatePropagation = true;
        };
      } catch (error3) {
      }
      type = event.type;
      listenersType = this._listeners[type] || [];
      dummyListener = this["on" + type];
      if (typeof dummyListener === "function") {
        dummyListener.call(this, event);
      }
      for (i = 0; !!(listener = listenersType[i]); i++) {
        if (stopImmediatePropagation) {
          break;
        }
        listener.call(this, event);
      }
      return !event.defaultPrevented;
    }
  }
});

// node_modules/yaeti/lib/Event.js
var require_Event = __commonJS({
  "node_modules/yaeti/lib/Event.js"(exports, module2) {
    init_shims();
    module2.exports = _Event;
    function _Event(type) {
      this.type = type;
      this.isTrusted = false;
      this._yaeti = true;
    }
  }
});

// node_modules/yaeti/index.js
var require_yaeti = __commonJS({
  "node_modules/yaeti/index.js"(exports, module2) {
    init_shims();
    module2.exports = {
      EventTarget: require_EventTarget(),
      Event: require_Event()
    };
  }
});

// node_modules/websocket/lib/W3CWebSocket.js
var require_W3CWebSocket = __commonJS({
  "node_modules/websocket/lib/W3CWebSocket.js"(exports, module2) {
    init_shims();
    var WebSocketClient = require_WebSocketClient();
    var toBuffer = require_typedarray_to_buffer();
    var yaeti = require_yaeti();
    var CONNECTING = 0;
    var OPEN = 1;
    var CLOSING = 2;
    var CLOSED = 3;
    module2.exports = W3CWebSocket;
    function W3CWebSocket(url, protocols, origin, headers, requestOptions, clientConfig) {
      yaeti.EventTarget.call(this);
      clientConfig = clientConfig || {};
      clientConfig.assembleFragments = true;
      var self2 = this;
      this._url = url;
      this._readyState = CONNECTING;
      this._protocol = void 0;
      this._extensions = "";
      this._bufferedAmount = 0;
      this._binaryType = "arraybuffer";
      this._connection = void 0;
      this._client = new WebSocketClient(clientConfig);
      this._client.on("connect", function(connection) {
        onConnect.call(self2, connection);
      });
      this._client.on("connectFailed", function() {
        onConnectFailed.call(self2);
      });
      this._client.connect(url, protocols, origin, headers, requestOptions);
    }
    Object.defineProperties(W3CWebSocket.prototype, {
      url: { get: function() {
        return this._url;
      } },
      readyState: { get: function() {
        return this._readyState;
      } },
      protocol: { get: function() {
        return this._protocol;
      } },
      extensions: { get: function() {
        return this._extensions;
      } },
      bufferedAmount: { get: function() {
        return this._bufferedAmount;
      } }
    });
    Object.defineProperties(W3CWebSocket.prototype, {
      binaryType: {
        get: function() {
          return this._binaryType;
        },
        set: function(type) {
          if (type !== "arraybuffer") {
            throw new SyntaxError('just "arraybuffer" type allowed for "binaryType" attribute');
          }
          this._binaryType = type;
        }
      }
    });
    [["CONNECTING", CONNECTING], ["OPEN", OPEN], ["CLOSING", CLOSING], ["CLOSED", CLOSED]].forEach(function(property) {
      Object.defineProperty(W3CWebSocket.prototype, property[0], {
        get: function() {
          return property[1];
        }
      });
    });
    [["CONNECTING", CONNECTING], ["OPEN", OPEN], ["CLOSING", CLOSING], ["CLOSED", CLOSED]].forEach(function(property) {
      Object.defineProperty(W3CWebSocket, property[0], {
        get: function() {
          return property[1];
        }
      });
    });
    W3CWebSocket.prototype.send = function(data) {
      if (this._readyState !== OPEN) {
        throw new Error("cannot call send() while not connected");
      }
      if (typeof data === "string" || data instanceof String) {
        this._connection.sendUTF(data);
      } else {
        if (data instanceof Buffer) {
          this._connection.sendBytes(data);
        } else if (data.byteLength || data.byteLength === 0) {
          data = toBuffer(data);
          this._connection.sendBytes(data);
        } else {
          throw new Error("unknown binary data:", data);
        }
      }
    };
    W3CWebSocket.prototype.close = function(code, reason) {
      switch (this._readyState) {
        case CONNECTING:
          onConnectFailed.call(this);
          this._client.on("connect", function(connection) {
            if (code) {
              connection.close(code, reason);
            } else {
              connection.close();
            }
          });
          break;
        case OPEN:
          this._readyState = CLOSING;
          if (code) {
            this._connection.close(code, reason);
          } else {
            this._connection.close();
          }
          break;
        case CLOSING:
        case CLOSED:
          break;
      }
    };
    function createCloseEvent(code, reason) {
      var event = new yaeti.Event("close");
      event.code = code;
      event.reason = reason;
      event.wasClean = typeof code === "undefined" || code === 1e3;
      return event;
    }
    function createMessageEvent(data) {
      var event = new yaeti.Event("message");
      event.data = data;
      return event;
    }
    function onConnect(connection) {
      var self2 = this;
      this._readyState = OPEN;
      this._connection = connection;
      this._protocol = connection.protocol;
      this._extensions = connection.extensions;
      this._connection.on("close", function(code, reason) {
        onClose.call(self2, code, reason);
      });
      this._connection.on("message", function(msg) {
        onMessage.call(self2, msg);
      });
      this.dispatchEvent(new yaeti.Event("open"));
    }
    function onConnectFailed() {
      destroy.call(this);
      this._readyState = CLOSED;
      try {
        this.dispatchEvent(new yaeti.Event("error"));
      } finally {
        this.dispatchEvent(createCloseEvent(1006, "connection failed"));
      }
    }
    function onClose(code, reason) {
      destroy.call(this);
      this._readyState = CLOSED;
      this.dispatchEvent(createCloseEvent(code, reason || ""));
    }
    function onMessage(message) {
      if (message.utf8Data) {
        this.dispatchEvent(createMessageEvent(message.utf8Data));
      } else if (message.binaryData) {
        if (this.binaryType === "arraybuffer") {
          var buffer = message.binaryData;
          var arraybuffer = new ArrayBuffer(buffer.length);
          var view = new Uint8Array(arraybuffer);
          for (var i = 0, len = buffer.length; i < len; ++i) {
            view[i] = buffer[i];
          }
          this.dispatchEvent(createMessageEvent(arraybuffer));
        }
      }
    }
    function destroy() {
      this._client.removeAllListeners();
      if (this._connection) {
        this._connection.removeAllListeners();
      }
    }
  }
});

// node_modules/websocket/lib/Deprecation.js
var require_Deprecation = __commonJS({
  "node_modules/websocket/lib/Deprecation.js"(exports, module2) {
    init_shims();
    var Deprecation = {
      disableWarnings: false,
      deprecationWarningMap: {},
      warn: function(deprecationName) {
        if (!this.disableWarnings && this.deprecationWarningMap[deprecationName]) {
          console.warn("DEPRECATION WARNING: " + this.deprecationWarningMap[deprecationName]);
          this.deprecationWarningMap[deprecationName] = false;
        }
      }
    };
    module2.exports = Deprecation;
  }
});

// node_modules/websocket/package.json
var require_package = __commonJS({
  "node_modules/websocket/package.json"(exports, module2) {
    module2.exports = {
      name: "websocket",
      description: "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
      keywords: [
        "websocket",
        "websockets",
        "socket",
        "networking",
        "comet",
        "push",
        "RFC-6455",
        "realtime",
        "server",
        "client"
      ],
      author: "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)",
      contributors: [
        "I\xF1aki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
      ],
      version: "1.0.34",
      repository: {
        type: "git",
        url: "https://github.com/theturtle32/WebSocket-Node.git"
      },
      homepage: "https://github.com/theturtle32/WebSocket-Node",
      engines: {
        node: ">=4.0.0"
      },
      dependencies: {
        bufferutil: "^4.0.1",
        debug: "^2.2.0",
        "es5-ext": "^0.10.50",
        "typedarray-to-buffer": "^3.1.5",
        "utf-8-validate": "^5.0.2",
        yaeti: "^0.0.6"
      },
      devDependencies: {
        "buffer-equal": "^1.0.0",
        gulp: "^4.0.2",
        "gulp-jshint": "^2.0.4",
        "jshint-stylish": "^2.2.1",
        jshint: "^2.0.0",
        tape: "^4.9.1"
      },
      config: {
        verbose: false
      },
      scripts: {
        test: "tape test/unit/*.js",
        gulp: "gulp"
      },
      main: "index",
      directories: {
        lib: "./lib"
      },
      browser: "lib/browser.js",
      license: "Apache-2.0"
    };
  }
});

// node_modules/websocket/lib/version.js
var require_version2 = __commonJS({
  "node_modules/websocket/lib/version.js"(exports, module2) {
    init_shims();
    module2.exports = require_package().version;
  }
});

// node_modules/websocket/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/websocket/lib/websocket.js"(exports, module2) {
    init_shims();
    module2.exports = {
      "server": require_WebSocketServer(),
      "client": require_WebSocketClient(),
      "router": require_WebSocketRouter(),
      "frame": require_WebSocketFrame(),
      "request": require_WebSocketRequest(),
      "connection": require_WebSocketConnection(),
      "w3cwebsocket": require_W3CWebSocket(),
      "deprecation": require_Deprecation(),
      "version": require_version2()
    };
  }
});

// node_modules/websocket/index.js
var require_websocket2 = __commonJS({
  "node_modules/websocket/index.js"(exports, module2) {
    init_shims();
    module2.exports = require_websocket();
  }
});

// node_modules/@supabase/realtime-js/dist/main/lib/serializer.js
var require_serializer = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/serializer.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Serializer = class {
      constructor() {
        this.HEADER_LENGTH = 1;
      }
      decode(rawPayload, callback) {
        if (rawPayload.constructor === ArrayBuffer) {
          return callback(this._binaryDecode(rawPayload));
        }
        if (typeof rawPayload === "string") {
          return callback(JSON.parse(rawPayload));
        }
        return callback({});
      }
      _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const decoder = new TextDecoder();
        return this._decodeBroadcast(buffer, view, decoder);
      }
      _decodeBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const eventSize = view.getUint8(2);
        let offset = this.HEADER_LENGTH + 2;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const event = decoder.decode(buffer.slice(offset, offset + eventSize));
        offset = offset + eventSize;
        const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
        return { ref: null, topic, event, payload: data };
      }
    };
    exports.default = Serializer;
  }
});

// node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
var require_RealtimeClient = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var constants_1 = require_constants3();
    var timer_1 = __importDefault(require_timer());
    var RealtimeSubscription_1 = __importDefault(require_RealtimeSubscription());
    var websocket_1 = require_websocket2();
    var serializer_1 = __importDefault(require_serializer());
    var noop3 = () => {
    };
    var RealtimeClient = class {
      constructor(endPoint, options2) {
        this.channels = [];
        this.endPoint = "";
        this.headers = {};
        this.params = {};
        this.timeout = constants_1.DEFAULT_TIMEOUT;
        this.transport = websocket_1.w3cwebsocket;
        this.heartbeatIntervalMs = 3e4;
        this.longpollerTimeout = 2e4;
        this.heartbeatTimer = void 0;
        this.pendingHeartbeatRef = null;
        this.ref = 0;
        this.logger = noop3;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new serializer_1.default();
        this.stateChangeCallbacks = {
          open: [],
          close: [],
          error: [],
          message: []
        };
        this.endPoint = `${endPoint}/${constants_1.TRANSPORTS.websocket}`;
        if (options2 === null || options2 === void 0 ? void 0 : options2.params)
          this.params = options2.params;
        if (options2 === null || options2 === void 0 ? void 0 : options2.headers)
          this.headers = options2.headers;
        if (options2 === null || options2 === void 0 ? void 0 : options2.timeout)
          this.timeout = options2.timeout;
        if (options2 === null || options2 === void 0 ? void 0 : options2.logger)
          this.logger = options2.logger;
        if (options2 === null || options2 === void 0 ? void 0 : options2.transport)
          this.transport = options2.transport;
        if (options2 === null || options2 === void 0 ? void 0 : options2.heartbeatIntervalMs)
          this.heartbeatIntervalMs = options2.heartbeatIntervalMs;
        if (options2 === null || options2 === void 0 ? void 0 : options2.longpollerTimeout)
          this.longpollerTimeout = options2.longpollerTimeout;
        this.reconnectAfterMs = (options2 === null || options2 === void 0 ? void 0 : options2.reconnectAfterMs) ? options2.reconnectAfterMs : (tries) => {
          return [1e3, 2e3, 5e3, 1e4][tries - 1] || 1e4;
        };
        this.encode = (options2 === null || options2 === void 0 ? void 0 : options2.encode) ? options2.encode : (payload, callback) => {
          return callback(JSON.stringify(payload));
        };
        this.decode = (options2 === null || options2 === void 0 ? void 0 : options2.decode) ? options2.decode : this.serializer.decode.bind(this.serializer);
        this.reconnectTimer = new timer_1.default(() => __awaiter(this, void 0, void 0, function* () {
          yield this.disconnect();
          this.connect();
        }), this.reconnectAfterMs);
      }
      connect() {
        if (this.conn) {
          return;
        }
        this.conn = new this.transport(this.endPointURL(), [], null, this.headers);
        if (this.conn) {
          this.conn.binaryType = "arraybuffer";
          this.conn.onopen = () => this._onConnOpen();
          this.conn.onerror = (error3) => this._onConnError(error3);
          this.conn.onmessage = (event) => this.onConnMessage(event);
          this.conn.onclose = (event) => this._onConnClose(event);
        }
      }
      disconnect(code, reason) {
        return new Promise((resolve2, _reject) => {
          try {
            if (this.conn) {
              this.conn.onclose = function() {
              };
              if (code) {
                this.conn.close(code, reason || "");
              } else {
                this.conn.close();
              }
              this.conn = null;
              this.heartbeatTimer && clearInterval(this.heartbeatTimer);
              this.reconnectTimer.reset();
            }
            resolve2({ error: null, data: true });
          } catch (error3) {
            resolve2({ error: error3, data: false });
          }
        });
      }
      log(kind, msg, data) {
        this.logger(kind, msg, data);
      }
      onOpen(callback) {
        this.stateChangeCallbacks.open.push(callback);
      }
      onClose(callback) {
        this.stateChangeCallbacks.close.push(callback);
      }
      onError(callback) {
        this.stateChangeCallbacks.error.push(callback);
      }
      onMessage(callback) {
        this.stateChangeCallbacks.message.push(callback);
      }
      connectionState() {
        switch (this.conn && this.conn.readyState) {
          case constants_1.SOCKET_STATES.connecting:
            return "connecting";
          case constants_1.SOCKET_STATES.open:
            return "open";
          case constants_1.SOCKET_STATES.closing:
            return "closing";
          default:
            return "closed";
        }
      }
      isConnected() {
        return this.connectionState() === "open";
      }
      remove(channel) {
        this.channels = this.channels.filter((c) => c.joinRef() !== channel.joinRef());
      }
      channel(topic, chanParams = {}) {
        let chan = new RealtimeSubscription_1.default(topic, chanParams, this);
        this.channels.push(chan);
        return chan;
      }
      push(data) {
        let { topic, event, payload, ref } = data;
        let callback = () => {
          this.encode(data, (result) => {
            var _a;
            (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
          });
        };
        this.log("push", `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) {
          callback();
        } else {
          this.sendBuffer.push(callback);
        }
      }
      onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg) => {
          let { topic, event, payload, ref } = msg;
          if (ref && ref === this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
          } else if (event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
            this._resetHeartbeat();
          }
          this.log("receive", `${payload.status || ""} ${topic} ${event} ${ref && "(" + ref + ")" || ""}`, payload);
          this.channels.filter((channel) => channel.isMember(topic)).forEach((channel) => channel.trigger(event, payload, ref));
          this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
        });
      }
      endPointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: constants_1.VSN }));
      }
      makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) {
          this.ref = 0;
        } else {
          this.ref = newRef;
        }
        return this.ref.toString();
      }
      _onConnOpen() {
        this.log("transport", `connected to ${this.endPointURL()}`);
        this._flushSendBuffer();
        this.reconnectTimer.reset();
        this._resetHeartbeat();
        this.stateChangeCallbacks.open.forEach((callback) => callback());
      }
      _onConnClose(event) {
        this.log("transport", "close", event);
        this._triggerChanError();
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.reconnectTimer.scheduleTimeout();
        this.stateChangeCallbacks.close.forEach((callback) => callback(event));
      }
      _onConnError(error3) {
        this.log("transport", error3.message);
        this._triggerChanError();
        this.stateChangeCallbacks.error.forEach((callback) => callback(error3));
      }
      _triggerChanError() {
        this.channels.forEach((channel) => channel.trigger(constants_1.CHANNEL_EVENTS.error));
      }
      _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
          return url;
        }
        const prefix = url.match(/\?/) ? "&" : "?";
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
      }
      _flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
          this.sendBuffer.forEach((callback) => callback());
          this.sendBuffer = [];
        }
      }
      _resetHeartbeat() {
        this.pendingHeartbeatRef = null;
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
      }
      _sendHeartbeat() {
        var _a;
        if (!this.isConnected()) {
          return;
        }
        if (this.pendingHeartbeatRef) {
          this.pendingHeartbeatRef = null;
          this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
          (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(constants_1.WS_CLOSE_NORMAL, "hearbeat timeout");
          return;
        }
        this.pendingHeartbeatRef = this.makeRef();
        this.push({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: this.pendingHeartbeatRef
        });
      }
    };
    exports.default = RealtimeClient;
  }
});

// node_modules/@supabase/realtime-js/dist/main/index.js
var require_main3 = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/index.js"(exports) {
    init_shims();
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Transformers = exports.RealtimeSubscription = exports.RealtimeClient = void 0;
    var Transformers = __importStar(require_transformers());
    exports.Transformers = Transformers;
    var RealtimeClient_1 = __importDefault(require_RealtimeClient());
    exports.RealtimeClient = RealtimeClient_1.default;
    var RealtimeSubscription_1 = __importDefault(require_RealtimeSubscription());
    exports.RealtimeSubscription = RealtimeSubscription_1.default;
  }
});

// node_modules/@supabase/supabase-js/dist/main/lib/SupabaseRealtimeClient.js
var require_SupabaseRealtimeClient = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/lib/SupabaseRealtimeClient.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseRealtimeClient = void 0;
    var realtime_js_1 = require_main3();
    var SupabaseRealtimeClient = class {
      constructor(socket, schema, tableName) {
        const topic = tableName === "*" ? `realtime:${schema}` : `realtime:${schema}:${tableName}`;
        this.subscription = socket.channel(topic);
      }
      getPayloadRecords(payload) {
        const records = {
          new: {},
          old: {}
        };
        if (payload.type === "INSERT" || payload.type === "UPDATE") {
          records.new = realtime_js_1.Transformers.convertChangeData(payload.columns, payload.record);
        }
        if (payload.type === "UPDATE" || payload.type === "DELETE") {
          records.old = realtime_js_1.Transformers.convertChangeData(payload.columns, payload.old_record);
        }
        return records;
      }
      on(event, callback) {
        this.subscription.on(event, (payload) => {
          let enrichedPayload = {
            schema: payload.schema,
            table: payload.table,
            commit_timestamp: payload.commit_timestamp,
            eventType: payload.type,
            new: {},
            old: {}
          };
          enrichedPayload = Object.assign(Object.assign({}, enrichedPayload), this.getPayloadRecords(payload));
          callback(enrichedPayload);
        });
        return this;
      }
      subscribe(callback = () => {
      }) {
        this.subscription.onError((e) => callback("SUBSCRIPTION_ERROR", e));
        this.subscription.onClose(() => callback("CLOSED"));
        this.subscription.subscribe().receive("ok", () => callback("SUBSCRIBED")).receive("error", (e) => callback("SUBSCRIPTION_ERROR", e)).receive("timeout", () => callback("RETRYING_AFTER_TIMEOUT"));
        return this.subscription;
      }
    };
    exports.SupabaseRealtimeClient = SupabaseRealtimeClient;
  }
});

// node_modules/@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder.js
var require_SupabaseQueryBuilder = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseQueryBuilder = void 0;
    var postgrest_js_1 = require_main2();
    var SupabaseRealtimeClient_1 = require_SupabaseRealtimeClient();
    var SupabaseQueryBuilder = class extends postgrest_js_1.PostgrestQueryBuilder {
      constructor(url, { headers = {}, schema, realtime, table }) {
        super(url, { headers, schema });
        this._subscription = new SupabaseRealtimeClient_1.SupabaseRealtimeClient(realtime, schema, table);
        this._realtime = realtime;
      }
      on(event, callback) {
        if (!this._realtime.isConnected()) {
          this._realtime.connect();
        }
        return this._subscription.on(event, callback);
      }
    };
    exports.SupabaseQueryBuilder = SupabaseQueryBuilder;
  }
});

// node_modules/@supabase/storage-js/dist/main/lib/fetch.js
var require_fetch2 = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/lib/fetch.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.remove = exports.put = exports.post = exports.get = void 0;
    var cross_fetch_1 = __importDefault(require_node_ponyfill());
    var _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    var handleError = (error3, reject) => {
      if (typeof error3.json !== "function") {
        return reject(error3);
      }
      error3.json().then((err) => {
        return reject({
          message: _getErrorMessage(err),
          status: (error3 === null || error3 === void 0 ? void 0 : error3.status) || 500
        });
      });
    };
    var _getRequestParams = (method, options2, parameters, body) => {
      const params = { method, headers: (options2 === null || options2 === void 0 ? void 0 : options2.headers) || {} };
      if (method === "GET") {
        return params;
      }
      params.headers = Object.assign({ "Content-Type": "application/json" }, options2 === null || options2 === void 0 ? void 0 : options2.headers);
      params.body = JSON.stringify(body);
      return Object.assign(Object.assign({}, params), parameters);
    };
    function _handleRequest(method, url, options2, parameters, body) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve2, reject) => {
          cross_fetch_1.default(url, _getRequestParams(method, options2, parameters, body)).then((result) => {
            if (!result.ok)
              throw result;
            if (options2 === null || options2 === void 0 ? void 0 : options2.noResolveJson)
              return resolve2(result);
            return result.json();
          }).then((data) => resolve2(data)).catch((error3) => handleError(error3, reject));
        });
      });
    }
    function get(url, options2, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("GET", url, options2, parameters);
      });
    }
    exports.get = get;
    function post(url, body, options2, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("POST", url, options2, parameters, body);
      });
    }
    exports.post = post;
    function put(url, body, options2, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("PUT", url, options2, parameters, body);
      });
    }
    exports.put = put;
    function remove(url, body, options2, parameters) {
      return __awaiter(this, void 0, void 0, function* () {
        return _handleRequest("DELETE", url, options2, parameters, body);
      });
    }
    exports.remove = remove;
  }
});

// node_modules/@supabase/storage-js/dist/main/lib/StorageBucketApi.js
var require_StorageBucketApi = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/lib/StorageBucketApi.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageBucketApi = void 0;
    var fetch_1 = require_fetch2();
    var StorageBucketApi = class {
      constructor(url, headers = {}) {
        this.url = url;
        this.headers = headers;
      }
      listBuckets() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.get(`${this.url}/bucket`, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      getBucket(id) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.get(`${this.url}/bucket/${id}`, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      createBucket(id, options2 = { public: false }) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.post(`${this.url}/bucket`, { id, name: id, public: options2.public }, { headers: this.headers });
            return { data: data.name, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      updateBucket(id, options2) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.put(`${this.url}/bucket/${id}`, { id, name: id, public: options2.public }, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      emptyBucket(id) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.post(`${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      deleteBucket(id) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.remove(`${this.url}/bucket/${id}`, {}, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
    };
    exports.StorageBucketApi = StorageBucketApi;
  }
});

// node_modules/@supabase/storage-js/dist/main/lib/StorageFileApi.js
var require_StorageFileApi = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/lib/StorageFileApi.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageFileApi = void 0;
    var fetch_1 = require_fetch2();
    var cross_fetch_1 = __importDefault(require_node_ponyfill());
    var DEFAULT_SEARCH_OPTIONS = {
      limit: 100,
      offset: 0,
      sortBy: {
        column: "name",
        order: "asc"
      }
    };
    var DEFAULT_FILE_OPTIONS = {
      cacheControl: "3600",
      contentType: "text/plain;charset=UTF-8",
      upsert: false
    };
    var StorageFileApi = class {
      constructor(url, headers = {}, bucketId) {
        this.url = url;
        this.headers = headers;
        this.bucketId = bucketId;
      }
      uploadOrUpdate(method, path, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let body;
            const options2 = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
            const headers = Object.assign(Object.assign({}, this.headers), method === "POST" && { "x-upsert": String(options2.upsert) });
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
              body = new FormData();
              body.append("cacheControl", options2.cacheControl);
              body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
              body = fileBody;
              body.append("cacheControl", options2.cacheControl);
            } else {
              body = fileBody;
              headers["cache-control"] = `max-age=${options2.cacheControl}`;
              headers["content-type"] = options2.contentType;
            }
            const _path = this._getFinalPath(path);
            const res = yield cross_fetch_1.default(`${this.url}/object/${_path}`, {
              method,
              body,
              headers
            });
            if (res.ok) {
              return { data: { Key: _path }, error: null };
            } else {
              const error3 = yield res.json();
              return { data: null, error: error3 };
            }
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      upload(path, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
        });
      }
      update(path, fileBody, fileOptions) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
        });
      }
      move(fromPath, toPath) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.post(`${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      createSignedUrl(path, expiresIn) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const _path = this._getFinalPath(path);
            let data = yield fetch_1.post(`${this.url}/object/sign/${_path}`, { expiresIn }, { headers: this.headers });
            const signedURL = `${this.url}${data.signedURL}`;
            data = { signedURL };
            return { data, error: null, signedURL };
          } catch (error3) {
            return { data: null, error: error3, signedURL: null };
          }
        });
      }
      download(path) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const _path = this._getFinalPath(path);
            const res = yield fetch_1.get(`${this.url}/object/${_path}`, {
              headers: this.headers,
              noResolveJson: true
            });
            const data = yield res.blob();
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      getPublicUrl(path) {
        try {
          const _path = this._getFinalPath(path);
          const publicURL = `${this.url}/object/public/${_path}`;
          const data = { publicURL };
          return { data, error: null, publicURL };
        } catch (error3) {
          return { data: null, error: error3, publicURL: null };
        }
      }
      remove(paths) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const data = yield fetch_1.remove(`${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      list(path, options2, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options2), { prefix: path || "" });
            const data = yield fetch_1.post(`${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
            return { data, error: null };
          } catch (error3) {
            return { data: null, error: error3 };
          }
        });
      }
      _getFinalPath(path) {
        return `${this.bucketId}/${path}`;
      }
    };
    exports.StorageFileApi = StorageFileApi;
  }
});

// node_modules/@supabase/storage-js/dist/main/lib/types.js
var require_types3 = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/lib/types.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@supabase/storage-js/dist/main/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/lib/index.js"(exports) {
    init_shims();
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_StorageBucketApi(), exports);
    __exportStar(require_StorageFileApi(), exports);
    __exportStar(require_types3(), exports);
  }
});

// node_modules/@supabase/storage-js/dist/main/SupabaseStorageClient.js
var require_SupabaseStorageClient = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/SupabaseStorageClient.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseStorageClient = void 0;
    var lib_1 = require_lib2();
    var SupabaseStorageClient = class extends lib_1.StorageBucketApi {
      constructor(url, headers = {}) {
        super(url, headers);
      }
      from(id) {
        return new lib_1.StorageFileApi(this.url, this.headers, id);
      }
    };
    exports.SupabaseStorageClient = SupabaseStorageClient;
  }
});

// node_modules/@supabase/storage-js/dist/main/index.js
var require_main4 = __commonJS({
  "node_modules/@supabase/storage-js/dist/main/index.js"(exports) {
    init_shims();
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseStorageClient = void 0;
    var SupabaseStorageClient_1 = require_SupabaseStorageClient();
    Object.defineProperty(exports, "SupabaseStorageClient", { enumerable: true, get: function() {
      return SupabaseStorageClient_1.SupabaseStorageClient;
    } });
    __exportStar(require_types3(), exports);
  }
});

// node_modules/@supabase/supabase-js/dist/main/SupabaseClient.js
var require_SupabaseClient = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/SupabaseClient.js"(exports) {
    init_shims();
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
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
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var constants_1 = require_constants();
    var SupabaseAuthClient_1 = require_SupabaseAuthClient();
    var SupabaseQueryBuilder_1 = require_SupabaseQueryBuilder();
    var storage_js_1 = require_main4();
    var postgrest_js_1 = require_main2();
    var realtime_js_1 = require_main3();
    var DEFAULT_OPTIONS = {
      schema: "public",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      localStorage: globalThis.localStorage,
      headers: constants_1.DEFAULT_HEADERS
    };
    var SupabaseClient = class {
      constructor(supabaseUrl, supabaseKey, options2) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        if (!supabaseUrl)
          throw new Error("supabaseUrl is required.");
        if (!supabaseKey)
          throw new Error("supabaseKey is required.");
        const settings2 = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options2);
        this.restUrl = `${supabaseUrl}/rest/v1`;
        this.realtimeUrl = `${supabaseUrl}/realtime/v1`.replace("http", "ws");
        this.authUrl = `${supabaseUrl}/auth/v1`;
        this.storageUrl = `${supabaseUrl}/storage/v1`;
        this.schema = settings2.schema;
        this.auth = this._initSupabaseAuthClient(settings2);
        this.realtime = this._initRealtimeClient(settings2.realtime);
      }
      get storage() {
        return new storage_js_1.SupabaseStorageClient(this.storageUrl, this._getAuthHeaders());
      }
      from(table) {
        const url = `${this.restUrl}/${table}`;
        return new SupabaseQueryBuilder_1.SupabaseQueryBuilder(url, {
          headers: this._getAuthHeaders(),
          schema: this.schema,
          realtime: this.realtime,
          table
        });
      }
      rpc(fn, params, { count = null } = {}) {
        const rest = this._initPostgRESTClient();
        return rest.rpc(fn, params, { count });
      }
      removeSubscription(subscription) {
        return new Promise((resolve2) => __awaiter(this, void 0, void 0, function* () {
          try {
            yield this._closeSubscription(subscription);
            const openSubscriptions = this.getSubscriptions().length;
            if (!openSubscriptions) {
              const { error: error3 } = yield this.realtime.disconnect();
              if (error3)
                return resolve2({ error: error3 });
            }
            return resolve2({ error: null, data: { openSubscriptions } });
          } catch (error3) {
            return resolve2({ error: error3 });
          }
        }));
      }
      _closeSubscription(subscription) {
        return __awaiter(this, void 0, void 0, function* () {
          if (!subscription.isClosed()) {
            yield this._closeChannel(subscription);
          }
        });
      }
      getSubscriptions() {
        return this.realtime.channels;
      }
      _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, localStorage, headers }) {
        const authHeaders = {
          Authorization: `Bearer ${this.supabaseKey}`,
          apikey: `${this.supabaseKey}`
        };
        return new SupabaseAuthClient_1.SupabaseAuthClient({
          url: this.authUrl,
          headers: Object.assign(Object.assign({}, headers), authHeaders),
          autoRefreshToken,
          persistSession,
          detectSessionInUrl,
          localStorage
        });
      }
      _initRealtimeClient(options2) {
        return new realtime_js_1.RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options2), { params: Object.assign(Object.assign({}, options2 === null || options2 === void 0 ? void 0 : options2.params), { apikey: this.supabaseKey }) }));
      }
      _initPostgRESTClient() {
        return new postgrest_js_1.PostgrestClient(this.restUrl, {
          headers: this._getAuthHeaders(),
          schema: this.schema
        });
      }
      _getAuthHeaders() {
        var _a, _b;
        const headers = {};
        const authBearer = (_b = (_a = this.auth.session()) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
        headers["apikey"] = this.supabaseKey;
        headers["Authorization"] = `Bearer ${authBearer}`;
        return headers;
      }
      _closeChannel(subscription) {
        return new Promise((resolve2, reject) => {
          subscription.unsubscribe().receive("ok", () => {
            this.realtime.remove(subscription);
            return resolve2(true);
          }).receive("error", (e) => reject(e));
        });
      }
    };
    exports.default = SupabaseClient;
  }
});

// node_modules/@supabase/supabase-js/dist/main/index.js
var require_main5 = __commonJS({
  "node_modules/@supabase/supabase-js/dist/main/index.js"(exports) {
    init_shims();
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SupabaseClient = exports.createClient = void 0;
    var SupabaseClient_1 = __importDefault(require_SupabaseClient());
    exports.SupabaseClient = SupabaseClient_1.default;
    __exportStar(require_main(), exports);
    __exportStar(require_main3(), exports);
    var createClient2 = (supabaseUrl, supabaseKey, options2) => {
      return new SupabaseClient_1.default(supabaseUrl, supabaseKey, options2);
    };
    exports.createClient = createClient2;
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
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
var import_supabase_js = __toModule(require_main5());
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
var css$b = {
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
  $$result.css.add(css$b);
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
var template$1 = ({ head, body }) => `<!DOCTYPE html>\r
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
	<script defer src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.min.js"><\/script>\r
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
      file: assets + "/internal/start-93b5d858.js",
      css: [assets + "/internal/assets/start-61d1577b.css"],
      js: [assets + "/internal/start-93b5d858.js", assets + "/internal/chunks/vendor-22a7772d.js"]
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
    template: template$1,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "CNAME", "size": 17, "type": null }, { "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "global.css", "size": 2253, "type": "text/css" }, { "file": "oembed.json", "size": 257, "type": "application/json" }, { "file": "p5/sketch.js", "size": 2087, "type": "application/javascript" }, { "file": "p5/sketch2.js", "size": 2232, "type": "application/javascript" }, { "file": "preview.gif", "size": 710690, "type": "image/gif" }],
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
    },
    {
      type: "page",
      pattern: /^\/template\/?$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/template.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/signup\/?$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/signup.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/login\/?$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/login.svelte"],
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
  }),
  "src/routes/template.svelte": () => Promise.resolve().then(function() {
    return template;
  }),
  "src/routes/signup.svelte": () => Promise.resolve().then(function() {
    return signup;
  }),
  "src/routes/login.svelte": () => Promise.resolve().then(function() {
    return login;
  })
};
var metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-34313fd7.js", "css": [], "js": ["layout.svelte-34313fd7.js", "chunks/vendor-22a7772d.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-57223e03.js", "css": [], "js": ["error.svelte-57223e03.js", "chunks/vendor-22a7772d.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-c84936e7.js", "css": ["assets/pages/index.svelte-5fb38b30.css", "assets/ThemeSwitcher.svelte_svelte&type=style&lang-04a37b01.css", "assets/Menu-f43809fa.css", "assets/Toast-6167e984.css"], "js": ["pages/index.svelte-c84936e7.js", "chunks/vendor-22a7772d.js", "chunks/Menu-1f4ad078.js", "chunks/Toast-7ffbd7ce.js"], "styles": [] }, "src/routes/settings.svelte": { "entry": "pages/settings.svelte-c4a664c9.js", "css": ["assets/pages/settings.svelte-e2536f27.css", "assets/ThemeSwitcher.svelte_svelte&type=style&lang-04a37b01.css", "assets/Menu-f43809fa.css", "assets/Toast-6167e984.css"], "js": ["pages/settings.svelte-c4a664c9.js", "chunks/vendor-22a7772d.js", "chunks/Menu-1f4ad078.js", "chunks/Toast-7ffbd7ce.js"], "styles": [] }, "src/routes/template.svelte": { "entry": "pages/template.svelte-cb833443.js", "css": ["assets/pages/template.svelte-7c0c85f4.css", "assets/Menu-f43809fa.css"], "js": ["pages/template.svelte-cb833443.js", "chunks/vendor-22a7772d.js", "chunks/Menu-1f4ad078.js"], "styles": [] }, "src/routes/signup.svelte": { "entry": "pages/signup.svelte-1e4731ce.js", "css": ["assets/pages/signup.svelte-dc983a56.css", "assets/Menu-f43809fa.css", "assets/Toast-6167e984.css"], "js": ["pages/signup.svelte-1e4731ce.js", "chunks/vendor-22a7772d.js", "chunks/Menu-1f4ad078.js", "chunks/Toast-7ffbd7ce.js", "chunks/auth-90822ed3.js"], "styles": [] }, "src/routes/login.svelte": { "entry": "pages/login.svelte-6fc0f68f.js", "css": ["assets/pages/signup.svelte-dc983a56.css", "assets/Menu-f43809fa.css"], "js": ["pages/login.svelte-6fc0f68f.js", "chunks/vendor-22a7772d.js", "chunks/Menu-1f4ad078.js", "chunks/auth-90822ed3.js"], "styles": [] } };
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
var css$a = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}button.deep-blue.svelte-1pnt6ev{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}button.deep-pink.svelte-1pnt6ev{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}button.soft-blue.svelte-1pnt6ev{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}button.soft-pink.svelte-1pnt6ev{background-color:#e60073;color:white}#inputArea.svelte-1pnt6ev{width:100%;display:grid;grid-template-rows:auto;grid-template-columns:repeat(6, 1fr)}#textInput.svelte-1pnt6ev{grid-column:1/span 6}#submit.svelte-1pnt6ev{color:purple;grid-column:7;border:none;text-decoration:none;width:100%}#sendButton.svelte-1pnt6ev{vertical-align:top}",
  map: `{"version":3,"file":"Input.svelte","sources":["Input.svelte"],"sourcesContent":["<script lang='ts'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { createEventDispatcher } from 'svelte';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport themeStore from './ts/themeStore';\\r\\nimport { onMount } from 'svelte';\\r\\nexport let messageList;\\r\\nexport let timer = 0;\\r\\n// export const animateList = function(){}\\r\\nexport let chatName;\\r\\nexport let fileName;\\r\\nexport let theme = '';\\r\\nlet messageContent = '';\\r\\nlet dispatch = createEventDispatcher();\\r\\nlet appStorage;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    appStorage = window.localStorage;\\r\\n}));\\r\\nconst parseMessage = (messageContent) => {\\r\\n    // console.log(messageContent[0])\\r\\n    switch (messageContent[0]) {\\r\\n        case '/':\\r\\n            let command = messageContent\\r\\n                .slice(1)\\r\\n                .split(' ');\\r\\n            switch (command[0]) {\\r\\n                case 'switch':\\r\\n                    switch (command[1]) {\\r\\n                        case 'theme':\\r\\n                            console.log('%cswitching themes from chatbox', 'color:cyan');\\r\\n                            theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n                            Helpers.updateTheme(window.localStorage, theme);\\r\\n                            break;\\r\\n                        case 'listener':\\r\\n                            console.log('%cswitching listeners from chatbox', 'color:teal');\\r\\n                            let listener = Helpers.fetchTheme(appStorage, themeStore, 'listener');\\r\\n                            Helpers.updateListener(window.localStorage, listener);\\r\\n                            break;\\r\\n                        default:\\r\\n                            Helpers.notify('Invalid slash command :x', 500);\\r\\n                            break;\\r\\n                    }\\r\\n                    break;\\r\\n                case 'save':\\r\\n                    Helpers.saveChat(fileName, messageList);\\r\\n                    break;\\r\\n                case 'stash':\\r\\n                    Helpers.stashChat(window.localStorage, chatName, messageList);\\r\\n                    break;\\r\\n                case 'clear':\\r\\n                    console.log(command);\\r\\n                    switch (command[1]) {\\r\\n                        case 'stash':\\r\\n                            Helpers.clearStash(window.localStorage);\\r\\n                            break;\\r\\n                        case 'chat':\\r\\n                            messageList = [];\\r\\n                            break;\\r\\n                        default:\\r\\n                            Helpers.notify('Invalid slash command :x', 500);\\r\\n                    }\\r\\n                    break;\\r\\n                default:\\r\\n                    Helpers.notify('Invalid slash command :x', 500);\\r\\n            }\\r\\n            break;\\r\\n        default:\\r\\n            sendMessage(messageContent);\\r\\n    }\\r\\n};\\r\\nconst sendMessage = (message) => {\\r\\n    if (!message) {\\r\\n        return;\\r\\n    }\\r\\n    let date = new Date();\\r\\n    let localTime = date.toLocaleTimeString();\\r\\n    let localDate = date.toLocaleDateString()\\r\\n        .split('/')\\r\\n        .reverse()\\r\\n        .join('.');\\r\\n    messageList = [\\r\\n        ...messageList,\\r\\n        { content: message,\\r\\n            sender: 'user',\\r\\n            timestamp: \`\${localDate} - \${localTime}\`\\r\\n        }\\r\\n    ];\\r\\n    messageContent = '';\\r\\n    // dispatch('voidInvoked')\\r\\n    // animateList('messages')\\r\\n};\\r\\nconst keypressCheck = (event) => {\\r\\n    // console.log(event)\\r\\n    if (event.key.toLowerCase() == 'enter') {\\r\\n        parseMessage(messageContent);\\r\\n        messageContent = '';\\r\\n        // dispatch('voidInvoked')\\r\\n    }\\r\\n    timer = 7;\\r\\n};\\r\\n<\/script>\\r\\n\\r\\n<section id='inputArea' on:click|preventDefault>\\r\\n\\t<input id='textInput'\\r\\n\\tclass={theme}\\r\\n\\tbind:value={messageContent}\\r\\n\\ton:keypress='{keypressCheck.bind(messageContent)}'>\\r\\n\\t<div id='submit'>\\r\\n\\t\\t<!-- <Fab  -->\\r\\n\\t\\t\\t<button\\r\\n\\t\\t\\tclass={theme}\\r\\n\\t\\t\\tid='submitButton'\\r\\n\\t\\t\\ton:mousedown={(event)=> {\\r\\n\\t\\t\\t\\tparseMessage(messageContent)\\r\\n\\t\\t\\t\\tevent.preventDefault()\\r\\n\\t\\t\\t}}\\r\\n\\t\\t\\t>\\r\\n\\t\\t\\t<span id='sendButton' class=\\"material-icons\\">send</span>\\r\\n\\t\\t\\tSend\\r\\n\\t\\t</button>\\r\\n\\t\\t<!-- </Fab> -->\\r\\n\\t</div>\\r\\n</section>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\n#inputArea {\\n  width: 100%;\\n  display: grid;\\n  grid-template-rows: auto;\\n  grid-template-columns: repeat(6, 1fr);\\n}\\n\\n#textInput {\\n  grid-column: 1/span 6;\\n}\\n\\n#submit {\\n  color: purple;\\n  grid-column: 7;\\n  border: none;\\n  text-decoration: none;\\n  width: 100%;\\n}\\n\\n#sendButton {\\n  vertical-align: top;\\n}</style>"],"names":[],"mappings":"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"}`
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
  $$result.css.add(css$a);
  return `<section id="${"inputArea"}" class="${"svelte-1pnt6ev"}"><input id="${"textInput"}" class="${escape2(null_to_empty(theme)) + " svelte-1pnt6ev"}"${add_attribute("value", messageContent, 0)}>
	<div id="${"submit"}" class="${"svelte-1pnt6ev"}">
			<button class="${escape2(null_to_empty(theme)) + " svelte-1pnt6ev"}" id="${"submitButton"}"><span id="${"sendButton"}" class="${"material-icons svelte-1pnt6ev"}">send</span>
			Send
		</button>
		</div>
</section>`;
});
var css$9 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}p.deep-blue.svelte-1sb2hxg,span.deep-blue.timestamp.svelte-1sb2hxg{color:white}div.deep-blue.toastMessage.svelte-1sb2hxg{background-color:#d9ddf2}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}p.deep-pink.svelte-1sb2hxg,span.deep-pink.timestamp.svelte-1sb2hxg{color:white}div.deep-pink.toastMessage.svelte-1sb2hxg{background-color:#f2d9f2}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}p.soft-blue.svelte-1sb2hxg,span.soft-blue.timestamp.svelte-1sb2hxg{color:black}div.soft-blue.toastMessage.svelte-1sb2hxg{background-color:#d9eaf2}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}p.soft-pink.svelte-1sb2hxg,span.soft-pink.timestamp.svelte-1sb2hxg{color:black}div.soft-pink.toastMessage.svelte-1sb2hxg{background-color:#f2d9e6}p.svelte-1sb2hxg{border-radius:2px;padding:1em;height:min-content;margin:0 0 0.5em;width:fit-content;display:flex;flex-direction:column}.user.svelte-1sb2hxg{text-align:end;float:right;background-color:white;color:black}.theVoid.svelte-1sb2hxg{text-align:start;float:left;background-color:black;color:white}.timestamp.svelte-1sb2hxg{font-size:0.85em;text-align:right;border:none}",
  map: `{"version":3,"file":"Message.svelte","sources":["Message.svelte"],"sourcesContent":["<script lang='ts'>import { fade, fly } from 'svelte/transition';\\r\\nexport let message;\\r\\nexport let theme = '';\\r\\n// transition:fly='{{y:50}}'\\r\\n<\/script>\\r\\n\\r\\n<div class='timestamp {theme}'>\\r\\n\\t<span class='timestamp {theme}'>{message.timestamp}</span>\\r\\n</div>\\r\\n<p \\r\\nclass={message.sender}\\r\\n>\\r\\n{message.content}</p>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\np {\\n  border-radius: 2px;\\n  padding: 1em;\\n  height: min-content;\\n  margin: 0 0 0.5em;\\n  width: fit-content;\\n  display: flex;\\n  flex-direction: column;\\n}\\n\\n.user {\\n  text-align: end;\\n  float: right;\\n  background-color: white;\\n  color: black;\\n}\\n\\n.theVoid {\\n  text-align: start;\\n  float: left;\\n  background-color: black;\\n  color: white;\\n}\\n\\n.timestamp {\\n  font-size: 0.85em;\\n  text-align: right;\\n  border: none;\\n}</style>"],"names":[],"mappings":"AAc2B,cAAc,AAAE,CAAC,AAC1C,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACzQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBkC,CAAC,yBAAU,CAAE,IAAI,UAAU,UAAU,eAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAED,GAAG,UAAU,aAAa,eAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAYO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAC3Q,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBkC,CAAC,yBAAU,CAAE,IAAI,UAAU,UAAU,eAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAED,GAAG,UAAU,aAAa,eAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAYO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAkBkC,CAAC,yBAAU,CAAE,IAAI,UAAU,UAAU,eAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAED,GAAG,UAAU,aAAa,eAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAYO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAsBkC,CAAC,yBAAU,CAAE,IAAI,UAAU,UAAU,eAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAED,GAAG,UAAU,aAAa,eAAC,CAAC,AAC1B,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAYD,CAAC,eAAC,CAAC,AACD,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WAAW,CACnB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CACjB,KAAK,CAAE,WAAW,CAClB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,AACxB,CAAC,AAED,KAAK,eAAC,CAAC,AACL,UAAU,CAAE,GAAG,CACf,KAAK,CAAE,KAAK,CACZ,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,QAAQ,eAAC,CAAC,AACR,UAAU,CAAE,KAAK,CACjB,KAAK,CAAE,IAAI,CACX,gBAAgB,CAAE,KAAK,CACvB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,UAAU,eAAC,CAAC,AACV,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,IAAI,AACd,CAAC"}`
};
var Message = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { message } = $$props;
  let { theme = "" } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$9);
  return `<div class="${"timestamp " + escape2(theme) + " svelte-1sb2hxg"}"><span class="${"timestamp " + escape2(theme) + " svelte-1sb2hxg"}">${escape2(message.timestamp)}</span></div>
<p class="${escape2(null_to_empty(message.sender)) + " svelte-1sb2hxg"}">${escape2(message.content)}</p>`;
});
var css$8 = {
  code: 'html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}button#toggleButton.deep-blue.svelte-11q6dfp{color:white}span.deep-blue.timestamp.svelte-11q6dfp{color:white}button.deep-blue.svelte-11q6dfp{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}button#toggleButton.deep-pink.svelte-11q6dfp{color:white}span.deep-pink.timestamp.svelte-11q6dfp{color:white}button.deep-pink.svelte-11q6dfp{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}button#toggleButton.soft-blue.svelte-11q6dfp{color:black}span.soft-blue.timestamp.svelte-11q6dfp{color:black}button.soft-blue.svelte-11q6dfp{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}button#toggleButton.soft-pink.svelte-11q6dfp{color:black}button#toggleButton.soft-pink.svelte-11q6dfp{color:black}span.soft-pink.timestamp.svelte-11q6dfp{color:black}button.soft-pink.svelte-11q6dfp{background-color:#e60073;color:white}#toggleButton.svelte-11q6dfp{bottom:2vh;right:0;position:fixed;z-index:10;padding:0 7.5vw}#toggleButton.svelte-11q6dfp{background:none;border:none;z-index:20;margin:none}#toggleButtonText.svelte-11q6dfp{vertical-align:middle}#stash-component.svelte-11q6dfp{position:fixed;left:0px;right:0px;bottom:0px;background-color:black;padding:2vh 7.5vw 10vh;display:grid;grid-template-areas:"middle middle middle middle" "stash-chat save-chat clear-stash clear-chat";justify-items:stretch;min-height:50px;gap:2vw;margin:auto}#name.svelte-11q6dfp{grid-area:middle;width:85vw;margin:auto}#stash-chat.svelte-11q6dfp{grid-area:stash-chat}#save-chat.svelte-11q6dfp{grid-area:save-chat}#clear-stash.svelte-11q6dfp{grid-area:clear-stash}#clear-chat.svelte-11q6dfp{grid-area:clear-chat}@media(min-width: 500px){#stash-component.svelte-11q6dfp{padding:2vh 20vw 10vh}#name.svelte-11q6dfp{width:60vw}}@media(min-width: 1000px){#stash-component.svelte-11q6dfp{padding:2vh 35vw 10vh}#name.svelte-11q6dfp{width:30vw}}',
  map: `{"version":3,"file":"Stash.svelte","sources":["Stash.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { browser } from '$app/env';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport { fade, fly } from 'svelte/transition';\\r\\nif (browser) {\\r\\n    const appStorage = window.localStorage;\\r\\n}\\r\\nconst currentDate = new Date();\\r\\nlet dateString = currentDate.toDateString().replace(/\\\\s/g, \\"-\\");\\r\\nlet showStashSave = false;\\r\\nexport let chatName = \\"\\";\\r\\nexport let messageList;\\r\\nexport let theme = '';\\r\\nconst toggle = (stashToggle) => {\\r\\n    stashToggle = !stashToggle;\\r\\n    console.log(stashToggle);\\r\\n    return stashToggle;\\r\\n};\\r\\n<\/script>\\r\\n\\r\\n<button\\r\\nid=\\"toggleButton\\"\\r\\nclass={theme}\\r\\non:click={() => {\\r\\n\\tshowStashSave = toggle(showStashSave);\\r\\n}}\\r\\n>\\r\\n<span class='material-icons {theme}'>info</span>\\r\\n<span class={theme} id='toggleButtonText'>Chat Options</span>\\r\\n</button>\\r\\n\\r\\n{#if showStashSave == true}\\r\\n{#if browser}\\r\\n<aside\\r\\nid=\\"stash-component\\"\\r\\ntransition:fly='{{duration: 300, y:200}}'\\r\\n>\\r\\n<input\\r\\ntransition:fade='{{duration: 100, delay:100}}'\\r\\nclass={theme}\\r\\nid=\\"name\\"\\r\\nplaceholder=\\"Name this chat, please c:\\"\\r\\nbind:value={chatName}\\r\\n/>\\r\\n<div id=\\"stash-chat\\">\\r\\n\\t<button\\r\\n\\ttransition:fade='{{duration: 150, delay:150}}'\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tHelpers.stashChat(window.localStorage, chatName, messageList);\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Stash Chat</span>\\r\\n</button>\\r\\n</div>\\r\\n<div id=\\"save-chat\\">\\r\\n\\t<button\\r\\n\\ttransition:fade='{{duration: 200, delay:200}}'\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tHelpers.saveChat(chatName, messageList);\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Save Chat</span>\\r\\n</button>\\r\\n</div>\\r\\n<div id=\\"clear-stash\\">\\r\\n\\t<button\\r\\n\\ttransition:fade='{{delay:250}}'\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tHelpers.clearStash(window.localStorage);\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Clear Stash</span>\\r\\n</button>\\r\\n</div>\\r\\n<div id=\\"clear-chat\\">\\r\\n\\t<button\\r\\n\\ttransition:fade='{{duration: 300, delay:300}}'\\r\\n\\tclass={theme}\\r\\n\\ton:click={() => {\\r\\n\\t\\tmessageList = []\\r\\n\\t}}\\r\\n\\t>\\r\\n\\t<span>Clear Chat</span>\\r\\n</button>\\r\\n</div>\\r\\n</aside>\\r\\n{/if}\\r\\n{/if}\\r\\n\\r\\n<style lang=\\"scss\\">:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nnav, #toggleButton {\\n  bottom: 2vh;\\n  right: 0;\\n  position: fixed;\\n  z-index: 10;\\n  padding: 0 7.5vw;\\n}\\n\\n#toggleButton {\\n  background: none;\\n  border: none;\\n  z-index: 20;\\n  margin: none;\\n}\\n\\n#toggleButtonText {\\n  vertical-align: middle;\\n}\\n\\nnav {\\n  bottom: 0vh;\\n  display: flex;\\n  flex-direction: column-reverse;\\n  height: 100%;\\n  left: 0px;\\n  line-height: 2;\\n  margin: 0;\\n  padding: 0 5vw 10vh;\\n  text-align: left;\\n  width: 5rem;\\n}\\n\\n#stash-component {\\n  position: fixed;\\n  left: 0px;\\n  right: 0px;\\n  bottom: 0px;\\n  background-color: black;\\n  padding: 2vh 7.5vw 10vh;\\n  display: grid;\\n  grid-template-areas: \\"middle middle middle middle\\" \\"stash-chat save-chat clear-stash clear-chat\\";\\n  justify-items: stretch;\\n  min-height: 50px;\\n  gap: 2vw;\\n  margin: auto;\\n}\\n\\n#name {\\n  grid-area: middle;\\n  width: 85vw;\\n  margin: auto;\\n}\\n\\n#stash-chat {\\n  grid-area: stash-chat;\\n}\\n\\n#save-chat {\\n  grid-area: save-chat;\\n}\\n\\n#clear-stash {\\n  grid-area: clear-stash;\\n}\\n\\n#clear-chat {\\n  grid-area: clear-chat;\\n}\\n\\n@media (min-width: 500px) {\\n  #stash-component {\\n    padding: 2vh 20vw 10vh;\\n  }\\n\\n  #name {\\n    width: 60vw;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  #stash-component {\\n    padding: 2vh 35vw 10vh;\\n  }\\n\\n  #name {\\n    width: 30vw;\\n  }\\n}</style>\\r\\n"],"names":[],"mappings":"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"}`
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
  $$result.css.add(css$8);
  return `<button id="${"toggleButton"}" class="${escape2(null_to_empty(theme)) + " svelte-11q6dfp"}"><span class="${"material-icons " + escape2(theme) + " svelte-11q6dfp"}">info</span>
<span class="${escape2(null_to_empty(theme)) + " svelte-11q6dfp"}" id="${"toggleButtonText"}">Chat Options</span></button>

${``}`;
});
var css$7 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}button#menuButton.deep-blue.svelte-1w72thp.svelte-1w72thp{color:white}nav.deep-blue.svelte-1w72thp.svelte-1w72thp{background-color:black}nav.deep-blue.svelte-1w72thp a.svelte-1w72thp{color:#99aaff}span.deep-blue.timestamp.svelte-1w72thp.svelte-1w72thp{color:white}button.deep-blue.svelte-1w72thp.svelte-1w72thp{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}button#menuButton.deep-pink.svelte-1w72thp.svelte-1w72thp{color:white}nav.deep-pink.svelte-1w72thp.svelte-1w72thp{background-color:black}nav.deep-pink.svelte-1w72thp a.svelte-1w72thp{color:#ff99ff}span.deep-pink.timestamp.svelte-1w72thp.svelte-1w72thp{color:white}button.deep-pink.svelte-1w72thp.svelte-1w72thp{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}button#menuButton.soft-blue.svelte-1w72thp.svelte-1w72thp{color:black}nav.soft-blue.svelte-1w72thp.svelte-1w72thp{background-color:white}nav.soft-blue.svelte-1w72thp a.svelte-1w72thp{color:#001a99}span.soft-blue.timestamp.svelte-1w72thp.svelte-1w72thp{color:black}button.soft-blue.svelte-1w72thp.svelte-1w72thp{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}button#menuButton.soft-pink.svelte-1w72thp.svelte-1w72thp{color:black}nav.soft-pink.svelte-1w72thp.svelte-1w72thp{background-color:white}nav.soft-pink.svelte-1w72thp a.svelte-1w72thp{color:#990000}span.soft-pink.timestamp.svelte-1w72thp.svelte-1w72thp{color:black}button.soft-pink.svelte-1w72thp.svelte-1w72thp{background-color:#e60073;color:white}nav.svelte-1w72thp.svelte-1w72thp,button.svelte-1w72thp.svelte-1w72thp{bottom:2vh;left:2vw;position:fixed;z-index:10;padding:0 7.5vw}#menuButton.svelte-1w72thp.svelte-1w72thp{left:0px;background:none;border:none;z-index:20;margin:none}.menuButtonText.svelte-1w72thp.svelte-1w72thp{vertical-align:middle}.material-icons{vertical-align:middle}nav.svelte-1w72thp.svelte-1w72thp{bottom:0vh;display:flex;flex-direction:column-reverse;height:100%;left:0px;line-height:2;margin:0;padding:0 2vw 10vh 7.5vw;text-align:left;width:10rem}ul.svelte-1w72thp.svelte-1w72thp{list-style:none;padding:0}li.svelte-1w72thp.svelte-1w72thp{text-decoration:none;list-style:none;padding:2vh 0}@media(max-width: 500px){nav.svelte-1w72thp.svelte-1w72thp{min-width:30%}}@media(min-width: 1000px){nav.svelte-1w72thp.svelte-1w72thp{max-width:10%}}",
  map: `{"version":3,"file":"Menu.svelte","sources":["Menu.svelte"],"sourcesContent":["<script lang='ts'>import { fly } from 'svelte/transition';\\r\\nexport let theme = '';\\r\\nexport let authStatus = false;\\r\\nlet flyoutStatus = false;\\r\\n<\/script>\\r\\n\\r\\n<button\\r\\nid='menuButton'\\r\\nclass={theme}\\r\\non:click=\\"{() => flyoutStatus = !flyoutStatus}\\"\\r\\n>\\r\\n<span class='material-icons {theme}'>menu</span>\\r\\n<span class='{theme} menuButtonText'>Menu</span>\\r\\n</button>\\r\\n\\r\\n{#if flyoutStatus}\\r\\n<nav\\r\\ntransition:fly='{{duration: 300, x: -200}}'\\r\\nclass={theme}>\\r\\n<ul>\\r\\n\\t<li>\\r\\n\\t\\t<a href=\\"/\\">\\r\\n\\t\\t\\t<span class='material-icons {theme}'>chat</span>\\r\\n\\t\\t\\t<span class='{theme} menuButtonText'>Chat</span>\\r\\n\\t\\t</a>\\r\\n\\t</li>\\r\\n\\t{#if authStatus == true}\\r\\n\\t<li>\\r\\n\\t\\t<a href=\\"/history\\">\\r\\n\\t\\t\\t<span class='material-icons {theme}'>info</span>\\r\\n\\t\\t\\tHistory\\r\\n\\t\\t</a>\\r\\n\\t</li>\\r\\n\\t{/if}\\r\\n\\t<li>\\r\\n\\t\\t<a href=\\"/settings\\">\\r\\n\\t\\t\\t<span class='material-icons {theme}'>settings</span>\\r\\n\\t\\t\\tSettings\\r\\n\\t\\t</a>\\r\\n\\t</li>\\r\\n\\t<li>\\r\\n\\t\\t<a href=\\"/login\\">\\r\\n\\t\\t\\t<span class='material-icons {theme}'>login</span>\\r\\n\\t\\t\\tLogin\\r\\n\\t\\t</a>\\r\\n\\t</li>\\r\\n</ul>\\r\\n</nav>\\r\\n{/if}\\r\\n\\r\\n<style lang=\\"scss\\">:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nnav, button {\\n  bottom: 2vh;\\n  left: 2vw;\\n  position: fixed;\\n  z-index: 10;\\n  padding: 0 7.5vw;\\n}\\n\\n#menuButton {\\n  left: 0px;\\n  background: none;\\n  border: none;\\n  z-index: 20;\\n  margin: none;\\n}\\n\\n.menuButtonText {\\n  vertical-align: middle;\\n}\\n\\n:global(.material-icons) {\\n  vertical-align: middle;\\n}\\n\\nnav {\\n  bottom: 0vh;\\n  display: flex;\\n  flex-direction: column-reverse;\\n  height: 100%;\\n  left: 0px;\\n  line-height: 2;\\n  margin: 0;\\n  padding: 0 2vw 10vh 7.5vw;\\n  text-align: left;\\n  width: 10rem;\\n}\\n\\nul {\\n  list-style: none;\\n  padding: 0;\\n}\\n\\nli {\\n  text-decoration: none;\\n  list-style: none;\\n  padding: 2vh 0;\\n}\\n\\n@media (max-width: 500px) {\\n  nav {\\n    min-width: 30%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  nav {\\n    max-width: 10%;\\n  }\\n}</style>"],"names":[],"mappings":"AAkD2B,cAAc,AAAE,CAAC,AAC1C,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACzQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAED,MAAM,WAAW,UAAU,8BAAgC,CAAC,AAC1D,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,GAAG,UAAU,8BAAC,CAAC,AACb,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,GAAG,yBAAU,CAAC,CAAC,eAAC,CAAC,AACf,KAAK,CAAE,OAAO,AAChB,CAAC,AAE+C,IAAI,UAAU,UAAU,8BAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,MAAM,UAAU,8BAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAOO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAC3Q,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAED,MAAM,WAAW,UAAU,8BAAgC,CAAC,AAC1D,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,GAAG,UAAU,8BAAC,CAAC,AACb,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,GAAG,yBAAU,CAAC,CAAC,eAAC,CAAC,AACf,KAAK,CAAE,OAAO,AAChB,CAAC,AAE+C,IAAI,UAAU,UAAU,8BAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,MAAM,UAAU,8BAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAOO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAED,MAAM,WAAW,UAAU,8BAAgC,CAAC,AAC1D,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,GAAG,UAAU,8BAAC,CAAC,AACb,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,GAAG,yBAAU,CAAC,CAAC,eAAC,CAAC,AACf,KAAK,CAAE,OAAO,AAChB,CAAC,AAE+C,IAAI,UAAU,UAAU,8BAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,MAAM,UAAU,8BAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAOO,cAAc,AAAE,CAAC,AACvB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,KAAK,CAAC,EAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,gBAAgB,MAAM,CAAC,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,OAAO,CAAC,GAAG,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CACvQ,qBAAqB,CAAE,KAAK,AAC9B,CAAC,AAED,MAAM,WAAW,UAAU,8BAAgC,CAAC,AAC1D,KAAK,CAAE,KAAK,AACd,CAAC,AAUD,GAAG,UAAU,8BAAC,CAAC,AACb,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,GAAG,yBAAU,CAAC,CAAC,eAAC,CAAC,AACf,KAAK,CAAE,OAAO,AAChB,CAAC,AAE+C,IAAI,UAAU,UAAU,8BAAC,CAAC,AACxE,KAAK,CAAE,KAAK,AACd,CAAC,AAMD,MAAM,UAAU,8BAAC,CAAC,AAChB,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,AACd,CAAC,AAOD,iCAAG,CAAE,MAAM,8BAAC,CAAC,AACX,MAAM,CAAE,GAAG,CACX,IAAI,CAAE,GAAG,CACT,QAAQ,CAAE,KAAK,CACf,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,CAAC,CAAC,KAAK,AAClB,CAAC,AAED,WAAW,8BAAC,CAAC,AACX,IAAI,CAAE,GAAG,CACT,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,AACd,CAAC,AAED,eAAe,8BAAC,CAAC,AACf,cAAc,CAAE,MAAM,AACxB,CAAC,AAEO,eAAe,AAAE,CAAC,AACxB,cAAc,CAAE,MAAM,AACxB,CAAC,AAED,GAAG,8BAAC,CAAC,AACH,MAAM,CAAE,GAAG,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,cAAc,CAC9B,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,GAAG,CACT,WAAW,CAAE,CAAC,CACd,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CACzB,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,KAAK,AACd,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,CAAC,AACZ,CAAC,AAED,EAAE,8BAAC,CAAC,AACF,eAAe,CAAE,IAAI,CACrB,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,GAAG,CAAC,CAAC,AAChB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,GAAG,8BAAC,CAAC,AACH,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,GAAG,8BAAC,CAAC,AACH,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC"}`
};
var Menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { theme = "" } = $$props;
  let { authStatus = false } = $$props;
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  if ($$props.authStatus === void 0 && $$bindings.authStatus && authStatus !== void 0)
    $$bindings.authStatus(authStatus);
  $$result.css.add(css$7);
  return `<button id="${"menuButton"}" class="${escape2(null_to_empty(theme)) + " svelte-1w72thp"}"><span class="${"material-icons " + escape2(theme) + " svelte-1w72thp"}">menu</span>
<span class="${escape2(theme) + " menuButtonText svelte-1w72thp"}">Menu</span></button>

${``}`;
});
var css$6 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}div.deep-blue.toastMessage.svelte-2xokuc{background-color:#d9ddf2}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}div.deep-pink.toastMessage.svelte-2xokuc{background-color:#f2d9f2}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}div.soft-blue.toastMessage.svelte-2xokuc{background-color:#d9eaf2}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}div.soft-pink.toastMessage.svelte-2xokuc{background-color:#f2d9e6}#toastContainer.svelte-2xokuc{position:absolute;transform:translateX(50%);top:1vh;left:0px;overflow:visible;height:2vh;margin:auto;width:50%}.toastMessage.svelte-2xokuc{background-color:white;height:3em;width:10em;border:thin solid grey;border-radius:2px;padding:1em;height:min-content;margin:auto;text-align:center;color:black}",
  map: `{"version":3,"file":"Toast.svelte","sources":["Toast.svelte"],"sourcesContent":["<script lang='ts'>import { toastStore } from './ts/toastStore';\\r\\nimport { browser } from '$app/env';\\r\\nimport { onMount } from 'svelte';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport { fly, fade, slide } from 'svelte/transition';\\r\\nexport let theme = '';\\r\\nlet currentToastQueue;\\r\\nlet currentToast;\\r\\nlet index = 0;\\r\\nlet toasterOccupied = false;\\r\\ntoastStore.subscribe((toastQueue) => {\\r\\n    if (toastQueue) {\\r\\n        // console.log(toastQueue)\\r\\n        currentToastQueue = toastQueue;\\r\\n        // let popup = toastQueue[toastQueue.length - 1]\\r\\n        // duration = popup?.duration\\r\\n        // toast = popup?.message\\r\\n        // console.log(popup)\\r\\n    }\\r\\n});\\r\\nfunction serveToast(toast) {\\r\\n    toasterOccupied = true;\\r\\n    console.log('now serving');\\r\\n    currentToast = currentToastQueue.filter(slice => toast.id == slice.id)[0];\\r\\n    let index = currentToastQueue.indexOf(toast);\\r\\n    setTimeout(() => {\\r\\n        console.log('loading next toast');\\r\\n        // toast = currentToast[0].message\\r\\n        currentToastQueue = currentToastQueue.filter(slice => toast.id !== slice.id);\\r\\n        toastStore.update(() => {\\r\\n            return currentToastQueue;\\r\\n        });\\r\\n        toasterOccupied = false;\\r\\n    }, currentToast.duration * 2);\\r\\n    return toast.message;\\r\\n}\\r\\n<\/script>\\r\\n\\r\\n\\r\\n{#if currentToastQueue?.length > 0}\\r\\n<div out:fade='{{duration:200}}' class={theme} id='toastContainer'>\\r\\n\\t<!-- {serveToast()} -->\\r\\n\\t{#each currentToastQueue as toast}\\r\\n\\t{#if !toasterOccupied}\\r\\n\\t<div class='toastMessage {theme}'\\r\\n\\tin:fly='{{duration: 300, y: -100}}'\\r\\n\\tout:fade='{{duration:200}}'\\r\\n\\t>\\r\\n\\t\\t{serveToast(toast)}\\r\\n\\t</div>\\r\\n\\t{/if}\\r\\n\\t{/each}\\r\\n</div>\\r\\n\\t{/if}\\r\\n\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\n#toastContainer {\\n  position: absolute;\\n  transform: translateX(50%);\\n  top: 1vh;\\n  left: 0px;\\n  overflow: visible;\\n  height: 2vh;\\n  margin: auto;\\n  width: 50%;\\n}\\n\\n.toastMessage {\\n  background-color: white;\\n  height: 3em;\\n  width: 10em;\\n  border: thin solid grey;\\n  border-radius: 2px;\\n  padding: 1em;\\n  height: min-content;\\n  margin: auto;\\n  text-align: center;\\n  color: black;\\n}</style>"],"names":[],"mappings":"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"}`
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
  $$result.css.add(css$6);
  return `${(currentToastQueue == null ? void 0 : currentToastQueue.length) > 0 ? `<div class="${escape2(null_to_empty(theme)) + " svelte-2xokuc"}" id="${"toastContainer"}">
	${each(currentToastQueue, (toast) => `${!toasterOccupied ? `<div class="${"toastMessage " + escape2(theme) + " svelte-2xokuc"}">${escape2(serveToast(toast))}
	</div>` : ``}`)}</div>` : ``}`;
});
var css$5 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}div.deep-blue.svelte-fns6nv p.svelte-fns6nv{color:white}div.deep-blue.toastMessage.svelte-fns6nv.svelte-fns6nv{background-color:#d9ddf2}button.deep-blue.svelte-fns6nv.svelte-fns6nv{background-color:#0026e6;color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}div.deep-pink.svelte-fns6nv p.svelte-fns6nv{color:white}div.deep-pink.toastMessage.svelte-fns6nv.svelte-fns6nv{background-color:#f2d9f2}button.deep-pink.svelte-fns6nv.svelte-fns6nv{background-color:#cc0088;color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}div.soft-blue.svelte-fns6nv p.svelte-fns6nv{color:black}div.soft-blue.toastMessage.svelte-fns6nv.svelte-fns6nv{background-color:#d9eaf2}button.soft-blue.svelte-fns6nv.svelte-fns6nv{background-color:#0073e6;color:white}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}div.soft-pink.svelte-fns6nv p.svelte-fns6nv{color:black}div.soft-pink.toastMessage.svelte-fns6nv.svelte-fns6nv{background-color:#f2d9e6}button.soft-pink.svelte-fns6nv.svelte-fns6nv{background-color:#e60073;color:white}",
  map: `{"version":3,"file":"ThemeSwitcher.svelte","sources":["ThemeSwitcher.svelte"],"sourcesContent":["<script lang='ts'>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport themeStore from './ts/themeStore';\\r\\nimport { browser } from '$app/env';\\r\\nimport { onMount } from 'svelte';\\r\\nimport * as Helpers from './ts/helpers';\\r\\nimport Toast from './Toast.svelte';\\r\\nlet themes = ['deep-blue',\\r\\n    'deep-pink',\\r\\n    'soft-blue',\\r\\n    'soft-pink'\\r\\n];\\r\\nexport let theme = '';\\r\\nlet appStorage;\\r\\nlet listener;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    listener = Helpers.fetchTheme(appStorage, themeStore, 'listener');\\r\\n    themeStore.subscribe((newTheme) => {\\r\\n        theme = newTheme;\\r\\n    });\\r\\n}));\\r\\n<\/script>\\r\\n\\r\\n<div class={theme}>\\r\\n\\t{#if browser}\\r\\n\\t<p>current theme: {theme.replace('-', ' ')}</p>\\r\\n\\t<button class={theme} on:click={() => Helpers.updateTheme(window.localStorage, theme)}>\\r\\n\\t\\t<span>Switch Theme</span>\\r\\n\\t</button>\\r\\n\\t<p>current listener: {listener}</p>\\r\\n\\t<button class={theme} on:click={() => listener = Helpers.updateListener(window.localStorage, listener)}>\\r\\n\\t\\t<span>Switch Listener</span>\\r\\n\\t</button>\\r\\n\\t{/if}\\r\\n\\t<Toast {theme}></Toast>\\r\\n</div>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}</style>"],"names":[],"mappings":"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"}`
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
  $$result.css.add(css$5);
  return `<div class="${escape2(null_to_empty(theme)) + " svelte-fns6nv"}">${``}
	${validate_component(Toast, "Toast").$$render($$result, { theme }, {}, {})}
</div>`;
});
var css$4 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}main.deep-blue.svelte-17oph5y p.svelte-17oph5y{color:white}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}main.deep-pink.svelte-17oph5y p.svelte-17oph5y{color:white}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}main.soft-blue.svelte-17oph5y p.svelte-17oph5y{color:black}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.soft-pink.svelte-17oph5y p.svelte-17oph5y{color:black}main.svelte-17oph5y.svelte-17oph5y{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}#messages.svelte-17oph5y.svelte-17oph5y{display:flex;flex-direction:column-reverse;height:80vh;min-height:1px;overflow:scroll;-webkit-mask-image:linear-gradient(to top, black 0%, transparent 80%);mask-image:linear-gradient(to top, black 0%, transparent 80%);scrollbar-width:none}#animatedList.svelte-17oph5y.svelte-17oph5y{display:flex;flex-direction:column}#animatedList.svelte-17oph5y>p.svelte-17oph5y{color:white}#messages.svelte-17oph5y.svelte-17oph5y::-webkit-scrollbar{display:none}@media(min-width: 500px){main.svelte-17oph5y.svelte-17oph5y{max-width:60%}}@media(min-width: 1000px){main.svelte-17oph5y.svelte-17oph5y{max-width:30%}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space</title>\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Input from '../components/Input.svelte';\\r\\nimport Message from '../components/Message.svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport ThemeSwitcher from '../components/ThemeSwitcher.svelte';\\r\\nimport themeStore from '../components/ts/themeStore';\\r\\nimport Toast from '../components/Toast.svelte';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nlet theme = 'soft-blue';\\r\\nlet date = new Date();\\r\\nexport let messageList = [], timer = 8;\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    if (!theme) {\\r\\n        theme = 'deep-blue';\\r\\n    }\\r\\n    themeStore.subscribe((newTheme) => {\\r\\n        theme = newTheme;\\r\\n    });\\r\\n    try {\\r\\n        let stash = JSON.parse(appStorage.getItem('chats'));\\r\\n        messageList = stash || messageList;\\r\\n        console.log(stash);\\r\\n    }\\r\\n    catch (error) {\\r\\n        console.warn(error);\\r\\n    }\\r\\n    Helpers.setListenerOpacity(100);\\r\\n}));\\r\\n// export let name: string;\\r\\nlet chatName = '';\\r\\nlet fileName = '';\\r\\nconst removeMessage = (list) => {\\r\\n    console.log(list);\\r\\n    switch (list.length > 0) {\\r\\n        case true:\\r\\n            return list.slice(0, -1);\\r\\n        case false:\\r\\n        default:\\r\\n            return list;\\r\\n    }\\r\\n};\\r\\nconst responses = [\`I'm just here to listen. :)\`,\\r\\n    \`Your feelings are valid. Keep talking. It's okay.\`,\\r\\n    'Keep going. :)',\\r\\n    '*nods* Okay...'\\r\\n];\\r\\nlet voidFlag = 0;\\r\\nconst voidResponse = (timer, listofResponses, messages, voidFlag, innerVoidFlag) => {\\r\\n    if (voidFlag !== innerVoidFlag) {\\r\\n        return messageList;\\r\\n    }\\r\\n    switch (timer) {\\r\\n        case (8):\\r\\n            break;\\r\\n        case (0):\\r\\n            let multiplier = Math.random();\\r\\n            let index = (100 * multiplier) % 4;\\r\\n            index = Math.floor(index);\\r\\n            console.log(listofResponses[index]);\\r\\n            let date = new Date();\\r\\n            let localTime = date.toLocaleTimeString();\\r\\n            let localDate = date.toLocaleDateString()\\r\\n                .split('/')\\r\\n                .reverse()\\r\\n                .join('.');\\r\\n            messageList = [...messages,\\r\\n                { content: listofResponses[index],\\r\\n                    sender: 'theVoid',\\r\\n                    timestamp: \`\${localDate} - \${localTime}\`\\r\\n                }\\r\\n            ];\\r\\n            voidFlag = 0;\\r\\n            timer = 8;\\r\\n            return messageList;\\r\\n        default:\\r\\n            voidFlag = 1;\\r\\n            setTimeout(() => {\\r\\n                console.log('void called');\\r\\n                timer = timer - 1;\\r\\n                voidResponse(timer, listofResponses, messages, voidFlag, 1);\\r\\n            }, 1000);\\r\\n    }\\r\\n};\\r\\nconst invokeVoid = (event) => {\\r\\n    console.log(event);\\r\\n    messageList = voidResponse(timer, responses, messageList, voidFlag, voidFlag);\\r\\n};\\r\\n// setInterval(function() {\\r\\n// \\tmessageList = removeMessage(messageList)\\r\\n// }.bind(messageList),\\r\\n// \\t3000)\\r\\n<\/script>\\r\\n\\t\\r\\n\\t<Menu {theme}></Menu>\\r\\n\\t\\r\\n\\t<main class={theme}>\\r\\n\\t\\t<div id='messages'>\\r\\n\\t\\t\\t<section id='animatedList'>\\r\\n\\t\\t\\t\\t{#if messageList.length !== 0}\\r\\n\\t\\t\\t\\t{#each messageList as message}\\r\\n\\t\\t\\t\\t<span\\r\\n\\t\\t\\t\\ttransition:slide='{{ duration: 200 }}'>\\r\\n\\t\\t\\t\\t<Message {theme} {message}></Message>\\r\\n\\t\\t\\t</span>\\r\\n\\t\\t\\t{/each}\\r\\n\\t\\t\\t{:else}\\r\\n\\t\\t\\t<p transition:fade|local>Talk to me.</p>\\r\\n\\t\\t\\t{/if}\\r\\n\\t\\t</section>\\r\\n\\t</div>\\r\\n\\t<Input\\r\\n\\t{theme}\\r\\n\\ton:click='{()=> {\\r\\n\\t\\tconsole.log('click')\\r\\n}}'\\r\\n\\ton:voidInvoked='{invokeVoid.bind(timer,responses,messageList)}'\\r\\n\\tbind:messageList\\r\\n\\tbind:timer\\r\\n\\tbind:chatName\\r\\n\\tbind:fileName></Input>\\r\\n\\t<Stash\\r\\n\\t{theme}\\r\\n\\tbind:messageList\\r\\n\\tbind:chatName></Stash>\\r\\n\\t\\r\\n<Toast {theme}></Toast>\\r\\n\\t\\r\\n\\t\\r\\n</main>\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  /* min-width: 400px; */\\n  max-width: 85%;\\n  /* width:100px; */\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\n#messages {\\n  display: flex;\\n  /* align-items:flex-end; */\\n  flex-direction: column-reverse;\\n  /* justify-content: flex-end; */\\n  height: 80vh;\\n  min-height: 1px;\\n  overflow: scroll;\\n  -webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);\\n  mask-image: linear-gradient(to top, black 0%, transparent 80%);\\n  scrollbar-width: none;\\n  /* border: thin solid white; */\\n}\\n\\n#animatedList {\\n  display: flex;\\n  flex-direction: column;\\n}\\n\\n#animatedList > p {\\n  color: white;\\n}\\n\\n#messages::-webkit-scrollbar {\\n  display: none;\\n}\\n\\n/* h1 {\\n\\tcolor: #fff;\\n\\ttext-transform: lowercase;\\n\\tfont-size: 3em;\\n\\tfont-weight: 600;\\n} */\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
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
  $$result.css.add(css$4);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>a softer space</title>`, ""}`, ""}


	
	${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}
	
	<main class="${escape2(null_to_empty(theme)) + " svelte-17oph5y"}"><div id="${"messages"}" class="${"svelte-17oph5y"}"><section id="${"animatedList"}" class="${"svelte-17oph5y"}">${messageList.length !== 0 ? `${each(messageList, (message) => `<span>${validate_component(Message, "Message").$$render($$result, { theme, message }, {}, {})}
			</span>`)}` : `<p class="${"svelte-17oph5y"}">Talk to me.</p>`}</section></div>
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
var css$3 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.svelte-3d6c7v{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}@media(min-width: 500px){main.svelte-3d6c7v{max-width:60%}}@media(min-width: 1000px){main.svelte-3d6c7v{max-width:30%}}",
  map: `{"version":3,"file":"settings.svelte","sources":["settings.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space :: settings</title>\\r\\n\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch.js\\"><\/script> -->\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch2.js\\"><\/script> -->\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport ThemeSwitcher from '../components/ThemeSwitcher.svelte';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nlet date = new Date();\\r\\nexport let theme = '';\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    Helpers.setListenerOpacity(25);\\r\\n}));\\r\\n// export let name: string;\\r\\n<\/script>\\r\\n\\r\\n<Menu {theme}></Menu>\\r\\n\\r\\n\\r\\n<main class={theme}>\\r\\n\\t<ThemeSwitcher bind:theme></ThemeSwitcher>\\r\\n\\t<section id=\\"p5Sketch\\"></section>\\r\\n\\t<section id=\\"p5Sketch2\\"></section>\\r\\n</main>\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  /* min-width: 400px; */\\n  max-width: 85%;\\n  /* width:100px; */\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\n/* h1 {\\n\\tcolor: #fff;\\n\\ttext-transform: lowercase;\\n\\tfont-size: 3em;\\n\\tfont-weight: 600;\\n} */\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
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
  $$result.css.add(css$3);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>a softer space :: settings</title>`, ""}`, ""}



${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}


<main class="${escape2(null_to_empty(theme)) + " svelte-3d6c7v"}">${validate_component(ThemeSwitcher, "ThemeSwitcher").$$render($$result, { theme }, {
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
var css$2 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.svelte-5br1lp{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}@media(min-width: 500px){main.svelte-5br1lp{max-width:60%}}@media(min-width: 1000px){main.svelte-5br1lp{max-width:30%}}",
  map: `{"version":3,"file":"template.svelte","sources":["template.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space :: settings</title>\\r\\n\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch.js\\"><\/script> -->\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch2.js\\"><\/script> -->\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport themeStore from '../components/ts/themeStore';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nexport let theme = '';\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    Helpers.setListenerOpacity(25);\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    if (!theme) {\\r\\n        theme = 'deep-blue';\\r\\n    }\\r\\n    themeStore.subscribe((newTheme) => {\\r\\n        theme = newTheme;\\r\\n    });\\r\\n}));\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\r\\n\\r\\n<Menu {theme}></Menu>\\r\\n\\r\\n<main class={theme}>\\r\\n\\t<section id=\\"p5Sketch\\"></section>\\r\\n\\t<section id=\\"p5Sketch2\\"></section>\\r\\n</main>\\r\\n\\r\\n\\r\\n\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  max-width: 85%;\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
};
var Template = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  return `${$$result.head += `${$$result.title = `<title>a softer space :: settings</title>`, ""}`, ""}






${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}

<main class="${escape2(null_to_empty(theme)) + " svelte-5br1lp"}"><section id="${"p5Sketch"}"></section>
	<section id="${"p5Sketch2"}"></section>
</main>`;
});
var template = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Template
});
var sbUrl = "https://tdoulxkicweqdvxnuqmm.supabase.co";
var sbKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A";
(0, import_supabase_js.createClient)(sbUrl, sbKey);
var css$1 = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}main.deep-blue.svelte-1sl4hew h1.svelte-1sl4hew{color:#002bff}main.deep-blue.svelte-1sl4hew p.svelte-1sl4hew{color:white}button.deep-blue.svelte-1sl4hew.svelte-1sl4hew{background-color:#0026e6;color:white}main.deep-blue.svelte-1sl4hew a.svelte-1sl4hew{color:#99ddff;font-weight:600}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}main.deep-pink.svelte-1sl4hew h1.svelte-1sl4hew{color:#ff00aa}main.deep-pink.svelte-1sl4hew p.svelte-1sl4hew{color:white}button.deep-pink.svelte-1sl4hew.svelte-1sl4hew{background-color:#cc0088;color:white}main.deep-pink.svelte-1sl4hew a.svelte-1sl4hew{color:#ffccb3;font-weight:600}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}main.soft-blue.svelte-1sl4hew h1.svelte-1sl4hew{color:#0080ff}main.soft-blue.svelte-1sl4hew p.svelte-1sl4hew{color:black}button.soft-blue.svelte-1sl4hew.svelte-1sl4hew{background-color:#0073e6;color:white}main.soft-blue.svelte-1sl4hew a.svelte-1sl4hew{color:#004080;font-weight:600}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.soft-pink.svelte-1sl4hew h1.svelte-1sl4hew{color:#ff0080}main.soft-pink.svelte-1sl4hew p.svelte-1sl4hew{color:black}button.soft-pink.svelte-1sl4hew.svelte-1sl4hew{background-color:#e60073;color:white}main.soft-pink.svelte-1sl4hew a.svelte-1sl4hew{color:#802b00;font-weight:600}main.svelte-1sl4hew.svelte-1sl4hew{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}h1.svelte-1sl4hew.svelte-1sl4hew{font-size:3em;font-weight:600}@media(min-width: 500px){main.svelte-1sl4hew.svelte-1sl4hew{max-width:60%}}@media(min-width: 1000px){main.svelte-1sl4hew.svelte-1sl4hew{max-width:30%}}",
  map: `{"version":3,"file":"signup.svelte","sources":["signup.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space :: settings</title>\\r\\n\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch.js\\"><\/script> -->\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch2.js\\"><\/script> -->\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport themeStore from '../components/ts/themeStore';\\r\\nimport Toast from '../components/Toast.svelte';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nimport { signup } from '../components/ts/auth';\\r\\nexport let theme = '';\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    Helpers.setListenerOpacity(25);\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    if (!theme) {\\r\\n        theme = 'deep-blue';\\r\\n    }\\r\\n    themeStore.subscribe((newTheme) => {\\r\\n        theme = newTheme;\\r\\n    });\\r\\n}));\\r\\n// export let name: string;\\r\\nlet email;\\r\\nlet password;\\r\\nlet name;\\r\\nlet user, session, error;\\r\\nfunction newAccount() {\\r\\n    return __awaiter(this, void 0, void 0, function* () {\\r\\n        ([user, session, error] = yield signup(email, password, name));\\r\\n        if (error) {\\r\\n            Helpers.notify(JSON.stringify(error.message), 2000);\\r\\n        }\\r\\n    });\\r\\n}\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\r\\n<Menu {theme}></Menu>\\r\\n\\r\\n<main class={theme}>\\r\\n\\t<h1>Sign Up</h1>\\r\\n\\t\\r\\n\\t<input \\r\\n\\tbind:value={name}\\r\\n\\ttransition:fade='{{duration: 100, delay:100}}'\\r\\n\\tid='name' placeholder=\\"Your Name\\">\\r\\n\\t\\r\\n\\t<input \\r\\n\\tbind:value={email}\\r\\n\\ttransition:fade='{{duration: 100, delay:100}}'\\r\\n\\tid='email' placeholder=\\"email@mailboxx.com\\">\\r\\n\\t\\r\\n\\t<input \\r\\n\\tbind:value={password}\\r\\n\\ttransition:fade='{{duration: 100, delay:150}}'\\r\\n\\tid='pass' type=\\"password\\" placeholder=\\"password\\">\\r\\n\\t\\r\\n\\t<div>\\r\\n\\t\\t<button\\r\\n\\t\\tclass={theme}\\r\\n\\t\\ttransition:fade='{{duration: 100, delay:200}}'\\r\\n\\t\\ton:click='{() => {\\r\\n\\t\\t\\tnewAccount()\\r\\n\\t\\t\\t}}'\\r\\n\\t\\t>\\r\\n\\t\\tSign up\\r\\n\\t</button>\\r\\n</div>\\r\\n\\r\\n<p transition:fade='{{duration: 100, delay:250}}'>Already have an account?\\r\\n\\t<a href='/login'>Log in here, okay?</a>\\r\\n</p>\\r\\n\\r\\n<Toast {theme}></Toast>\\r\\n</main>\\r\\n\\r\\n\\r\\n\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  /* min-width: 400px; */\\n  max-width: 85%;\\n  /* width:100px; */\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\nh1 {\\n  font-size: 3em;\\n  font-weight: 600;\\n}\\n\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
};
var Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  let email;
  let password;
  let name;
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>a softer space :: settings</title>`, ""}`, ""}





${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}

<main class="${escape2(null_to_empty(theme)) + " svelte-1sl4hew"}"><h1 class="${"svelte-1sl4hew"}">Sign Up</h1>
	
	<input id="${"name"}" placeholder="${"Your Name"}"${add_attribute("value", name, 0)}>
	
	<input id="${"email"}" placeholder="${"email@mailboxx.com"}"${add_attribute("value", email, 0)}>
	
	<input id="${"pass"}" type="${"password"}" placeholder="${"password"}"${add_attribute("value", password, 0)}>
	
	<div><button class="${escape2(null_to_empty(theme)) + " svelte-1sl4hew"}">Sign up
	</button></div>

<p class="${"svelte-1sl4hew"}">Already have an account?
	<a href="${"/login"}" class="${"svelte-1sl4hew"}">Log in here, okay?</a></p>

${validate_component(Toast, "Toast").$$render($$result, { theme }, {}, {})}
</main>`;
});
var signup = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signup
});
var css = {
  code: "html.deep-blue{background:linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);background-attachment:fixed}main.deep-blue.svelte-1sl4hew h1.svelte-1sl4hew{color:#002bff}main.deep-blue.svelte-1sl4hew p.svelte-1sl4hew{color:white}button.deep-blue.svelte-1sl4hew.svelte-1sl4hew{background-color:#0026e6;color:white}main.deep-blue.svelte-1sl4hew a.svelte-1sl4hew{color:#99ddff;font-weight:600}html.deep-pink{background:linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);background-attachment:fixed}main.deep-pink.svelte-1sl4hew h1.svelte-1sl4hew{color:#ff00aa}main.deep-pink.svelte-1sl4hew p.svelte-1sl4hew{color:white}button.deep-pink.svelte-1sl4hew.svelte-1sl4hew{background-color:#cc0088;color:white}main.deep-pink.svelte-1sl4hew a.svelte-1sl4hew{color:#ffccb3;font-weight:600}html.soft-blue{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);background-attachment:fixed}main.soft-blue.svelte-1sl4hew h1.svelte-1sl4hew{color:#0080ff}main.soft-blue.svelte-1sl4hew p.svelte-1sl4hew{color:black}button.soft-blue.svelte-1sl4hew.svelte-1sl4hew{background-color:#0073e6;color:white}main.soft-blue.svelte-1sl4hew a.svelte-1sl4hew{color:#004080;font-weight:600}html.soft-pink{background:linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);background-attachment:fixed}main.soft-pink.svelte-1sl4hew h1.svelte-1sl4hew{color:#ff0080}main.soft-pink.svelte-1sl4hew p.svelte-1sl4hew{color:black}button.soft-pink.svelte-1sl4hew.svelte-1sl4hew{background-color:#e60073;color:white}main.soft-pink.svelte-1sl4hew a.svelte-1sl4hew{color:#802b00;font-weight:600}main.svelte-1sl4hew.svelte-1sl4hew{position:relative;text-align:center;padding:1em;max-width:85%;height:100%;margin:0 auto}h1.svelte-1sl4hew.svelte-1sl4hew{font-size:3em;font-weight:600}@media(min-width: 500px){main.svelte-1sl4hew.svelte-1sl4hew{max-width:60%}}@media(min-width: 1000px){main.svelte-1sl4hew.svelte-1sl4hew{max-width:30%}}",
  map: `{"version":3,"file":"login.svelte","sources":["login.svelte"],"sourcesContent":["<svelte:head>\\r\\n<title>a softer space :: settings</title>\\r\\n\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch.js\\"><\/script> -->\\r\\n<!-- <script id='p5' defer src=\\"/p5/sketch2.js\\"><\/script> -->\\r\\n</svelte:head>\\r\\n\\r\\n<script lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\r\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\r\\n    return new (P || (P = Promise))(function (resolve, reject) {\\r\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\r\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\r\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\r\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\r\\n    });\\r\\n};\\r\\nimport { fade, slide } from 'svelte/transition';\\r\\nimport { bind } from 'svelte/internal';\\r\\nimport { onMount } from 'svelte';\\r\\nimport Stash from '../components/Stash.svelte';\\r\\nimport Menu from '../components/Menu.svelte';\\r\\nimport themeStore from '../components/ts/themeStore';\\r\\nimport * as Helpers from '../components/ts/helpers';\\r\\nimport { login } from '../components/ts/auth';\\r\\nexport let theme = '';\\r\\nonMount(() => __awaiter(void 0, void 0, void 0, function* () {\\r\\n    const appStorage = window.localStorage;\\r\\n    Helpers.setListenerOpacity(25);\\r\\n    theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');\\r\\n    if (!theme) {\\r\\n        theme = 'deep-blue';\\r\\n    }\\r\\n    themeStore.subscribe((newTheme) => {\\r\\n        theme = newTheme;\\r\\n    });\\r\\n}));\\r\\n// export let name: string;\\r\\nlet email;\\r\\nlet password;\\r\\nlet user, session, error;\\r\\nfunction signin() {\\r\\n    console.log('signin invoked');\\r\\n    login(email, password)\\r\\n        .then(result => {\\r\\n        [user, session, error] = result;\\r\\n    });\\r\\n    console.log(user, session, error);\\r\\n}\\r\\n<\/script>\\r\\n\\r\\n\\r\\n\\r\\n<Menu {theme}></Menu>\\r\\n\\r\\n<main class={theme}>\\r\\n\\t<h1>Login</h1>\\r\\n\\t\\r\\n\\t<input \\r\\n\\tbind:value={email}\\r\\n\\ttransition:fade='{{duration: 100, delay:100}}'\\r\\n\\tid='email' placeholder=\\"email@mailboxx.com\\">\\r\\n\\t\\r\\n\\t<input \\r\\n\\tbind:value={password}\\r\\n\\ttransition:fade='{{duration: 100, delay:150}}'\\r\\n\\tid='pass' type=\\"password\\" placeholder=\\"password\\">\\r\\n\\t\\r\\n\\t<div>\\r\\n\\t\\t<button\\r\\n\\t\\tclass={theme}\\r\\n\\t\\ttransition:fade='{{duration: 100, delay:200}}'\\r\\n\\t\\ton:click='{() => {\\r\\n\\t\\t\\tsignin()\\r\\n\\t\\t\\t}}'\\r\\n\\t\\t>\\r\\n\\t\\tLogin\\r\\n\\t</button>\\r\\n</div>\\r\\n\\r\\n<p transition:fade='{{duration: 100, delay:250}}'>New to A Softer Space?\\r\\n\\t<a href='/signup'>Sign up here, okay?</a>\\r\\n</p>\\r\\n\\r\\n</main>\\r\\n\\r\\n\\r\\n\\r\\n\\r\\n<style lang='scss'>:global(html.deep-blue) {\\n  background: linear-gradient(130deg, #200338 0%, rgba(175, 0, 87, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, black 30%, rgba(12, 5, 94, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #3700ff 10%, #2115a5 20%, black 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-blue, button#toggleButton.deep-blue {\\n  color: white;\\n}\\n\\nmain.deep-blue h1 {\\n  color: #002bff;\\n}\\n\\nnav.deep-blue {\\n  background-color: black;\\n}\\n\\nnav.deep-blue a {\\n  color: #99aaff;\\n}\\n\\nmain.deep-blue p, div.deep-blue p, p.deep-blue, span.deep-blue.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-blue.toastMessage {\\n  background-color: #d9ddf2;\\n}\\n\\nbutton.deep-blue {\\n  background-color: #0026e6;\\n  color: white;\\n}\\n\\nmain.deep-blue a {\\n  color: #99ddff;\\n  font-weight: 600;\\n}\\n\\n:global(html.deep-pink) {\\n  background: linear-gradient(130deg, #3a0303 0%, rgba(153, 0, 0, 0.1) 70%, rgba(255, 255, 255, 0) 100%), radial-gradient(circle at top, purple 30%, rgba(63, 5, 92, 0.8) 60%, rgba(0, 0, 0, 0) 100%), radial-gradient(circle at bottom, #b300b3 10%, #000033 30%, black 50%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.deep-pink, button#toggleButton.deep-pink {\\n  color: white;\\n}\\n\\nmain.deep-pink h1 {\\n  color: #ff00aa;\\n}\\n\\nnav.deep-pink {\\n  background-color: black;\\n}\\n\\nnav.deep-pink a {\\n  color: #ff99ff;\\n}\\n\\nmain.deep-pink p, div.deep-pink p, p.deep-pink, span.deep-pink.timestamp {\\n  color: white;\\n}\\n\\ndiv.deep-pink.toastMessage {\\n  background-color: #f2d9f2;\\n}\\n\\nbutton.deep-pink {\\n  background-color: #cc0088;\\n  color: white;\\n}\\n\\nmain.deep-pink a {\\n  color: #ffccb3;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-blue) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #4095bf 30%, rgba(143, 134, 249, 0.8) 60%, #4095bf 100%), radial-gradient(circle at bottom, #9b80ff 10%, #2115a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-blue, button#toggleButton.soft-blue {\\n  color: black;\\n}\\n\\nmain.soft-blue h1 {\\n  color: #0080ff;\\n}\\n\\nnav.soft-blue {\\n  background-color: white;\\n}\\n\\nnav.soft-blue a {\\n  color: #001a99;\\n}\\n\\nmain.soft-blue p, div.soft-blue p, p.soft-blue, span.soft-blue.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-blue.toastMessage {\\n  background-color: #d9eaf2;\\n}\\n\\nbutton.soft-blue {\\n  background-color: #0073e6;\\n  color: white;\\n}\\n\\nmain.soft-blue a {\\n  color: #004080;\\n  font-weight: 600;\\n}\\n\\n:global(html.soft-pink) {\\n  background: linear-gradient(130deg, white 0%, rgba(255, 128, 191, 0.1) 70%, rgba(255, 0, 247, 0) 100%), radial-gradient(circle at top, #df9fdf 30%, rgba(249, 134, 134, 0.8) 60%, #bf4040 100%), radial-gradient(circle at bottom, #ff80bf 10%, #a215a2 20%, white 40%);\\n  background-attachment: fixed;\\n}\\n\\nbutton#menuButton.soft-pink, button#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nbutton#toggleButton.soft-pink {\\n  color: black;\\n}\\n\\nmain.soft-pink h1 {\\n  color: #ff0080;\\n}\\n\\nnav.soft-pink {\\n  background-color: white;\\n}\\n\\nnav.soft-pink a {\\n  color: #990000;\\n}\\n\\nmain.soft-pink p, div.soft-pink p, p.soft-pink, span.soft-pink.timestamp {\\n  color: black;\\n}\\n\\ndiv.soft-pink.toastMessage {\\n  background-color: #f2d9e6;\\n}\\n\\nbutton.soft-pink {\\n  background-color: #e60073;\\n  color: white;\\n}\\n\\nmain.soft-pink a {\\n  color: #802b00;\\n  font-weight: 600;\\n}\\n\\nmain {\\n  position: relative;\\n  text-align: center;\\n  padding: 1em;\\n  /* min-width: 400px; */\\n  max-width: 85%;\\n  /* width:100px; */\\n  height: 100%;\\n  margin: 0 auto;\\n}\\n\\nh1 {\\n  font-size: 3em;\\n  font-weight: 600;\\n}\\n\\n@media (min-width: 500px) {\\n  main {\\n    max-width: 60%;\\n  }\\n}\\n@media (min-width: 1000px) {\\n  main {\\n    max-width: 30%;\\n  }\\n}</style>"],"names":[],"mappings":"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"}`
};
var Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
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
  let email;
  let password;
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0)
    $$bindings.theme(theme);
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>a softer space :: settings</title>`, ""}`, ""}





${validate_component(Menu, "Menu").$$render($$result, { theme }, {}, {})}

<main class="${escape2(null_to_empty(theme)) + " svelte-1sl4hew"}"><h1 class="${"svelte-1sl4hew"}">Login</h1>
	
	<input id="${"email"}" placeholder="${"email@mailboxx.com"}"${add_attribute("value", email, 0)}>
	
	<input id="${"pass"}" type="${"password"}" placeholder="${"password"}"${add_attribute("value", password, 0)}>
	
	<div><button class="${escape2(null_to_empty(theme)) + " svelte-1sl4hew"}">Login
	</button></div>

<p class="${"svelte-1sl4hew"}">New to A Softer Space?
	<a href="${"/signup"}" class="${"svelte-1sl4hew"}">Sign up here, okay?</a></p>

</main>`;
});
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Login
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
