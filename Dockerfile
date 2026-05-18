# Estágio 1: Compilação do App React + Vite
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependências de forma otimizada
COPY package*.json ./
RUN npm ci

# Copiar arquivos do projeto e compilar para produção
COPY . .
RUN npm run build

# Estágio 2: Servidor Web Nginx de Produção para arquivos estáticos
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
