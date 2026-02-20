FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/project-service
COPY services/project-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/project-service/ .

EXPOSE 3003

CMD ["npm", "start"]
