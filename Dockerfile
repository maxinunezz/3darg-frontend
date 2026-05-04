# 1. Usamos una imagen de Node ligera
FROM node:20-alpine

WORKDIR /app

# 2. Copiamos archivos de dependencias
COPY package*.json ./

# 3. Instalamos dependencias
RUN npm install

# 4. Copiamos el resto del código
COPY . .

# 5. Exponemos el puerto de Next.js (3000 por defecto)
EXPOSE 3000

# 6. Comando para desarrollo con hot-reload
CMD ["npm", "run", "dev"]