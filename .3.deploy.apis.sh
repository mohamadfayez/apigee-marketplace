# deploy apis
cd ./apis
apintegrate apigee apis import --project $PROJECT_ID
apintegrate apigee apis deploy --project $PROJECT_ID --environment $APIGEE_ENV --serviceAccount mpservice@$PROJECT_ID.iam.gserviceaccount.com
cd ..

# configure local integration flow with admin email address
cp ./integrations/ProductApprovalFlow.json "./integrations/ProductApprovalFlow.$PROJECT_ID.local.json"
integrationcli integrations apply -f . -e dev --wait=true -p $PROJECT_ID -t $(gcloud auth print-access-token) -r $REGION --sp $PROJECT_ID
# replace email address for approval
sed -i "s/test@example.com/$ADMIN_EMAIL/g" "./integrations/ProductApprovalFlow.$PROJECT_ID.local.json"
# create integration
integrationcli integrations create -f "./integrations/ProductApprovalFlow.$PROJECT_ID.local.json" -n ProductApprovalFlow -p $PROJECT_ID -r $REGION -t $(gcloud auth print-access-token)
# publish integration
integrationcli integrations versions publish -n ProductApprovalFlow -p $PROJECT_ID -r $REGION -t $(gcloud auth print-access-token) -s 1