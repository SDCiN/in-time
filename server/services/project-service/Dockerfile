FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm ci --only=production

WORKDIR /app/services/project-service
COPY services/project-service/package*.json ./
RUN npm ci --only=production

COPY shared/ /app/shared/
COPY services/project-service/ .

EXPOSE 3003

CMD ["npm", "start"]
