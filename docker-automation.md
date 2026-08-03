
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



=========================================================================================================================

Semi-Implementation:
====================

create Dockerfile for property service

            # Dockerfile

            FROM node:20-alpine
            WORKDIR /usr/src/app
            COPY package*.json ./
            RUN npm install
            COPY . .
            EXPOSE 3001
            CMD ["node", "src/index.js"]

    # builds the image 
    docker build -t test-property-service .

    # docker run
    docker run -p 3001:3001 -e PORT=3001 -e MONGO_URI=mongodb://host.docker.internal:27017/spacematrix test-property-service

    check: 

    localhost:3001
    -----------success-------------


    Create Dockerfile for analytics-service
                #Docker file for analytics-service

            # 1. Base Image: Use light weight Node 20 environment
            FROM node:20-alpine

            # 2. Working Directory: Set the default directory inside the container
            WORKDIR /usr/src/app

            # 3. Cache Optimisation: Copy dependency manifests: first to leverage Docker cache
            COPY package*.json ./

            # 4. Dependencies: Install production packages
            RUN npm install

            # 5. Application Code: Copy the rest of the microservices/ application files
            COPY . .

            # 6. Documentation: Indicate which PORT your Express app exposes
            EXPOSE 3003

            # 7. Execution: Default command to run the application when container starts 
            CMD ["node", "src/index.js"]
    🎉 Massive milestone! All 4 microservices in your SpaceMatrix backend architecture are containerized, running on their assigned ports, and connected to MongoDB:

            ┌─────────────────────────────────────────────────────────────┐
            │                      SPACEMATRIX BACKEND                    │
            ├───────────────────┬──────┬──────────────────────────────────┤
            │ Microservice      │ Port │ Status                           │
            ├───────────────────┼──────┼──────────────────────────────────┤
            │ Property Service  │ 3001 │ 🟢 Active (test-property)        │
            │ Analytics Service │ 3002 │ 🟢 Active (test-analytics)       │
            │ Inquiry Service   │ 3003 │ 🟢 Active (test-inquiry)         │
            │ Notification Svc  │ 3004 │ 🟢 Active (test-notification)    │
            └───────────────────┴──────┴──────────────────────────────────┘


    Create Dockerfile for inquiry-service

            # Docker file for `inquiry-service` 

            # 1. Base Image: Use light weight Node 20 environment
            FROM node:20-alpine

            # 2. Working Directory: Set the default directory inside the container
            WORKDIR /usr/src/app

            # 3. Cache Optimization: Copy dependency manifests first to leverage Docker cache
            COPY package*.json ./

            # 4. Dependencies: Install production packages
            RUN npm install

            # 5. Application Code: Copy the rest of the microservices/ application files
            COPY . .

            # 6. Documentation: Indicate which PORT your Express app exposes
            EXPOSE 3002

            # 7. Execution: Default command to run the application when container starts 
            CMD ["node", "src/index.js"]


    Create the Dockerfile for Notification-service:

                        #Dockerfile for notification-service
            # 1. Base Image: Use light weight Node 20 environment
            FROM node:20-alpine

            # 2. Working Directory: Set the default directory inside the container
            WORKDIR /usr/src/app        

            # 3. Cache Optimisation: Copy dependency manifests: first to leverage Docker cache
            COPY package*.json ./

            # 4. Dependencies: Install production packages
            RUN npm install

            # 5. Application Code: Copy the rest of the microservices/ application files
            COPY . .

            # 6. Documentation: Indicate which PORT your Express app exposes
            EXPOSE 3004

            # 7. Execution: Default command to run the application when container starts 
            CMD ["node", "src/index.js"]        


    Create a Dockerfile for Property-service

            # Dockerfile

            # 1. Base Image: Use light weight Node 20 environment
            FROM node:20-alpine

            # 2. Working Directory: Set the default directory inside the container
            WORKDIR /usr/src/app

            # 3. Cache Optimization: Copy dependency manifests first to leverage Docker cache
            COPY package*.json ./

            # 4. Dependencies: Install production packages
            RUN npm install 

            # 5. Application Code: Copy the rest of the microservices/ application files
            COPY . .

            # 6. Docmentation: Indicate which PORT your Express app exposes
            EXPOSE 3001

            # 7. Execution: Default command to run the application when container starts 
            CMD ["node", "src/index.js"]

        Manual- testing for docker:

        step-1: Build the Images
        Step-2: Run the Images

        Build the Image: 
            <docker build -t <image name>:<tag> . >

            docker build -t test-property-service .
        
        Run the Image:

            < docker run -d --rm 
                -p <host-port>:<Container-port> 
                -e PORT=<container-port> 
                -e MONGO_URI=mongodb://host.docker.internal:27017/spacematrix 
                --name <container-name>
                <image-name>:<tag>>

            docker run -d -p <> -e PORT=<> -e MONG_URI=<> --name <> Imagename<>

            docker run -d -p 3001:3001 -e PORT=3001 -e MONGO_URI=mongodb://host.docker.internal:27017/spacematrix --name test-property-service test-property-service:latest 


        🔑 Flag Quick Reference
            Flag        Name                What It Does    
            -d          Detached            Runs container in the background (frees up terminal).   
            --rm        Auto-Remove         Automatically deletes container when stopped (prevents name conflict errors).
            -p          Port Mapping        Maps Host Port : Container Port (e.g., -p 3001:3001).   
            -e          Environment Var     Passes variables to Node.js (e.g., -e PORT=3001).   
            --name      Container Name      Sets a readable container name instead of random letters.



