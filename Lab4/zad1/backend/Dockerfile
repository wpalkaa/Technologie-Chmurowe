FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json .

RUN npm ci --only=production


# =================

FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps --chown=app:app /app/node_modules ./node_modules

COPY --chown=app:app . .

USER app
EXPOSE 3000
# HEALTHCHECK --interval=30s --timeout=5s \
#     CMD wget -q00 http://localhost:3010/health || exit 1
CMD ["node", "server.js"]