# 🐳 Dockerfile - Rifa Chá Thomas
# Imagem otimizada para produção com Nginx

# Estágio 1: Build (se necessário)
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./

# Instalar dependências (se houver)
RUN npm ci --only=production 2>/dev/null || echo "Sem package-lock.json, continuando..."

# Copiar código fonte
COPY . .

# Limpeza de arquivos desnecessários
RUN rm -rf node_modules \
    && rm -f package*.json \
    && rm -f *.md \
    && rm -f *.ps1 \
    && rm -rf .git \
    && rm -rf dataconnect* \
    && rm -rf functions

# Estágio 2: Produção com Nginx
FROM nginx:alpine

# Metadados da imagem
LABEL maintainer="Rifa Thomas <contato@charifa.com>"
LABEL description="Sistema de Rifa Online - Chá de Bebê Thomas"
LABEL version="2.0.0"

# Copiar arquivos estáticos do build
COPY --from=builder /app/*.html /usr/share/nginx/html/
COPY --from=builder /app/*.css /usr/share/nginx/html/
COPY --from=builder /app/*.js /usr/share/nginx/html/

# Configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Criar diretório para logs
RUN mkdir -p /var/log/nginx

# Expor porta 80
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
