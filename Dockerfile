# Imagen base de Node.js para construir la app
FROM node:16-alpine AS build

# Configurar memoria máxima para Node.js
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Crear directorio de trabajo
WORKDIR /app

# Instalar dependencias primero (aprovecha la cache de Docker: solo se reinstala
# cuando cambia package*.json, no en cada cambio de código fuente)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copiar el resto del proyecto y construir la aplicación
COPY . .
RUN npm run build --prod

# Imagen ligera de Nginx para servir el contenido
FROM nginx:alpine

# Copiar los archivos de compilación de Angular desde el contenedor de construcción
COPY --from=build /app/dist/maestria-computacion-front /usr/share/nginx/html

# Copiar el archivo de plantilla para las variables dinámicas
COPY ./src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js

# Copiar el script de inicialización que reemplaza las variables de entorno
COPY ./init.sh /init.sh
# Normalizar saltos de línea (por si el archivo se edito/guardo en Windows con CRLF,
# lo cual rompe el shebang "#!/bin/sh" al ejecutarlo en el contenedor Linux)
RUN sed -i 's/\r$//' /init.sh && chmod +x /init.sh

# Configurar el script de entrada
ENTRYPOINT ["/init.sh"]

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
