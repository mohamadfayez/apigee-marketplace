
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
                        "stringValue": "DeepMind Alphafold"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.deepmind_alphafold.metadata"
                      },
                      "entity": {
                        "stringValue": "alphafold-metadata"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Austin Bike Trips"
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
                        "stringValue": "London Bike Trips"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.london_bicycles.cycle_hire"
                      },
                      "entity": {
                        "stringValue": "london-bike-trips"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "New York City Bike Trips"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.new_york_citibike.citibike_trips"
                      },
                      "entity": {
                        "stringValue": "new-york-bike-trips"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "New York City Subway Trips"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.new_york_subway.trips"
                      },
                      "entity": {
                        "stringValue": "new-york-subway-trips"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Chicago Taxi Trips"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.chicago_taxi_trips.taxi_trips"
                      },
                      "entity": {
                        "stringValue": "chicago-taxi-trips"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "BBC News Full Text"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.bbc_news.fulltext"
                      },
                      "entity": {
                        "stringValue": "news-text"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Bitcoin Transactions"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.crypto_bitcoin.transactions"
                      },
                      "entity": {
                        "stringValue": "bitcoin-transactions"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Ethereum Transactions"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.crypto_ethereum.transactions"
                      },
                      "entity": {
                        "stringValue": "ethereum-transactions"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Github Commits"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.github_repos.commits"
                      },
                      "entity": {
                        "stringValue": "github-commits"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "NOAA Hurricane Data"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.noaa_hurricanes.hurricanes"
                      },
                      "entity": {
                        "stringValue": "noaa-hurricanes"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "NOAA Lightning Data"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.noaa_lightning.lightning_strikes"
                      },
                      "entity": {
                        "stringValue": "noaa-lightning-strikes"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Google Maps Project Sunroof"
                      },
                      "table": {
                        "stringValue": "bigquery-public-data.sunroof_solar.solar_potential_by_postal_code"
                      },
                      "entity": {
                        "stringValue": "maps-sunroof"
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
          "ratePlans": {
            "arrayValue": {
              "values": [
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Bronze_Plan_5hb46"
                      },
                      "apiproduct": {
                        "stringValue": ""
                      },
                      "displayName": {
                        "stringValue": "Bronze Plan"
                      },
                      "description": {
                        "stringValue": "Bronze rate plan"
                      },
                      "billingPeriod": {
                        "stringValue": "MONTHLY"
                      },
                      "paymentFundingModel": {
                        "stringValue": "POSTPAID"
                      },
                      "currencyCode": {
                        "stringValue": "USD"
                      },
                      "setupFee": {
                        "mapValue": {
                          "fields": {
                            "currencyCode": {
                              "stringValue": "USD"
                            },
                            "units": {
                              "stringValue": "500"
                            },
                            "nanos": {
                              "stringValue": "0"
                            }
                          }
                        }
                      },
                      "fixedRecurringFee": {
                        "mapValue": {
                          "fields": {
                            "currencyCode": {
                              "stringValue": "USD"
                            },
                            "units": {
                              "stringValue": "0"
                            },
                            "nanos": {
                              "stringValue": "0"
                            }
                          }
                        }
                      },
                      "fixedFeeFrequency": {
                        "integerValue": "1"
                      },
                      "consumptionPricingType": {
                        "stringValue": "BANDED"
                      },
                      "consumptionPricingRates": {
                        "arrayValue": {
                          "values": [
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "0"
                                  },
                                  "end": {
                                    "stringValue": "100"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "100000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "101"
                                  },
                                  "end": {
                                    "stringValue": "201"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "90000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "202"
                                  },
                                  "end": {
                                    "stringValue": "302"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "80000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "303"
                                  },
                                  "end": {
                                    "stringValue": "0"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "70000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      },
                      "state": {
                        "stringValue": "PUBLISHED"
                      },
                      "startTime": {
                        "integerValue": "1740835753347"
                      },
                      "endTime": {
                        "integerValue": "0"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Silver_Plan_b7ehc"
                      },
                      "apiproduct": {
                        "stringValue": ""
                      },
                      "displayName": {
                        "stringValue": "Silver Plan"
                      },
                      "description": {
                        "stringValue": "Silver rate plan"
                      },
                      "billingPeriod": {
                        "stringValue": "MONTHLY"
                      },
                      "paymentFundingModel": {
                        "stringValue": "POSTPAID"
                      },
                      "currencyCode": {
                        "stringValue": "USD"
                      },
                      "setupFee": {
                        "mapValue": {
                          "fields": {
                            "currencyCode": {
                              "stringValue": "USD"
                            },
                            "units": {
                              "stringValue": "500"
                            },
                            "nanos": {
                              "stringValue": "0"
                            }
                          }
                        }
                      },
                      "fixedRecurringFee": {
                        "mapValue": {
                          "fields": {
                            "currencyCode": {
                              "stringValue": "USD"
                            },
                            "units": {
                              "stringValue": "500"
                            },
                            "nanos": {
                              "stringValue": "0"
                            }
                          }
                        }
                      },
                      "fixedFeeFrequency": {
                        "stringValue": "1"
                      },
                      "consumptionPricingType": {
                        "stringValue": "BANDED"
                      },
                      "consumptionPricingRates": {
                        "arrayValue": {
                          "values": [
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "0"
                                  },
                                  "end": {
                                    "stringValue": "100"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "80000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "101"
                                  },
                                  "end": {
                                    "stringValue": "201"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "70000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "202"
                                  },
                                  "end": {
                                    "stringValue": "302"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "60000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "303"
                                  },
                                  "end": {
                                    "stringValue": "0"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "50000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      },
                      "state": {
                        "stringValue": "PUBLISHED"
                      },
                      "startTime": {
                        "integerValue": "1740835787029"
                      },
                      "endTime": {
                        "integerValue": "0"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "name": {
                        "stringValue": "Gold_Plan_j60i2"
                      },
                      "apiproduct": {
                        "stringValue": ""
                      },
                      "displayName": {
                        "stringValue": "Gold Plan"
                      },
                      "description": {
                        "stringValue": "Gold rate plan"
                      },
                      "billingPeriod": {
                        "stringValue": "MONTHLY"
                      },
                      "paymentFundingModel": {
                        "stringValue": "POSTPAID"
                      },
                      "currencyCode": {
                        "stringValue": "USD"
                      },
                      "setupFee": {
                        "mapValue": {
                          "fields": {
                            "currencyCode": {
                              "stringValue": "USD"
                            },
                            "units": {
                              "stringValue": "500"
                            },
                            "nanos": {
                              "stringValue": "0"
                            }
                          }
                        }
                      },
                      "fixedRecurringFee": {
                        "mapValue": {
                          "fields": {
                            "currencyCode": {
                              "stringValue": "USD"
                            },
                            "units": {
                              "stringValue": "1000"
                            },
                            "nanos": {
                              "stringValue": "0"
                            }
                          }
                        }
                      },
                      "fixedFeeFrequency": {
                        "stringValue": "1"
                      },
                      "consumptionPricingType": {
                        "stringValue": "BANDED"
                      },
                      "consumptionPricingRates": {
                        "arrayValue": {
                          "values": [
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "0"
                                  },
                                  "end": {
                                    "stringValue": "100"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "50000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "101"
                                  },
                                  "end": {
                                    "stringValue": "201"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "40000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "202"
                                  },
                                  "end": {
                                    "stringValue": "302"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "30000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            {
                              "mapValue": {
                                "fields": {
                                  "start": {
                                    "stringValue": "303"
                                  },
                                  "end": {
                                    "stringValue": "0"
                                  },
                                  "fee": {
                                    "mapValue": {
                                      "fields": {
                                        "currencyCode": {
                                          "stringValue": "USD"
                                        },
                                        "units": {
                                          "stringValue": "0"
                                        },
                                        "nanos": {
                                          "stringValue": "20000000"
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          ]
                        }
                      },
                      "state": {
                        "stringValue": "PUBLISHED"
                      },
                      "startTime": {
                        "integerValue": "1740835822901"
                      },
                      "endTime": {
                        "integerValue": "0"
                      }
                    }
                  }
                }
              ]
            }
          },
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
                      "upTimeInPercent": {
                        "stringValue": ""
                      },
                      "maxLatencyMS": {
                        "stringValue": ""
                      },
                      "description": {
                        "stringValue": "No SLA guaranteed."
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "upTimeInPercent": {
                        "stringValue": "99.99"
                      },
                      "maxLatencyMS": {
                        "stringValue": "400"
                      },
                      "description": {
                        "stringValue": "99.99% uptime SLA"
                      },
                      "id": {
                        "stringValue": "sla_9999"
                      },
                      "name": {
                        "stringValue": "99.99% SLA"
                      }
                    }
                  }
                },
                {
                  "mapValue": {
                    "fields": {
                      "maxLatencyMS": {
                        "stringValue": "700"
                      },
                      "description": {
                        "stringValue": "99.5% SLA"
                      },
                      "id": {
                        "stringValue": "99.5_sla_j3ab"
                      },
                      "name": {
                        "stringValue": "99.5% SLA"
                      },
                      "upTimeInPercent": {
                        "stringValue": "99.5"
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