import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION } from "$env/static/public";
import { appService } from "$lib/app-service";
import type { DataGenJob } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

let marketplaceHost: string = import.meta.env.VITE_ORIGIN;

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

const vertex_ai = new VertexAI({project: PUBLIC_PROJECT_ID, location: 'us-central1'});
const model = 'gemini-1.5-flash-002';
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 8192,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [],
});

// Create a new client
const firestore = new Firestore();

export const POST: RequestHandler = async({ params, url, request}) => {

  const col = url.searchParams.get('col') ?? '';
  let dataGen: DataGenJob = await request.json();

  // first init api hub categories
  await initApiHubCategories();

  // generate & create categories
  let categoryPrompt = `Generate ${dataGen.categoryCount} one-word category names for API domains for the topic ${dataGen.topic}. The category names should be returned in a JSON string array.`;
  let categoryNames: string = await generatePayloadGemini(categoryPrompt);
  let categories: string[] = JSON.parse(categoryNames);
  // get category objects
  let categoryObjects = await createApiHubAttribute("category", "Category", categories);
  categoryPrompt = `Generate ${dataGen.categoryCount} generic sub-category names for API domains for the topic ${dataGen.topic}. The sub-category names should be returned in a JSON string array.`;
  let subCategoryNames: string = await generatePayloadGemini(categoryPrompt);
  let subCategories: string[] = JSON.parse(subCategoryNames);
  // get subcategory objects
  let subCategoryObjects = await createApiHubAttribute("subcategory", "Sub Category", subCategories);

  // generate APIs
  for (let i=0; i<dataGen.apiCount; i++) {
    let category = categoryObjects[Math.floor(Math.random() * (categoryObjects.length - 1))];
    let subCategory = subCategoryObjects[Math.floor(Math.random() * (subCategoryObjects.length - 1))];
    let apiPrompt = `Generate an API definition for the ${dataGen.target} industry and in the category ${category.displayName}. The API definition should have a name property that is only lower-case letters and dashes, a display name property called displayName, a slightly amusing description property that is 1-3 sentences, and an Open API specification in the openapi property with CRUD operations on the path ${category.id} and API key authentication through a header x-api-key. The Open API specication should have good documentation on how to use the API. The result should be returned as a JSON object with the properties described.`;
    let apiDefinitionContent = await generatePayloadGemini(apiPrompt);
    let apiDefinition: {name: string, displayName: string, description: string, basePath: string, openapi: any} = JSON.parse(apiDefinitionContent);
    await createApiHubApi(dataGen, apiDefinition, category, subCategory);

    // create versions
    for (let v=0; v<dataGen.versionCount; v++) {
      // create deployment
      await createApiHubApiDeployment(dataGen, apiDefinition, v);
      await createApiHubApiVersion(dataGen, apiDefinition, v);
      await createApiHubApiVersionSpec(dataGen, apiDefinition, v);
    }
  }

  return json({});
}

