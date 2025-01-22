# Apigee Data Marketplace Sample
This project offers a sample marketplace frontend application for Apigee to offer publishing & subscription user flows for data, AI & API products. This is only a demo to show what is possible using the **Headless API Distribution** engine in Apigee (supporting any type of frontend framework). In this case the marketplace app uses [SvelteKit](https://svelte.dev/) as the frontend framework.

## Deployment
1. First make sure you have a GCP project with Apigee X already deployed (either pay-as-you-go, subscription or a trial). Also make sure Identity Platform is configured for a web app and that you have a web app API key, authorized domain, and OAuth ID from the GCP credentials console.
2. Clone this repository and run `./.0.init.sh PROJECT_ID` with your GCP project id. This will create a `.1.env.PROJECT_ID.sh` environment variables file.
3. Edit the file `.1.env.PROJECT_ID.sh` with all variables, including Apigee info and Identity Platform IDs.
4. Follow these instructions to deploy.

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