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

  const col = url.searchParams.get('col') ?? '';
  let id: string | undefined = params.id;

  let result: any | undefined = undefined;

  const document = firestore.doc(col + '/' + id);
  const doc = await document.get();

  if (doc.exists) {
    let docData = doc.data();
    if (docData)
      result = docData;
  }

  if (result) {
	  return json(result);
  }
  else
    error(404, "Data record not found.");
};

export const PUT: RequestHandler = async({ params, url, request}) => {
  let id: string = "";
  if (params.id) id = params.id;

  const col = url.searchParams.get('col') ?? '';
  let rec: any = await request.json();

  // Persist defnition to Firestore...
  let doc = firestore.doc(col + "/" + id);
  doc.set(rec);

	return json(rec);
}

export const DELETE: RequestHandler = async({ params, url, request}) => {
  let id: string = "";
  const col = url.searchParams.get('col') ?? '';
  if (params.id) id = params.id;

  let record: any | undefined = undefined;

  const document = firestore.doc(col + '/' + id);
  const doc = await document.get();

  if (doc.exists) {
    let docData = doc.data();
    if (docData)
      record = docData;

    await document.delete();
  }

  if (record) {
	  return json(record);
  }
  else {
    error(404, "Record not found.");
  }
}