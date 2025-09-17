# Development-friendly React Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for dev server)
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ARG CI=false
ENV CI=$CI
ENV CHOKIDAR_USEPOLLING=true
ENV FAST_REFRESH=false

# Expose port 3000
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]