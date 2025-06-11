# ✅ Checklist Firebase - Rifa Thomas

## 🔧 Configuração Inicial

### Pré-requisitos
- [ ] Node.js instalado (`node --version`)
- [ ] Firebase CLI instalado (`firebase --version`)
- [ ] Conta Google criada
- [ ] Projeto Firebase criado

### Configuração do Projeto Firebase

#### 1. Console Firebase
- [ ] Projeto "rifa-cha-thomas" criado
- [ ] Authentication habilitado:
  - [ ] Email/Password ativado
  - [ ] Login anônimo ativado
- [ ] Firestore Database criado
- [ ] Regras de segurança configuradas

#### 2. Configuração Local
- [ ] `firebase-config.js` com credenciais corretas
- [ ] `firebase login` executado
- [ ] `firebase init` configurado

## 🧪 Testes de Funcionalidade

### Frontend Principal (`index.html`)
- [ ] Página carrega sem erros
- [ ] Números são exibidos corretamente
- [ ] Seleção de números funciona
- [ ] Formulário de compra funciona
- [ ] Modal de pagamento abre
- [ ] Informações PIX exibidas
- [ ] Opção doação de fraldas funciona

### Sincronização Tempo Real
- [ ] Números vendidos aparecem em tempo real
- [ ] Múltiplas abas sincronizam
- [ ] Estado persiste após refresh

### Painel Administrativo (`admin.html`)
- [ ] Login de admin funciona
- [ ] Lista de compras carrega
- [ ] Filtros por status funcionam
- [ ] Botões confirmar/rejeitar funcionam
- [ ] Dados atualizam em tempo real

## 🔐 Segurança

### Autenticação
- [ ] Login anônimo funciona
- [ ] Login admin funciona
- [ ] Proteção de rotas admin
- [ ] Logout funciona

### Firestore Rules
- [ ] Leitura pública de compras
- [ ] Escrita protegida
- [ ] Admin protegido por autenticação
- [ ] Config protegida

## 🚀 Deploy

### Hospedagem
- [ ] `firebase deploy` funciona
- [ ] Site público acessível
- [ ] Todas as páginas funcionam online
- [ ] SSL configurado

### Monitoramento
- [ ] Console Firebase mostra dados
- [ ] Logs de erro configurados
- [ ] Analytics funcionando (opcional)

## 🐛 Debugging

### Erros Comuns
- [ ] Console do navegador sem erros
- [ ] Network tab mostra requests corretos
- [ ] Firebase imports carregando
- [ ] Configuração de API keys correta

### Performance
- [ ] Página carrega rapidamente
- [ ] Sync em tempo real responsivo
- [ ] Mobile friendly

## 📱 Dispositivos

### Teste em Diferentes Telas
- [ ] Desktop funciona
- [ ] Tablet funciona  
- [ ] Mobile funciona
- [ ] Layout responsivo

### Navegadores
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🎯 Funcionalidades Específicas

### Sistema de Rifa
- [ ] 150 números disponíveis
- [ ] Preço R$ 40,00 exibido
- [ ] Data sorteio: 11/07/2025 16h
- [ ] Prêmios por faixa corretos
- [ ] PIX: R$ 100,00 e R$ 200,00

### Pagamento/Doação
- [ ] Opção PIX funciona
- [ ] Opção doação fraldas funciona
- [ ] Marcas sugeridas: Pampers, Huggies, MamyPoko
- [ ] Informações de contato corretas

## 📊 Dados de Produção

### Backup
- [ ] Export de dados configurado
- [ ] Backup automático ativo
- [ ] Recovery testado

### Escalabilidade
- [ ] Firestore quota suficiente
- [ ] Hosting quota suficiente
- [ ] Performance monitorada

---

## 🆘 Problemas Comuns

### Firebase não carrega
1. Verificar console do navegador
2. Verificar `firebase-config.js`
3. Verificar regras Firestore
4. Verificar autenticação

### Sincronização falha
1. Verificar conexão internet
2. Verificar regras Firestore
3. Verificar listeners configurados
4. Refresh do navegador

### Admin não funciona
1. Verificar se conta admin existe
2. Verificar login correto
3. Verificar regras admin
4. Criar nova conta admin se necessário

---

✅ **Projeto pronto quando todos os itens estiverem marcados!**
