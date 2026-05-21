# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV npm_config_update_notifier=false

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
ARG DATABASE_URL=postgresql://lore_wiki:change-me@postgres:5432/lore_wiki?schema=public
ENV DATABASE_URL=$DATABASE_URL
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production-deps
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
USER node
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

FROM deps AS migrator
COPY . .
CMD ["npx", "prisma", "migrate", "deploy"]
