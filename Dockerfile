# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Копируем package.json, tsconfig и prisma.config.ts
COPY package*.json tsconfig.json prisma.config.ts ./
COPY src ./src
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install
COPY .env ./

# Копируем билд и Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma.config.ts ./  
COPY .env ./

EXPOSE 3000
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

CMD ["sh", "./entrypoint.sh"]