async function initApiHubCategories(): Promise<void> {
  let token = await auth.getAccessToken();

  let url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-deployment-type?updateMask=allowedValues`;
  
  // first update deployment types
  let response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "name": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-deployment-type`,
      "displayName": "Deployment Type",
      "description": "Deployment Type attribute",
      "definitionType": "SYSTEM_DEFINED",
      "scope": "DEPLOYMENT",
      "dataType": "ENUM",
      "allowedValues": [
        {
          "id": "apigee",
          "displayName": "Apigee",
          "description": "Apigee",
          "immutable": true
        },
        {
          "id": "apigee-hybrid",
          "displayName": "Apigee Hybrid",
          "description": "Apigee Hybrid",
          "immutable": true
        },
        {
          "id": "apigee-edge-private",
          "displayName": "Apigee Edge Private Cloud",
          "description": "Apigee Edge Private Cloud",
          "immutable": true
        },
        {
          "id": "apigee-edge-public",
          "displayName": "Apigee Edge Public Cloud",
          "description": "Apigee Edge Public Cloud",
          "immutable": true
        },
        {
          "id": "mock-server",
          "displayName": "Mock server",
          "description": "Mock server",
          "immutable": true
        },
        {
          "id": "cloud-api-gateway",
          "displayName": "Cloud API Gateway",
          "description": "Cloud API Gateway",
          "immutable": true
        },
        {
          "id": "cloud-endpoints",
          "displayName": "Cloud Endpoints",
          "description": "Cloud Endpoints",
          "immutable": true
        },
        {
          "id": "unmanaged",
          "displayName": "Unmanaged",
          "description": "Unmanaged",
          "immutable": true
        },
        {
          "id": "others",
          "displayName": "Others",
          "description": "Others",
          "immutable": true
        },
        {
          "id": "aws-api-gateway",
          "displayName": "AWS API Gateway",
          "description": "AWS API Gateway",
          "immutable": false
        },
        {
          "id": "azure-api-management",
          "displayName": "Azure API Management",
          "description": "Azure API Management",
          "immutable": false
        },
      ],
      "cardinality": 1,
      "mandatory": true
    })
  });

  if (response.status > 299) {
    console.log(`API Hub system-deployment-type update failed with code ${response.status}: ${response.statusText} `);
  }

  url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-business-unit?updateMask=allowedValues`;
  
  // now update business units 
  response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "name": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-business-unit`,
      "displayName": "Business Unit",
      "description": "Business unit attribute",
      "definitionType": "SYSTEM_DEFINED",
      "scope": "API",
      "dataType": "ENUM",
      "allowedValues": [
        {
          "id": "example-business-unit",
          "displayName": "Personal Risk Management",
          "description": "Personal Risk Management"
        },
        {
          "id": "commercial-insurance-solutions",
          "displayName": "Commercial Insurance Solutions",
          "description": "Commercial Insurance Solutions"
        },
        {
          "id": "life-and-legacy-planning",
          "displayName": "Life & Legacy Planning",
          "description": "Life & Legacy Planning"
        },
        {
          "id": "group-benefits-and-wellness",
          "displayName": "Group Benefits & Wellness",
          "description": "Group Benefits & Wellness"
        },
        {
          "id": "claims-resolution-center",
          "displayName": "Claims Resolution Center",
          "description": "Claims Resolution Center"
        },
        {
          "id": "risk-assessment-and-underwriting",
          "displayName": "Risk Assessment & Underwriting",
          "description": "Risk Assessment & Underwriting"
        },
        {
          "id": "investment-and-asset-management",
          "displayName": "Investment & Asset Management",
          "description": "Investment & Asset Management"
        },
        {
          "id": "customer-care-and-support",
          "displayName": "Customer Care & Support",
          "description": "Customer Care & Support"
        },
        {
          "id": "digital-innovation-and-technology",
          "displayName": "Digital Innovation & Technology",
          "description": "Digital Innovation & Technology"
        },
        {
          "id": "strategic-partnerships-and-alliances",
          "displayName": "Strategic Partnerships & Alliances",
          "description": "Strategic Partnerships & Alliances"
        }
      ],
      "cardinality": 1
    })
  });

  if (response.status > 299) {
    console.log(`API Hub system-business-unit update failed with code ${response.status}: ${response.statusText} `);
  }

  url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-team?updateMask=allowedValues`;
  
  // now update example teams 
  response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      "name": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/system-team`,
      "displayName": "Team",
      "description": "Team attribute",
      "definitionType": "SYSTEM_DEFINED",
      "scope": "API",
      "dataType": "ENUM",
      "allowedValues": [
        {
          "id": "example-team",
          "displayName": "Policy Services Team",
          "description": "Policy Services Team"
        },
        {
          "id": "claims-response-unit",
          "displayName": "Claims Response Unit",
          "description": "Claims Response Unit"
        },
        {
          "id": "underwriting-solutions-group",
          "displayName": "Underwriting Solutions Group",
          "description": "Underwriting Solutions Group"
        },
        {
          "id": "the-navigators",
          "displayName": "The Navigators",
          "description": "The Navigators"
        },
        {
          "id": "the-risk-wranglers",
          "displayName": "The Risk Wranglers",
          "description": "The Risk Wranglers"
        },
        {
          "id": "the-safety-net",
          "displayName": "The Safety Net",
          "description": "The Safety Net"
        },
        {
          "id": "the-horizon-team",
          "displayName": "The Horizon Team",
          "description": "The Horizon Team"
        },
        {
          "id": "the-phoenix-group",
          "displayName": "The Phoenix Group",
          "description": "The Phoenix Group"
        }
      ],
      "cardinality": 1
    })
  });

  if (response.status > 299) {
    console.log(`API Hub system-team update failed with code ${response.status}: ${response.statusText} `);
  }

  url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes?attributeId=gdpr-relevance`;
  
  // now create gdpr relevance attribute 
  response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "name": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/gdpr-relevance`,
      "displayName": "GDPR Relevance",
      "description": "How relevant the API is for GDPR data protection audits & concerns.",
      "scope": "API",
      "dataType": "ENUM",
      "allowedValues": [
        {
          "id": "high",
          "displayName": "HIGH",
          "description": "Highly relevant."
        },
        {
          "id": "partial",
          "displayName": "PARTIAL",
          "description": "Partially relevant."
        },
        {
          "id": "none",
          "displayName": "NONE",
          "description": "Not at all relevant."
        }
      ],
      "cardinality": 1
    })
  });

  if (response.status > 299) {
    console.log(`API Hub gdpr-relevance update failed with code ${response.status}: ${response.statusText} `);
  }

  url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes?attributeId=business-type`;
  
  // now create business type
  response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "name": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/business-type`,
      "displayName": "Business Type",
      "description": "The type of API for different categories of business operations.",
      "scope": "API",
      "dataType": "ENUM",
      "allowedValues": [
        {
          "id": "payments",
          "displayName": "PAYMENTS",
          "description": "Payment processing APIs."
        },
        {
          "id": "insurance",
          "displayName": "INSURANCE",
          "description": "Insurance related APIs."
        },
        {
          "id": "risk",
          "displayName": "RISK",
          "description": "Risk related APIs."
        },
        {
          "id": "claims",
          "displayName": "CLAIMS",
          "description": "Claims related APIs."
        },
        {
          "id": "investment",
          "displayName": "INVESTMENT",
          "description": "Investment related APIs."
        }
      ],
      "cardinality": 1
    })
  });

  if (response.status > 299) {
    console.log(`API Hub business-type update failed with code ${response.status}: ${response.statusText} `);
  }

  url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes?attributeId=regions`;
  
  // now create region
  response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      "name": `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/regions`,
      "displayName": "Regions",
      "description": "The regions that the API is active in.",
      "scope": "API",
      "dataType": "ENUM",
      "allowedValues": [
        {
          "id": "northam",
          "displayName": "NORTHAM",
          "description": "North America"
        },
        {
          "id": "southam",
          "displayName": "SOUTHAM",
          "description": "South America"
        },
        {
          "id": "europe",
          "displayName": "EUROPE",
          "description": "Europe"
        },
        {
          "id": "asia",
          "displayName": "ASIA",
          "description": "Asia"
        },
        {
          "id": "africa",
          "displayName": "AFRICA",
          "description": "Africa"
        },
        {
          "id": "australia",
          "displayName": "AUSTRALIA",
          "description": "Australia"
        }
      ],
      "cardinality": 20
    })
  });

  if (response.status > 299) {
    console.log(`API Hub regions update failed with code ${response.status}: ${response.statusText} `);
  }

  return;
}

async function createApiHubAttribute(attributeId: string, attributeDisplayName: string, values: string[]): Promise<{ id: string; displayName: string; description: string; }[]> {
  let token = await auth.getAccessToken();
  let newValues: {id: string, displayName: string, description: string}[] = [];
  for (let val of values) {
    newValues.push({
      id: val.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and").replaceAll("(", "").replaceAll(")", ""),
      displayName: val,
      description: val
    });
  }
  let url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes?attributeId=${attributeId}`;
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/${attributeId}`,
      displayName: attributeDisplayName,
      description: `The ${attributeId} of the API.`,
      scope: "API",
      dataType: "ENUM",
      allowedValues: newValues,
      cardinality: 1
    })
  });

  if (response.status === 409) {
    // already exists, so let's just fetch the existing data then...
    url = `https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/attributes/${attributeId}`;

    response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      let data = await response.json();
      if (data.allowedValues) {
        newValues = data.allowedValues;
      }
    } else {
      console.log("Could not get attribute " + attributeId + " - status - " + response.status.toString());
    }
  } else if (response.status !== 201) {
    console.log("Could not create attribute " + attributeId + " - status - " + response.status.toString());
  }

  return newValues;
}

async function createApiHubApi(job: DataGenJob, api: {name: string, displayName: string,  description: string, basePath: String, openapi: string}, category: {id: string, displayName: string, description: string}, subCategory: {id: string, displayName: string, description: string}) {
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

  let response = await fetch(hubUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      display_name: api.displayName,
      description: api.description,
      documentation: {
        externalUri: marketplaceHost + "/products/" + api.name
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
            maturityLevel[Math.floor(Math.random() * (maturityLevel.length - 1))]
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
        "projects/$PROJECT_ID/locations/$REGION/attributes/category": {
          enumValues: {
            values: [
              category
            ]
          }
        },
        "projects/$PROJECT_ID/locations/$REGION/attributes/subcategory": {
          enumValues: {
            values: [
              subCategory
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
    })
  });

  let result: any = await response.json();
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
       "externalUri": "https://apigee-marketplace.apintegrate.cloud/" + api.name + "-" + index.toString()
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
        "externalUri": "https://apigee-marketplace.apintegrate.cloud/" + api.name + "-" + index.toString()
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
        "externalUri": "https://apigee-marketplace.apintegrate.cloud/" + api.name
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

const targetUsers = [
  {
    "id": "team",
    "displayName": "Team",
    "description": "Team target user",
    "immutable": true
  },
  {
    "id": "internal",
    "displayName": "Internal",
    "description": "Internal target user",
    "immutable": true
  },
  {
    "id": "partner",
    "displayName": "Partner",
    "description": "Partner target user",
    "immutable": true
  },
  {
    "id": "public",
    "displayName": "Public",
    "description": "Public target user",
    "immutable": true
  }
];

const teams = [
  {
    "id": "example-team",
    "displayName": "Policy Services Team",
    "description": "Policy Services Team"
  },
  {
    "id": "claims-response-unit",
    "displayName": "Claims Response Unit",
    "description": "Claims Response Unit"
  },
  {
    "id": "underwriting-solutions-group",
    "displayName": "Underwriting Solutions Group",
    "description": "Underwriting Solutions Group"
  },
  {
    "id": "the-navigators",
    "displayName": "The Navigators",
    "description": "The Navigators"
  },
  {
    "id": "the-risk-wranglers",
    "displayName": "The Risk Wranglers",
    "description": "The Risk Wranglers"
  },
  {
    "id": "the-safety-net",
    "displayName": "The Safety Net",
    "description": "The Safety Net"
  },
  {
    "id": "the-horizon-team",
    "displayName": "The Horizon Team",
    "description": "The Horizon Team"
  },
  {
    "id": "the-phoenix-group",
    "displayName": "The Phoenix Group",
    "description": "The Phoenix Group"
  }
];

const businessUnits = [
  {
    "id": "example-business-unit",
    "displayName": "Personal Risk Management",
    "description": "Personal Risk Management"
  },
  {
    "id": "commercial-insurance-solutions",
    "displayName": "Commercial Insurance Solutions",
    "description": "Commercial Insurance Solutions"
  },
  {
    "id": "life-and-legacy-planning",
    "displayName": "Life & Legacy Planning",
    "description": "Life & Legacy Planning"
  },
  {
    "id": "group-benefits-and-wellness",
    "displayName": "Group Benefits & Wellness",
    "description": "Group Benefits & Wellness"
  },
  {
    "id": "claims-resolution-center",
    "displayName": "Claims Resolution Center",
    "description": "Claims Resolution Center"
  },
  {
    "id": "risk-assessment-and-underwriting",
    "displayName": "Risk Assessment & Underwriting",
    "description": "Risk Assessment & Underwriting"
  },
  {
    "id": "investment-and-asset-management",
    "displayName": "Investment & Asset Management",
    "description": "Investment & Asset Management"
  },
  {
    "id": "customer-care-and-support",
    "displayName": "Customer Care & Support",
    "description": "Customer Care & Support"
  },
  {
    "id": "digital-innovation-and-technology",
    "displayName": "Digital Innovation & Technology",
    "description": "Digital Innovation & Technology"
  },
  {
    "id": "strategic-partnerships-and-alliances",
    "displayName": "Strategic Partnerships & Alliances",
    "description": "Strategic Partnerships & Alliances"
  }
];

const maturityLevel = [
  {
    "id": "level-1",
    "displayName": "Level 1",
    "description": "Level 1"
  },
  {
    "id": "level-2",
    "displayName": "Level 2",
    "description": "Level 2"
  },
  {
    "id": "level-3",
    "displayName": "Level 3",
    "description": "Level 3"
  }
];

const businessTypes = [
  {
    "id": "payments",
    "displayName": "PAYMENTS",
    "description": "Payment processing APIs."
  },
  {
    "id": "insurance",
    "displayName": "INSURANCE",
    "description": "Insurance related APIs."
  },
  {
    "id": "risk",
    "displayName": "RISK",
    "description": "Risk related APIs."
  },
  {
    "id": "claims",
    "displayName": "CLAIMS",
    "description": "Claims related APIs."
  },
  {
    "id": "investment",
    "displayName": "INVESTMENT",
    "description": "Investment related APIs."
  }
];

const regions = [
  {
    "id": "northam",
    "displayName": "NORTHAM",
    "description": "North America"
  },
  {
    "id": "southam",
    "displayName": "SOUTHAM",
    "description": "South America"
  },
  {
    "id": "europe",
    "displayName": "EUROPE",
    "description": "Europe"
  },
  {
    "id": "asia",
    "displayName": "ASIA",
    "description": "Asia"
  },
  {
    "id": "africa",
    "displayName": "AFRICA",
    "description": "Africa"
  },
  {
    "id": "australia",
    "displayName": "AUSTRALIA",
    "description": "Australia"
  }
]

const gdprValues = [
  {
    "id": "high",
    "displayName": "HIGH",
    "description": "Highly relevant."
  },
  {
    "id": "partial",
    "displayName": "PARTIAL",
    "description": "Partially relevant."
  },
  {
    "id": "none",
    "displayName": "NONE",
    "description": "Not at all relevant."
  }
];

let systemEnvironments = [
  {
    "id": "development",
    "displayName": "Development",
    "description": "Development"
  },
  {
    "id": "test",
    "displayName": "Test",
    "description": "Test"
  },
  {
    "id": "staging",
    "displayName": "Staging",
    "description": "Staging"
  },
  {
    "id": "pre-prod",
    "displayName": "Pre-Production",
    "description": "Pre-Production"
  },
  {
    "id": "prod",
    "displayName": "Production",
    "description": "Production"
  }
];