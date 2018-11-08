import { IPostmanCollectionV1 } from "../src/interfaces/v1/postman.collection";
import { K6Request, render, reset } from "../src/index";

const template = `
import http from "k6/http";

export default function() {
  let res = {{request}};
};`.trim();

const opts = {
  mustache: { path: "somepath" },
  tags: { name: "test" }
};
const sample: IPostmanCollectionV1 = {
  owner: "owner",
  lastUpdatedBy: "lastUpdatedBy",
  lastRevision: 123,
  team: null,
  id: "id",
  name: "name",
  description: "description",
  variables: null,
  auth: null,
  events: null,
  folders_order: [],
  order: ["0", "1"],
  folders: [],
  hasRequests: true,
  requests: [
    {
      id: "0",
      headers: "",
      headerData: [],
      url: "{{path}}/to/v1/",
      folder: null,
      queryParams: [],
      preRequestScript: null,
      pathVariables: [],
      pathVariableData: [],
      method: "GET",
      data: null,
      dataMode: "params",
      tests: null,
      currentHelper: "normal",
      helperAttributes: [],
      time: 123,
      name: "name",
      description: "",
      collectionId: "collectionId",
      responses: []
    },
    {
      id: "1",
      headers: "Content-Type: application/json\n",
      headerData: [
        {
          key: "Content-Type",
          value: "application/json",
          description: "",
          enabled: true
        }
      ],
      url: "{{path}}/to/some/where?var1=1&var2=abc",
      folder: null,
      queryParams: [
        {
          key: "var1",
          value: "1",
          equals: true,
          description: "",
          enabled: true
        },
        {
          key: "var2",
          value: "abc",
          equals: true,
          description: "",
          enabled: true
        }
      ],
      preRequestScript: null,
      pathVariables: [],
      pathVariableData: [],
      method: "POST",
      data: [],
      dataMode: "raw",
      tests: null,
      currentHelper: "normal",
      helperAttributes: [],
      time: 123,
      name: "name",
      description: null,
      collectionId: "collectionId",
      responses: [],
      rawModeData: '{"somedata": [1, 2, 3], "abc": true}'
    }
  ]
};

const expectedRequests = [
  'http.get("somepath/to/v1/", {"tags":{"uuid":"name-1","name":"test"}})',
  'http.post("somepath/to/some/where?var1=1&var2=abc", \'{"somedata":[1,2,3],"abc":true}\', {"headers":{"Content-Type":"application/json"},"tags":{"uuid":"name-1","name":"test"}})'
];

const expectedRender = {
  uuid: "name-1",
  rendered: `import http from "k6/http";

export default function() {
  let res = ${expectedRequests[1]};
};`
};

beforeEach(() => {
  // reset counter for requests
  reset();
});

describe("@grab/postman-k6", () => {
  it("`K6Request` generates http.get str if request method is GET", () => {
    const request = new K6Request(sample.requests[0], opts);
    expect(request.toString()).toMatch(expectedRequests[0]);
  });

  it("`K6Request` generates http.post str if request method is POST and raw data is provided", () => {
    const request = new K6Request(sample.requests[1], opts);
    expect(request.toString()).toMatch(expectedRequests[1]);
  });

  it("`render` generates templates", () => {
    const request = new K6Request(sample.requests[1], opts);
    const results = render(request, template);
    expect(results).toEqual(expectedRender);
  });

  it("`K6Request` request id should auto-inc", () => {
    const ids = [1, 1, 1].map(
      () => new K6Request(sample.requests[1], opts).uuid
    );
    const expected = ["name-1", "name-2", "name-3"];
    expect(ids).toEqual(expected);
  });
});
