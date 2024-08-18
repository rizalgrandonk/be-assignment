# Step 1: Use the official Node.js image as the base image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json files
COPY package*.json ./

COPY prisma ./prisma/

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the port on which the app will run
EXPOSE 3000

# Step 7: Define the command to start the app
CMD ["npm", "run", "start"]