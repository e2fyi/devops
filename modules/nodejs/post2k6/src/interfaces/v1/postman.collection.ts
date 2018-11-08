/**
 * Postman collection v1 interfaces generated from JSON.
 *
 * > TODO: proper interface implementation.
 *
 */

/* tslint:disable */

/**
 * Naive implementation of postman collection v1.
 */
export interface IPostmanCollectionV1 {
  owner: string;
  lastUpdatedBy: string;
  lastRevision: number;
  team: null;
  id: string;
  name: string;
  description: string;
  variables: null;
  auth: null;
  events: null;
  folders_order: any[];
  order: string[];
  folders: any[];
  hasRequests: boolean;
  requests: IPostmanRequest[];
}
export interface IPostmanRequest {
  id: string;
  headers: string;
  headerData: IHeaderData[];
  url: string;
  folder: null;
  queryParams: IQueryParam[];
  preRequestScript: null;
  pathVariables: any[];
  pathVariableData: any[];
  method: string;
  data: null | any[];
  dataMode: string;
  tests: null;
  currentHelper: string;
  helperAttributes: any[];
  time: number;
  name: string;
  description: string | null;
  collectionId: string;
  responses: any[];
  rawModeData?: string;
}
export interface IHeaderData {
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}
export interface IQueryParam {
  key: string;
  value: string;
  equals: boolean;
  description: string;
  enabled: boolean;
}
