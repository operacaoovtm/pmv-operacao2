# Mensagem de commit inicial sugerida

```
feat: sistema PMV NOC completo — editor LED + backend VNNOX + interface NOC

Implementação inicial do sistema de gestão de Painéis de Mensagem Variável (PMV)
com suporte a controladoras NovaStar TB40 via VNNOX / NovaCloud Open Platform.

## Frontend (React + Vite + Tailwind)

- PMV-Suite.jsx: aplicação unificada com editor integrado ao NOC
- EditorPMV.jsx: editor de conteúdo LED pixel a pixel
  - Grade dimensionada pela resolução real do painel (px)
  - Réguas, grade, zoom (3x–20x)
  - Ferramentas: seleção, caneta, borracha, linha, retângulo, texto, imagem
  - Fonte LED 5×7 clássica + fontes de sistema com tamanho/negrito
  - Placas de alerta vetoriais: setas (←→↓), X, triângulo, círculo
  - Importação de imagem com conversão threshold → LEDs
  - Camadas: ocultar, reordenar, duplicar, excluir
  - Modos: Âmbar / Vermelho (monocromático) / RGB full-color
  - Pré-visualização ao vivo ("Energizar painel")
  - Programação de playlist: duração, prioridade, transição, loop,
    janela de data/hora, dias da semana, linha do tempo 24h
  - Suporte a fontes via API (injeção por prioridade / preempção)
- PMV-NOC.jsx: 14 módulos operacionais
  - Dashboard: totais, gráficos (disponibilidade, publicações, erros), eventos 24h
  - Mapa geral: georreferenciamento com status por cores (verde/amarelo/vermelho/cinza)
  - Monitoramento: telemetria ao vivo com auto-refresh 2s, filtros por status
  - Central de alertas: temperatura, offline, sinal, memória, firmware antigo
  - Equipamentos: cadastro completo + tela individual (telemetria, erros, histórico)
  - Grupos: por zona, cliente, rodovia ou personalizado
  - Biblioteca: mensagens com categoria, prioridade, versão
  - Publicação & fila: por PMV / grupo / cidade / cliente / todos; imediata/agendada
  - Histórico de erros: filtros, observação técnica, exportação CSV
  - Logs & auditoria: registro imutável quem/quando/IP/antes/depois
  - Relatórios: disponibilidade, publicações, falhas — exportação PDF/Excel/CSV
  - Usuários & acesso: 5 papéis, JWT, 2FA, permissões por módulo/PMV/cliente
  - API VNNOX: console ao vivo, fila, retry, quadro de escalabilidade de protocolos

## Backend (Node.js + Express)

- server.js: API REST com 11 endpoints (publish, emergency, cancel, restart, brightness, power)
- vnnox.js: cliente VNNOX com autenticação AK/AS (SHA256), limitador 15req/s + 1500req/h
- driver.js: abstração PmvDriver; VnnoxDriver (real), MockDriver (simulado), stubs JT/NTCIP
- pipeline.js: render PNG → upload → publish em um fluxo coordenado
- queue.js: fila com concorrência configurável e retry com backoff exponencial (4 tentativas)
- render.js: snapshot {w, h, px[]} → PNG via pngjs (contrato de dados editor→backend)
- poller.js: polling de status/alarmes + watchdog de offline
- store.js: estado em memória substituível por banco sem alterar interfaces
- web/apiClient.js: cliente JS para integração frontend↔backend

## Infraestrutura / configuração

- Monorepo com package.json raiz (scripts: dev, build, install:all)
- Vite proxy em dev: /api/* → backend:4000 (sem CORS)
- MOCK_MODE: roda totalmente sem credenciais para desenvolvimento
- .gitignore: protege .env, node_modules, dist
- docs/ARCHITECTURE.md: ADRs, diagrama de componentes, fluxos

## Dados de exemplo

- 8 PMVs realistas (Manaus/AM): Torquato Tapajós, Ponte Rio Negro, BR-174,
  Centro Eduardo Ribeiro, Distrito Industrial, AM-010, Ponta Negra
- Telemetria simulada com variação realista e alertas derivados
- Eventos, logs de auditoria, histórico de publicações e erros pré-populados

Co-authored-by: PMV NOC System <pmv-noc@sistema.local>
```
