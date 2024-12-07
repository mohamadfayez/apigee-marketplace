import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION } from "$env/static/public";
import type { DataGenJob } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

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

  // Generate categories
  let categoryPrompt = `Generate ${dataGen.categoryCount} one-word category names for API domains for the topic ${dataGen.topic}. The category names should be returned in a JSON string array.`;
  let categoryNames: string = await generatePayloadGemini(categoryPrompt);
  let categories: string[] = JSON.parse(categoryNames);
  await createApiHubAttribute("category", "Category", categories);
  categoryPrompt = `Generate ${dataGen.categoryCount} generic sub-category names for API domains for the topic ${dataGen.topic}. The sub-category names should be returned in a JSON string array.`;
  let subCategoryNames: string = await generatePayloadGemini(categoryPrompt);
  let subCategories: string[] = JSON.parse(subCategoryNames);
  await createApiHubAttribute("subcategory", "Sub Category", subCategories);

  return json({});
  // Persist defnition to Firestore...
  // let newDoc = firestore.doc(col + "/" + newDocument.id);
  // newDoc.set(newDocument);

	// return json(newDocument);
}

async function createApiHubAttribute(attributeId: string, attributeDisplayName: string, values: string[]) {
  let token = await auth.getAccessToken();
  let newValues: {id: string, displayName: string, description: string}[] = [];
  for (let val of values) {
    newValues.push({
      id: val.toLowerCase().replaceAll(" ", "_").replaceAll("&", "and").replaceAll("(", "").replaceAll(")", ""),
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