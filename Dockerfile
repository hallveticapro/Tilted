FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS build

WORKDIR /app

ARG VITE_PUBLIC_URL
ARG VITE_SHARE_IMAGE_URL
ENV VITE_PUBLIC_URL=${VITE_PUBLIC_URL}
ENV VITE_SHARE_IMAGE_URL=${VITE_SHARE_IMAGE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:37f356a5eba5d187365b4f59cd6cc29f1f922ad18146d554b576a80983377e6a

COPY --chown=nginx:nginx deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx deploy/40-runtime-metadata.sh /docker-entrypoint.d/40-runtime-metadata.sh
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
