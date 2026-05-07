FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.js ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

RUN chmod +x ./scripts/docker-entrypoint.sh
RUN DATABASE_URL="postgresql://bio4dev:placeholder@localhost:5432/api_bio4dev" npx prisma generate
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["node", "dist/main"]
