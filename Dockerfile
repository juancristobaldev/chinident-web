FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Aquí salvamos el conflicto de dependencias de React
RUN npm ci --legacy-peer-deps

COPY . .
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Fase 2: Ejecución
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiamos solo lo necesario para arrancar el servidor
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]