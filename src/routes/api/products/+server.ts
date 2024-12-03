import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Firestore } from '@google-cloud/firestore';
import { DataProduct, StorageConfig, User, DataSourceTypes, ProductProtocols, MonetizationRatePlan } from '$lib/interfaces';
import { GoogleAuth } from 'google-auth-library';
import { PUBLIC_PROJECT_ID, PUBLIC_API_HOST, PUBLIC_APIGEE_ENV, PUBLIC_APIHUB_REGION } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const firestore = new Firestore();
let marketplaceHost: string = import.meta.env.VITE_ORIGIN;
if (!marketplaceHost) marketplaceHost = "https://marketplace.apigee.com"
let apigeeHubLocation: string = PUBLIC_APIHUB_REGION;
if (!apigeeHubLocation) apigeeHubLocation = "europe-west1";

export const GET: RequestHandler = async ({ url }) => {
  const email = url.searchParams.get('email') ?? '';
  const site = url.searchParams.get('site') ?? '';
  let colName = "apigee-marketplace-sites/default/products";
  if (site)
    colName = "apigee-marketplace-sites/" + site + "/products";

  const userDoc = await firestore.doc('apigee-marketplace-users/' + email).get();
  const userData: User | undefined = userDoc.data() as User;

  let prodColRef = firestore.collection(colName);
  let products = await prodColRef.listDocuments();

  let results: DataProduct[] = [];
  for (let doc of products.entries()) {
    let productDoc = await doc[1].get();
    let productData: DataProduct | undefined = productDoc.data() as DataProduct;
    if (productData && productData.audiences.some((item: string) => userData.roles.includes(item)))
      results.push(productData);
  }

  return json(results);
};

export const POST: RequestHandler = async ({ params, url, request }) => {
  const site = url.searchParams.get('site') ?? '';
  let colName = "apigee-marketplace-sites/default/products";
  if (site)
    colName = "apigee-marketplace-sites/" + site + "/products";

  let newProduct: DataProduct = await request.json();
  let proxyName: string = newProduct.source.startsWith("BigQuery") ? "MP-DataAPI-v1" : "MP-ServicesAPI-v1";
  let callPath: string = newProduct.source.startsWith("BigQuery") ? "/data" : "/services";

  newProduct.specUrl = `/api/products/${newProduct.id}/spec?site=${site}`;

  if (newProduct.source === DataSourceTypes.GenAITest && newProduct.samplePayload) {
    // set mock data if product is Gen AI test generated
    setKVMEntry("marketplace-kvm", newProduct.entity + "-mock", newProduct.samplePayload);
    // create and set product
    createProduct("marketplace_" + newProduct.id, "Marketplace " + newProduct.name, "/" + newProduct.entity, proxyName);
    newProduct.apigeeProductId = "marketplace_" + newProduct.id;
  } else if ((newProduct.source.startsWith("BigQuery") || newProduct.source === DataSourceTypes.API)
    && newProduct.protocols.includes(ProductProtocols.API)
    && newProduct.entity) {
    // set data API kvm entry
    setKVMEntry("marketplace-kvm", newProduct.entity, newProduct.query);
    if (!newProduct.samplePayload) {
      let response = await fetch(`https://${PUBLIC_API_HOST}/v1/test${callPath}/` + newProduct.entity);
      newProduct.samplePayload = await response.text();
    }

    if (!newProduct.specContents) {
      newProduct.specContents = await generateSpec(newProduct.name, `/v1${callPath}/${newProduct.entity}`, newProduct.samplePayload);
      newProduct.specContents = newProduct.specContents.replaceAll("```json", "").replaceAll("```", "");
    }
    
    // create and set product
    createProduct("marketplace_" + newProduct.id, "Marketplace " + newProduct.name, "/" + newProduct.entity, proxyName);
    newProduct.apigeeProductId = "marketplace_" + newProduct.id;

    // await apiHubRegister(newProduct);
    // await apiHubCreateDeployment(newProduct);
    // await apiHubCreateVersion(newProduct);
    // await apiHubCreateVersionSpec(newProduct);
  }

  // create monetization rate plan for product, if set
  if (newProduct.monetizationData) {
    createMonetizationPlanForProduct(newProduct);
  }

  if (newProduct.protocols.includes(ProductProtocols.DataSync)) {
    // Set KVM entry for the data proxy to BigQuery
    setKVMEntry("marketplace-kvm", newProduct.entity, newProduct.query);
    // Create the API product to access the storage export
    createProduct("marketplace_storage_" + newProduct.id, "Marketplace Storage " + newProduct.name, "/", "MP-StorageAPI-v1");
    // Add to storage entities to sync daily through integration flow
    // let storageConfigDoc = firestore.doc("data-marketplace-config/storage-sync");
    // let storageConfig = await storageConfigDoc.get();
    // let storageConfigObject: StorageConfig;
    // if (storageConfig.exists)
    //   storageConfigObject = storageConfig.data() as StorageConfig;
    // else
    //   storageConfigObject = { entities: [] };

    // if (!storageConfigObject.entities.includes(newProduct.entity)) {
    //   storageConfigObject.entities.push(newProduct.entity);
    //   storageConfigDoc.set(storageConfigObject);
    // }

    // Do first data sync
    fetch(`https://${PUBLIC_API_HOST}/v1/test/data/${newProduct.entity}?export=true`);
  }

  // Persist defnition to Firestore...
  let newDoc = firestore.doc(colName + "/" + newProduct.id);
  newDoc.set(newProduct);

  return json(newProduct);
}

