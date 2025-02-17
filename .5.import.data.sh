
arrIN=(${ADMIN_EMAIL//@/ })

curl -i -X POST "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents:batchWrite" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  --data-binary @- << EOF

{
  "writes": [
    {
      "update": {
        "name": "projects/$PROJECT_ID/databases/(default)/documents/apigee-marketplace-sites/default",
        "fields": {
          "id": {
            "stringValue": "default"
          },
          "name": {
            "stringValue": "Apigee Marketplace"
          },
          "nameTop": {
            "stringValue": "-12px"
          },
          "nameLeft": {
            "stringValue": "4px"
          },
          "logoUrl": {
            "stringValue": "/loop.svg"
          },
          "logoWidth": {
            "stringValue": "36px"
          },
          "heroImageUrl": {
            "stringValue": "/banner.png"
          },          
          "owner": {
            "stringValue": "$ADMIN_EMAIL"
          },
          "categories": {
            "arrayValue": {
              "values": [
                {
                  "stringValue": "CRM - Customer Orders"
                },
                {
                  "stringValue": "CRM - Sales Automation"
                },
                {
                  "stringValue": "CRM - Marketing Automation"
                },
                {
                  "stringValue": "ERP - Financials"
                },
                {
                  "stringValue": "ERP - Inventory Management"
                },
                {
                  "stringValue": "ERP - Supply Chain"
                },
                {
                  "stringValue": "HR - Employee Functions"
                },
                {
                  "stringValue": "HR - Recruitment"
                },
                {
                  "stringValue": "HR - Performance Management"
                },
                {
                  "stringValue": "E-commerce - Product Catalog"
                },
                {
                  "stringValue": "E-commerce - Order Management"
                },
                {
                  "stringValue": "E-commerce - Payment Processing"
                },
                {
                  "stringValue": "CMS - Content Delivery"
                },
                {
                  "stringValue": "CMS - Digital Asset Management"
                },
                {
                  "stringValue": "CMS - Headless CMS"
                },
                {
                  "stringValue": "Data Analytics - Business Intelligence"
                },
                {
                  "stringValue": "Data Analytics - Data Warehousing"
                },
                {
                  "stringValue": "Data Analytics - Predictive Analytics"
                },
                {
                  "stringValue": "Communication & Collaboration - Messaging"
                },
                {
                  "stringValue": "Communication & Collaboration - Video Conferencing"
                },
                {
                  "stringValue": "Communication & Collaboration - Document Sharing"
                },
                {
                  "stringValue": "Security & Identity - Authentication"
                },
                {
                  "stringValue": "Security & Identity - Access Control"
                },
                {
                  "stringValue": "Security & Identity - Fraud Detection"
                },
                {
                  "stringValue": "Logistics & Shipping - Shipping Tracking"
                },
                {
                  "stringValue": "Logistics & Shipping - Route Optimization"
                },
                {
                  "stringValue": "Logistics & Shipping - Warehouse Management"
                },
                {
                  "stringValue": "Marketing & Advertising - Social Media"
                },
                {
                  "stringValue": "Marketing & Advertising - Advertising Platforms"
                },
                {
                  "stringValue": "Marketing & Advertising - Customer Engagement"
                },
                {
                  "stringValue": "Legal & Compliance - Document Management"
                },
                {
                  "stringValue": "Legal & Compliance - Compliance Tracking"
                },
                {
                  "stringValue": "Legal & Compliance - E-Signature"
                },
                {
                  "stringValue": "Mapping & Location Services - Geocoding"
                },
                {
                  "stringValue": "Mapping & Location Services - Route Planning"
                },
                {
                  "stringValue": "Mapping & Location Services - Location Tracking"
                }
              ]
            }
          },
          "products": {
            "arrayValue": {
              "values": []
            }
          },
          "bqtables": {
            "arrayValue": {
              "values": [
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Austin bike trips"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.austin_bikeshare.bikeshare_trips"
                      },
                      "entity": {
                        "stringValue": "bike-trips"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "BBC News full text"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.bbc_news.fulltext"
                      },
                      "entity": {
                        "stringValue": "news-text"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      "update": {
        "name": "projects/$PROJECT_ID/databases/(default)/documents/apigee-marketplace-config/default",
        "fields": {
          "roles": {
            "arrayValue": {
              "values": [
                {
                  "stringValue": "admin"
                },
                {
                  "stringValue": "internal"
                },
                {
                  "stringValue": "external"
                },
                {
                  "stringValue": "partner"
                },
                {
                  "stringValue": "publisher"
                }
              ]
            }
          },
          "slas": {
            "arrayValue": {
              "values": [
                {
                  "mapValue": {
                    "fields": {
                      "id": {
                        "stringValue": "no_sla_5k3j"
                      },
                      "name": {
                        "stringValue": "No SLA"
                      },
                      "description": {
                          "stringValue": "No SLA guaranteed."
                      },
                      "upTimeInPercent": {
                          "stringValue": ""
                      },
                      "maxLatencyMS": {
                          "stringValue": ""
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "id": {
                        "stringValue": "sla_9999"
                      },
                      "name": {
                        "stringValue": "99.99% SLA"
                      },
                      "description": {
                          "stringValue": "99.99% uptime SLA"
                      },
                      "upTimeInPercent": {
                          "stringValue": "99.99"
                      },
                      "maxLatencyMS": {
                          "stringValue": "400"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      "update": {
        "name": "projects/$PROJECT_ID/databases/(default)/documents/apigee-marketplace-users/$ADMIN_EMAIL",
        "fields": {
          "email": {
              "stringValue": "$ADMIN_EMAIL"
          },
          "firstName": {
              "stringValue": "Marketplace"
          },
          "lastName": {
              "stringValue": "Admin"
          },
          "roles": {
            "arrayValue": {
              "values": [
                {
                  "stringValue": "admin"
                },
                {
                  "stringValue": "internal"
                }
              ]
            },
          },
          "status": {
              "stringValue": "approved"
          },
          "userName": {
              "stringValue": "${arrIN[0]}"
          }
        }
      }
    }
  ]
}
EOF