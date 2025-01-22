cd ./apis
apintegrate apigee apis import --project $PROJECT_ID
apintegrate apigee apis deploy --project $PROJECT_ID --environment $APIGEE_ENV --serviceAccount mpservice@$PROJECT_ID.iam.gserviceaccount.com
cd ..