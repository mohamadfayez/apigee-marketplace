import type { EnumValue } from "svelte-jsoneditor";

export class User {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[] = [];
  photoUrl = "";
  providerId = "";
  developerData?: Developer;
  status = "";
  productAwaitingApprovals: string[] = [];
  productApprovalExecutionIds: {[id: string]: string} = {};
  productApprovals: string[] = [];

  constructor(email: string, userName: string, firstName: string, lastName: string) {
    this.email = email;
    this.userName = userName;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export class Products {
  products: Product[] = [];
}

export class Product {
  name: string = "";
  type?: string;
  displayName: string = "";
  description?: string;
  approvalType: string = "";
  imageUrl?: string;
  specUrl?: string;
  hubUrl?: string;
  hubMarketplaceId? = "";
  hubListingId? = "";
  status?: string;
  access?: string;
  pricing?: {tier: string, price: string, range: string}[] = [];
  attributes?: KeyValue[] = [];
  // New properties
  attrArray?: string[] = [];
  groupArray?: string[] = [];
  typeArray?: string[] = [];
}

export let specPrompt: string = `Generate a valid JSON OpenAPI spec with the name {name} at the server https://{apigeeHost}. 
It should have a good description instructing the user on the basics of how to use the API, and be authorized with an API key in the x-api-key header.
It should offer a GET and POST operations at the {path} path, as well as GET, PUT and DELETE operations for individual records.
It should not contain any symbols or special characters beyond what is allowed in valid JSON.
The GET operation for all records should offer query parameters for pageSize, filter, nextToken and orderBy.
It should use the following data structure for all operations: `;

export let specApiProductPrompt: string = `Generate an valid JSON OpenAPI spec with the name {name} at the server https://{apigeeHost}. 
It should have a good description instructing the user on the basics of how to use the API.
It should offer full CRUD operations at the {path} path and be authorized with an API key in the x-api-key header.
It should not contain any symbols or special characters beyond what is allowed in valid JSON.
It should use the following data structure for all operations: `;

export class DataProduct {
  id: string;
  ownerEmail: string;
  ownerName: string = "";
  name: string;
  description: string;
  site: string = "";
  imageUrl: string = "/data_icon.png";
  specUrl: string = "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/esg-analytics.yaml";
  specContents: string = "";
  specPrompt: string = specPrompt;
  sampleRequest: string = "";
  samplePayload: string = "";
  apigeeProductId: string = "";
  analyticsHubName: string = "";
  anaylticsHubDisplayName: string = "";
  analyticsHubDescription: string = "";
  monetizationId: string = "";
  apigeeMonetizationId: string = "";
  monetizationData?: MonetizationRatePlan;
  status: string;
  source: string;
  entity: string;
  query: string;
  queryAdditionalInfo: string = "";
  path: string = "";
  pathVerbs: string[] = [];
  sla: SLA = new SLA("no_sla_5k3j", "no_sla_5k3j")
  createdAt: string;
  protocols: string[];
  audiences: string[];
  categories: string[];
  approvalRequired: boolean = false;

  constructor(id: string, email: string, ownerName: string, name: string, description: string, status: string, source: string, entity: string, query: string, createdAt: string, protocols: string[], audiences: string[], categories: string[]) {
    this.id = id;
    this.ownerEmail = email;
    this.ownerName = ownerName;
    this.name = name;
    this.description = description;
    this.status = status;
    this.source = source;
    this.entity = entity;
    this.query = query;
    this.createdAt = createdAt;
    this.protocols = protocols;
    this.audiences = audiences;
    this.categories = categories;
  }
}

export class Developer {
  email: string = "";
  firstName: string = "";
  lastName: string = "";
  userName: string = "";
  developerId?: string;
  organizationName?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  status?: string;
  apps?: string[];
  error?: Error;
  attributes?: KeyValue[];
}

export class ApiApp {
  appId: string = "";
  name: string = "";
  description: string = "";
  apiProducts: string[] = [];
  createdAt: string = "";
  createdAtDate?: string = "";
  callbackUrl?: string;
  status?: string;
  credentials?: ApiAppCredential[];
  attributes?: KeyValue[];
  error?: Error;

  constructor(name: string, description: string, apiProducts: string[]) {
    this.name = name;
    this.description = description;
    this.apiProducts = apiProducts;
  }
}

export class ApiAppCredential {
  consumerKey: string = "";
  consumerSecret: string = "";
  issuedAt: string = "";
  expiresAt: string = "";
  scopes?: string[];
  apiProducts?: ApiAppCredentialProduct[];
  status?: string;
  error?: Error;
}

export class ApiAppCredentialProduct {
  apiproduct: string = "";
  status?: string = "";
}

export class ApiApps {
  apps: ApiApp[] = [];
}

export interface KeyValue {
  name: string;
  value: string;
}

export interface Error {
  code: string;
  message: string;
  status: string;
}

export class AnalyticsHubSubscription {
  product: string = "";
  listingName: string = "";
  listingDisplayName: string = "";
  project: string = "";
  dataset: string = "";
  createdAt: string = "";
  status?: string = "Inactive";
  // listingId: string = "";
  // marketplaceId: string = "";
}

export class BucketSubscription {
  product: string = "";
  type: string = "PARQUET";
  url: string = "";
  createdAt: string = "";
  status: string = "";
}

export class DisplayOptions {name: string = ""; displayName: string = ""; active: boolean = false};

export class UsageData {
  environments: UsageDataEnvironment[] = [];
}

export class UsageDataEnvironment {
  name: string = "";
  dimensions: UsageDataDimension[] = [];
}

export class UsageDataDimension {
  name: string = "";
  metrics: {name: string, values: {value: string, timestamp: number}[]}[] = [];
}

export class IdentityConfig {
  id: string;
  roles: string[];

  constructor(id: string, roles: string[]) {
    this.id = id;
    this.roles = roles;
  }
}

export class StorageConfig {
  entities: string[] = [];
}

export class MarketplaceConfig {
  categories: string[] = [];
}

export class SLA {
  id: string;
  name: string;
  description: string = "";
  upTimeInPercent: string = "";
  maxLatencyMS: string = ""

  constructor(id: string, name: string, description: string = "", upTimeInPercent: string = "99.5", maxLatencyMS: string = "") {
    this.id = id;
    this.name = name;
    this.description = description;
    this.upTimeInPercent = upTimeInPercent;
    this.maxLatencyMS = maxLatencyMS;
  }
}

export class MonetizationRatePlans {
  ratePlans: MonetizationRatePlan[] = [];
}

export class MonetizationRatePlan {
  name?: string = "";
  apiproduct: string;
  displayName: string;
  description: string = "";
  billingPeriod: string = "MONTHLY"; // can also be WEEKLY
  paymentFundingModel: string = "POSTPAID"; // can also be PREPAID
  currencyCode: string = "USD";
  setupFee: MonetizationRatePlanMoney = {currencyCode: "USD", units: "500", nanos: "0"};
  fixedRecurringFee: MonetizationRatePlanMoney = {currencyCode: "USD", units: "0", nanos: "0"};
  fixedFeeFrequency: number = 0;
  consumptionPricingType: MonetizationConsumptionTypes = MonetizationConsumptionTypes.FIXED_PER_UNIT; // can also be BANDED
  consumptionPricingRates: MonetizationRatePlanRate[] = [{
    start: "0",
    end: "-1",
    fee: { currencyCode: "USD", units: "0", nanos: "10" }
  }];
  state: string = "PUBLISHED" // can also be DRAFT
  startTime: number = 0;
  endTime: number = 0;
  constructor(apiProduct: string, displayName: string) {
    this.apiproduct = apiProduct;
    this.displayName = displayName;
  }
}

export enum MonetizationConsumptionTypes {
  FIXED_PER_UNIT = "FIXED_PER_UNIT",
  BANDED = "BANDED"
}

export class MonetizationRatePlanMoney {
  currencyCode: string = "USD";
  units: string = "";
  nanos: string = "";
}

export class MonetizationRatePlanRate {
  start: string = "0";
  end: string = "-1";
  fee: MonetizationRatePlanMoney = { currencyCode: "USD", units: "0", nanos: "10" };
}

export interface ApigeeApps {
  app: ApigeeApp[];
  error?: Error;
}

export interface ApigeeApp {
  appId: string;
  name: string;
  status?: string;
  callbackUrl?: string;
  createdAt?: string;
  credentials?: ApigeeAppCredential[];
  apiProducts?: string[];
  error?: Error;
  attributes: KeyValue[];
}

export interface ApigeeAppCredential {
  consumerKey: string;
  consumerSecret: string;
  issuedAt: string;
  expiresAt: string;
  scopes?: string[];
  status?: string;
  apiProducts?: ApigeeAPIProductName[];
}

export interface ApigeeAPIProductName {
  apiproduct: string;
  status: string;
}

export class FlatTableData {
  headers: FlatTableHeader[] = [];
  styles: FlatTableStyle[] = [];
  data: any[] = [];
}

export interface FlatTableHeader {name: string, displayName: string, sortable: boolean, searchable: boolean}
export interface FlatTableStyle {name: string, value: string, color: string, isBold: boolean}

export interface DataExchange {
  name: string;
  displayName: string;
  listingCount: number;
}

export interface DataExchnageListing {
  name: string;
  displayName: string;
  description: string;
  primaryContact: string;
  documentation: string;
  state: string;
  categories: string[];
  requestAccess: string;
}

export class Site {
  id: string = "";
  name: string = "";
  googleCloudProjectId: string = "";
  nameTop: string = "-12px";
  nameLeft: string = "4px";
  logoUrl: string = "/loop.svg";
  logoWidth: string = "36px";
  owner: string = "";
  categories: string[] = [];
  products: DataProduct[] = [];
  bqtables: {name: string, table: string, entity: string}[] = [];
  heroImageUrl: string = "/products_banner.png";
  heroGradientStyle: string = "";
  heroBackgroundPosition: string = "";
}

export enum DialogType {
  Ok = "ok",
  OkCancel = "okCancel",
  Cancel = "cancel"
}

export class DialogResult {
  result: DialogType = DialogType.Ok;
  inputs: {label: string, value: string}[] = [];
}

export class ApiHubApi {
  name: string = "";
  displayName: string = "";
  description: string = "";
  attributes: {[key: string]: ApigeeAPIHubAttribute} = {};
  documentation: {externalUri: string} = {externalUri: ""};
  owner: {displayName: string, email: string} = {displayName: "", email: ""};
  versions: string[] = [];
  createTime: string = "";
  updateTime: string = "";
}

export class ApigeeAPIHubAttribute {
  attribute: string = "";
  enumValues: {values: ApigeeAPIHubAttributeValue[]} = {values: []};
}

export class ApigeeAPIHubAttributeValue {
  description: string = "";
  displayName: string = "";
  id: string = "";
}

export class ApigeeApiProduct {
  name: string = "";
  displayName: string = "";
  description: string = "";
  approvalType: string = "auto";
  environments: string[] = [];
  createdAt: string = "";
  lastModifiedAt: string = "";
  operationGroup?: { operationConfigs: {apiSource: string, operations: {resource: string, methods: string[]}[]}[]};
}

export class ApigeeApi {
  name: string = "";
  revision: string[] = [];
}

export enum ProductProtocols {
  API = "API",
  DataSync = "Data sync",
  Event = "Event",
  AnalyticsHub = "Analytics Hub"
}

export enum DataSourceTypes {
  BigQuery = "BigQuery",
  BigQueryTable = "BigQueryTable",
  AIModel = "AI Model",
  GenAITest = "GenAITest",
  AI = "Vertex AI",
  ApigeeProduct = "Apigee API Product",
  ApiHub = "Apigee API Hub",
  API = "API",
}

export class DataGenJob {
  id: string = "";
  name: string = "";
  topic: string = "order management";
  apiCount: number = 15;
  userName: string = "";
  userEmail: string = "";
  site: string = "";
  categories: string[] = [];
  monetizationPlans: MonetizationRatePlan[] = [];
  products: DataProduct[] = [];
}