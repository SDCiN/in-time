FROM node:18-alpine

WORKDIR /app

# Build context: ./server
# O api-gateway não importa de shared/, então copiamos apenas seus próprios arquivos
COPY api-gateway/package*.json ./
RUN npm ci --only=production

COPY api-gateway/ .

EXPOSE 3000

CMD ["npm", "start"]
