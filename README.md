# 🕒 PONTO & ESTOQUE — Sistema Integrado de Frequência, Banco de Horas & Materiais

Um sistema web corporativo completo, moderno e responsivo para gestão de ponto eletrônico, acúmulo de banco de horas (CLT 8h48m/dia com 1h de almoço) e controle de movimentações de estoque.

---

## 🚀 Funcionalidades Principais

1. **Jornada de Trabalho CLT (8h 48min por dia)**:
   - Carga diária padrão calculada em **8 horas e 48 minutos** (8.8h = 528 minutos) com **1 hora de almoço**.
   - Cálculo automático de horas trabalhadas, horas extras (+), atrasos (-) e abonos/atestados (+).

2. **Banco de Horas com Carregamento Automático**:
   - Acúmulo e transferência automática de saldos negativos (atrasos) e positivos (extras) para o **mês seguinte**.
   - Relatório consolidado ("Folha de Ponto Individual") exibindo:
     - Saldo do Mês Atual
     - Saldo Anterior Acumulado
     - Saldo Total Consolidado Carregado para o Mês Seguinte.

3. **Sistema de Login & Modo Portfólio / Demonstração**:
   - Autenticação por e-mail e senha para clientes/supervisores.
   - **Modo Portfólio (Demonstração em 1 Clique)**: Botão direto na tela de login para visitantes navegarem e avaliarem o projeto com dados de demonstração sem necessitar de credenciais.

4. **Gerenciamento de Estoque Integrado**:
   - Cadastro de produtos/EPIs, controle de entradas e saídas e cálculo automático do saldo em estoque.

5. **Suporte Dual (Local Storage + Supabase)**:
   - Funciona 100% offline em modo de demonstração/local storage.
   - Conexão nativa com **Supabase** via variáveis de ambiente ou modal de configuração em tempo de execução.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, Vite, Lucide React (ícones), CSS3 customizado.
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Realtime API).
- **Exportação**: HTML2Canvas & jsPDF (Impressão e download de folhas de ponto em PDF/CSV).

---

## 📋 Passo a Passo: Enviar para o Supabase e Hospedar na Vercel

### 1️⃣ Criando e Configurando o Banco no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login (ou crie uma conta gratuita).
2. Clique em **"New Project"** (Novo Projeto), defina o nome do projeto (ex: `ponto-estoque`), crie uma senha forte para o banco e escolha a região (ex: *South America / São Paulo*).
3. Após a criação do projeto (cerca de 2 minutos):
   - No menu lateral esquerdo, vá em **SQL Editor**.
   - Clique em **"New Query"**.
   - Abra o arquivo `schema.sql` deste repositório, copie todo o conteúdo e cole no SQL Editor.
   - Clique no botão **"Run"** (Executar) no canto inferior direito.
   *(Isso criará automaticamente todas as tabelas: `employees`, `time_records`, `allowances`, `products`, `stock_movements`, com índices, permissões e dados de demonstração!)*
4. Para obter as chaves de conexão:
   - No menu lateral esquerdo do Supabase, vá em **Project Settings** (ícone de engrenagem) ➡️ **API**.
   - Copie a **Project URL** (ex: `https://xxxx.supabase.co`).
   - Copie a **anon public key** (`eyJhbGci...`).

---

### 2️⃣ Subindo o Código para o GitHub

1. Certifique-se de que o Git está inicializado na pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "feat: Sistema de Ponto 8h48m, Banco de Horas, Modo Portfolio e Supabase"
   ```
2. Acesse [https://github.com](https://github.com) e crie um novo repositório (ex: `ponto-estoque-app`).
3. Conecte seu repositório local ao GitHub e faça o push:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/ponto-estoque-app.git
   git branch -M main
   git push -u origin main
   ```

---

### 3️⃣ Hospedando o Projeto na Vercel

1. Acesse [https://vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. No painel da Vercel, clique em **"Add New..."** ➡️ **"Project"**.
3. Selecione o repositório `ponto-estoque-app` que você acabou de enviar para o GitHub e clique em **"Import"**.
4. Na tela de configuração do deploy (**Configure Project**):
   - **Framework Preset**: Vite (detectado automaticamente).
   - Abra a seção **Environment Variables** (Variáveis de Ambiente).
   - Adicione as duas variáveis obtidas no Supabase:
     - `VITE_SUPABASE_URL` = `https://seu-projeto.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sua-chave-anon-publica-aqui`
5. Clique no botão **"Deploy"**.
6. Em cerca de 1 minuto, seu projeto estará online com HTTPS gratuito e totalmente integrado ao Supabase!

---

## 🔑 Credenciais de Teste / Demonstração

- **Administrador**: `admin@ponto.com` | **Senha**: `123456`
- **Acesso Portfólio**: Basta clicar no botão **"💼 Acessar Modo Portfólio (Demonstração)"** na tela inicial de login.
