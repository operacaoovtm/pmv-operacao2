import express from 'express';
import cors from 'cors';
import { cfg } from './config.js';
import { store, log, findDevice } from './store.js';
import { JobQueue } from './queue.js';
import { getDriver } from './driver.js';
import { startPoller } from './poller.js';
import { makePublish } from './pipeline.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

const driver = getDriver();
const queue = new JobQueue({ concurrency: 2, maxRetries: 4 });
const publishDesign = makePublish(queue, driver);

// Resolve ids de PMV -> id que o driver espera (playerId no modo real).
function resolveTargets(ids = []) {
  return ids.map(id => {
    const dv = findDevice(id);
    return cfg.mock ? id : (dv ? dv.playerId : id);
  });
}

app.get('/api/health', (req, res) => res.json({ ok: true, mock: cfg.mock, node: cfg.vnnox.baseUrl }));
app.get('/api/devices', (req, res) => res.json(store.devices));
app.get('/api/devices/:id', (req, res) => res.json(findDevice(req.params.id) || null));
app.get('/api/alerts', (req, res) => res.json(store.alerts));
app.get('/api/logs', (req, res) => res.json(store.logs.slice(0, 100)));
app.get('/api/jobs/:id', (req, res) => res.json(queue.get(req.params.id) || null));

app.post('/api/publish', (req, res) => {
  const { snapshot, targets = [], schedule = {}, priority = 'normal', name = 'Mensagem' } = req.body || {};
  if (!snapshot || !Array.isArray(targets) || !targets.length) return res.status(400).json({ error: 'snapshot e targets são obrigatórios' });
  const jobId = publishDesign({ snapshot, targets: resolveTargets(targets), schedule, priority, name });
  res.json({ jobId, targets, priority });
});

app.post('/api/emergency', (req, res) => {
  const { snapshot, targets = [], name = 'EMERGÊNCIA' } = req.body || {};
  if (!snapshot || !targets.length) return res.status(400).json({ error: 'snapshot e targets são obrigatórios' });
  const jobId = publishDesign({ snapshot, targets: resolveTargets(targets), priority: 'emergency', name });
  res.json({ jobId, targets, priority: 'emergency' });
});

app.post('/api/emergency/cancel', async (req, res) => {
  const { targets = [] } = req.body || {};
  const out = [];
  for (const device of resolveTargets(targets)) out.push(await driver.cancelEmergency({ device }));
  log({ tipo: 'Publicação', msg: `Emergência cancelada: ${targets.join(', ')}` });
  res.json({ ok: true, results: out });
});

async function control(req, res, fn, label) {
  try {
    const dv = findDevice(req.params.id);
    const target = cfg.mock ? req.params.id : (dv ? dv.playerId : req.params.id);
    const out = await fn(target);
    log({ tipo: 'Config', msg: `${label} em ${req.params.id}` });
    res.json({ ok: true, out });
  } catch (e) { res.status(502).json({ error: e.message }); }
}
app.post('/api/devices/:id/restart', (req, res) => control(req, res, (t) => driver.restart(t), 'Reiniciar'));
app.post('/api/devices/:id/brightness', (req, res) => control(req, res, (t) => driver.setBrightness(t, Number(req.body?.value ?? 100)), 'Brilho'));
app.post('/api/devices/:id/power', (req, res) => control(req, res, (t) => driver.setPower(t, !!req.body?.on), 'Energia da tela'));

startPoller(driver);
app.listen(cfg.port, () => {
  console.log(`PMV-comms rodando em http://localhost:${cfg.port}  (modo: ${cfg.mock ? 'SIMULADO' : 'REAL VNNOX'})`);
});
