# 🏢 SpaceMatrix — Microservices Commercial Real Estate Portal

SpaceMatrix is an enterprise-grade commercial real estate leasing platform built with an event-driven **Node.js/Express Microservices** architecture and a fast, SSR-enabled **SvelteKit** frontend.

---

## 🏗️ System Architecture

```text
                           ┌───────────────────────────────────┐
                           │   SvelteKit Frontend Web App      │
                           │      http://localhost:5173        │
                           └─────────────────┬─────────────────┘
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │ (Fetch Catalog)                      │ (Submit Inquiry)                     │ (Track Telemetry)
      ▼                                      ▼                                      ▼
┌─────────────────────────┐        ┌─────────────────────────┐            ┌─────────────────────────┐
│  Property Microservice  │        │  Inquiry Microservice   │            │ Analytics Microservice  │
│  Port 3001              │        │  Port 3002              │            │ Port 3003               │
└────────────┬────────────┘        └────────────┬────────────┘            └────────────┬────────────┘
             │                                  │                                      │
             │                                  │ (Trigger Notification)               │
             │                                  └───────────────┐                      │
             │                                                  ▼                      │
             │                                      ┌─────────────────────────┐        │
             │                                      │ Notification Service    │        │
             │                                      │ Port 3004               │        │
             │                                      └─────────────────────────┘        │
             ▼                                                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                MongoDB Database (`spacematrix`)                         │
│   Collections: properties | inquiries | metrics                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘



spacematrix/
├── backend/
│   ├── property-service/       # Port 3001 | Handles commercial property CRUD
│   │   ├── src/
│   │   │   ├── models/Property.js
│   │   │   ├── routes/propertyRoutes.js
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── inquiry-service/        # Port 3002 | Processes & saves leasing inquiries
│   │   ├── src/
│   │   │   ├── models/Inquiry.js
│   │   │   ├── routes/inquiryRoutes.js
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── analytics-service/      # Port 3003 | Captures usage metrics & events
│   │   ├── src/
│   │   │   ├── models/Metric.js
│   │   │   ├── routes/analyticsRoutes.js
│   │   │   └── index.js
│   │   └── package.json
│   │
│   └── notification-service/   # Port 3004 | Dispatches notifications/alerts
│       ├── src/
│       │   └── index.js
│       └── package.json
│
└── frontend/                   # SvelteKit App (Port 5173)
    ├── src/
    │   ├── lib/
    │   │   └── index.ts        # Service endpoints & TypeScript interfaces
    │   └── routes/
    │       ├── +layout.svelte  # Global app layout & headers
    │       ├── +page.ts        # SSR loader for property microservice
    │       └── +page.svelte    # Main interactive UI & modal forms
    └── package.json


Microservices & Ports Summary

Service,Port,Endpoint Base,MongoDB Collection,Description
Property Service,3001,/api/v1/properties,properties,Manages listing catalog
Inquiry Service,3002,/api/v1/inquiries,inquiries,Stores lead contact submissions
Analytics Service,3003,/api/v1/analytics,metrics,Logs UI events and analytics
Notification Service,3004,/api/v1/notifications,N/A (Stateless),Sends alerts to leasing team
Frontend UI,5173,/,N/A,SvelteKit client interface


📊 Database Schemas (MongoDB)
All database services explicitly connect to the spacematrix database:
mongodb://127.0.0.1:27017/spacematrix

1. Property Schema (properties collection)
JavaScript

{
  name: String,            // Required
  description: String,     // Required
  propertyType: String,    // Enum: ['office', 'warehouse', 'retail']
  totalArea: Number,       // Sq. Ft.
  rentPerSqFt: Number,     // Monthly rate
  totalMonthlyRent: Number,// Monthly total
  images: [String],        // Optional image URLs
  createdAt: Date          // Default: Date.now
}


2. Inquiry Schema (inquiries collection)
JavaScript
{
  propertyId: String,      // Associated property ID
  propertyName: String,    // Property title
  inquirerName: String,    // Lead's full name
  inquirerEmail: String,   // Lead's email
  phone: String,           // Lead's phone number
  message: String,         // Custom message
  createdAt: Date          // Default: Date.now
}
3. Metric Schema (metrics collection)
JavaScript
{
  eventType: String,       // e.g., 'PAGE_VIEW', 'INQUIRY_SUBMITTED_SUCCESS'
  metadata: Object,        // Contextual payload
  timestamp: Date          // Default: Date.now
}
🚀 Getting Started
Prerequisites
Node.js (v18+)

MongoDB Community Server running locally on mongodb://127.0.0.1:27017

MongoDB Compass (for database inspection)

Step 1: Clone & Install Dependencies
1. Backend Microservices:
Run npm install inside each individual backend service folder:

Bash
cd backend/property-service && npm install
cd ../inquiry-service && npm install
cd ../analytics-service && npm install
cd ../notification-service && npm install
2. Frontend SvelteKit App:
Bash
cd ../../frontend && npm install
Step 2: Start All Microservices
Open 5 separate terminal tabs or windows and run:

Bash
# Terminal 1 — Property Service (Port 3001)
cd backend/property-service && node src/index.js

# Terminal 2 — Inquiry Service (Port 3002)
cd backend/inquiry-service && node src/index.js

# Terminal 3 — Analytics Service (Port 3003)
cd backend/analytics-service && node src/index.js

# Terminal 4 — Notification Service (Port 3004)
cd backend/notification-service && node src/index.js

# Terminal 5 — SvelteKit Frontend (Port 5173)
cd frontend && npm run dev
🧪 Testing the Pipeline
1. Open the UI
Navigate to http://localhost:5173/ in your browser to view live property listings.

2. Submit an Inquiry
Click Send Inquiry on any commercial space card.

Fill out the contact form and hit Submit.

Watch the terminal logs:

Inquiry Service receives POST 201 Created.

Notification Service prints 🔔 [NOTIFICATION DISPATCHED].

Analytics Service receives 📊 [Analytics Logged].

3. Verify Database
Open MongoDB Compass and refresh the spacematrix database. You will see all 3 collections populated:

📁 properties

📁 inquiries

📁 metrics

🛡️ Troubleshooting & Tips
500 Error regarding file names in SvelteKit: Ensure reserved framework files inside src/routes/ are correctly spelled with an e (e.g., +page.ts, +page.svelte, +layout.svelte).

Collections missing in Compass: MongoDB creates collections on-demand when the first document is inserted. Ensure your connection URIs explicitly end with /spacematrix (e.g., mongodb://127.0.0.1:27017/spacematrix).

📜 License
This project is open-source and available under the MIT License.

