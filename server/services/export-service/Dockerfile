FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm ci --only=production

WORKDIR /app/services/export-service
COPY services/export-service/package*.json ./
RUN npm ci --only=production

COPY shared/ /app/shared/
COPY services/export-service/ .

EXPOSE 3009

CMD ["npm", "start"]
