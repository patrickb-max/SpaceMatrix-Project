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