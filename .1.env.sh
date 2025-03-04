# Set environment variables here
export PROJECT_ID=
export REGION=europe-west1
export MODEL_ARMOR_REGION=europe-west4
export SERVICE_NAME=apigee-marketplace
export SITE_NAME="Apigee Marketplace"
export SITE_URL="https://marketplace.googee.cloud"

# Set Identity Platform & Firebase variables
export FIREBASE_APIKEY=
export FIREBASE_AUTHDOMAIN=$PROJECT_ID.firebaseapp.com
export OAUTH_CLIENT_ID=

# Set Cloud Storage bucket name
export BUCKET_NAME=marketplace-

# Set Apigee variables
export APIGEE_ENV=dev
# Host just the host name, without https:// (e.g. 34-149-70-69.nip.io)
export APIGEE_ENVGROUP_HOST=
export APIGEE_APIHUB_REGION=europe-west1

# Internal domains are the comma-separated email domains that will be considered internal for users registering (no approval needed)
export INTERNAL_DOMAINS=

# The admin email will be given admin access to the marketplace, and also receive approval requests
export ADMIN_EMAIL=