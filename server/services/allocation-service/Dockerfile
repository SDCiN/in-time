FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/allocation-service
COPY services/allocation-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/allocation-service/ .

EXPOSE 3005

CMD ["npm", "start"]
