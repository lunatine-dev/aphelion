# Use official Node.js image
FROM node:22

# Create app directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the app source
COPY . .

# Run the app
CMD ["npm", "run", "start"]
