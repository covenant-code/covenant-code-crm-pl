# ─── Stage 1: Build ──────────────────────────────────────────────────────────
# node:22-alpine — тот же подход что в gateway/service (Alpine = минимальный образ)
FROM node:22-alpine AS builder

WORKDIR /app

# Сначала копируем только package*.json — Docker кэширует этот слой.
# Если код изменился, но зависимости нет — npm ci не запускается повторно.
# Аналогия: Maven кэширует .m2 между сборками.
COPY package*.json ./
RUN npm ci

# Копируем весь исходный код
COPY . .

# VITE_API_BASE_URL намеренно пуст — в production nginx проксирует /api/** на gateway.
# Vite "запекает" переменную в JS-бандл во время сборки (в отличие от Spring,
# где переменные читаются при старте приложения).
ARG VITE_API_BASE_URL=""
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
# Берём только nginx:alpine — никакого node, никаких node_modules в финальном образе
FROM nginx:alpine

# Копируем собранную статику из stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx официально поддерживает шаблоны с envsubst:
# файлы из /etc/nginx/templates/*.template автоматически обрабатываются
# при старте контейнера — переменные окружения подставляются в конфиг.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
