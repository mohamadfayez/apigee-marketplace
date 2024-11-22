import type { DataProduct } from "$lib/interfaces";
import { json, text, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";
import { PUBLIC_PROJECT_ID, PUBLIC_API_HOST, PUBLIC_APIGEE_ENV } from '$env/static/public';
import { DataSourceTypes } from "$lib/utils";

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

export const POST: RequestHandler = async({ params, url, request}) => {

  let newProduct: DataProduct = await request.json();

  let payload = newProduct.samplePayload.replaceAll("\"", "'");

  let callPath: string = "services";
  if (newProduct.source.startsWith("BigQuery"))
    callPath = "data";
  else if (newProduct.source === DataSourceTypes.GenAITest)
    callPath = "test/mock";

  newProduct.specPrompt = newProduct.specPrompt.replaceAll("${name}", newProduct.name).replaceAll("${apigeeHost}", PUBLIC_API_HOST).replaceAll("${path}", `/v1/${callPath}/` + newProduct.entity);

  let prompt: string = newProduct.specPrompt;

  prompt += "   " + payload;

  let newSpec = (await generateSpecGemini(prompt)).replace("```json", "").replace("```", "");
  newProduct.specContents = newSpec;

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

function generateSpecApigee(prompt: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let url = `https://${PUBLIC_API_HOST}/v2/genai/prompt`;
    console.log(url);
    fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        prompt: prompt
      })
    }).then((response) => {
      if (response.status != 200) {
        console.error("Could not call Gen AI Prompt API, response code from server: " + response.status);
        reject("Could not call Gen AI Prompt API");
      }
      else
        return response.text();
    }).then((result: string | undefined) => {
      if (result) {
        let jsonResult = JSON.parse(result);
        resolve(jsonResult.answer);
      }
    }).catch((error) => {
      console.error("Error in genai request: ");
      console.error(error);
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
