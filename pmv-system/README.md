# PMV NOC — Sistema de Gestão de Painéis de Mensagem Variável

Centro de operações (NOC) completo para gestão de PMVs com controladoras **NovaStar TB40**
integradas via **VNNOX / NovaCloud Open Platform**.

## Estrutura do repositório

```
pmv-system/
├── frontend/          # Interface web (React + Vite + Tailwind)
│   ├── src/
│   │   ├── PMV-Suite.jsx   ← aplicação principal (ponto de entrada)
│   │   ├── PMV-NOC.jsx     ← módulos do NOC (dashboard, mapa, etc.)
│   │   ├── EditorPMV.jsx   ← editor de conteúdo LED
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/           # Serviço de comunicação (Node.js + Express)
│   ├── src/
│   │   ├── server.js    ← ponto de entrada da API REST
│   │   ├── vnnox.js     ← cliente VNNOX (AK/AS auth, rate limit)
│   │   ├── driver.js    ← abstração de controladora (VNNOX, Mock, JT stub, NTCIP stub)
│   │   ├── pipeline.js  ← render PNG → upload → publish
│   │   ├── queue.js     ← fila com concorrência e retry
│   │   ├── poller.js    ← polling de status e watchdog
│   │   ├── render.js    ← snapshot do editor → PNG
│   │   ├── store.js     ← estado em memória (substituir por DB em produção)
│   │   └── config.js    ← variáveis de ambiente
│   ├── web/
│   │   └── apiClient.js ← cliente JS que o frontend usa para chamar o backend
│   ├── package.json
│   └── .env.example
│
├── docs/              ← documentação adicional (ADRs, diagramas, etc.)
├── .gitignore
├── package.json       ← scripts raiz: dev (ambos), build, install:all
└── README.md
```

## Pré-requisitos

