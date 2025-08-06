# Use Node.js 18 LTS Alpine for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies for node-gyp and other native modules
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies with npm ci for faster, reliable builds
RUN if [ -f "yarn.lock" ]; then yarn install --frozen-lockfile; \
    elif [ -f "package-lock.json" ]; then npm ci --silent; \
    else npm install --silent; fi

# Copy source code
COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactjs -u 1001

# Change ownership of the app directory
RUN chown -R reactjs:nodejs /app
USER reactjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the development server
CMD ["npm", "start"]