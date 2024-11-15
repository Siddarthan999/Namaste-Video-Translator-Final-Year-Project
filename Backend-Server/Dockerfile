# Step 1: Use an official Node.js image as a base image
FROM node:18

# Step 2: Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 5: Install Node.js dependencies
RUN npm install

# Step 6: Copy the rest of the application code
COPY . .

# Step 7: Expose the port the app runs on
EXPOSE 5000

# Step 8: Start the Node.js server
CMD ["npm", "start"]
