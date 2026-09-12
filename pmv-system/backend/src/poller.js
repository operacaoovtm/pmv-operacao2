import { store, log } from './store.js';
import { cfg } from './config.js';

const rnd = (a, b) => Math.round(a + Math.random() * (b - a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function deriveAlerts() {
  const a = [];
  for (const dv of store.devices) {
    if (dv.status === 'offline') { a.push({ pmv: dv.id, tipo: 'Offline', crit: 'Crítica' }); continue; }
    if (dv.status === 'manut') continue;
    if (dv.temp > 65) a.push({ pmv: dv.id, tipo: 'Temperatura alta', crit: 'Crítica', valor: dv.temp + '°C' });
    if (dv.sinal < 25) a.push({ pmv: dv.id, tipo: 'Sinal fraco', crit: 'Média', valor: dv.sinal + '%' });
    if (dv.mem > 85) a.push({ pmv: dv.id, tipo: 'Memória alta', crit: 'Média', valor: dv.mem + '%' });
  }
  store.alerts = a;
}

function mockTick() {
  for (const dv of store.devices) {
    if (dv.status === 'offline') continue;
    dv.temp = clamp(dv.temp + rnd(-2, 2), 30, 80);
    dv.mem = clamp(dv.mem + rnd(-3, 3), 20, 95);
    dv.sinal = clamp(dv.sinal + rnd(-3, 3), 5, 99);
    dv.status = dv.temp > 65 || dv.sinal < 25 ? 'alerta' : (dv.status === 'manut' ? 'manut' : 'online');
    dv.lastSeen = Date.now();
  }
  deriveAlerts();
}

function watchdog() {
  const limit = cfg.pollMs * 4;
  for (const dv of store.devices) {
    if (dv.status !== 'offline' && Date.now() - dv.lastSeen > limit) {
      dv.status = 'offline';
      log({ tipo: 'Alerta', msg: `${dv.id} sem comunicação (watchdog)` });
    }
  }
}

export function startPoller(driver) {
  const tick = async () => {
    try {
      if (cfg.mock) {
        mockTick();
      } else {
        // Mapeie o retorno real de listDevices()/alarms() para store.devices.
        // Os campos exatos dependem do payload de cada API (ajuste conforme sua conta).
        await driver.listDevices();
        const alarms = await driver.alarms();
        if (Array.isArray(alarms)) store.alerts = alarms;
      }
      watchdog();
    } catch (e) {
      log({ tipo: 'API', msg: 'poll falhou: ' + e.message });
    }
  };
  tick();
  return setInterval(tick, cfg.pollMs);
}