async function createMonetizationPlanForProduct(product: DataProduct) {
  let newPlan: MonetizationRatePlan = JSON.parse(JSON.stringify(product.monetizationData))
  delete newPlan.name;

  let token = await auth.getAccessToken();
  let response = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts/${product.apigeeProductId}/rateplans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newPlan)
  });

  let responsePayload = await response.json();

  if (response.status != 201) {
    console.error("Error creating monetization plan");
    console.error(JSON.stringify(newPlan));
    console.error(`${response.status} - ${response.statusText}`);
  }
}

async function apiHubRegister(product: DataProduct) {
  let token = await auth.getAccessToken();
  // First let's register the API
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/apis?api_id=${product.id}`;
  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      display_name: product.name,
      description: product.description,
      documentation: {
        externalUri: marketplaceHost + "/products/" + product.id
      },
      owner: {
        displayName: product.ownerName,
        email: product.ownerEmail
      }
    })
  });

  let result: any = await response.json();
}

async function apiHubCreateDeployment(product: DataProduct) {
  let token = await auth.getAccessToken();
  // Now create deployment
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/deployments?deploymentId=${product.id}`;
  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/deployments/${product.id}`,
      displayName: product.name,
      description: product.description,
      documentation: {
        externalUri: marketplaceHost + "/products/" + product.id
      },
      deploymentType: {
        attribute: "projects/apigee-test74/locations/europe-west1/attributes/system-deployment-type",
        enumValues: {
          values: [
            {
              id: "apigee",
              displayName: "Apigee",
              description: "Apigee",
              immutable: true
            }
          ]
        }
      },
      resourceUri: "https://console.cloud.google.com/apigee/proxies/MP-DataAPI-v1/overview?product_id=" + product.id,
      endpoints: [
        `https://${PUBLIC_API_HOST}/v1/data/${product.entity}`
      ]
    })
  });

  let result = await response.json();
}

async function apiHubCreateVersion(product: DataProduct) {
  let token = await auth.getAccessToken();
  // Now create new version
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/apis/${product.id}/versions?version_id=${product.id}`;
  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      display_name: product.name,
      description: product.description,
      documentation: {
        externalUri: marketplaceHost + "/products/" + product.id
      },
      deployments: [
        `projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/deployments/${product.id}`
      ]
    })
  });

  let result = await response.json();
}

async function apiHubCreateVersionSpec(product: DataProduct) {
  let token = await auth.getAccessToken();
  // Now create spec
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/apis/${product.id}/versions/${product.id}/specs?specId=${product.id}`;
  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/apis/${product.id}/versions/${product.id}/specs/${product.id}`,
      displayName: product.name,
      specType: {
        attribute: `projects/${PUBLIC_PROJECT_ID}/locations/${apigeeHubLocation}/attributes/system-spec-type`,
        enumValues: {
          values: [
            {
              id: "openapi",
              displayName: "OpenAPI Spec",
              description: "OpenAPI Spec",
              immutable: true
            }
          ]
        }
      },
      contents: {
        contents: btoa(product.specContents),
        mimeType: "application/json"
      }
    })
  });

  let result = await response.json();
}

function generateSpec(name: string, path: string, payload: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    payload = payload.replaceAll("\"", "'");
    fetch(`https://${PUBLIC_API_HOST}/v1/genai/prompt`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        prompt: `Generate an OpenAPI spec in json format with the name ${name} at the server https://${PUBLIC_API_HOST}. It should have one GET operation 
        at the ${path} path, be authorized with an API key in the x-api-key header, and return the following data structure:
        
        ${payload}`
      })
    }).then((response) => {
      return response.json();
    }).then((result: { answer: string }) => {
      resolve(result.answer);
    }).catch((error) => {
      reject("Error in calling Gen AI API.");
    })

  });
}

function setKVMEntry(KVMName: string, keyName: string, keyValue: string) {
  auth.getAccessToken().then((token) => {
    fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/environments/${PUBLIC_APIGEE_ENV}/keyvaluemaps/${KVMName}/entries`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: keyName,
        value: keyValue
      })
    }).then((response) => {
    }).catch((error) => {
      console.error(error);
    });
  });
}

