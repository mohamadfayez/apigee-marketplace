API_NAME=MP-GenAIAPI-v1
cd ./apis/$API_NAME
apigeecli apis create bundle -f apiproxy --name $API_NAME -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli apis deploy -n $API_NAME -o $PROJECT_ID -e $APIGEE_ENV -t $(gcloud auth print-access-token) -s "mpservice@$PROJECT_ID.iam.gserviceaccount.com" --ovr
cd ../..

API_NAME=MP-DataTestAPI-v1
cd ./apis/$API_NAME
apigeecli apis create bundle -f apiproxy --name $API_NAME -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli apis deploy -n $API_NAME -o $PROJECT_ID -e $APIGEE_ENV -t $(gcloud auth print-access-token) -s "mpservice@$PROJECT_ID.iam.gserviceaccount.com" --ovr
cd ../..

API_NAME=MP-DataAPI-v1
cd ./apis/$API_NAME
apigeecli apis create bundle -f apiproxy --name $API_NAME -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli apis deploy -n $API_NAME -o $PROJECT_ID -e $APIGEE_ENV -t $(gcloud auth print-access-token) -s "mpservice@$PROJECT_ID.iam.gserviceaccount.com" --ovr
cd ../..

API_NAME=MP-ServicesAPI-v1
cd ./apis/$API_NAME
apigeecli apis create bundle -f apiproxy --name $API_NAME -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli apis deploy -n $API_NAME -o $PROJECT_ID -e $APIGEE_ENV -t $(gcloud auth print-access-token) -s "mpservice@$PROJECT_ID.iam.gserviceaccount.com" --ovr
cd ../..

API_NAME=MP-ServicesTestAPI-v1
cd ./apis/$API_NAME
apigeecli apis create bundle -f apiproxy --name $API_NAME -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli apis deploy -n $API_NAME -o $PROJECT_ID -e $APIGEE_ENV -t $(gcloud auth print-access-token) -s "mpservice@$PROJECT_ID.iam.gserviceaccount.com" --ovr
cd ../..

API_NAME=MP-StorageAPI-v1
cd ./apis/$API_NAME
apigeecli apis create bundle -f apiproxy --name $API_NAME -o $PROJECT_ID -t $(gcloud auth print-access-token)
apigeecli apis deploy -n $API_NAME -o $PROJECT_ID -e $APIGEE_ENV -t $(gcloud auth print-access-token) -s "mpservice@$PROJECT_ID.iam.gserviceaccount.com" --ovr
cd ../..