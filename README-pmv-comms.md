# PMV-comms — módulo de comunicação (NovaStar VNNOX / TB40)

Serviço que liga o sistema **PMV NOC + Editor** à placa: recebe o desenho do editor,
renderiza em imagem na resolução do painel, publica na nuvem **VNNOX (NovaCloud Open
Platform)** e traz de volta status/alarmes. Roda **simulado** sem credenciais e vira
**real** quando você preenche AK/AS.

## Como o conteúdo chega na placa
O TB40 é um player Android que toca em **modo assíncrono**: o conteúdo fica gravado no
player e roda sozinho. O fluxo é: editor → PNG na resolução → upload de mídia → cria
uma *solution* → publica para o(s) player(s). O TB40 (via cabo/Wi-Fi/4G) puxa a solution
da VNNOX e exibe. Emergência usa **Emergency Insertion** (preempção) com cancelamento.

## Rodar
    cp .env.example .env
    npm install
    npm start
Sobe em `http://localhost:4000` em modo SIMULADO. Teste:
    curl localhost:4000/api/health
    curl localhost:4000/api/devices

## Ir para o modo real
1. Crie conta na **NovaCloud Open Platform** (developer.vnnox.com) e pegue **AK/AS**.
2. Escolha o **nó regional** correto (ex.: open-us / open-eu) e ajuste `VNNOX_BASE_URL`.
3. **Vincule os players**: ao VNNOX **Media** (publicação) via ViPlex Express ou remotamente;
   ao VNNOX **Care** (monitoramento) via NovaLCT ou importando do Media.
4. Preencha `VNNOX_AK` e `VNNOX_AS` no `.env` (o modo real ativa sozinho).
5. Preencha o `playerId` real de cada PMV em `src/store.js` e confirme, na doc de cada
   endpoint, o **corpo exato** de upload/solution/publish (marcados com o número da API
   em `src/vnnox.js`). Mapeie o retorno de status/alarmes em `src/poller.js`.

## Endpoints do backend (o frontend consome)
`GET /api/health · /api/devices · /api/devices/:id · /api/alerts · /api/logs · /api/jobs/:id`
`POST /api/publish · /api/emergency · /api/emergency/cancel`
`POST /api/devices/:id/restart · /brightness · /power`

Ligue o editor com `web/apiClient.js` (o `snapshot()` do editor já é o payload de publish).

## Pontos importantes (checklist de operação)
- **Modo assíncrono**: PMV toca do storage; se cair a internet, continua exibindo o último
  conteúdo. Tenha uma **mensagem failsafe** padrão gravada.
- **Rede**: prioridade Cabo > Wi-Fi > 4G/5G (coexistem a partir do firmware V4.5.0). Em
  rodovia com 4G, cuide do **APN do SIM**, IP fixo/VPN e cobertura.
- **Autenticação**: AK/AS ficam **só no servidor** (nunca no navegador). Assinatura
  `SHA256(AS+Nonce+CurTime)` exige **relógio sincronizado** (NTP) — erro máx. 5 min.
- **Limites de taxa**: 15 req/s e 1500 req/h por IP. Já há **fila + limitador + retry**;
  agrupe alvos e use cache de status para não estourar.
- **Prioridade/emergência**: mensagem crítica entra por Emergency Insertion e preempta a
  playlist; ao encerrar/cancelar, volta o ciclo normal.
- **Agendamento**: janela de entrada/saída, dias e duração vão no `schedule`. Agende
  **brilho por horário** (dia/noite) — legibilidade e segurança em rodovia.
- **Telemetria/alarmes**: via VNNOX Care (status, temperatura, sinal, alarmes). O TB40 tem
  sensores de temperatura/umidade/brilho. Um **watchdog** marca offline sem heartbeat.
- **Confiabilidade de envio**: retry com backoff + confirmação de publicação; reconcilie o
  estado publicado com o desejado.
- **Segurança**: HTTPS, terminal authentication/playback verification do player, RBAC no
  NOC, trilha de auditoria.
- **Caminho local (sem nuvem)**: para sites sem internet, dá para publicar por LAN
  (ViPlex/local do Taurus) — implemente um `LanDriver` na mesma interface `PmvDriver`.
- **Escalabilidade**: `src/driver.js` isola o protocolo. VNNOX é um driver; JT/NTCIP/MQTT
  entram como novos drivers sem mexer no resto.
