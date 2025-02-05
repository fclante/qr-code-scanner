FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ .

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]