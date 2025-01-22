
# Deploy signed url function
# cd ./services/signedurl-function
# gcloud functions deploy signedurl-function --project=$PROJECT_ID \
#   --gen2 \
#   --runtime=python310 \
#   --region=$REGION \
#   --source=. \
#   --entry-point=get_url \
#   --ingress-settings=all \
#   --trigger-http \
#   --no-allow-unauthenticated \
#   --service-account=mpservice@$PROJECT_ID.iam.gserviceaccount.com \
#   --build-service-account=projects/$PROJECT_ID/serviceAccounts/mpservice@$PROJECT_ID.iam.gserviceaccount.com
# cd ../..

# Get function URL
# FUNCTION_URL=$(gcloud functions describe signedurl-function --region $REGION --project $PROJECT_ID --format 'value(url)')
# # Set in Apigee KVM so the API knows where to call
# apigeecli kvms entries create -m marketplace-kvm -k storage_function_url -l $FUNCTION_URL -e $APIGEE_ENV -o $PROJECT_ID -t $(gcloud auth print-access-token) 2>/dev/null
# apigeecli kvms entries update -m marketplace-kvm -k storage_function_url -l $FUNCTION_URL -e $APIGEE_ENV -o $PROJECT_ID -t $(gcloud auth print-access-token)
# gcloud functions add-invoker-policy-binding signedurl-function \
#   --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" --region=$REGION --project $PROJECT_ID

# Deploy marketplace app
SECONDS=0
# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --format 'value(status.url)' --project $PROJECT_ID --region $REGION)

# First deploy to Cloud Run
if [ -z "${SERVICE_URL}" ]; then 
  gcloud beta run deploy $SERVICE_NAME --source . --region $REGION --project $PROJECT_ID \
    --allow-unauthenticated --service-account=mpservice@$PROJECT_ID.iam.gserviceaccount.com \
    --build-service-account=projects/$PROJECT_ID/serviceAccounts/mpservice@$PROJECT_ID.iam.gserviceaccount.com \
    --port 3000
  SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --format 'value(status.url)' --region $REGION --project $PROJECT_ID)
fi

# Redeploy to Cloud Run
gcloud beta run deploy $SERVICE_NAME --source . --region $REGION --project $PROJECT_ID \
  --allow-unauthenticated --service-account=mpservice@$PROJECT_ID.iam.gserviceaccount.com \
  --build-service-account=projects/$PROJECT_ID/serviceAccounts/mpservice@$PROJECT_ID.iam.gserviceaccount.com \
  --port 3000 --set-env-vars "ORIGIN=$SERVICE_URL,VITE_ORIGIN=$SERVICE_URL"

# make available publicly
gcloud run services add-iam-policy-binding $SERVICE_NAME --region $REGION --project $PROJECT_ID \
  --member="allUsers" --role="roles/run.invoker"

duration=$SECONDS
echo "Total deployment finished in $((duration / 60)) minutes and $((duration % 60)) seconds."