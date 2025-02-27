import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION, PUBLIC_SITE_URL } from "$env/static/public";
import { DataProduct, type DataGenJob } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { generateRandomString } from "$lib/utils";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const vertex_ai = new VertexAI({project: PUBLIC_PROJECT_ID, location: 'us-central1'});
const model = 'gemini-2.0-flash-001';
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [],
});

const firestore = new Firestore();

class ApiHubAttribute {id: string = ""; displayName: string = ""; description: string = "";};
let targetUsers: ApiHubAttribute[] = [];
let businessUnits: ApiHubAttribute[] = [];
let teams: ApiHubAttribute[] = [];
let maturityLevels: ApiHubAttribute[] = [];
let regions: ApiHubAttribute[] = [];
let gdprValues: ApiHubAttribute[] = [];
let businessTypes: ApiHubAttribute[] = [];
let deploymentEnvironments: ApiHubAttribute[] = [];

// make sure data is loaded from Api Hub
if (targetUsers.length === 0) targetUsers = await getApiHubAttribute("system-target-user");
if (businessUnits.length === 0) businessUnits = await getApiHubAttribute("system-business-unit");
if (teams.length === 0) teams = await getApiHubAttribute("system-team");
if (maturityLevels.length === 0) maturityLevels = await getApiHubAttribute("system-maturity-level");
if (regions.length === 0) regions = await getApiHubAttribute("regions");
if (gdprValues.length === 0) gdprValues = await getApiHubAttribute("gdpr-relevance");
if (businessTypes.length === 0) businessTypes = await getApiHubAttribute("business-type");
if (deploymentEnvironments.length === 0) deploymentEnvironments = await getApiHubAttribute("system-environment");

