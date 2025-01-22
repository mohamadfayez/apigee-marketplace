
# enable services
gcloud services enable apigee.googleapis.com --project=$PROJECT_ID
gcloud services enable firestore.googleapis.com --project $PROJECT_ID
gcloud services enable secretmanager.googleapis.com --project $PROJECT_ID
gcloud services enable integrations.googleapis.com --project $PROJECT_ID
gcloud services enable connectors.googleapis.com --project $PROJECT_ID
gcloud services enable cloudkms.googleapis.com --project $PROJECT_ID
gcloud services enable identitytoolkit.googleapis.com --project $PROJECT_ID
gcloud services enable aiplatform.googleapis.com --project $PROJECT_ID
gcloud services enable iamcredentials.googleapis.com --project $PROJECT_ID
gcloud services enable run.googleapis.com --project $PROJECT_ID
gcloud services enable cloudfunctions.googleapis.com --project $PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project $PROJECT_ID

# sleep 5 seconds to let the API be initialized...
sleep 5

# enable identity platform
curl -X POST "https://identitytoolkit.googleapis.com/v2/projects/$PROJECT_ID/identityPlatform:initializeAuth" \
	-H "Authorization: Bearer $(gcloud auth print-access-token)" \
	-H "x-goog-user-project: $PROJECT_ID"

# create service account and assign roles 
gcloud iam service-accounts create mpservice \
    --description="Service account to manage marketplace services" \
    --display-name="MarketplaceService" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/integrations.integrationInvoker" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/apigee.developerAdmin" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/apigee.environmentAdmin" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.jobUser" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountTokenCreator" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.invoker" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.developer" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.builder" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.integrations.editor" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$ADMIN_EMAIL" \
    --role="roles/integrations.suspensionResolver" --project $PROJECT_ID

echo "Creating Firestore default instance..."
gcloud firestore databases create --location=$REGION --project $PROJECT_ID

echo "Setting web app variables..."
rm .env 1>/dev/null 2>/dev/null
touch .env
echo $"PUBLIC_SITE_NAME=$SITE_NAME" >> .env
echo $"PUBLIC_API_HOST=$APIGEE_ENVGROUP_HOST" >> .env
echo $"PUBLIC_PROJECT_ID=$PROJECT_ID" >> .env
echo $"PUBLIC_APIGEE_ENV=$APIGEE_ENV" >> .env
echo $"PUBLIC_APIHUB_REGION=$APIGEE_APIHUB_REGION" >> .env
echo $"PUBLIC_FIREBASE_APIKEY=$FIREBASE_APIKEY" >> .env
echo $"PUBLIC_FIREBASE_AUTHDOMAIN=$FIREBASE_AUTHDOMAIN" >> .env
echo $"PUBLIC_OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID" >> .env
echo $"PUBLIC_INTERNAL_DOMAINS=$INTERNAL_DOMAINS" >> .env
cp .env .env.$PROJECT_ID.env

echo "Creating storage bucket..."
gcloud storage buckets create gs://$BUCKET_NAME --location=eu --project $PROJECT_ID

echo "Creating Apigee KVM..."
apigeecli kvms create -e $APIGEE_ENV -n marketplace-kvm -o $PROJECT_ID -t $(gcloud auth print-access-token)