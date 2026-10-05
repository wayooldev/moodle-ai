# Build from repo root:
#   docker build -f apps/mcp/Dockerfile -t ghcr.io/<org>/moodle-ai-mcp:latest .
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/db/package.json ./packages/db/
COPY apps/mcp/package.json ./apps/mcp/
RUN npm install --omit=dev -w @moodle-ai/mcp -w @moodle-ai/db

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY packages/db ./packages/db
COPY apps/mcp ./apps/mcp
USER node
EXPOSE 3000
WORKDIR /app/apps/mcp
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/index.js"]