function createProduct(name: string, displayName: string, path: string, proxyName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    auth.getAccessToken().then((token) => {
      fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apiproducts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          displayName: displayName,
          approvalType: "auto",
          environments: [PUBLIC_APIGEE_ENV],
          operationGroup: {
            operationConfigs: [
              {
                apiSource: proxyName,
                operations: [
                  {
                    resource: path,
                    methods: ["GET"]
                  }
                ]
              }
            ]
          }
        })
      }).then((response) => {
        return response.json();
      }).then((result: any) => {
        resolve();
      }).catch((error) => {
        console.error(error);
        reject();
      });
    });
  });
}

// function createAPITemplate(product: DataProduct): ApigeeTemplateInput {
//   let result: ApigeeTemplateInput = {
//     name: product.name.replace(" ", "-"),
//     profile: "default",
//     endpoints: [
//       {
//         name: "default",
//         basePath: "/data/" + product.entity,
//         target: {
//           name: "default",
//           url: "https://bigquery.googleapis.com/bigquery/v2/projects/{organization.name}/queries",
//           googleAccessToken: {
//             scopes: [
//               "https://www.googleapis.com/auth/bigquery"
//             ],
//             headerName: ""
//           }
//         },
//         parameters: {},
//         extensionSteps: [
//           {
//             name: "EV-ExtractName",
//             flowRunPoints: [{
//               name: "preRequest",
//               runPoints: [RunPoint.preRequest]
//             }],
//             properties: {
//               "ExtractVariables": {
//                 "_attributes": {
//                   name: "EV-ExtractName",
//                   "enabled": true
//                 },
//                 "DisplayName": "EV-ExtractName",
//                 "URIPath": {
//                   "Pattern": "/{entityName}"
//                 }
//               }
//             }
//           },    
//           {
//             name: "AM-SetDataVariables",
//             type: "AssignMessage",
//             flowRunPoints: [{
//               name: "preRequest",
//               runPoints: [RunPoint.preRequest]
//             }],
//             properties: {
//               assignVariables: [
//                 {
//                   name: product.entity,
//                   value: "table::" + product.query
//                 }
//               ]
//             }
//           },
//           {
//             name: "RS-JavascriptFiles",
//             type: "resourceFiles",
//             flowRunPoints: [],
//             properties: {
//               files: {
//                 "jsc/bigquery_pretarget.js": "https://raw.githubusercontent.com/tyayers/apigee-js-modules/main/src/bigquery_apigee_pretarget.js",
//                 "jsc/bigquery_posttarget.js": "https://raw.githubusercontent.com/tyayers/apigee-js-modules/main/src/bigquery_apigee_posttarget.js",
//                 "jsc/bigquery_functions.js": "https://raw.githubusercontent.com/tyayers/apigee-js-modules/main/src/bigquery_functions.js"
//               },
//             }
//           },
//           {
//             name: "JS-RunPreTarget-Script",
//             flowRunPoints: [{
//               name: "preTarget",
//               runPoints: [RunPoint.preTarget]
//             }],
//             properties: {
//               "Javascript": {
//                 "_attributes": {
//                   "name": "JS-RunPreTarget-Script"
//                 },
//                 "DisplayName": "JS-RunPreTarget-Script",
//                 "Properties": {},
//                 "ResourceURL": "jsc://bigquery_pretarget.js",
//                 "IncludeURL": "jsc://bigquery_functions.js"
//               }
//             }
//           },
//           {
//             name: "JS-RunPostTarget-Script",
//             flowRunPoints: [{
//               name: "postTarget",
//               runPoints: [RunPoint.postTarget]
//             }],
//             properties: {
//               "Javascript": {
//                 "_attributes": {
//                   name: "JS-RunPostTarget-Script"
//                 },
//                 "DisplayName": "JS-RunPostTarget-Script",
//                 "Properties": {},
//                 "ResourceURL": "jsc://bigquery_posttarget.js",
//                 "IncludeURL": "jsc://bigquery_functions.js"
//               }
//             }
//           }
//         ]
//       }
//     ]
//   }

