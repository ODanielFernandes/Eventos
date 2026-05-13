# Eventos

Aplicação web para **gerenciamento de eventos**: cadastro e login de usuários, listagem e detalhes de eventos, criação/edição/exclusão pelo criador, e inscrição (participação) de usuários autenticados. O repositório segue uma arquitetura **monorepo** com API REST em **ASP.NET Core** e interface em **React**.

---

## Descrição do projeto

O sistema permite:

- **Público:** listar eventos, ver detalhes e criar conta (`signup`).
- **Autenticado (JWT):** criar eventos, editar e excluir **apenas os próprios** eventos, inscrever-se ou cancelar inscrição em eventos.
- **Backend:** persistência em **SQLite**, autenticação JWT e endpoints REST.
- **Frontend:** SPA com rotas, tema escuro (Bootstrap 5) e comunicação com a API via **Fetch** (com proxy em desenvolvimento para evitar CORS).

---

## Tecnologias utilizadas

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | ASP.NET Core, C#, Entity Framework Core (SQLite), JWT Bearer, REST |
| **Frontend** | React, Vite, Bootstrap 5, Fetch API |
| **Banco** | SQLite (arquivo local gerado na primeira execução, conforme connection string) |

Ferramentas auxiliares: ESLint (frontend), `appsettings.json` / `launchSettings.json` (URLs e connection string da API).

---

## Instruções para execução do backend

### Pré-requisitos

- [.NET SDK](https://dotnet.microsoft.com/download) instalado (use a versão indicada em `TargetFramework` no arquivo `backend/API/RestApi.csproj`).

### Passos

1. Clone o repositório e entre na pasta do projeto da API:

   ```bash
   git clone https://github.com/ODanielFernandes/Eventos.git
   cd Eventos/backend/API
   ```

2. Restaure dependências e execute:

   ```bash
   dotnet restore
   dotnet run
   ```

3. A API sobe nas URLs definidas em `Properties/launchSettings.json` (perfil **RestApi**). No estado atual do repositório, o perfil expõe por exemplo:

   - **HTTPS:** `https://localhost:53311`
   - **HTTP:** `http://localhost:53312`

   Ajuste a porta se o arquivo for alterado localmente.

4. O arquivo SQLite é criado conforme a connection string em `appsettings.json` (chave `ConnectionStrings:DefaultConnection`; no repositório aparece como `Data Source=booking.db` na raiz de execução da API).

---

## Instruções para execução do frontend

### Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado) com `npm`.

### Passos

1. Na pasta do app React:

   ```bash
   cd Eventos/front/event
   npm install
   npm run dev
   ```

2. O Vite inicia o servidor de desenvolvimento (por padrão em `http://localhost:5173`). As chamadas à API usam caminhos relativos (`/events`, `/login`, etc.) e o **proxy** em `vite.config.js` encaminha para o backend.

3. Configure o alvo do proxy para coincidir com a porta **HTTP** da API (exemplo do repositório: `53312`):

   - Crie `front/event/.env.development` com:

     ```env
     VITE_DEV_PROXY_TARGET=http://localhost:53312
     ```

   - Se a API usar **HTTPS** local com certificado de desenvolvimento, use `https://localhost:PORTA` e mantenha no Vite `secure: false` no proxy, se já estiver configurado.

4. **Produção / build:**

   ```bash
   npm run build
   npm run preview
   ```

   Para apontar a API por URL absoluta, use `VITE_API_BASE_URL` (e configure CORS no backend para a origem do front).

---

## Estrutura do projeto

```text
Eventos/
├── README.md                 # Este arquivo
├── backend/
│   └── API/                  # Solução .NET (RestApi.sln / RestApi.csproj)
│       ├── Controllers/      # Endpoints REST
│       ├── Data/           # DbContext / EF Core
│       ├── DTOs/           # Contratos de entrada/saída
│       ├── Models/         # Entidades
│       ├── Repositories/   # Acesso a dados
│       ├── Services/       # Regras de negócio / integrações
│       ├── Program.cs      # Pipeline HTTP, JWT, CORS, etc.
│       ├── appsettings.json
│       └── Properties/
│           └── launchSettings.json
└── front/
    └── event/                # App React (Vite)
        ├── index.html
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── api/          # fetchWrapper, serviços HTTP
            ├── auth/       # token em memória, leitura de claims do JWT
            ├── components/ # Navbar, rotas protegidas
            ├── context/    # AuthContext
            ├── pages/      # Home, login, cadastro, detalhe, dashboard
            └── utils/
```

---

## Decisões arquiteturais

1. **Monorepo (`backend/` + `front/`):** facilita versionar contrato da API e interface juntos, com instruções únicas de clone e execução.

2. **API REST + SPA:** o backend não renderiza páginas; expõe JSON e o React consome os recursos. Isso separa claramente apresentação e domínio.

3. **SQLite:** banco em arquivo, simples para desenvolvimento e entrega acadêmica, sem dependência de servidor de banco separado.

4. **JWT para sessão na API:** o cliente envia o token no cabeçalho `Authorization` (conforme contrato combinado com o backend). A validação e as regras de autorização permanecem **no servidor**.

5. **Token só em memória no front:** o JWT não é gravado em `localStorage` / `sessionStorage`, reduzindo superfície para roubo via XSS persistente; a sessão acaba ao recarregar a página (aceitável para o escopo do projeto).

6. **Proxy do Vite em desenvolvimento:** o navegador fala com a mesma origem do front; o Vite repassa `/events`, `/login` e `/signup` para a API, evitando bloqueios de CORS no dia a dia do desenvolvimento.

7. **Camadas no backend (`Controllers` → `Services` → `Repositories`):** organiza HTTP, regras de negócio e persistência, facilitando testes e evolução.

8. **Edição/exclusão apenas pelo criador (UI):** o front compara o usuário do JWT com o criador do evento (ou flags enviadas pela API) para exibir ações; a **autorização definitiva** deve permanecer implementada na API.

---

