FROM node:18-alpine

# Build context: ./server
# notification-service usa Socket.io + Redis Pub/Sub (não depende de shared/Sequelize)

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm ci --only=production

WORKDIR /app/services/notification-service
COPY services/notification-service/package*.json ./
RUN npm ci --only=production

COPY shared/ /app/shared/
COPY services/notification-service/ .

EXPOSE 3008

CMD ["npm", "start"]
