import type { Products, Product } from './interfaces';

export let product_index: Products = {
  products: [
    {
      name: "Order Events",
      type: "event",
      displayName: "Order Events",
      description: "The Order Events async API alerts authorized users to all order data events..",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "/orders.html",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Commerce/Orders, Commerce/Customers, Commerce/Suppliers"
        },
        {
          name: "groups",
          value: "Internal"
        }
      ]
    },
    {
      name: "ESG Analytics",
      type: "api",
      displayName: "ESG Analytics",
      description: "Our ESG data product offers a detailed view of companies' environmental, social, and governance performance.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/esg-analytics.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "ESG/Environmental, ESG/Social, ESG/Governance"
        },
        {
          name: "groups",
          value: "Internal"
        }
      ]
    },
    {
      name: "Index Research",
      type: "api,ah",
      displayName: "Index Research",
      description: "Get in-depth index data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/index-research.yaml",
      hubUrl: "https://console.cloud.google.com/bigquery/analytics-hub/exchanges;cameo=analyticshub;pageName=listing-detail;pageResource=apigee-test38.eu.marketplace_18dccea19ab.trading_data_18dccebea66",
      hubMarketplaceId: "marketplace_18dccea19ab",
      hubListingId: "trading_data_18dccebea66",      
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Initial fee",
          "price": "$1,000",
          "range": "Start of subscription"
        },
        {
          "tier": "Monthly fee",
          "price": "$1,000 per month",
          "range": "0 - 5000 calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Investment/Research, Investment/Statistics, Investment/Management"
        }
      ]
    },
    {
      name: "STOXX Indexes",
      type: "api,sync",
      displayName: "STOXX Indexes",
      description: "Get in-depth STOXX index data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/stoxx-indexes.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        },
        {
          "tier": "Basic",
          "price": "$0.20 per 100 API calls or file downloads",
          "range": "21 - 5000 API calls or file downloads per month"
        },
        {
          "tier": "Premium",
          "price": "$0.10 per 100 API calls or file downloads",
          "range": "> 5000 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Investment/Research, Investment/Statistics, Investment/Management"
        }
      ]
    },
    {
      name: "DAX Indexes",
      type: "api,sync",
      displayName: "DAX Indexes",
      description: "Get in-depth DAX index data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/dax-indexes.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Investment/Research, Investment/Statistics, Investment/Management"
        }
      ]
    },
    {
      name: "Market Structure",
      type: "api",
      displayName: "Market Structure",
      description: "Get in-depth pre-IPO listing data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/trading-data.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Pre-IPO/Research, Pre-IPO/Statistics, Pre-IPO/Management, Listing/Research, Listing/Statistics, Listing/Management"
        }
      ]
    },
    {
      name: "Growth Venture Networks",
      type: "api",
      displayName: "Growth Venture Networks",
      description: "Get in-depth pre-IPO listing data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/trading-data.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Pre-IPO/Research, Pre-IPO/Statistics"
        }
      ]
    },
    {
      name: "Public Offerings",
      type: "api,sync",
      displayName: "Public Offerings",
      description: "Get in-depth public offering listing data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/trading-data.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Pre-IPO/Research, Pre-IPO/Statistics"
        }
      ]
    },
    {
      name: "Trading locations",
      type: "api,sync",
      displayName: "Trading locations",
      description: "Get in-depth public trading location data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/trading-data.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Trading/Research, Trading/Statistics"
        }
      ]
    },
    {
      name: "Trading data",
      type: "api",
      displayName: "Trading products",
      description: "Get in-depth public trading location data and analysis for smarter investment strategies.",
      approvalType: "automatic",
      imageUrl: "/data_icon.png",
      specUrl: "https://raw.githubusercontent.com/tyayers/apigee-data-marketplace/main/specs/trading-data.yaml",
      status: "active",
      access: "public",
      pricing: [
        {
          "tier": "Starter",
          "price": "Free",
          "range": "20 API calls or file downloads per month"
        }
      ],
      attributes: [
        {
          name: "tags",
          value: "Trading/Research, Trading/Statistics, Trading/Classes"
        }
      ]
    }
  ]
}