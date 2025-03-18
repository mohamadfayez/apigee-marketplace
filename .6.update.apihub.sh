echo "Adding additional deployment types to API Hub..."

curl -X PATCH "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes/system-deployment-type?updateMask=allowedValues" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
	"name": "projects/$PROJECT_ID/locations/$REGION/attributes/system-deployment-type",
	"displayName": "Deployment Type",
	"description": "Deployment Type attribute",
	"definitionType": "SYSTEM_DEFINED",
	"scope": "DEPLOYMENT",
	"dataType": "ENUM",
	"allowedValues": [
		{
			"id": "apigee",
			"displayName": "Apigee",
			"description": "Apigee",
			"immutable": true
		},
		{
			"id": "apigee-hybrid",
			"displayName": "Apigee Hybrid",
			"description": "Apigee Hybrid",
			"immutable": true
		},
		{
			"id": "apigee-edge-private",
			"displayName": "Apigee Edge Private Cloud",
			"description": "Apigee Edge Private Cloud",
			"immutable": true
		},
		{
			"id": "apigee-edge-public",
			"displayName": "Apigee Edge Public Cloud",
			"description": "Apigee Edge Public Cloud",
			"immutable": true
		},
		{
			"id": "mock-server",
			"displayName": "Mock server",
			"description": "Mock server",
			"immutable": true
		},
		{
			"id": "cloud-api-gateway",
			"displayName": "Cloud API Gateway",
			"description": "Cloud API Gateway",
			"immutable": true
		},
		{
			"id": "cloud-endpoints",
			"displayName": "Cloud Endpoints",
			"description": "Cloud Endpoints",
			"immutable": true
		},
		{
			"id": "unmanaged",
			"displayName": "Unmanaged",
			"description": "Unmanaged",
			"immutable": true
		},
		{
			"id": "others",
			"displayName": "Others",
			"description": "Others",
			"immutable": true
		},
		{
			"id": "aws-api-gateway",
			"displayName": "AWS API Gateway",
			"description": "AWS API Gateway",
			"immutable": false
		},
		{
			"id": "azure-api-management",
			"displayName": "Azure API Management",
			"description": "Azure API Management",
			"immutable": false
		},
		{
			"id": "sap-api-management",
			"displayName": "SAP API Management",
			"description": "SAP API Management",
			"immutable": false
		}
	],
	"cardinality": 1,
	"mandatory": true
}
EOF

echo "Adding example business units to API Hub..."

curl -X PATCH "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes/system-business-unit?updateMask=allowedValues" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "name": "projects/$PROJECT_ID/locations/$REGION/attributes/system-business-unit",
  "displayName": "Business Unit",
  "description": "Business unit attribute",
  "definitionType": "SYSTEM_DEFINED",
  "scope": "API",
  "dataType": "ENUM",
  "allowedValues": [
    {
      "id": "sales-and-marketing",
      "displayName": "Sales & Marketing",
      "description": "Sales & Marketing"
    },
    {
      "id": "financial-accounting",
      "displayName": "Finance & Accounting",
      "description": "Finance & Accounting"
    },
    {
      "id": "human-resources",
      "displayName": "Human Resources (HR)",
      "description": "Human Resources (HR)"
    },
    {
      "id": "information-technology",
      "displayName": "Information Technology (IT)",
      "description": "Information Technology (IT)"
    },
    {
      "id": "operations",
      "displayName": "Operations",
      "description": "Operations"
    },
    {
      "id": "research-and-development",
      "displayName": "Research & Development (R&D)",
      "description": "Research & Development (R&D)"
    },
    {
      "id": "product-management",
      "displayName": "Product Management",
      "description": "Product Management"
    },
    {
      "id": "legal-and-compliance",
      "displayName": "Legal & Compliance",
      "description": "Legal & Compliance"
    },
    {
      "id": "customer-support",
      "displayName": "Customer Service/Support",
      "description": "Customer Service/Support"
    },
    {
      "id": "supply-chain-management",
      "displayName": "Supply Chain Management",
      "description": "Supply Chain Management"
    },
    {
      "id": "corporate-strategy",
      "displayName": "Corporate Strategy",
      "description": "Corporate Strategy"
    },
    {
      "id": "business-development",
      "displayName": "Business Development",
      "description": "Business Development"
    },
    {
      "id": "partner-management",
      "displayName": "Partner Management",
      "description": "Partner Management"
    },
    {
      "id": "procurement",
      "displayName": "Procurement",
      "description": "Procurement"
    }
  ],
  "cardinality": 1
}
EOF

echo "Adding example teams to API Hub..."

