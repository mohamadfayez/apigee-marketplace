import { json, type RequestHandler } from "@sveltejs/kit";
import { GoogleAuth } from "google-auth-library";
import { PUBLIC_PROJECT_ID, PUBLIC_APIHUB_REGION } from '$env/static/public';
import { ApiHubApi } from "$lib/interfaces";

const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

export const GET: RequestHandler = async ({url, params}) => {

  let result: ApiHubApi[] = await getApiHubApis();
  return json(result);
};

async function getApiHubApis(): Promise<ApiHubApi[]> {
  let result: ApiHubApi[] = [];
  let token = await auth.getAccessToken();

  let response = await fetch(`https://apihub.googleapis.com/v1/projects/${PUBLIC_PROJECT_ID}/locations/${PUBLIC_APIHUB_REGION}/apis`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    let tempApis = (await response.json()).apis;

    if (tempApis && tempApis.length > 0) {
      // fetch each api
      for (let p = 0; p < tempApis.length; p++) {
        if (tempApis[p].versions && tempApis[p].versions.length > 0) {
          // fetch each version
          for (let i = 0; i < tempApis[p].versions.length; i++) {
            let versionResponse = await fetch(`https://apihub.googleapis.com/v1/${tempApis[p].versions[i]}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });

            if (versionResponse.status === 200) {
              let versionBody = await versionResponse.json();
              tempApis[p].versions[i] = versionBody;

              // fetch deployment
              if (versionBody.deployments && versionBody.deployments.length > 0) {
                for (let d = 0; d < versionBody.deployments.length; d++) {
                  let deployResponse = await fetch(`https://apihub.googleapis.com/v1/${versionBody.deployments[d]}`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${token}`
                    }
                  });

                  if (deployResponse.status === 200) {
                    let deploymentBody = await deployResponse.json();
                    tempApis[p].versions[i].deployments[d] = deploymentBody;
                  }
                }
              }
            }
          }
        }
      }
    }

    if (tempApis) result = tempApis;
  }

  return result;
}