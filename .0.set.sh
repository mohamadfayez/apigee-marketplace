source .1.env.$1.sh
gcloud config set project $PROJECT_ID

rm .env
cp .env.$PROJECT_ID.env .env