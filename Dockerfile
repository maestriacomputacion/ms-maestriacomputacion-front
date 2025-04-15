# Imagen base de Node.js para construir la app
FROM node:16 AS build

# Configurar memoria máxima para Node.js
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Crear directorio de trabajo y copiar archivos del proyecto
WORKDIR /app
COPY . .

# Instalar dependencias y construir la aplicación
RUN npm install
RUN npm run build --prod

# Imagen ligera de Nginx para servir el contenido
FROM nginx:alpine

# Copiar los archivos de compilación de Angular desde el contenedor de construcción
COPY --from=build /app/dist/maestria-computacion-front /usr/share/nginx/html

# Copiar el archivo de plantilla para las variables dinámicas
COPY ./src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js

# Copiar el script de inicialización que reemplaza las variables de entorno
COPY ./init.sh /init.sh
RUN chmod +x /init.sh

# Configurar el script de entrada
ENTRYPOINT ["/init.sh"]

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
