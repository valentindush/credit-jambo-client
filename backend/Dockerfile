FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and configuration files
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build the application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "dist/src/main.js"]

