# Stage 1: Сборка React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Раздача статики через Nginx
FROM nginx:stable-alpine
# Копируем наш конфиг в папку конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Копируем билд приложения
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]