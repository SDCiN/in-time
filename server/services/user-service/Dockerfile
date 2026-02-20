FROM node:18-alpine

# Build context: ./server
# shared/ é necessário para imports relativos (../../../../shared/...)

# 1. Dependências do shared
COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

# 2. Dependências do serviço
WORKDIR /app/services/user-service
COPY services/user-service/package*.json ./
RUN npm install --omit=dev

# 3. Código-fonte
COPY shared/ /app/shared/
COPY services/user-service/ .

EXPOSE 3002

CMD ["npm", "start"]
