# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the transaction service runs on
EXPOSE 5001

# Define the command to run the app
CMD ["node", "server.js"]
