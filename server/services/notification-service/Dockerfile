FROM node:20-alpine

# Build context: ./server
# notification-service usa Socket.io + Redis Pub/Sub (não depende de shared/Sequelize)

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/notification-service
COPY services/notification-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/notification-service/ .

EXPOSE 3008

CMD ["npm", "start"]