export const POST: RequestHandler = async({ params, url, request, fetch}) => {

  const col = url.searchParams.get('col') ?? '';
  let dataGen: DataGenJob = await request.json();

  // generate unique base path topics
  let basePaths: string[] = JSON.parse(await generatePayloadGemini(`Generate a string array list in JSON of ${dataGen.apiCount} unique two word descriptions in lower case connected by dash that describe typical API topics in the ${dataGen.topic} industry.`));

  // generate APIs
  let apiResults: DataProduct[] = [];
  for (let i=0; i<basePaths.length; i++) {
    let apiPrompt = `Generate a random but realistic API definition for the ${dataGen.topic} industry and the topic ${basePaths[i]}. The API definition should be a JSON object that has a name property that is only lower-case letters and dashes, a display name property called displayName, and a slightly amusing description property that is 1 sentence long.`;
    let apiDefinitionContent = await generatePayloadGemini(apiPrompt);
    let apiDefinition: {name: string, displayName: string, description: string, basePath: string, openapi: any} = JSON.parse(apiDefinitionContent);
    apiDefinition.name += "-" + generateRandomString(4);
    
    apiPrompt = `Return just the index as number of these category objects that best matches for an API named "${apiDefinition.displayName}". ${JSON.stringify(dataGen.categories)}`;
    let categoryIndex = parseInt(await generatePayloadGemini(apiPrompt));

    let categories = [dataGen.categories[categoryIndex]];
    let newProduct: DataProduct = new DataProduct(apiDefinition.name, dataGen.userEmail, dataGen.userName, apiDefinition.displayName, apiDefinition.description, "Published", "GenAITest", basePaths[i], dataGen.topic + " " + basePaths[i], new Date().toLocaleString(), ["API"], ["internal", "partner", "external"], categories);

    let genPayloadResponse = await fetch("/api/products/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    if (genPayloadResponse.status === 200) newProduct.samplePayload = JSON.stringify(await genPayloadResponse.json());

    let genSpecResponse = await fetch("/api/products/generate/spec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    let specContents: string = "";
    if (genSpecResponse.status === 200) {
      let newProd = await genSpecResponse.json() as DataProduct;
      if (newProd && newProd.specContents) specContents = newProd.specContents;
    }

    newProduct.specContents = specContents;

    let response = await fetch("/api/products?site=" + dataGen.site, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    if (response.status === 200) {
      let product = await response.json();
      apiResults.push(product);
    } else {
      console.error(`Could not create generated product ${apiDefinition.name} with status ${response.status} and message ${response.statusText}`);
    }

    // await createApiHubApi(dataGen, apiDefinition);

    // // create versions
    // await createApiHubApiDeployment(dataGen, apiDefinition, 0);
    // await createApiHubApiVersion(dataGen, apiDefinition, 0);
    // await createApiHubApiVersionSpec(dataGen, apiDefinition, 0);
  }

  return json(apiResults);
}

async function createApiHubApi(job: DataGenJob, api: {name: string, displayName: string,  description: string, basePath: String, openapi: string}) {
  let token = await auth.getAccessToken();
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/apis?api_id=${api.name}`;

  let regionIndex1 = Math.floor(Math.random() * (regions.length - 1));
  let regionIndex2 = regionIndex1 + 1;
  if (regionIndex2 >= regions.length) regionIndex2 = 0;
  let regionIndex3 = regionIndex2 + 1;
  if (regionIndex3 >= regions.length) regionIndex3 = 0;
  let usersIndex1 = Math.floor(Math.random() * (targetUsers.length - 1));
  let usersIndex2 = usersIndex1++;
  if (usersIndex2 >= targetUsers.length) usersIndex2 = 0;

  let newBody = JSON.stringify({
    display_name: api.displayName,
    description: api.description,
    documentation: {
      externalUri: PUBLIC_SITE_URL + "/products/" + api.name + "?site=" + job.site
    },
    owner: {
      displayName: job.userName,
      email: job.userEmail
    },
    targetUser: {
      attribute: "projects/$PROJECT_ID/locations/$REGION/attributes/system-target-user",
      enumValues: {
        values: [
          targetUsers[usersIndex1],
          targetUsers[usersIndex2]
        ]
      }
    },
    team: {
      attribute: "projects/$PROJECT_ID/locations/$REGION/attributes/system-team",
      enumValues: {
        values: [
          teams[Math.floor(Math.random() * (teams.length - 1))]
        ]
      }
    },
    businessUnit: {
      attribute: "projects/$PROJECT_ID/locations/$REGION/attributes/system-business-unit",
      enumValues: {
        values: [
          businessUnits[Math.floor(Math.random() * (businessUnits.length - 1))]
        ]
      }
    },
    maturityLevel: {
      attribute: "projects/$PROJECT_ID/locations/$REGION/attributes/system-maturity-level",
      enumValues: {
        values: [
          maturityLevels[Math.floor(Math.random() * (maturityLevels.length - 1))]
        ]
      }
    },
    apiStyle: {
      attribute: "projects/$PROJECT_ID/locations/$REGION/attributes/system-api-style",
      enumValues: {
        values: [
          {
            id: "rest",
            displayName: "REST"	
          }
        ]
      }
    },
    attributes: {
      "projects/$PROJECT_ID/locations/$REGION/attributes/business-type": {
        enumValues: {
          values: [
            businessTypes[Math.floor(Math.random() * (businessTypes.length - 1))]
          ]
        }
      },
      "projects/$PROJECT_ID/locations/$REGION/attributes/regions": {
        enumValues: {
          values: [
            regions[regionIndex1],
            regions[regionIndex2],
            regions[regionIndex3]
          ]
        }
      },
      "projects/$PROJECT_ID/locations/$REGION/attributes/gdpr-relevance": {
        enumValues: {
          values: [
            gdprValues[Math.floor(Math.random() * (gdprValues.length - 1))]
          ]
        }
      }
    }
  });

  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: newBody
  });

  let result: any = await response;
  if (result.status > 299) {
    console.log(`Error generating API for ${api.name} with status ${result.status} and message ${result.statusText}`);
  }

  return;
}

async function createApiHubApiDeployment(job: DataGenJob, api: {name: string, displayName: string,  description: string, basePath: String, openapi: string}, index: number) {
  let token = await auth.getAccessToken();
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/deployments?deploymentId=${api.name + "-" + index.toString()}`;

  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "displayName": api.displayName + " v" + index.toString(),
      "description": api.description,
      "documentation": {
       "externalUri": PUBLIC_SITE_URL + "/products/" + api.name + "?site=" + job.site
      },
      "deploymentType": {
       "attribute": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-deployment-type`,
       "enumValues": {
        "values": [
         {
          "id": "apigee",
          "displayName": "Apigee",
          "description": "Apigee",
          "immutable": true
         }
        ]
       }
      },
      "resourceUri": "https://console.cloud.google.com/apigee/" + api.name + "-" + index.toString(),
      "endpoints": [
       "https://api.apigee-marketplace.apintegrate.cloud/" + api.basePath + "-" + index.toString()
      ],
      "apiVersions": [
       index.toString()
      ]
     })
  });

  let result = await response;
  if (result.status > 299) {
    console.log(`Error generating API deployment for ${api.name} with status ${result.status} and message ${result.statusText}`);
  }

  return;
}

async function createApiHubApiVersion(job: DataGenJob, api: {name: string, displayName: string,  description: string, basePath: String, openapi: string}, index: number) {
  let token = await auth.getAccessToken();
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/apis/${api.name}/versions?versionId=${api.name + "-" + index.toString()}`;

  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "displayName": api.displayName + " v" + index.toString(),
      "description": api.description,
      "documentation": {
        "externalUri": PUBLIC_SITE_URL + "/products/" + api.name + "?site=" + job.site
      },
      "deployments": [
        `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/deployments/${api.name + "-" + index.toString()}`
      ]
    })
  });

  let result = await response;
  if (result.status > 299) {
    console.log(`Error generating API version for ${api.name} with status ${result.status} and message ${result.statusText}`);
  }

  return;
}

