import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION, PUBLIC_SITE_URL } from "$env/static/public";
import { DataProduct, MonetizationRatePlan, type DataGenJob } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { generateRandomString } from "$lib/utils";
import { appService } from "$lib/app-service";

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
let jobs: {[key: string]: DataGenJob} = {};

export const POST: RequestHandler = async({ params, url, request, fetch}) => {

  const col = url.searchParams.get('col') ?? '';
  let dataGen: DataGenJob = await request.json();
  dataGen.id = generateRandomString(10);
  jobs[dataGen.id] = dataGen;
  
  generateData(dataGen, fetch);

  return json(dataGen);
}

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('id') ?? '';
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      while (jobs[id]) {
        let itemNames = jobs[id].products.map(p => p.name);

        controller.enqueue(encoder.encode(JSON.stringify(itemNames)));
        await delay(1000)
      }
      controller.close()
    }
  });

  return new Response(readable, {
    headers: {
      'content-type': 'text/event-stream',
    }
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function generateData(dataGen: DataGenJob, fetch: any) {
  // generate unique base path topics
  let basePaths: string[] = JSON.parse(await generatePayloadGemini(`Generate a string array list in JSON of ${dataGen.apiCount * 2} unique two word descriptions in lower case connected by dash that describe typical API topics in the ${dataGen.topic} industry. Only include words with letters, no numbers or symbols beyond the one dash.`));

  // generate APIs
  let apiResults: DataProduct[] = [];
  for (let i=0; i<basePaths.length; i++) {
    try {
      let apiPrompt = `Generate a random but realistic API definition for the ${dataGen.topic} industry and the topic ${basePaths[i]}. The API definition should be a JSON object that has a name property that is only lower-case letters and dashes, a display name property called displayName, and a description property that is 1 sentence long.`;
      let apiDefinitionContent = await generatePayloadGemini(apiPrompt);
      let apiDefinition: {name: string, displayName: string, description: string, basePath: string, openapi: any} = JSON.parse(apiDefinitionContent);
      apiDefinition.name += "-" + generateRandomString(4);
      
      apiPrompt = `Return just the index as number of these category objects that best matches for an API named "${apiDefinition.displayName}". ${JSON.stringify(dataGen.categories)}`;
      let categoryIndex = parseInt(await generatePayloadGemini(apiPrompt));

      let categories = [dataGen.categories[categoryIndex]];
      let newProduct: DataProduct = new DataProduct(apiDefinition.name, dataGen.userEmail, dataGen.userName, apiDefinition.displayName, apiDefinition.description, "Published", "GenAITest", basePaths[i], dataGen.topic + " " + basePaths[i], (new Date()).toString(), ["API"], ["internal", "partner", "external"], categories);
      newProduct.imageUrl = "/genai.svg";
      if (dataGen.monetizationPlans && dataGen.monetizationPlans.length > 0) {
        newProduct.monetizationId = dataGen.monetizationPlans[0].name ? dataGen.monetizationPlans[0].name : "";
        newProduct.monetizationData = JSON.parse(JSON.stringify(dataGen.monetizationPlans[0])) as MonetizationRatePlan;
        newProduct.monetizationData.displayName = newProduct.name + " " + newProduct.monetizationData.displayName;
      }

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
        if (jobs[dataGen.id]) jobs[dataGen.id].products.push(product);
      } else {
        console.error(`Could not create generated product ${apiDefinition.name} with status ${response.status} and message ${response.statusText}`);
      }
    } catch (e) {
      console.error(e);
    }

    if (jobs[dataGen.id].products.length >= dataGen.apiCount) break;
  }

  delete jobs[dataGen.id];
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