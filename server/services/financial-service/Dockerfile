FROM node:18-alpine

# Build context: ./server
# financial-service usa pool maior (max: 10, min: 2) para cálculos EVM

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/financial-service
COPY services/financial-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/financial-service/ .

EXPOSE 3007

CMD ["npm", "start"]
