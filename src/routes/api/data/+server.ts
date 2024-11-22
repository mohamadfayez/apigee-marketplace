import type { SLA } from "$lib/interfaces";
import { Firestore } from "@google-cloud/firestore";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Create a new client
const firestore = new Firestore();

export const GET: RequestHandler = async ({ url, params }) => {
  const site = url.searchParams.get('site') ?? '';
  const col = url.searchParams.get('col') ?? '';
  let results: any[] = [];

  if (col) {
    let prodColRef = firestore.collection(col);
    let documents = await prodColRef.listDocuments();

    for (let doc of documents.entries()) {
      let docData = await doc[1].get()
      results.push(docData.data());
    }
  }

  return json(results);
};

export const POST: RequestHandler = async({ params, url, request}) => {

  const col = url.searchParams.get('col') ?? '';
  let newDocument = await request.json();

  // Persist defnition to Firestore...
  let newDoc = firestore.doc(col + "/" + newDocument.id);
  newDoc.set(newDocument);

	return json(newDocument);
}

export const DELETE: RequestHandler = async({ params, url, request}) => {
  const col = url.searchParams.get('col') ?? '';

  // delete an entire collection
  firestore.collection(col).listDocuments().then(val => {
    val.map((val) => {
        val.delete()
    });
  });
  
  return json({});
}