# 1. Use an official Node.js runtime as the base image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 5002

# 7. Define the command to run the app
CMD ["node", "server.js"]
