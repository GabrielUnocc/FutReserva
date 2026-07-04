FROM node:20-alpine

WORKDIR /app

# Copia manifesto de dependências primeiro (melhor cache)
COPY package*.json ./

RUN npm install

# Copia o restante do código
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "src/server.js"]
