FROM node:18-alpine

# Build context: ./server
# audit-service usa MongoDB (Mongoose) — não depende do shared/Sequelize factory
# mas incluímos shared para uso futuro (AppError, logger, etc.)

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm ci --only=production

WORKDIR /app/services/audit-service
COPY services/audit-service/package*.json ./
RUN npm ci --only=production

COPY shared/ /app/shared/
COPY services/audit-service/ .

EXPOSE 3010

CMD ["npm", "start"]
