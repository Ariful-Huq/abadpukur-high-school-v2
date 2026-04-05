# abadpukur-high-school/frontend/Dockerfile
# Stage 1 — Build React app
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 — Serve static files via Nginx
FROM nginx:stable-alpine

# Copy built files from Vite's 'dist' folder
COPY --from=build /app/dist /usr/share/nginx/html

# Simple SPA config — main Nginx handles proxying
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]