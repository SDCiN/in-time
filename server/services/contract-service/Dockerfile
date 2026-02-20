FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/contract-service
COPY services/contract-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/contract-service/ .

EXPOSE 3006

CMD ["npm", "start"]
