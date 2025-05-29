FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx tsc --project ./tsconfig.json

FROM node:20-alpine AS production
RUN apk add --no-cache tini
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN chown -R mcp:nodejs /app
USER mcp

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]

LABEL org.opencontainers.image.title="Moodle MCP Server"
LABEL org.opencontainers.image.description="Model Context Protocol server for Moodle Web Service API"
LABEL org.opencontainers.image.version="0.1.0"
LABEL org.opencontainers.image.authors="moodle-mcp contributors"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/yourusername/moodle-mcp" 