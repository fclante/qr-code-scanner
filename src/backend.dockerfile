FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY backend/ .
COPY backend/.env .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]