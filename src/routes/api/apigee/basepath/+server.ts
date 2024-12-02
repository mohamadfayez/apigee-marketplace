import { json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION } from '$env/static/public';
import { ApigeeApi } from "$lib/interfaces";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({url, params}) => {

  const proxyName = url.searchParams.get('proxyName') ?? '';

  let result: string = await getProxyBasePath(proxyName);
  return json({
    basePath: result
  });
};

// get apigee proxy base path
async function getProxyBasePath(proxyName: string): Promise<string> {
  let result = "";
  let token = await auth.getAccessToken();

  // first get proxy versions
  let proxyUrl = `https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apis/${encodeURI(proxyName)}`;
  let response = await fetch(proxyUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    let apiProxy: ApigeeApi = (await response.json());
    if (apiProxy.revision.length > 0) {
      // sort revision numbers
      apiProxy.revision.sort(function(a, b) {
        return (Number(a) < Number(b)) ? -1 : (Number(a) > Number(b)) ? 1 : 0;
      });

      // last revision
      let lastRevision = apiProxy.revision[apiProxy.revision.length - 1];

      // get revision
      let revisionResponse = await fetch(`https://apigee.googleapis.com/v1/organizations/${PUBLIC_PROJECT_ID}/apis/${proxyName}/revisions/${lastRevision}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (revisionResponse.status === 200) {
        // get first base path
        let basePaths: string[] = (await revisionResponse.json()).basepaths;
        if (basePaths && basePaths.length > 0)
          result = basePaths[0];
      }
    }
  }

  return result;
}