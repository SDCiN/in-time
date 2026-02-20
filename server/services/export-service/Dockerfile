FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/export-service
COPY services/export-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/export-service/ .

EXPOSE 3009

CMD ["npm", "start"]