async function createApiHubApiVersionSpec(job: DataGenJob, api: {name: string, displayName: string,  description: string, basePath: String, openapi: string}, index: number) {
  let token = await auth.getAccessToken();
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/apis/${api.name}/versions/${api.name + "-" + index.toString()}/specs?specId=${api.name + "-" + index.toString()}`;

  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "displayName": "Sales Order API"  + " v" + index.toString(),
      "specType": {
      "attribute": "",
      "enumValues": {
       "values": [
        {
         "id": "openapi",
         "displayName": "OpenAPI Spec",
         "description": "OpenAPI Spec",
         "immutable": true
        }
       ]
      }
      },
      "contents": {
        "mimeType": "application/json",
        "contents": btoa(api.openapi)
      },
      "documentation": {
        "externalUri": PUBLIC_SITE_URL + "/products/" + api.name + "?site=" + job.site
      }
    })
  });

  let result = await response;
  if (result.status > 299) {
    console.log(`Error generating API version spec for ${api.name} with status ${result.status} and message ${result.statusText}`);
  }

  return;
}

async function generatePayloadGemini(prompt: string): Promise<string> {
  let result: string = "";
  const chat = await generativeModel.startChat({});
  const chatResponse = await chat.sendMessageStream(prompt);
  const chatResult = await chatResponse.response;

  if (chatResult && chatResult.candidates && chatResult.candidates.length > 0) {
    if (chatResult.candidates[0].content.parts[0].text)
      result = chatResult.candidates[0].content.parts[0].text;
  }

  result = result.replaceAll("```json", "").replaceAll("```", "");
  return result;
}

async function getApiHubAttribute(name: string): Promise<ApiHubAttribute[]> {
  let attributes: ApiHubAttribute[] = [];
  let token = await auth.getAccessToken();
  let hubUrl = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/${name}`;

  let response = await fetch(hubUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    let result = await response.json();
    attributes = result.allowedValues;
  }

  return attributes;
}

