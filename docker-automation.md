
    Here is your step-by-step guide to setting up Docker Automation on your dedicated automation branch.

    We will create a Dockerfile for each of your services and a central docker-compose.yml in your project root (SpaceMatrix-Project/).


        📁 1. Project Structure
    Ensure your files are placed according to this layout:

                SpaceMatrix-Project/
            ├── docker-compose.yml          <-- Central Orchestrator
            ├── frontend/
            │   ├── Dockerfile              <-- SvelteKit Dockerfile
            │   └── ...
            ├── property-service/           <-- (or your backend folder)
            │   ├── Dockerfile              <-- Express Service Dockerfile
            │   └── ...
            ├── inquiry-service/
            │   ├── Dockerfile
            │   └── ...
            ├── analytics-service/
            │   ├── Dockerfile
            │   └── ...
            └── notification-service/
                ├── Dockerfile
                └── ...


    🛠️ 2. Step-by-Step Configuration Files
    A. Backend Service Dockerfile
    Create a file named Dockerfile inside each of your Express microservice folders (property-service, inquiry-service, analytics-service, notification-service):
        
        Dockerfile
            # Use lightweight Node 20
            FROM node:20-alpine

            WORKDIR /usr/src/app

            # Copy dependency configs
            COPY package*.json ./

            # Install dependencies
            RUN npm install

            # Copy source code
            COPY . .

            # Start service
            CMD ["node", "index.js"]


        B. Frontend Dockerfile
    Create a file named Dockerfile inside the frontend/ directory:

        Dockerfile
        FROM node:20-alpine AS builder

        WORKDIR /app
        COPY package*.json ./
        RUN npm install
        COPY . .
        RUN npm run build

        FROM node:20-alpine AS runner
        WORKDIR /app
        COPY --from=builder /app/package*.json ./
        COPY --from=builder /app/node_modules ./node_modules
        COPY --from=builder /app/build ./build

        EXPOSE 5173
        ENV HOST=0.0.0.0
        CMD ["node", "build"]

        
        
        C. Central docker-compose.yml
        Create a docker-compose.yml file in the project root (/d/practice_projects/SpaceMatrix-Project):

                version: '3.8'

                services:
                # 1. Database
                mongodb:
                    image: mongo:latest
                    container_name: spacematrix_db
                    ports:
                    - "27017:27017"
                    volumes:
                    - mongo_data:/data/db

                # 2. Property Microservice
                property-service:
                    build: ./property-service # Update folder path if different
                    container_name: property_service
                    ports:
                    - "3001:3001"
                    environment:
                    - PORT=3001
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix
                    depends_on:
                    - mongodb

                # 3. Inquiry Microservice
                inquiry-service:
                    build: ./inquiry-service # Update folder path if different
                    container_name: inquiry_service
                    ports:
                    - "3002:3002"
                    environment:
                    - PORT=3002
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix
                    depends_on:
                    - mongodb

                # 4. Analytics Microservice
                analytics-service:
                    build: ./analytics-service # Update folder path if different
                    container_name: analytics_service
                    ports:
                    - "3003:3003"
                    environment:
                    - PORT=3003
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix
                    depends_on:
                    - mongodb

                # 5. Notification Microservice
                notification-service:
                    build: ./notification-service # Update folder path if different
                    container_name: notification_service
                    ports:
                    - "3004:3004"
                    environment:
                    - PORT=3004

                # 6. SvelteKit Frontend
                frontend:
                    build: ./frontend
                    container_name: frontend_app
                    ports:
                    - "5173:5173"
                    depends_on:
                    - property-service
                    - inquiry-service
                    - analytics-service
                    - notification-service

                volumes:
                    mongo_data:


    🚀 3. Run Your Automated Architecture
    From your root folder in Git Bash (/d/practice_projects/SpaceMatrix-Project):

    1. Build and start all services in a single command:

        docker compose up --build

    2. Verify running services:
    Open http://localhost:5173 in your browser. All microservices and MongoDB are now running automatically in orchestrated containers.

    3. Stop everything:
    Press Ctrl + C in the terminal, or run:

    docker compose down

    4. Commit your changes to the automation branch:

        git add .
        git commit -m "feat: complete docker containerization and orchestration setup"
        git push origin automation

==================================================================================================================================
       
        Implementation : Starts
    Your project guide cleanly maps out the entire lifecycle from manual local development to a fully automated Docker architecture!

    Here is a quick overview of how your directory structure aligns with your Docker automation plan and how to execute it on your docker-automation branch.

    📁 Project Architecture Alignment

    Based on your repository guide, your microservices live nested under the backend/ directory:

                SpaceMatrix-Project/
                ├── docker-compose.yml          <-- Root Orchestrator
                ├── run-all.sh                  <-- Automation Bootstrap Script
                ├── database/
                │   └── seed.js
                ├── frontend/
                │   ├── Dockerfile
                │   └── ...
                └── backend/
                    ├── property-service/       <-- Dockerfile here
                    ├── inquiry-service/        <-- Dockerfile here
                    ├── analytics-service/      <-- Dockerfile here
                    └── notification-service/   <-- Dockerfile here


        🛠️ Step-by-Step Execution on docker-automation Branch
        Since you have updated your docker-automation.md and repository files, follow these exact steps to run Phase 3 (Docker Automation):

        1. Ensure Dockerfile exists in each service folder
        Make sure each of your 4 backend microservices inside backend/ has a Dockerfile:

        backend/property-service/Dockerfile (Repeat for inquiry, analytics, notification):

        FROM node:20-alpine
        WORKDIR /usr/src/app
        COPY package*.json ./
        RUN npm install
        COPY . .
        EXPOSE 3001
        CMD ["node", "index.js"]

        And your frontend/Dockerfile:

        FROM node:20-alpine AS builder
        WORKDIR /app
        COPY package*.json ./
        RUN npm install
        COPY . .
        RUN npm run build

        FROM node:20-alpine AS runner
        WORKDIR /app
        COPY --from=builder /app/package*.json ./
        COPY --from=builder /app/node_modules ./node_modules
        COPY --from=builder /app/build ./build

        EXPOSE 5173
        ENV HOST=0.0.0.0
        CMD ["node", "build"]


        2. Verify docker-compose.yml in Root
    Your docker-compose.yml in the root folder maps directly to your nested backend/ paths:

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

            frontend:
                build: ./frontend
                container_name: frontend-app
                restart: always
                ports:
                - "5173:5173"
                depends_on:
                - property-service
                - inquiry-service
                - analytics-service
                - notification-service

            volumes:
            mongo_data:


            3. Run with One Command (run-all.sh)
        In Git Bash from your project root (/d/practice_projects/SpaceMatrix-Project), run:

            Bash
            ./run-all.sh
            This will automatically:

            Spin up MongoDB, all 4 Express microservices, and the SvelteKit frontend inside isolated Docker containers.

            Wait 8 seconds for database initialization.

            Automatically seed sample properties into MongoDB via curl.

        4. Push Progress to GitHub
        To save your latest commits on your docker-automation branch:

        Bash
        git add .
        git commit -m "feat: complete docker automation setup and bootstrap script"
        git push origin docker-automation