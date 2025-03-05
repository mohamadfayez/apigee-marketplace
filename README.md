# Apigee Data Marketplace Sample
This project offers a sample marketplace frontend application for Apigee to offer publishing & subscription user flows for data, AI & API products. This is only a demo to show what is possible using the **Headless API Distribution** engine in Apigee (supporting any type of frontend framework). In this case the marketplace app uses [SvelteKit](https://svelte.dev/) as the frontend framework.

## Prerequisites
1. A [**GCP project**](https://console.cloud.google.com/) with Apigee X deployed (subscription, paygo, or trial). [This script](https://github.com/api-integration-samples/apigee-integration-quickstart) will create a project & Apigee X instance in one go.
2. Configure [**Identity Platform**](https://console.cloud.google.com/customer-identity). Add the Google & Email/Password providers, then use **Application Setup Details > apiKey and authDomain** in the below steps in the `.1.env.PROJECT_ID.sh` file.
3. Install the [Apintegrate](https://github.com/apintegrate/apintegrate) CLI tool in your shell for Apigee deployments.
4. If you plan on using Gen AI models in the marketplace, optionally enable these third-party models:
- [Llama 3.3](https://console.cloud.google.com/vertex-ai/publishers/meta/model-garden/llama3-3)
- [Mistral Nemo](https://console.cloud.google.com/vertex-ai/publishers/mistralai/model-garden/mistral-nemo)

## Deployment
1. Clone this repository and run `./.0.init.sh PROJECT_ID` with your GCP project id. This will create a `.1.env.PROJECT_ID.sh` environment variables file.
2. Edit the file `.1.env.PROJECT_ID.sh` and set the variables, including Apigee project info and Identity Platform IDs. Set **INTERNAL_DOMAINS** to the domains of users who should be considered internal (can publish data & APIs, all others can just subscribe and consume), and add your email account as **ADMIN_EMAIL**.
4. Follow the following instructions to deploy.

```sh
# set env variables file (change PROJECT_ID to your project id)
source .1.env.PROJECT_ID.sh

# run 2_create_resources.sh to create resources like a storage bucket and Apigee KVMs
./.2.create.resources.sh

# deploy Apigee APIs
./.3.deploy_apis.sh

# deploy Cloud Run service
./.4.deploy.services.sh

# run import data to setup Firebase db
./.5.import.data.sh

# start client
npm run dev
```

After deploying and running you can open the dev version in your browser at http://localhost:5173.

## Open source libraries used
- [Svelte-JSON Editor](https://github.com/josdejong/svelte-jsoneditor) - awesome JSON editor svelte control.
- [Rapidoc](https://rapidocweb.com/) - very nice Open API spec documentation web element that is used for API docs.

## Support
This is not an officially supported Google product.