- **Node.js ≥ 18** (recomendado 20 LTS)
- **npm ≥ 9**
- Conta na [NovaCloud Open Platform](https://developer-en.vnnox.com/) para o modo real
- Players **NovaStar TB40** vinculados ao VNNOX Media (publicação) e VNNOX Care (monitoramento)

## Instalação

```bash
git clone <url-do-repositorio>
cd pmv-system
npm run install:all
```

## Configuração

```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env:
#   VNNOX_AK=<seu AppKey ID>
#   VNNOX_AS=<seu AppKey Secret>
#   VNNOX_BASE_URL=https://open-us.vnnox.com   # confirme o nó regional
#   MOCK_MODE=false                             # true = simulado, sem credenciais

# Frontend
cp frontend/.env.example frontend/.env
# VITE_API_URL=http://localhost:4000  (ou URL de produção do backend)
```

> **Segurança**: `backend/.env` está no `.gitignore`. Nunca commite credenciais.

## Rodar em desenvolvimento

```bash
npm run dev          # sobe backend (porta 4000) + frontend (porta 3000) juntos
# ou separados:
npm run dev:backend
npm run dev:frontend
```

Frontend: http://localhost:3000  
Backend:  http://localhost:4000/api/health

## Build para produção

```bash
npm run build        # gera frontend/dist/
```
Sirva `frontend/dist/` com nginx/caddy e rode o backend com `node backend/src/server.js`
(ou `pm2 start backend/src/server.js --name pmv-backend`).

## Módulos da interface (sidebar)

| Módulo | Descrição |
|---|---|
| Dashboard | Totais, gráficos, alertas e eventos em tempo real |
| Mapa geral | Georreferenciamento com status por cores |
| Monitoramento | Telemetria ao vivo (auto-refresh 2s) |
| Central de alertas | Temperatura, offline, sinal, memória, firmware |
| Equipamentos | Cadastro completo + tela individual de dispositivo |
| Grupos | Zona Norte/Sul, Rodovias, personalizados |
| Editor de conteúdo | Grade de pixels, réguas, fontes LED, placas, imagem, camadas |
| Biblioteca | Mensagens por categoria, prioridade e versionamento |
| Publicação & fila | Por PMV, grupo, cidade, cliente ou todos; agendamento |
| Histórico de erros | Filtros, observação técnica, exportação CSV |
| Logs & auditoria | Registro imutável: quem/quando/IP/antes/depois |
| Relatórios | Disponibilidade, publicações, falhas — PDF/Excel/CSV |
| Usuários & acesso | 5 papéis, JWT, 2FA, permissões por módulo/PMV/cliente |
| API VNNOX | Console ao vivo, fila de envio, retry, escalabilidade |

## API do backend

```
GET  /api/health
GET  /api/devices
GET  /api/devices/:id
GET  /api/alerts
GET  /api/logs
GET  /api/jobs/:id

POST /api/publish           { snapshot, targets, schedule, priority, name }
POST /api/emergency         { snapshot, targets, name }
POST /api/emergency/cancel  { targets }

POST /api/devices/:id/restart
POST /api/devices/:id/brightness  { value: 0-100 }
POST /api/devices/:id/power       { on: true|false }
```

## Fluxo de publicação (ponta a ponta)

```
Editor (snapshot) → POST /api/publish
  → render.js: snapshot → PNG (resolução exata do painel)
  → queue.js: enfileira com concorrência e retry
  → driver.js (VnnoxDriver):
      1. media.uploadMedia(png)        → mediaId
      2. media.createSolution(...)     → solutionId
      3. media.publishSolution(...)    → TB40 recebe e grava
  → TB40 (modo assíncrono): exibe do storage, sem depender de conexão contínua
```

Emergência usa `media.emergencyInsert()` — preempta a playlist com prioridade imediata.  
`media.cancelEmergency()` encerra e devolve o ciclo normal.

## Autenticação VNNOX (AK/AS)

Cada requisição leva no header:
- `AppKey` — AK
- `Nonce` — string aleatória 8-64 chars
- `CurTime` — timestamp UTC em segundos
- `CheckSum` — `SHA256(AppSecret + Nonce + CurTime)`

O servidor exige que o relógio do cliente esteja a no máximo **5 minutos** do servidor.  
Configure NTP no host do backend.

## Limites de taxa (VNNOX)

- **15 req/s** por IP  
- **1500 req/h** por IP  

O módulo `queue.js` + `vnnox.js` já gerencia isso com fila, limitador e backoff exponencial.

## Expansão para outros protocolos

A classe `PmvDriver` em `backend/src/driver.js` é a interface de abstração.  
Stubs já existem para JT Series (`JtDriver`) e NTCIP 1203 (`NtcipDriver`).  
Para adicionar um novo protocolo: implemente os métodos da classe base e registre no `getDriver()`.

## Suporte a hardware

| Protocolo | Status |
|---|---|
| NovaStar TB Series (VNNOX Media) | ✅ Implementado |
| NovaStar VNNOX Care (monitoramento) | ✅ Implementado |
| NovaStar JT Series | 🔲 Stub (aguarda especificação) |
| NTCIP 1203 | 🔲 Stub (aguarda especificação) |
| MQTT | 🔲 Planejado |
| WebSocket (tempo real) | 🔲 Planejado |

## Checklist para ir ao ar (modo real)

- [ ] Criar conta na [NovaCloud Open Platform](https://developer-en.vnnox.com/)
- [ ] Obter AK/AS e confirmar nó regional (`open-us` / `open-eu` / etc.)
- [ ] Vincular cada TB40 ao **VNNOX Media** via ViPlex Express (publicação)
- [ ] Vincular cada TB40 ao **VNNOX Care** via NovaLCT (monitoramento)
- [ ] Preencher `playerId` real de cada PMV em `backend/src/store.js`
- [ ] Preencher `backend/.env` com AK, AS, BASE_URL e `MOCK_MODE=false`
- [ ] Confirmar corpo dos endpoints de upload/solution/publish na doc da API
- [ ] Mapear campos de status/alarmes em `backend/src/poller.js`
- [ ] Configurar NTP no host (tolerância de 5 min para a assinatura VNNOX)
- [ ] Gravar mensagem **failsafe** no storage do TB40 (exibe se perder rede)
- [ ] Configurar agendamento de **brilho** (dia/noite) por horário
- [ ] Habilitar HTTPS no backend (nginx/caddy como proxy reverso)
- [ ] Configurar PM2 ou systemd para manter o backend ativo
- [ ] Substituir `store.js` por banco de dados (PostgreSQL recomendado)

## Licença

Proprietário — uso interno. Todos os direitos reservados.
