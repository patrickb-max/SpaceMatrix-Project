# SpaceMatrix-Project
Manual to automation process of a Project 

📋 Phase 1: Create the Project Directory Structure
Open a terminal inside VS Code (Terminal -> New Terminal) and run this command to generate all folders at once:

Bash
  mkdir -p backend/property-service/src/{controllers,models,routes} \
          backend/inquiry-service/src/{controllers,models,routes} \
          backend/analytics-service/src/{controllers,models,routes} \
          backend/notification-service/src/{controllers,routes} \
          database
🛠️ Phase 2: Manual Local Development Setup
  We will first run the project manually to ensure all microservices and database queries work properly on bare metal.

Step 1: Start MongoDB
  Launch MongoDB Community Server locally.

Open MongoDB Compass.

  Connect to mongodb://127.0.0.1:27017 and verify connection.

Step 2: Initialize Microservices
  Run these commands in your VS Code terminal to create package files and install dependencies for each service:

1. Property Microservice (Port 3001)
  Bash
  cd backend/property-service
  npm init -y
  npm install express mongoose cors dotenv
  Create backend/property-service/.env:

Code snippet
    PORT=3001
    MONGO_URI=mongodb://127.0.0.1:27017/spacematrix
2. Inquiry Microservice (Port 3002)
  Bash
  cd ../inquiry-service
  npm init -y
  npm install express mongoose cors dotenv
  Create backend/inquiry-service/.env:

Code snippet
    PORT=3002
    MONGO_URI=mongodb://127.0.0.1:27017/spacematrix
3. Analytics Microservice (Port 3003)
    Bash
    cd ../analytics-service
    npm init -y
    npm install express mongoose cors dotenv
    Create backend/analytics-service/.env:

Code snippet
    PORT=3003
    MONGO_URI=mongodb://127.0.0.1:27017/spacematrix
4. Notification Microservice (Port 3004)
    Bash
    cd ../notification-service
    npm init -y
    npm install express cors dotenv
    Create backend/notification-service/.env:

Code snippet
  PORT=3004
Step 3: Initialize SvelteKit Frontend
  Navigate back to the project root and create your frontend app:

Bash
# Return to root directory
    cd ../..

# Initialize SvelteKit project
  npm create svelte@latest frontend
  Select SvelteKit minimal project, JS with JSDoc, and accept defaults.

  npx sv create frontend

  Bash
  cd frontend
    npm install
