FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]