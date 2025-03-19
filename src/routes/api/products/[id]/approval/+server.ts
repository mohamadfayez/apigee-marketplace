import type { DataProduct } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_REGION } from '$env/static/public';

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Create a new client
const firestore = new Firestore();

export const GET: RequestHandler = async({ params, url, request}) => {
  const executionId = url.searchParams.get('executionId') ?? '';
  
  let result: boolean = false;
  if (executionId) {
    result = await getApprovalFlowStatus(executionId);
  }

  return json({
    result: result
  });
}

export const POST: RequestHandler = async({ params, url, request}) => {
  const productId: string = params.id ?? "";
  const productName = url.searchParams.get('productName') ?? '';
  const userEmail = url.searchParams.get('userEmail') ?? '';
  const approverEmail = url.searchParams.get('approverEmail') ?? '';

  console.log(`Starting approval workflow for: ${productId} - ${productName} - ${userEmail} - ${approverEmail}`);

  let executionId = await startApprovalFlow(productId, productName, userEmail, approverEmail);

  return json({
    executionId: executionId
  });
}

async function startApprovalFlow(productId: string, productName: string, userEmail: string, approverEmail: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let token = await auth.getAccessToken();

    let response = await fetch(`https://integrations.googleapis.com/v2/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_REGION}/integrations/ProductApprovalFlow:execute?triggerId=api_trigger/ProductApprovalFlow_API_1`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ApprovalEmails: [approverEmail],
        ProductId: productId,
        ProductName: productName,
        UserEmails: [userEmail]
      })
    });
  
    let executionId = response.headers.get("execution_id") ?? "";
    console.log(executionId);
    resolve(executionId);
  })
}

async function getApprovalFlowStatus(executionId: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    let token = await auth.getAccessToken();

    let response = await fetch(`https://integrations.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_REGION}/integrations/ProductApprovalFlow/executions/${executionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  
    let result: boolean = false;
    let responseObject: {eventExecutionDetails: {eventExecutionState: string}} = await response.json();
    
    if (responseObject.eventExecutionDetails.eventExecutionState === "SUCCEEDED")
      result = true;

    resolve(result);
  });
}