curl -X PATCH "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes/system-team?updateMask=allowedValues" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "name": "projects/$PROJECT_ID/locations/$REGION/attributes/system-team",
  "displayName": "Team",
  "description": "Team attribute",
  "definitionType": "SYSTEM_DEFINED",
  "scope": "API",
  "dataType": "ENUM",
  "allowedValues": [
    {
      "id": "data-drivers",
      "displayName": "The Data Drivers",
      "description": "The Data Drivers"
    },
    {
      "id": "code-crafters",
      "displayName": "The Code Crafters",
      "description": "The Code Crafters"
    },
    {
      "id": "solution-architects",
      "displayName": "The Solution Architects",
      "description": "The Solution Architects"
    },
    {
      "id": "the-navigators",
      "displayName": "The Navigators",
      "description": "The Navigators"
    },
    {
      "id": "the-risk-wranglers",
      "displayName": "The Risk Wranglers",
      "description": "The Risk Wranglers"
    },
    {
      "id": "the-safety-net",
      "displayName": "The Safety Net",
      "description": "The Safety Net"
    },
    {
      "id": "the-horizon-team",
      "displayName": "The Horizon Team",
      "description": "The Horizon Team"
    },
    {
      "id": "the-phoenix-group",
      "displayName": "The Phoenix Group",
      "description": "The Phoenix Group"
    },
    {
      "id": "the-project-pioneers",
      "displayName": "The Project Pioneers",
      "description": "The Project Pioneers"
    }
  ],
  "cardinality": 1
}
EOF

echo "Adding additional user attributes to API Hub..."

curl -X POST "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes?attributeId=gdpr-relevance" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "name": "projects/$PROJECT_ID/locations/$REGION/attributes/gdpr-relevance",
  "displayName": "GDPR Relevance",
  "description": "How relevant the API is for GDPR data protection audits & concerns.",
  "scope": "API",
  "dataType": "ENUM",
  "allowedValues": [
    {
      "id": "high",
      "displayName": "HIGH",
      "description": "Highly relevant."
    },
    {
      "id": "partial",
      "displayName": "PARTIAL",
      "description": "Partially relevant."
    },
    {
      "id": "none",
      "displayName": "NONE",
      "description": "Not at all relevant."
    }
  ],
  "cardinality": 1
}
EOF

curl -X POST "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes?attributeId=business-type" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "name": "projects/$PROJECT_ID/locations/$REGION/attributes/business-type",
  "displayName": "Business Type",
  "description": "The type of API for different categories of business operations.",
  "scope": "API",
  "dataType": "ENUM",
  "allowedValues": [
    {
      "id": "payments",
      "displayName": "PAYMENTS",
      "description": "Payment processing APIs."
    },
    {
      "id": "production-manufacturing",
      "displayName": "Production/Manufacturing",
      "description": "Production/Manufacturing"
    },
    {
      "id": "finance-and-accounting",
      "displayName": "Finance and Accounting",
      "description": "Finance and Accounting"
    },
    {
      "id": "ai-and-ml",
      "displayName": "AI and ML",
      "description": "AI and ML"
    },
    {
      "id": "strategy-and-planning",
      "displayName": "Strategy and Planning",
      "description": "Strategy and Planning"
    }
  ],
  "cardinality": 1
}
EOF

curl -X POST "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes?attributeId=regions" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "name": "projects/$PROJECT_ID/locations/$REGION/attributes/regions",
  "displayName": "Regions",
  "description": "The regions that the API is active in.",
  "scope": "API",
  "dataType": "ENUM",
  "allowedValues": [
    {
      "id": "northam",
      "displayName": "NORTHAM",
      "description": "North America"
    },
    {
      "id": "southam",
      "displayName": "SOUTHAM",
      "description": "South America"
    },
    {
      "id": "europe",
      "displayName": "EUROPE",
      "description": "Europe"
    },
    {
      "id": "asia",
      "displayName": "ASIA",
      "description": "Asia"
    },
    {
      "id": "africa",
      "displayName": "AFRICA",
      "description": "Africa"
    },
    {
      "id": "australia",
      "displayName": "AUSTRALIA",
      "description": "Australia"
    }
  ],
  "cardinality": 20
}
EOF

curl -X POST "https://apihub.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/attributes?attributeId=source" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF

{
  "name": "projects/$PROJECT_ID/locations/$REGION/attributes/source",
  "displayName": "Source",
  "description": "The source of the API registration.",
  "scope": "VERSION",
  "dataType": "ENUM",
  "allowedValues": [
    {
      "id": "manual",
      "displayName": "Manual",
      "description": "Manual registration"
    },
    {
      "id": "discovery",
      "displayName": "Discovery",
      "description": "Discovery automatic registration"
    },
    {
      "id": "marketplace",
      "displayName": "Marketplace",
      "description": "Marketplace registration"
    }
  ],
  "cardinality": 1
}
EOF