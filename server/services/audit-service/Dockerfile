FROM node:20-alpine

# Build context: ./server
# audit-service usa MongoDB (Mongoose) — não depende do shared/Sequelize factory
# mas incluímos shared para uso futuro (AppError, logger, etc.)

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/audit-service
COPY services/audit-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/audit-service/ .

EXPOSE 3010

CMD ["npm", "start"]