==============================================================================================================================================

Implementation of Compose file: 
===============================

                Imagine you are opening a restaurant, and you have 4 specialists on your staff:

        👨‍🍳 Property Service (the Chef)

        📊 Analytics Service (the Manager)

        📩 Inquiry Service (the Receptionist)

        🔔 Notification Service (the Waiter)

        🗄️ MongoDB (the Pantry where food and ingredients are stored)

        The Problem with standard docker run (No Compose):
        ==================================================
            Without a Compose file, you are acting as a micromanager shouting individual commands at every staff member one by one, every single day:

            You walk up to the Pantry: "Hey MongoDB, start up on port 27017!"

            You walk up to the Chef: "Hey Property Service, start up on port 3001, connect to the Pantry at this specific IP address!"

            You walk up to the Manager: "Hey Analytics Service, start up on port 3002!"

            You walk up to the Receptionist... and so on.

            If you make one typo in a command flag, or if you start the Chef before the Pantry is open, the whole system crashes. Worse, tomorrow morning, you have to type all 4-8 massive terminal commands all over again!

        The Solution: What docker-compose.yml actually is
        ==================================================
        
            A docker-compose.yml file is like an automated Master Blueprint or Operations Manual for your entire system.

            Instead of running around giving 8 separate commands in the terminal, you write down the rules once in a simple file:

            "Here are my 4 microservices and my database."

            "Here are the ports they listen to."

            "Start MongoDB first, then start the services after it's ready."

            "Put them all in the same private network so they can talk to each other by name."

        
        WithOut Compose( docker run ):
        ==============================

            8+ Long Commands: You have to memorize and type huge commands with -p, -e, --name, --rm.

            Manual Dependency Order: If a service starts before MongoDB is ready, it crashes.

            IP Address Headaches: Services struggle to find host machines or local IP addresses.

            Hard to Share: Teammates have to ask you, "Hey, what env flags do I need to pass?"


        With Compose (docker-compose.yaml)
        ==================================

            1 Short Command: You just type docker-compose up and walk away.

            Automatic Order: depends_on: [mongodb] tells Docker to wait for the database.

            Automatic Networking: Services talk to each other directly using friendly names like http://mongodb:27017.

            Easy to Share: Just push docker-compose.yml to GitHub. Anyone on your team runs docker-compose up and gets the exact same setup.


        Dockerfile = Blueprint for ONE service.

        docker-compose.yml = Orchestrator for THE WHOLE TEAM.


        docker-compose.yml file

                        version: '3.8'

                services:
                # 1. Database Service (Uses offical image directly, no Dockerfile needed)
                mongodb:
                    image: mongo:latest
                    container_name: spacematrix-mongodb
                    ports:
                    - "27017:27017"
                    volumes:
                    - mongo_data:/data/db
                    networks:
                    - spacematrix-net
                
                # 2. Properties Service (Uses Dockerfile in ./backend/property-service)
                property-service:
                    build:
                    context: ./backend/property-service   # Path to the directory containing the Dockerfile
                    dockerfile: Dockerfile                # Path to the Dockerfile
                    container_name: spacematrix-property-service
                    ports:
                    - "3001:3001"
                    environment:
                    - PORT=3001
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix  # Uses service name "mongodb" as hostname
                    depends_on:
                    - mongodb     
                    networks:
                    - spacematrix-net

                # 3. Analytics Service (Uses Dockerfile in ./backend/analytics-service)
                analytics-service:  
                    build:
                    context: ./backend/analytics-service
                    dockerfile: Dockerfile
                    container_name: spacematrix-analytics-service
                    ports:
                    - "3002:3002"
                    environment:
                    - PORT=3002
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix  # Uses service name "mongodb" as hostname
                    depends_on:
                    - mongodb
                    networks:
                    - spacematrix-net
                
                # 4. Inquiry Service (Uses Dockerfile in ./backend/inquiry-service)
                inquiry-service:
                    build:
                    context: ./backend/inquiry-service
                    dockerfile: Dockerfile
                    container_name: spacematrix-inquiry-service
                    ports:
                    - "3003:3003"
                    environment:
                    - PORT=3003
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix  # Uses service name "mongodb" as hostname
                    depends_on:
                    - mongodb
                    networks:
                    - spacematrix-net

                # 5. Notification Service (Uses Dockerfile in ./backend/notification-service)
                notification-service:
                    build:
                    context: ./backend/notification-service
                    dockerfile: Dockerfile
                    container_name: spacematrix-notification-service
                    ports:
                    - "3004:3004"
                    environment:        
                    - PORT=3004
                    - MONGO_URI=mongodb://mongodb:27017/spacematrix  # Uses service name "mongodb" as hostname  
                    depends_on:
                    - mongodb
                    networks:
                    - spacematrix-net
                
                
                # Define a volume for MongoDB data persistence
                networks:
                spacematrix-net:
                    driver: bridge

                volumes:
                mongo_data: 



     build cmd: 
        docker-compose up --build -d

        docker-compose ps


        curl Commands for property-service (Port 3001)

        1. GET All Properties
            Bash
            curl -X GET http://localhost:3001/api/v1/properties

        2. POST (Create) a Property
            curl -X POST http://localhost:3001/api/v1/properties \
            -H "Content-Type: application/json" \
            -d '{"title": "Luxury Docker Apartment", "price": 850000, "location": "Tech Hub"}'

        Check Route Prefixes for the Other 3 Services:

            grep -rn "app.use" backend/*/src/




    ADMIN@DESKTOP-1M2QVFG MINGW64 /d/practice_projects/SpaceMatrix-Project (docker-automation)
                $ curl -X POST http://localhost:3001/api/v1/properties \
                -H "Content-Type: application/json" \
                -d '{"title": "Luxury Docker Apartment", "price": 850000, "location": "Tech Hub"}'
                {"error":"Property validation failed: totalMonthlyRent: Path `totalMonthlyRent` is required., rentPerSqFt: Path `rentPerSqFt` is required., totalArea: Path `totalArea` is required., propertyType: Path `propertyType` is required., description: Path `description` is required., name: Path `name` is required."}
        
        
    ADMIN@DESKTOP-1M2QVFG MINGW64 /d/practice_projects/SpaceMatrix-Project (docker-automation)
    
        
                $ grep -rn "app.use" backend/*/src/
                backend/analytics-service/src/index.js:9:app.use(cors());
                backend/analytics-service/src/index.js:10:app.use(express.json());
                backend/analytics-service/src/index.js:12:app.use('/api/v1/analytics', analyticsRoutes);
                backend/inquiry-service/src/index.js:8:app.use(cors());
                backend/inquiry-service/src/index.js:9:app.use(express.json());
                backend/inquiry-service/src/index.js:11:app.use('/api/v1/inquiries', inquiryRoutes);
                backend/notification-service/src/index.js:9:app.use(cors());
                backend/notification-service/src/index.js:10:app.use(express.json());
                backend/notification-service/src/index.js:12:app.use('/api/v1/notifications', notificationRoutes);
                backend/property-service/src/index.js:9:app.use(cors());
                backend/property-service/src/index.js:10:app.use(express.json());
                backend/property-service/src/index.js:12:app.use('/api/v1/properties', propertyRoutes);

                ADMIN@DESKTOP-1M2QVFG MINGW64 /d/practice_projects/SpaceMatrix-Project (docker-automation)