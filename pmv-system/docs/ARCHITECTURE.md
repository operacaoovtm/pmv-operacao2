# Arquitetura do sistema PMV NOC

## Decisões de arquitetura

### ADR-001 — Abstração de controladora via PmvDriver
**Decisão**: toda comunicação com hardware passa pela interface `PmvDriver`.  
**Motivo**: permite trocar o protocolo (VNNOX → JT → NTCIP) sem alterar o resto do sistema.  
**Consequência**: novos drivers entram sem reescrever fila, pipeline ou rotas.

### ADR-002 — Modo simulado (MockDriver) como padrão sem credenciais
**Decisão**: `MOCK_MODE=true` (ou ausência de AK/AS) ativa o `MockDriver` automaticamente.  
**Motivo**: desenvolvimento, testes e demonstrações sem hardware ou conta VNNOX.

### ADR-003 — Snapshot como contrato de dados entre editor e backend
**Decisão**: o editor exporta `{ w, h, mode, px: [[x,y,color],...] }` (snapshot).  
**Motivo**: formato simples, sem dependência de framework, fácil de renderizar com pngjs.  
**Consequência**: qualquer fonte de conteúdo (editor, API externa, script) usa o mesmo contrato.

### ADR-004 — Fila com retry e limitador de taxa no backend
**Decisão**: toda publicação passa pela `JobQueue` antes de tocar a API VNNOX.  
**Motivo**: VNNOX limita a 15 req/s e 1500 req/h. Sem fila, um burst causaria ban de IP.

### ADR-005 — Estado em memória (store.js) substituível por banco
**Decisão**: `store.js` usa objetos JS simples.  
**Motivo**: simplifica o MVP. A interface (`findDevice`, `log`, `store.devices`) não muda.  
**Consequência**: troca por PostgreSQL/Redis sem alterar server.js, poller.js ou pipeline.js.

## Componentes

```
┌─────────────────────────────────┐
│         FRONTEND (React)        │
│  PMV-Suite.jsx                  │
│  ├─ PMV-NOC.jsx  (14 módulos)   │
│  └─ EditorPMV.jsx (editor LED)  │
└──────────────┬──────────────────┘
               │ HTTP /api/*
               │ (vite proxy em dev, nginx em prod)
┌──────────────▼──────────────────┐
│         BACKEND (Node/Express)  │
│  server.js ──► queue.js         │
│            ──► pipeline.js      │
│               ├─ render.js      │
│               └─ driver.js      │
│                  ├─ VnnoxDriver │
│                  ├─ MockDriver  │
│                  ├─ JtDriver    │ ← stub
│                  └─ NtcipDriver │ ← stub
│  poller.js (intervalo POLL_MS)  │
│  store.js  (estado + logs)      │
└──────────────┬──────────────────┘
               │ HTTPS + AK/AS auth
┌──────────────▼──────────────────┐
│    VNNOX / NovaCloud (nuvem)    │
│  ├─ Media: publicação           │
│  └─ Care:  monitoramento        │
└──────────────┬──────────────────┘
               │ 4G / Ethernet / Wi-Fi
┌──────────────▼──────────────────┐
│    NovaStar TB40 (hardware)     │
│    Modo assíncrono              │
└──────────────┬──────────────────┘
               │ Cabo de dados LED
┌──────────────▼──────────────────┐
│    Painel LED (PMV)             │
└─────────────────────────────────┘
```

## Fluxos principais

### Publicação normal
1. Usuário monta mensagem no editor (canvas de pixels)
2. `snapshot()` serializa o estado visual `{w, h, px[]}`
3. `POST /api/publish` enfileira o job
4. `pipeline.js`: renderiza PNG com `pngjs` → chama `driver.publish()`
5. `VnnoxDriver`: upload de mídia → cria solution → publica para player(s)
6. TB40 baixa a solution, grava no storage e exibe

### Emergência (preempção)
1. `POST /api/emergency` → enfileira com `priority: 'emergency'`
2. `VnnoxDriver.emergency()` → `media.emergencyInsert()` → TB40 interrompe playlist
3. `POST /api/emergency/cancel` → `media.cancelEmergency()` → ciclo normal retorna

### Monitoramento (polling)
- A cada `POLL_MS` ms, `poller.js` chama `driver.listDevices()` + `driver.alarms()`
- Derivação de alertas: temperatura > 65°C, sinal < 25%, memória > 85%
- Watchdog: sem `lastSeen` atualizado por 4× `POLL_MS` → marca `offline`
