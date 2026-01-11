# Билд стадии
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Копируем package.json и устанавливаем зависимости
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Копируем исходный код и собираем
COPY . .
RUN npx prisma generate
RUN yarn build

RUN chmod +x entry.sh

# Открываем порт
EXPOSE 3000

# Запускаем приложение
ENTRYPOINT [ "./entry.sh" ]