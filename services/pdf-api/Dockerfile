FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY packages/ packages/
COPY services/pdf-api/ services/pdf-api/

RUN npm install
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/pdf-tools
RUN npm run build --workspace=services/pdf-api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/pdf-tools/dist ./packages/pdf-tools/dist
COPY --from=builder /app/packages/pdf-tools/package.json ./packages/pdf-tools/
COPY --from=builder /app/services/pdf-api/dist ./services/pdf-api/dist
COPY --from=builder /app/services/pdf-api/package.json ./services/pdf-api/

EXPOSE 8080
CMD ["node", "services/pdf-api/dist/index.js"]
