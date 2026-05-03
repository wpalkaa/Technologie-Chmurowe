FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json .

# RUN npm ci --only=production

RUN npm install

COPY . .

RUN npm run build

# ==========

FROM nginx:alpine
WORKDIR /app

COPY --from=deps /app/dist/ /usr/share/nginx/html
COPY /nginx.conf /etc/nginx/conf.d/default.conf