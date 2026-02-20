FROM node:18-alpine

# Build context: ./server

COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

WORKDIR /app/services/timesheet-service
COPY services/timesheet-service/package*.json ./
RUN npm install --omit=dev

COPY shared/ /app/shared/
COPY services/timesheet-service/ .

EXPOSE 3004

CMD ["npm", "start"]
