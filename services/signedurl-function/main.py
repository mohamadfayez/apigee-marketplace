import json
import os
import urllib.parse
from datetime import datetime, timedelta
from datetime import datetime, timedelta

import google.auth
from google.auth.transport import requests    
from google.cloud import storage
import functions_framework

from markupsafe import escape

@functions_framework.http
def get_url(request):
    # get bucket and object from querystring
    qs = urllib.parse.parse_qs(request.query_string.decode())
    bucket_name = qs['bucket'][0]
    object_name = qs['object'][0]
    # Get the default credential on the current environment
    credentials, project_id = google.auth.default()
    # Refresh request to get the access token 
    req = requests.Request()
    credentials.refresh(req)
    # Create storage object to sign
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = bucket.get_blob(object_name)
    expires = datetime.utcnow() + timedelta(minutes=5)
    # specify service account only for local development, deployment will use
    #   the assigned service account
    service_account_email = os.environ.get('SVC_ACCT', None)
    if hasattr(credentials, 'service_account_email'):
        service_account_email = credentials.service_account_email
    url = blob.generate_signed_url(
        expiration=expires,
        service_account_email=service_account_email, 
        access_token=credentials.token,
        method='GET'
        )
    data = {'data': url}
    return json.dumps(data)
