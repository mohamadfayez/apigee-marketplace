# Set environment variables here
export PROJECT_ID=
export REGION=europe-west1
export SERVICE_NAME=apigee-marketplace
export SITE_NAME="Apigee Marketplace"

# Set Identity Platform & Firebase variables
export FIREBASE_APIKEY=
export FIREBASE_AUTHDOMAIN=$PROJECT_ID.firebaseapp.com
export OAUTH_CLIENT_ID=

# Set Cloud Storage bucket name
export BUCKET_NAME=marketplace-

# Set Apigee variables
export APIGEE_ENV=
export APIGEE_ENVGROUP_HOST=
# Default is EU, if another location is needed set here.
# export APIGEE_APIHUB_REGION=

# Internal domains are the comma-separated email domains that will be considered internal for users registering (no approval needed)
export INTERNAL_DOMAINS=

# The admin email will be given admin access to the marketplace, and also receive approval requests
export ADMIN_EMAIL=