
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
gcloud services enable dlp.googleapis.com --project=$PROJECT_ID
gcloud services enable modelarmor.googleapis.com --project=$PROJECT_ID
   
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

sleep 5

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
    --role="roles/apigee.apiAdminV2" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/apigee.monetizationAdmin" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/apihub.editor" --project $PROJECT_ID

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
    --member="serviceAccount:mpservice@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/modelarmor.user" --project $PROJECT_ID

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$ADMIN_EMAIL" \
    --role="roles/integrations.suspensionResolver" --project $PROJECT_ID

echo "Creating Firestore default instance..."
gcloud firestore databases create --location=$REGION --project $PROJECT_ID

echo "Setting web app variables..."
rm .env 1>/dev/null 2>/dev/null
touch .env
echo $"PUBLIC_SITE_NAME=$SITE_NAME" >> .env
echo $"PUBLIC_SITE_URL=$SITE_URL" >> .env
echo $"PUBLIC_API_HOST=$APIGEE_ENVGROUP_HOST" >> .env
echo $"PUBLIC_PROJECT_ID=$PROJECT_ID" >> .env
echo $"PUBLIC_REGION=$REGION" >> .env
echo $"PUBLIC_APIGEE_ENV=$APIGEE_ENV" >> .env
echo $"PUBLIC_APIHUB_REGION=$APIGEE_APIHUB_REGION" >> .env
echo $"PUBLIC_FIREBASE_APIKEY=$FIREBASE_APIKEY" >> .env
echo $"PUBLIC_FIREBASE_AUTHDOMAIN=$FIREBASE_AUTHDOMAIN" >> .env
echo $"PUBLIC_OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID" >> .env
echo $"PUBLIC_INTERNAL_DOMAINS=$INTERNAL_DOMAINS" >> .env
cp .env .env.$PROJECT_ID.env

echo "Creating storage bucket..."
gcloud storage buckets create gs://$BUCKET_NAME --location=eu --project $PROJECT_ID

echo "Creating Apigee KVM and default model keys..."
apigeecli kvms create -e $APIGEE_ENV -n marketplace-kvm -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli kvms entries create -m marketplace-kvm -k gemini-model -l "publishers/google/models/gemini-2.0-flash-001" -e $APIGEE_ENV -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli kvms entries create -m marketplace-kvm -k gemini-thinking-model -l "publishers/google/models/gemini-2.0-flash-thinking-exp-01-21" -e $APIGEE_ENV -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli kvms entries create -m marketplace-kvm -k llama-model -l "publishers/meta/models/llama-3.3-70b-instruct-maas" -e $APIGEE_ENV -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli kvms entries create -m marketplace-kvm -k mistral-model -l "publishers/mistralai/models/mistral-nemo@2407" -e $APIGEE_ENV -o $PROJECT_ID -t $(gcloud auth print-access-token)

echo "Creating Apigee data collectors..."
apigeecli datacollectors create -n dc_genai_model_name -d "Name of the Gen AI model" -p STRING -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli datacollectors create -n dc_genai_prompt_tokens -d "Gen AI model prompt token count" -p INTEGER -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli datacollectors create -n dc_genai_completion_tokens -d "Gen AI model completion token count" -p INTEGER -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli datacollectors create -n dc_genai_total_tokens -d "Gen AI model total token count" -p INTEGER -o $PROJECT_ID -t $(gcloud auth print-access-token)

echo "Creating Apigee custom LLM report..."
curl -X POST "https://apigee.googleapis.com/v1/organizations/$PROJECT_ID/reports" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "displayName": "LLM Token Counts",
  "metrics": [
    {
      "name": "dc_genai_prompt_tokens",
      "function": "sum"
    },
    {
      "name": "dc_genai_completion_tokens",
      "function": "sum"
    },
    {
      "name": "dc_genai_total_tokens",
      "function": "sum"
    }
  ],
  "dimensions": [
    "dc_genai_model_name",
    "developer_app",
    "developer"
  ],
  "properties": [
    {
      "value": [
        {
          "value": "Token counts for all LLMs used in the organization."
        }
      ]
    }
  ],
  "chartType": "line",
  "organization": "apigee-tlab5"
}
EOF

echo "Enabling Model Armor in our region..."
gcloud config set api_endpoint_overrides/modelarmor "https://modelarmor.$MODEL_ARMOR_REGION.rep.googleapis.com/" --project $PROJECT_ID

gcloud model-armor templates create --location $MODEL_ARMOR_REGION --project $PROJECT_ID marketplace-template1 \
  --rai-settings-filters='[{ "filterType": "HATE_SPEECH", "confidenceLevel": "MEDIUM_AND_ABOVE" },{ "filterType": "HARASSMENT", "confidenceLevel": "MEDIUM_AND_ABOVE" },{ "filterType": "SEXUALLY_EXPLICIT", "confidenceLevel": "MEDIUM_AND_ABOVE" }]' \
  --basic-config-filter-enforcement=enabled  \
  --pi-and-jailbreak-filter-settings-enforcement=enabled \
  --pi-and-jailbreak-filter-settings-confidence-level=LOW_AND_ABOVE \
  --malicious-uri-filter-settings-enforcement=enabled \
  --template-metadata-custom-llm-response-safety-error-code=798 \
  --template-metadata-custom-llm-response-safety-error-message="LLM sensitive information detected." \
  --template-metadata-custom-prompt-safety-error-code=799 \
  --template-metadata-custom-prompt-safety-error-message="Prompt sensitive information detected." \
  --template-metadata-ignore-partial-invocation-failures \
  --template-metadata-log-operations \
  --template-metadata-log-sanitize-operations