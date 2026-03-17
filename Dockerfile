FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN yarn install

FROM base AS builder
WORKDIR /app

COPY . .

RUN yarn prisma generate
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production
ENV PORT=8000

COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN yarn install --production=false

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated

EXPOSE 8000

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn seed && node dist/src/main.js"]