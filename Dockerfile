# ─── Stage 1: Build Angular frontend ────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build -- --configuration production


# ─── Stage 2: Build TypeScript backend ───────────────────────────────────────
FROM node:22-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build


# ─── Stage 3: Frontend — nginx serving Angular SPA ───────────────────────────
FROM nginx:alpine AS frontend

COPY --from=frontend-builder /app/frontend/dist/demo/browser /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80


# ─── Stage 4: Backend — Node.js production server ────────────────────────────
FROM node:22-alpine AS backend

ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
