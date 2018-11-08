/**
 * Node module to parse postman collection v1 and generate k6 scripts
 * from provided template.
 */
import {
  IPostmanRequest,
  IPostmanCollectionV1
} from "./interfaces/v1/postman.collection";

/** global count of requests */
const env = { requestCnt: 0 };

/** An object used as a map where keys and values are string. */
export interface IStringMap {
  [from: string]: string;
}

/** Output state holding information about the request. */
export interface IRequestState {
  /** string representation of the js code for k6 http apis. */
  request: string;
  /** identifier for this request. */
  uuid: string;
}

/** converts a name and id into a identifier. */
export function asId(name: string, id: number) {
  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/gim, "_")
    .replace(/_{2,}/gim, "_")}-${id}`;
}

/** set the global counter to 0. */
export function reset() {
  env.requestCnt = 0;
}

/** Represents a k6 request. */
export class K6Request {
  /** tags to append to the k6 request. */
  public readonly tags!: IStringMap;
  /**
   * object map to replace mustached variables with the corresponding values.
   * key does not need the mustache.
   *
   * @example
   * ```js
   * {hostname: "example.com"}
   * ```
   */
  public readonly mustache!: IStringMap;
  constructor(
    /** Request object from postman collection v1. */
    public readonly request: IPostmanRequest,
    /** Options for tags and mustache mappings. */
    public readonly opts: IGenerateRequestsOpts = {},
    /** identifier for the request. auto-increment if not provided. */
    public readonly id: number = ++env.requestCnt
  ) {
    const { mustache = {}, tags = {} } = opts;
    this.tags = { uuid: this.uuid, name: request.name, ...tags };
    this.mustache = mustache;
  }

  /** identifier constructed from request name and id. */
  get uuid() {
    return asId(this.request.name, this.id);
  }

  /** identifier and k6 http api as string. */
  get state(): IRequestState {
    return { uuid: this.uuid, request: this.toString() };
  }

  /** k6 http api as a string. */
  toString() {
    const { mustache, request, tags } = this;
    const {
      queryParams = [],
      headerData = [],
      method = "GET",
      rawModeData
    } = request;
    const args = [];

    // remove query string from url
    let url = request.url.split("?")[0];
    // replace mustache variables in url
    for (const key in mustache) {
      const re = new RegExp(`{{${key}}}`, "g");
      url = url.replace(re, mustache[key]);
    }
    // parse query strings
    const qs = queryParams
      .filter(param => param.enabled)
      .map(param => encodeURI(`${param.key}=${param.value}`))
      .join("&");
    // inject query string
    url = qs.length > 0 ? `${url}?${qs}` : url;
    // first argument
    args.push(`"${url}"`);

    // raw data only - assumes jsonify string
    if (method.toLowerCase() === "post" && rawModeData) {
      let dataStr = rawModeData;
      try {
        // make json string smaller
        dataStr = JSON.stringify(JSON.parse(dataStr));
      } catch (error) {
        console.error(error);
      }
      // if post, second argument is body string
      args.push(`'${dataStr}'`);
    }

    // generate headers
    const headers: { [key: string]: string } = {};
    headerData.forEach(obj => {
      if (obj.enabled) {
        headers[obj.key] = obj.value;
      }
    });
    if (headerData.length > 0) {
      args.push({ headers, tags });
    } else {
      args.push({ tags });
    }

    return `http.${method.toLowerCase()}(${args
      .map(obj => (typeof obj === "string" ? obj : JSON.stringify(obj)))
      .join(", ")})`;
  }
}

/** options for K6Request. */
export interface IGenerateRequestsOpts {
  /** object map for mustache variables in request url. */
  mustache?: IStringMap;
  /** tags to add to k6 requests. */
  tags?: IStringMap;
}

/** creates a list of K6Request from postman collection object. */
export function generateRequests(
  /** postman collection v1 object. */
  collection: IPostmanCollectionV1,
  /** options passed to K6Request. */
  opts: IGenerateRequestsOpts = {}
) {
  const { requests = [] } = collection;
  return requests.map(request => new K6Request(request, opts));
}

/** Creates the uuid and rendered k6 scripts from a K6Request and template string. */
export function render(
  /** K6Request object to render. */
  k6request: K6Request,
  /** template with a mustache variable `{{request}}`. The k6 http call will be mapped into `{{request}}`. */
  template: string
) {
  const { uuid, request } = k6request.state;
  const rendered = template.replace(/{{request}}/gim, request);
  return { uuid, rendered };
}
