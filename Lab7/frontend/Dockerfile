# ============ DEPS ============
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json .

# RUN npm ci --only=production
# RUN npm install
RUN npm ci

# ============ BUILD ============
FROM node:20-alpine AS build 
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# ============ PRODUCTION ============
FROM nginx:alpine AS prd
WORKDIR /app

ARG BUILD_DATE
ARG VERSION
ARG NODE_ENV=production

LABEL   org.opencontainers.image.created=$BUILD_DATE \
        org.opencontainers.image.version=$VERSION \
        org.opencontainers.image.title="Frontend na lab6 chmurówek"

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/dist/ /usr/share/nginx/html
COPY /nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache wget

RUN touch /run/nginx.pid
RUN chown -R app:app    /etc/nginx/conf.d \ 
                        /var/cache/nginx  \
                        /run/nginx.pid

USER app

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]