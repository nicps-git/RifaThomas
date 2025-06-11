# 🐳 Deploy com Docker - Rifa Thomas

## 🚀 Opções de Deploy Docker

### 1. 🏠 Deploy Local (Desenvolvimento)

```powershell
# Build da imagem
docker build -t rifa-thomas .

# Executar container
docker run -d -p 3000:80 --name rifa-thomas-app rifa-thomas

# Acessar: http://localhost:3000
```

### 2. 🔄 Deploy com Docker Compose

```powershell
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### 3. ☁️ Deploy em Cloud (VPS/Server)

#### Opção A: DigitalOcean/Vultr/Linode
```bash
# 1. Conectar no servidor
ssh root@SEU_IP

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Fazer upload dos arquivos
scp -r . root@SEU_IP:/opt/rifa-thomas/

# 4. Deploy
cd /opt/rifa-thomas
docker-compose up -d
```

#### Opção B: AWS ECS/Azure Container/Google Cloud Run
```powershell
# Build e push para registry
docker build -t rifa-thomas .
docker tag rifa-thomas:latest SEU_REGISTRY/rifa-thomas:latest
docker push SEU_REGISTRY/rifa-thomas:latest
```

### 4. 🌐 Deploy com SSL (Produção)

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  rifa-thomas:
    image: rifa-thomas:latest
    container_name: rifa-thomas-prod
    restart: always
    
  nginx-ssl:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - rifa-thomas
```

## ⚡ Deploy Rápido - 5 Minutos

### Passo 1: Verificar Docker
```powershell
# Verificar se Docker está instalado
docker --version
docker-compose --version

# Se não estiver instalado:
# https://docs.docker.com/desktop/install/windows-install/
```

### Passo 2: Build e Deploy
```powershell
# No diretório da rifa
Set-Location "d:\OneDrive - Instituto Nordeste Cidadania\Documents\Pessoal\Rifa"

# Build da imagem
docker build -t rifa-thomas .

# Executar
docker run -d -p 3000:80 --name rifa-thomas-app rifa-thomas

# Verificar se está rodando
docker ps
```

### Passo 3: Testar
```powershell
# Abrir navegador
Start-Process "http://localhost:3000"

# Ver logs se necessário
docker logs rifa-thomas-app
```

## 🌍 Providers de Cloud Gratuitos

### 1. **Railway** (Recomendado)
```powershell
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway deploy
```

### 2. **Render**
1. Conectar GitHub
2. Selecionar repositório
3. Deploy automático

### 3. **Heroku Container**
```powershell
# Login Heroku
heroku login
heroku container:login

# Push container
heroku container:push web -a rifa-thomas
heroku container:release web -a rifa-thomas
```

### 4. **Google Cloud Run**
```powershell
# Build e push
docker build -t gcr.io/SEU_PROJECT/rifa-thomas .
docker push gcr.io/SEU_PROJECT/rifa-thomas

# Deploy
gcloud run deploy --image gcr.io/SEU_PROJECT/rifa-thomas --platform managed
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers
```powershell
# Ver containers rodando
docker ps

# Parar container
docker stop rifa-thomas-app

# Remover container
docker rm rifa-thomas-app

# Ver logs
docker logs -f rifa-thomas-app

# Executar bash no container
docker exec -it rifa-thomas-app sh
```

### Build e Otimização
```powershell
# Build sem cache
docker build --no-cache -t rifa-thomas .

# Ver tamanho da imagem
docker images rifa-thomas

# Limpeza de imagens antigas
docker image prune -f
```

### Troubleshooting
```powershell
# Verificar saúde do container
docker exec rifa-thomas-app curl -f http://localhost/ || echo "Erro"

# Ver configuração Nginx
docker exec rifa-thomas-app cat /etc/nginx/nginx.conf

# Reiniciar Nginx
docker exec rifa-thomas-app nginx -s reload
```

## 📊 Monitoramento

### Logs em Tempo Real
```powershell
# Logs da aplicação
docker logs -f rifa-thomas-app

# Logs do Nginx
docker exec rifa-thomas-app tail -f /var/log/nginx/access.log
```

### Métricas Básicas
```powershell
# Uso de recursos
docker stats rifa-thomas-app

# Processos no container
docker exec rifa-thomas-app ps aux
```

## 🎯 Vantagens do Deploy Docker

- ✅ **Isolamento completo** do ambiente
- ✅ **Portabilidade total** (roda em qualquer lugar)
- ✅ **Escalabilidade** fácil
- ✅ **Rollback rápido** em caso de problemas
- ✅ **Nginx otimizado** para produção
- ✅ **SSL/HTTPS** fácil de configurar
- ✅ **Sem dependências** do sistema host

---

## 🚀 Deploy Recomendado AGORA

Para resolver o problema de quota Firebase:

```powershell
# 1. Build local
docker build -t rifa-thomas .

# 2. Testar local
docker run -d -p 3000:80 --name rifa-thomas-app rifa-thomas

# 3. Verificar funcionamento
Start-Process "http://localhost:3000"

# 4. Deploy na cloud (Railway/Render)
# Seguir instruções específicas do provider
```

**🎉 Rifa Thomas online em 5 minutos com Docker! 🐳👶🚀**
