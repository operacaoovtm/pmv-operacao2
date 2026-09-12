import crypto from 'node:crypto';
import { cfg } from './config.js';

// ---- Limitador de taxa: no maximo 15 req/s e 1500 req/h por IP ----
class Limiter {
  constructor(perSec = 15, perHour = 1500) {
    this.perSec = perSec; this.perHour = perHour; this.sec = []; this.hour = [];
  }
  async take() {
    for (;;) {
      const now = Date.now();
      this.sec = this.sec.filter(t => now - t < 1000);
      this.hour = this.hour.filter(t => now - t < 3600000);
      if (this.sec.length < this.perSec && this.hour.length < this.perHour) {
        this.sec.push(now); this.hour.push(now); return;
      }
      await new Promise(r => setTimeout(r, this.sec.length >= this.perSec ? 80 : 1000));
    }
  }
}
const limiter = new Limiter();

// ---- Assinatura AK/AS: CheckSum = SHA256(AppSecret + Nonce + CurTime) ----
function nonce() { return crypto.randomBytes(16).toString('hex'); }
function authHeaders() {
  const CurTime = String(Math.floor(Date.now() / 1000));
  const Nonce = nonce();
  const CheckSum = crypto.createHash('sha256').update(cfg.vnnox.as + Nonce + CurTime).digest('hex');
  return { AppKey: cfg.vnnox.ak, Nonce, CurTime, CheckSum };
}

export async function vnnoxRequest(method, path, { query, body } = {}) {
  await limiter.take();
  const url = new URL(cfg.vnnox.baseUrl + path);
  if (query) for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
  const headers = authHeaders();
  const opts = { method, headers };
  if (method === 'POST') {
    headers['Content-Type'] = 'application/json; charset=utf-8';
    opts.body = JSON.stringify(body || {});
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (res.status === 429) { const e = new Error('VNNOX rate limit (429)'); e.status = 429; e.retryable = true; throw e; }
  if (!res.ok) { const e = new Error('VNNOX ' + res.status); e.status = res.status; e.data = data; e.retryable = res.status >= 500; throw e; }
  return data;
}

// ================= VNNOX Media (publicacao + controle) =================
// Docs: https://developer-en.vnnox.com  — confirme o corpo/paths exatos por endpoint.
export const media = {
  listPlayers: (q = {}) => vnnoxRequest('GET', '/v2/player/list', { query: q }),                 // api-180498654
  playerStatus: (playerId) => vnnoxRequest('GET', '/v2/player/status', { query: { playerId } }), // api-180498661 / 186309730
  uploadMedia: (payload) => vnnoxRequest('POST', '/v2/media/upload', { body: payload }),
  createSolution: (payload) => vnnoxRequest('POST', '/v2/solution', { body: payload }),           // api-180502121
  publishSolution: (payload) => vnnoxRequest('POST', '/v2/solution/publish', { body: payload }),
  emergencyInsert: (payload) => vnnoxRequest('POST', '/v2/solution/emergency', { body: payload }),        // api-180502122
  cancelEmergency: (payload) => vnnoxRequest('POST', '/v2/solution/emergency/cancel', { body: payload }), // api-180502123
  restart: (playerId) => vnnoxRequest('POST', '/v2/player/restart', { body: { playerId } }),             // api-180498659
  setBrightness: (playerId, value) => vnnoxRequest('POST', '/v2/player/brightness', { body: { playerId, brightness: value } }), // api-180498655
  setPower: (playerId, on) => vnnoxRequest('POST', '/v2/player/screen-power', { body: { playerId, power: on ? 1 : 0 } }),        // api-180498660
  screenshot: (playerId) => vnnoxRequest('GET', '/v2/player/screenshot', { query: { playerId } }),       // api-180502120
  playLogs: (q = {}) => vnnoxRequest('GET', '/v2/play-log/overview', { query: q }),                      // api-188119325
};

// ================= VNNOX Care (monitoramento) =================
export const care = {
  deviceBasic: (q = {}) => vnnoxRequest('GET', '/v2/device-status-monitor/receiving-card/basics/', { query: q }),      // api-181820138
  deviceMonitoring: (q = {}) => vnnoxRequest('GET', '/v2/device-status-monitor/receiving-card/monitoring/', { query: q }), // api-181820139
  alarms: (q = {}) => vnnoxRequest('GET', '/v2/device-status-monitor/receiving-card/alarms/', { query: q }),           // api-181820140
};