//   return result;
// }

// function createBigQueryTemplate(product: DataProduct): ApigeeTemplateInput {
//   let result: ApigeeTemplateInput = {
//     name: product.name.replace(" ", "-"),
//     profile: "default",
//     endpoints: [
//       {
//         name: "default",
//         basePath: "/data/" + product.entity,
//         target: {
//           name: "default",
//           url: "https://bigquery.googleapis.com/bigquery/v2/projects/{organization.name}/queries",
//           googleAccessToken: {
//             scopes: [
//               "https://www.googleapis.com/auth/bigquery"
//             ],
//             headerName: ""
//           }
//         },
//         parameters: {},
//         extensionSteps: [
//           {
//             name: "EV-ExtractName",
//             flowRunPoints: [{
//               name: "preRequest",
//               runPoints: [RunPoint.preRequest]
//             }],
//             properties: {
//               "ExtractVariables": {
//                 "_attributes": {
//                   name: "EV-ExtractName",
//                   "enabled": true
//                 },
//                 "DisplayName": "EV-ExtractName",
//                 "URIPath": {
//                   "Pattern": "/{entityName}"
//                 }
//               }
//             }
//           },    
//           {
//             name: "AM-SetDataVariables",
//             type: "AssignMessage",
//             flowRunPoints: [{
//               name: "preRequest",
//               runPoints: [RunPoint.preRequest]
//             }],
//             properties: {
//               assignVariables: [
//                 {
//                   name: product.entity,
//                   value: "table::" + product.query
//                 }
//               ]
//             }
//           },
//           {
//             name: "RS-JavascriptFiles",
//             type: "resourceFiles",
//             flowRunPoints: [],
//             properties: {
//               files: {
//                 "jsc/bigquery_pretarget.js": "https://raw.githubusercontent.com/tyayers/apigee-js-modules/main/src/bigquery_apigee_pretarget.js",
//                 "jsc/bigquery_posttarget.js": "https://raw.githubusercontent.com/tyayers/apigee-js-modules/main/src/bigquery_apigee_posttarget.js",
//                 "jsc/bigquery_functions.js": "https://raw.githubusercontent.com/tyayers/apigee-js-modules/main/src/bigquery_functions.js"
//               },
//             }
//           },
//           {
//             name: "JS-RunPreTarget-Script",
//             flowRunPoints: [{
//               name: "preTarget",
//               runPoints: [RunPoint.preTarget]
//             }],
//             properties: {
//               "Javascript": {
//                 "_attributes": {
//                   "name": "JS-RunPreTarget-Script"
//                 },
//                 "DisplayName": "JS-RunPreTarget-Script",
//                 "Properties": {},
//                 "ResourceURL": "jsc://bigquery_pretarget.js",
//                 "IncludeURL": "jsc://bigquery_functions.js"
//               }
//             }
//           },
//           {
//             name: "JS-RunPostTarget-Script",
//             flowRunPoints: [{
//               name: "postTarget",
//               runPoints: [RunPoint.postTarget]
//             }],
//             properties: {
//               "Javascript": {
//                 "_attributes": {
//                   name: "JS-RunPostTarget-Script"
//                 },
//                 "DisplayName": "JS-RunPostTarget-Script",
//                 "Properties": {},
//                 "ResourceURL": "jsc://bigquery_posttarget.js",
//                 "IncludeURL": "jsc://bigquery_functions.js"
//               }
//             }
//           }
//         ]
//       }
//     ]
//   }

//   return result;
// }