Step 4: Run Microservices & Test
    Open 4 terminal split tabs in VS Code (Ctrl + Shift + ** or click +` in terminal view).

Start each microservice in its respective terminal tab:

    Tab 1: cd backend/property-service && npm start

    Tab 2: cd backend/inquiry-service && npm start

    Tab 3: cd backend/analytics-service && npm start

    Tab 4: cd backend/notification-service && npm start

    Open a 5th terminal tab and launch the SvelteKit frontend:

    Tab 5: cd frontend && npm run dev

  Open your browser to http://localhost:5173/.

Step 5: Seed Sample Data
    Run this command in VS Code terminal to insert initial commercial listings into MongoDB:

    Bash
    curl -X POST http://localhost:3001/api/v1/properties \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Silicon Hub Tower",
        "description": "Prime corporate office space in downtown financial district with modern glass facade.",
        "propertyType": "office",
        "totalArea": 5500,
        "rentPerSqFt": 4.5,
        "totalMonthlyRent": 24750,
        "images": ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"]
      }'
🐳 Phase 3: Transition to Docker Automation
    Once manual verification is complete, transition to containerized single-command execution.

  Step 1: Create docker-compose.yml
    Create a file named docker-compose.yml in the project root:

  YAML
  version: '3.8'

  services:
    mongo:
      image: mongo:7.0
      container_name: spacematrix-db
      restart: always
      ports:
        - "27017:27017"
      volumes:
        - mongo_data:/data/db

    property-service:
      build: ./backend/property-service
      container_name: property-service
      restart: always
      ports:
        - "3001:3001"
      environment:
        - PORT=3001
        - MONGO_URI=mongodb://mongo:27017/spacematrix
      depends_on:
        - mongo

    inquiry-service:
      build: ./backend/inquiry-service
      container_name: inquiry-service
      restart: always
      ports:
        - "3002:3002"
      environment:
        - PORT=3002
        - MONGO_URI=mongodb://mongo:27017/spacematrix
      depends_on:
        - mongo

    analytics-service:
      build: ./backend/analytics-service
      container_name: analytics-service
      restart: always
      ports:
        - "3003:3003"
      environment:
        - PORT=3003
        - MONGO_URI=mongodb://mongo:27017/spacematrix
      depends_on:
        - mongo

    notification-service:
      build: ./backend/notification-service
      container_name: notification-service
      restart: always
      ports:
        - "3004:3004"
      environment:
        - PORT=3004

  volumes:
    mongo_data:
Step 2: Create Automation Bootstrap Script (run-all.sh)
  Create run-all.sh in your project root:

  Bash
  #!/bin/bash

  echo "🚀 Starting SpaceMatrix Automated Infrastructure..."
  docker-compose up -d --build

  echo "⏳ Waiting 8 seconds for database and microservices to spin up..."
  sleep 8

    echo "🌱 Seeding initial properties..."
    curl -s -X POST http://localhost:3001/api/v1/properties \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Silicon Hub Tower",
        "description": "Prime corporate office space in downtown financial district.",
        "propertyType": "office",
        "totalArea": 5500,
        "rentPerSqFt": 4.5,
        "totalMonthlyRent": 24750,
        "images": ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"]
      }' > /dev/null

  echo "✅ All 4 Microservices & Database are Live!"
  Grant execution permissions:

    Bash
    chmod +x run-all.sh
🐙 Phase 4: Commit & Push to Git Repository
    Create a root .gitignore file to ensure node_modules and secret files aren't committed to Git:

    Plaintext
    # .gitignore
    node_modules/
    .env
    .DS_Store
    .svelte-kit/
    build/
    dist/
    Commit and push your full architecture to GitHub:

    Bash
    git add .
    git commit -m "feat: initialize SpaceMatrix 4-microservices architecture with SvelteKit frontend & Docker automation"
    git push origin main

🛠️ Phase 2: Manual Local Development Setup
    We will first run the project manually to ensure all microservices and database queries work properly on bare metal.

  Step 1: Start MongoDB
    Launch MongoDB Community Server locally.

Open MongoDB Compass.

    Connect to mongodb://127.0.0.1:27017 and verify connection.

    Step 2: Initialize Microservices
    Run these commands in your VS Code terminal to create package files and install dependencies for each service:

    1. Property Microservice (Port 3001)
    Bash
    cd backend/property-service
    npm init -y
    npm install express mongoose cors dotenv
    Create backend/property-service/.env:

    Code snippet
    PORT=3001
    MONGO_URI=mongodb://127.0.0.1:27017/spacematrix
    2. Inquiry Microservice (Port 3002)
    Bash
    cd ../inquiry-service
    npm init -y
    npm install express mongoose cors dotenv
    Create backend/inquiry-service/.env:

    Code snippet
    PORT=3002
    MONGO_URI=mongodb://127.0.0.1:27017/spacematrix
    3. Analytics Microservice (Port 3003)
    Bash
    cd ../analytics-service
    npm init -y
    npm install express mongoose cors dotenv
    Create backend/analytics-service/.env:

    Code snippet
    PORT=3003
    MONGO_URI=mongodb://127.0.0.1:27017/spacematrix
    4. Notification Microservice (Port 3004)
    Bash
    cd ../notification-service
    npm init -y
    npm install express cors dotenv
    Create backend/notification-service/.env:

    Code snippet
    PORT=3004
    Step 3: Initialize SvelteKit Frontend
    Navigate back to the project root and create your frontend app:

    Bash
    # Return to root directory
    cd ../..

    # Initialize SvelteKit project
    npm create svelte@latest frontend
    Select SvelteKit minimal project, JS with JSDoc, and accept defaults.

    Bash
    cd frontend
    npm install
    Step 4: Run Microservices & Test
    Open 4 terminal split tabs in VS Code (Ctrl + Shift + ** or click +` in terminal view).

    Start each microservice in its respective terminal tab:

    Tab 1: cd backend/property-service && npm start

    Tab 2: cd backend/inquiry-service && npm start

    Tab 3: cd backend/analytics-service && npm start

    Tab 4: cd backend/notification-service && npm start

    Open a 5th terminal tab and launch the SvelteKit frontend:

    Tab 5: cd frontend && npm run dev

    Open your browser to http://localhost:5173/.

    Step 5: Seed Sample Data
    Run this command in VS Code terminal to insert initial commercial listings into MongoDB:

Bash
    curl -X POST http://localhost:3001/api/v1/properties \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Silicon Hub Tower",
        "description": "Prime corporate office space in downtown financial district with modern glass facade.",
        "propertyType": "office",
        "totalArea": 5500,
        "rentPerSqFt": 4.5,
        "totalMonthlyRent": 24750,
        "images": ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"]
      }'