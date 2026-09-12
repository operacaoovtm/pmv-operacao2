// Estado em memoria (troque por Postgres/Redis em producao).
function d(id, nome, playerId, status, temp, mem, sinal) {
  return { id, nome, playerId, status, temp, mem, sinal, lastSeen: Date.now() };
}
export const store = {
  devices: [
    d('PMV-001', 'Av. Torquato Tapajós', 'TB40-A1X7734', 'online', 41, 48, 78),
    d('PMV-002', 'Ponte Rio Negro', 'TB40-A1X7739', 'online', 38, 44, 84),
    d('PMV-003', 'BR-174 KM 12', 'TB40-A1X7742', 'alerta', 71, 82, 41),
    d('PMV-004', 'Av. das Torres', 'TB40-A1X7745', 'offline', 0, 0, 0),
    d('PMV-005', 'Centro - Eduardo Ribeiro', 'TB40-A1X7751', 'online', 44, 51, 80),
    d('PMV-006', 'Distrito Industrial', 'TB40-A1X7758', 'manut', 36, 30, 66),
    d('PMV-007', 'AM-010 Rodovia', 'TB40-A1X7760', 'online', 47, 55, 59),
    d('PMV-008', 'Entrada Ponta Negra', 'TB40-A1X7763', 'alerta', 49, 58, 18),
  ],
  alerts: [],
  logs: [],
};
export function log(entry) {
  store.logs.unshift({ t: Date.now(), ...entry });
  store.logs = store.logs.slice(0, 500);
}
export function findDevice(id) { return store.devices.find(x => x.id === id); }
