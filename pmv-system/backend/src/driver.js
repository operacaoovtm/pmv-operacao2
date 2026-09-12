import { media, care } from './vnnox.js';
import { store } from './store.js';
import { cfg } from './config.js';

// Interface abstrata: todo controlador/protocolo futuro (JT, NTCIP, MQTT) implementa isto.
export class PmvDriver {
  async listDevices() { throw new Error('not implemented'); }
  async deviceStatus(id) { throw new Error('not implemented'); }
  async publish({ device, png, schedule, name }) { throw new Error('not implemented'); }
  async emergency({ device, png, name }) { throw new Error('not implemented'); }
  async cancelEmergency({ device }) { throw new Error('not implemented'); }
  async restart(id) { throw new Error('not implemented'); }
  async setBrightness(id, v) { throw new Error('not implemented'); }
  async setPower(id, on) { throw new Error('not implemented'); }
  async alarms() { return []; }
}

// ---- Driver real: NovaStar VNNOX / NovaCloud ----
export class VnnoxDriver extends PmvDriver {
  async listDevices() { return media.listPlayers(); }
  async deviceStatus(id) { return media.playerStatus(id); }
  async publish({ device, png, schedule, name }) {
    const up = await media.uploadMedia({ name, contentType: 'image/png', dataBase64: png.toString('base64') });
    const sol = await media.createSolution({
      name,
      pages: [{ widgets: [{ type: 'IMAGE', mediaId: up.mediaId }], duration: (schedule && schedule.duration) || 8 }],
    });
    return media.publishSolution({ solutionId: sol.solutionId, players: [device], schedule });
  }
  async emergency({ device, png, name }) {
    const up = await media.uploadMedia({ name, contentType: 'image/png', dataBase64: png.toString('base64') });
    return media.emergencyInsert({ players: [device], widgets: [{ type: 'IMAGE', mediaId: up.mediaId }], name });
  }
  async cancelEmergency({ device }) { return media.cancelEmergency({ players: [device] }); }
  async restart(id) { return media.restart(id); }
  async setBrightness(id, v) { return media.setBrightness(id, v); }
  async setPower(id, on) { return media.setPower(id, on); }
  async alarms() { return care.alarms(); }
}

// ---- Driver simulado: roda sem credenciais e exercita todo o fluxo ----
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const sid = () => 'sol_' + Math.random().toString(36).slice(2, 8);
export class MockDriver extends PmvDriver {
  async listDevices() { return store.devices; }
  async deviceStatus(id) { return store.devices.find(x => x.id === id) || null; }
  async publish({ device, name }) { await wait(300); return { ok: true, device, solutionId: sid(), name }; }
  async emergency({ device, name }) { await wait(200); return { ok: true, device, emergency: true, name }; }
  async cancelEmergency({ device }) { return { ok: true, device }; }
  async restart(id) { return { ok: true, id, action: 'restart' }; }
  async setBrightness(id, v) { return { ok: true, id, brightness: v }; }
  async setPower(id, on) { return { ok: true, id, power: on }; }
  async alarms() { return []; }
}

// ---- Stubs de expansao (o prompt pede nascer preparado p/ outros protocolos) ----
export class JtDriver extends PmvDriver {}    // NovaStar JT Series
export class NtcipDriver extends PmvDriver {} // NTCIP 1203 (orgaos de transito)

export function getDriver() { return cfg.mock ? new MockDriver() : new VnnoxDriver(); }
