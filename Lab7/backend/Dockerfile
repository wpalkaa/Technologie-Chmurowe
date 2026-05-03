FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

# ============ test ============
FROM deps AS test
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

RUN npm test

# ============ production ============

FROM node:20-alpine AS production
WORKDIR /app

ARG BUILD_DATE
ARG VERSION
ARG NODE_ENV=production

LABEL   org.opencontainers.image.created=$BUILD_DATE \
        org.opencontainers.image.version=$VERSION \
        org.opencontainers.image.title="Backend na lab6 chmurówek"

RUN apk add --no-cache wget

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps --chown=app:app /app/node_modules ./node_modules

COPY --chown=app:app . .

USER app
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]