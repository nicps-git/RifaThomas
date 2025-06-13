# 🚀 Chá Rifa Thomas - Tema Astronauta

Um sistema completo para o chá de bebê do Thomas com tema espacial/astronauta, desenvolvido como uma rifa online interativa.

## 🌟 Sobre o Projeto

Este é um site de rifa especialmente criado para o **Chá de Bebê do Thomas** com o tema **Astronauta no Espaço**. O sistema permite que familiares e amigos participem comprando números da rifa e concorram a fraldas e prêmios em PIX.

### 🎯 Detalhes da Rifa

- **👶 Bebê**: Thomas
- **🚀 Tema**: Astronauta no Espaço  
- **🎯 Total de números**: 150 (001 a 150)
- **💰 Valor por número**: R$ 40,00
- **📅 Sorteio**: Data a ser definida pelo administrador
- **🎁 Prêmios por faixa**:
  - **1-30**: 1 Fralda P + chance PIX R$ 100,00
  - **31-100**: 1 Fralda M + chance PIX R$ 200,00  
  - **101-150**: 1 Fralda G + chance PIX R$ 100,00
- **🍼 Marcas de fralda**: Pampers, Huggies ou MamyPoko

### 🎯 Página Principal (`index.html`)
- **Design moderno e responsivo** - Funciona perfeitamente em desktop e mobile
- **Seleção visual de números** - Grid interativo com 1000 números
- **Sistema de filtros** - Visualizar números disponíveis, selecionados, vendidos
- **Busca de números** - Encontrar números específicos rapidamente
- **Formulário de participação** - Coleta de dados dos participantes
- **Contador regressivo** - Tempo restante até o sorteio
- **Informações em tempo real** - Estatísticas atualizadas automaticamente

### 🛠️ Painel Administrativo (`admin.html`)
- **Dashboard completo** - Estatísticas em tempo real da rifa
- **Gestão de participantes** - Lista completa com status e ações
- **Controle de números** - Marcar como vendido, reservado ou liberar
- **Sistema de sorteio** - Sorteio automático com animação
- **Exportação de dados** - Relatórios em CSV e JSON
- **Configurações** - Personalizar todos os aspectos da rifa

## 🚀 Como Usar

### Configuração Inicial

1. **Abra o arquivo `index.html`** em seu navegador
2. **Acesse o painel admin** clicando em "Admin" (senha: `admin123`)
3. **Configure a rifa** na seção "Configurações":
   - Número total de bilhetes
   - Preço por bilhete
   - Data do sorteio
   - Prêmios
   - Chave PIX

### Para Participantes

1. **Escolha os números** clicando na grade
2. **Preencha o formulário** com seus dados
3. **Efetue o pagamento** via PIX
4. **Envie o comprovante** pelo WhatsApp

### Para Administradores

1. **Acesse o painel admin** com a senha
2. **Monitore as vendas** no dashboard
3. **Gerencie participantes** na lista
4. **Configure a rifa** conforme necessário
5. **Realize o sorteio** quando chegou a hora

## 📱 Funcionalidades Detalhadas

### Sistema de Números
- **1000 números disponíveis** (configurável)
- **Estados visuais distintos**:
  - 🟢 Disponível - pode ser selecionado
  - 🔵 Selecionado - escolhido pelo usuário
  - 🔴 Vendido - já foi comprado
  - 🟡 Reservado - temporariamente bloqueado
- **Filtros inteligentes** para facilitar a visualização
- **Busca por número específico**

### Gestão de Participantes
- **Dados completos** coletados de forma segura
- **Validação de CPF** e email
- **Status automatizado**:
  - ✅ Confirmado - pagamento verificado
  - ⏳ Pendente - aguardando confirmação
  - ❌ Expirado - tempo limite ultrapassado

### Sistema de Sorteio
- **Sorteio totalmente automático**
- **Animação visual** do processo
- **3 prêmios** configuráveis
- **Lista de vencedores** com contato
- **Exportação dos resultados**

### Relatórios e Exportação
- **Relatório completo** em JSON
- **Lista de participantes** em CSV
- **Estatísticas em tempo real**
- **Dados para auditoria**

## 🔒 Segurança e Dados

### Armazenamento Local
- Todos os dados são salvos no navegador (localStorage)
- **Não há servidor** - funciona offline
- **Backup manual** através das exportações

### Autenticação
- Painel admin protegido por senha
- **Senha padrão**: `admin123` (altere no código)

### Privacidade
- **Dados sensíveis** tratados com cuidado
- **Validações** de CPF e email
- **Formatação automática** de telefone

## 🎨 Personalização

### Cores e Estilo
Edite o arquivo `styles.css` para personalizar:
- Cores do tema
- Fontes
- Espaçamentos
- Animações

### Configurações da Rifa
No painel admin ou editando `script.js`:
```javascript
const RIFA_CONFIG = {
    totalNumbers: 1000,      // Total de números
    ticketPrice: 10.00,      // Preço por bilhete
    drawDate: new Date('2025-12-31T20:00:00'),
    pixKey: 'seu@email.com'  // Chave PIX
};
```

### Prêmios
Personalize os prêmios no painel admin ou no código.

## 📊 Estatísticas

O sistema fornece automaticamente:
- **Números vendidos** vs total
- **Receita atual** em tempo real
- **Taxa de conversão**
- **Tempo restante** para o sorteio
- **Progresso visual** da venda

## 🔧 Problemas Comuns

### Dados não aparecem
- Verifique se o JavaScript está habilitado
- Limpe o cache do navegador
- Tente em modo privado

### Números não carregam
- Aguarde alguns segundos para carregar
- Atualize a página
- Verifique a conexão com a internet (para fontes)

### Painel admin não abre
- Verifique se digitou a senha correta: `admin123`
- Limpe o localStorage se necessário

## 🚀 Publicação Online

Para colocar o site no ar:

1. **Hospedagem gratuita**:
   - Netlify
   - Vercel
   - GitHub Pages

2. **Upload dos arquivos**:
   - `index.html`
   - `admin.html`
   - `styles.css`
   - `admin.css`
   - `script.js`
   - `admin.js`

3. **Configure o domínio** (opcional)

## 💡 Dicas de Uso

### Para Máxima Conversão
- **Configure prêmios atrativos**
- **Mantenha preços acessíveis**
- **Promova nas redes sociais**
- **Responda rapidamente** no WhatsApp

### Para Credibilidade
- **Mostre transparência** no processo
- **Publique comprovantes** dos prêmios
- **Mantenha contato ativo** com participantes
- **Documente todo o processo**

### Para Organização
- **Faça backup** dos dados regularmente
- **Exporte relatórios** periodicamente
- **Confirme pagamentos** rapidamente
- **Mantenha registro** de tudo

## 📞 Suporte

Para dúvidas ou melhorias:
- Edite os arquivos conforme sua necessidade
- Consulte a documentação do código
- Teste sempre antes de publicar

## ⚖️ Aspectos Legais

⚠️ **IMPORTANTE**: Verifique as leis locais sobre rifas e sorteios antes de usar este sistema. Algumas jurisdições exigem licenças específicas.

---

**Desenvolvido com ❤️ para facilitar a gestão de rifas online**
