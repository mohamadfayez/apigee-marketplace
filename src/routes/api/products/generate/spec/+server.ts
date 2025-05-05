import { type DataProduct, DataSourceTypes } from "$lib/interfaces";
import { json, text, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";
import { PUBLIC_PROJECT_ID, PUBLIC_API_HOST, PUBLIC_APIGEE_ENV } from '$env/static/public';
import { tryParseJson } from "$lib/utils";

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

export const POST: RequestHandler = async({ params, url, request}) => {

  let newProduct: DataProduct = await request.json();

  let payload = newProduct.samplePayload.replaceAll("\"", "'");

  if (newProduct.source.startsWith("BigQuery")) {
    newProduct.specPrompt = newProduct.specPrompt.replaceAll("{path}", "/v1/data/" + newProduct.entity);
  }
  else if (newProduct.source === DataSourceTypes.API) {
    newProduct.specPrompt = newProduct.specPrompt.replaceAll("{path}", "/v1/services/" + newProduct.entity);
  }
  else if (newProduct.source === DataSourceTypes.GenAITest) {
    newProduct.specPrompt = newProduct.specPrompt.replaceAll("{path}", "/v1/mock/" + newProduct.entity);
  }
  else if (newProduct.source === DataSourceTypes.ApigeeProduct) {
    newProduct.specPrompt = newProduct.specPrompt.replaceAll("{path}", newProduct.path);
  }

  newProduct.specPrompt = newProduct.specPrompt.replaceAll("{name}", newProduct.name).replaceAll("{apigeeHost}", PUBLIC_API_HOST);

  let prompt: string = newProduct.specPrompt;

  prompt += "   " + payload;
  let specJson: any = false;

  if (newProduct.source === DataSourceTypes.GenAITest) {
    newProduct.specContents = generateSpecMockData(newProduct.name, "https://" + PUBLIC_API_HOST, "/v1/mock/" + newProduct.entity, newProduct.samplePayload);
  } else {
    while (!specJson) {
      let newSpec = (await generateSpecGemini(prompt)).replaceAll("```json", "").replaceAll("```", "");
      specJson = tryParseJson(newSpec);
      if (specJson) newProduct.specContents = newSpec;
    }
  }

	return json(newProduct);
}

function generateSpecGemini(prompt: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {

    const chat = generativeModel.startChat({});
    chat.sendMessageStream(prompt).then((chatResult) => {
      chatResult.response.then((streamResult) => {
        if (streamResult.candidates && streamResult.candidates.length > 0) {
          if (streamResult.candidates[0].content.parts[0].text)
            resolve(streamResult.candidates[0].content.parts[0].text);
        }
      });
    });
  });
}

function generateSpecMockData(name: string, server: string, path: string, payload: string): string {
  let result = JSON.parse(JSON.stringify(baseSpec));
  result.info.title = name;
  result.info.description = result.info.description.replaceAll("{name}", name).replaceAll("{path}", path);
  result.servers[0].url = server;
  delete Object.assign(result.paths, {[path]: result.paths["{path}"] })["{path}"];
  delete Object.assign(result.paths, {[path+ "/{id}"]: result.paths["{path}/{id}"] })["{path}/{id}"];
  result.paths[path].get.summary = "Get all " + name + " records";
  result.paths[path].get.description = "Retrieves a list of all " + name + " records";
  result.paths[path].post.summary = "Create a new " + name + " record";
  result.paths[path].post.description = "Creates a new " + name + " record";
  result.paths[path+"/{id}"].get.summary = "Get a single " + name + " record by id";
  result.paths[path+"/{id}"].get.description = "Retrieves a single " + name + " record by id";
  result.paths[path+"/{id}"].put.summary = "Updates a single " + name + " record by id";
  result.paths[path+"/{id}"].put.description = "Updates a single " + name + " record by id";
  result.paths[path+"/{id}"].delete.summary = "Deletes a single " + name + " record by id";
  result.paths[path+"/{id}"].delete.description = "Deletes a single " + name + " record by id";

  let payloadObject = tryParseJson(payload);

  if (!payloadObject.length) {
    payloadObject = payloadObject[Object.keys(payloadObject)[0]];
  }

  result.components.schemas.Record.properties = {};
  result.components.schemas.Record.required = [];

  if (payloadObject.length && payloadObject.length > 0) {
    for (const [key, value] of Object.entries(payloadObject[0])) {
      let valType = typeof value;
      let isInt = Number.isInteger(value);
      let valProp: any = { "type": "string" };
      if (valType === "number"){
        if (isInt) {
          valProp = { "type": "integer", "format": "int64" };
        } else {
          valProp = { "type": "number", "format": "float" };
        }
      } else if (valType === "boolean") {
        valProp = { "type": "boolean"};
      }

      result.components.schemas.Record.properties[key] = valProp;
      if (result.components.schemas.Record.required.length < 3)
        result.components.schemas.Record.required.push(key);
    }
  } else {
    console.log("Could not find an object in payload to generate spec from: " + payload);
  }


  return JSON.stringify(result, null, 2);
}

let baseSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "Client Onboarding API",
    "version": "1.0.0",
    "description": "This API allows you to manage {name} information.  Use this API to GET, POST, PUT, and DELETE records.\n\n**Authentication:** All requests require an API key in the `x-api-key` header.\n\n**Endpoints:**\n\n* `{path}`:  Handles GET (retrieve all records) and POST (create new records) operations. \n* `{path}/{id}`: Handles GET (retrieve a single record), PUT (update a single record), and DELETE (delete a single record) operations.\n\n"
  },
  "servers": [
    {
      "url": "https://34-149-70-69.nip.io",
      "description": "Production server"
    }
  ],
  "paths": {
    "{path}": {
      "get": {
        "summary": "Get all records",
        "description": "Retrieves a list of records.",
        "parameters": [],
        "responses": {
          "200": {
            "description": "A list of records",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Record"
                  }
                }
              }
            }
          }
        },
        "security": [
          {
            "ApiKeyAuth": []
          }
        ]
      },
      "post": {
        "summary": "Create a new client onboarding record",
        "description": "Creates a new client onboarding record.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Record"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Record created successfully"
          }
        },
        "security": [
          {
            "ApiKeyAuth": []
          }
        ]
      }
    },
    "{path}/{id}": {
      "get": {
        "summary": "Get a single record",
        "description": "Retrieves a specific record by id.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID of the resource",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "A single record",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Record"
                }
              }
            }
          }
        },
        "security": [
          {
            "ApiKeyAuth": []
          }
        ]
      },
      "put": {
        "summary": "Update a record",
        "description": "Updates a specific record by id.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID of the record",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Record"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Record updated successfully"
          }
        },
        "security": [
          {
            "ApiKeyAuth": []
          }
        ]
      },
      "delete": {
        "summary": "Delete a record",
        "description": "Deletes a specific record by id.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID of the record",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Record deleted successfully"
          }
        },
        "security": [
          {
            "ApiKeyAuth": []
          }
        ]
      }
    }
  },
  "components": {
    "schemas": {
      "Record": {
        "type": "object",
        "properties": {
          "clientId": { "type": "string" },
          "clientName": { "type": "string" },
          "contactPerson": { "type": "string" },
          "contactTitle": { "type": "string" },
          "contactEmail": { "type": "string", "format": "email" },
          "contactPhone": { "type": "string" },
          "addressLine1": { "type": "string" },
          "addressLine2": { "type": "string" },
          "city": { "type": "string" },
          "state": { "type": "string" },
          "zipCode": { "type": "string" },
          "country": { "type": "string" },
          "industry": { "type": "string" },
          "annualRevenue": { "type": "integer", "format": "int64" },
          "investmentObjective": { "type": "string" },
          "riskTolerance": { "type": "string" },
          "accountType": { "type": "string" },
          "legalStructure": { "type": "string" },
          "incorporationDate": { "type": "string", "format": "date" },
          "taxId": { "type": "string" },
          "accountOfficer": { "type": "string" }
        },
        "required": [
          "clientId",
          "clientName",
          "contactPerson",
          "contactTitle",
          "contactEmail",
          "contactPhone",
          "addressLine1",
          "city",
          "state",
          "zipCode",
          "country",
          "industry",
          "annualRevenue",
          "investmentObjective",
          "riskTolerance",
          "accountType",
          "legalStructure",
          "incorporationDate",
          "taxId",
          "accountOfficer"
        ]
      }
    },
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "name": "x-api-key",
        "in": "header"
      }
    }
  }
};