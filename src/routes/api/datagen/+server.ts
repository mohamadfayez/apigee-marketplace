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
    createApiHubApi(dataGen, apiDefinition, category, subCategory);
  }

  return json({});
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
  console.log(result);
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