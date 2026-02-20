FROM node:20-alpine

# Build context: ./server
# Precisamos de shared/ para os imports relativos (../../../../shared/...)

# 1. Dependências do shared
COPY shared/package*.json /app/shared/
RUN cd /app/shared && npm install --omit=dev

# 2. Dependências do serviço
WORKDIR /app/services/auth-service
COPY services/auth-service/package*.json ./
RUN npm install --omit=dev

# 3. Código-fonte
COPY shared/ /app/shared/
COPY services/auth-service/ .

EXPOSE 3001

CMD ["npm", "start"]
