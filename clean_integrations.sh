# This script resets the integration definitions back to the original state, replacing user info with placeholders

INTEGATION_NAME=MP-Users
sed -i "s/$ADMIN_EMAIL/approver@example.com/g" ./integrations/$INTEGATION_NAME.json
sed -i "s/$INTERNAL_DOMAINS/"example.com"/g" ./integrations/$INTEGATION_NAME.json
sed -i "s/$PROJECT_ID/example-project/g" ./integrations/$INTEGATION_NAME.json