// Cliente para o frontend (PMV-Suite) falar com o backend de comunicacao.
const BASE = (typeof window !== 'undefined' && window.PMV_API) || 'http://localhost:4000';
async function j(method, path, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error('API ' + r.status + ' ' + path);
  return r.json();
}
export const api = {
  health: () => j('GET', '/api/health'),
  devices: () => j('GET', '/api/devices'),
  device: (id) => j('GET', `/api/devices/${id}`),
  alerts: () => j('GET', '/api/alerts'),
  logs: () => j('GET', '/api/logs'),
  job: (id) => j('GET', `/api/jobs/${id}`),
  publish: (payload) => j('POST', '/api/publish', payload),
  emergency: (payload) => j('POST', '/api/emergency', payload),
  cancelEmergency: (targets) => j('POST', '/api/emergency/cancel', { targets }),
  restart: (id) => j('POST', `/api/devices/${id}/restart`),
  brightness: (id, value) => j('POST', `/api/devices/${id}/brightness`, { value }),
  power: (id, on) => j('POST', `/api/devices/${id}/power`, { on }),
};

// COMO LIGAR O EDITOR:
// O snapshot() do editor ja retorna { w, h, mode, px }. No botao "Publicar", chame:
//   const jobId = (await api.publish({
//     name: scheduleName || 'Mensagem',
//     snapshot: snapshot(),
//     targets: ['PMV-005'],                 // 1+ ids de PMV
//     schedule: { duration: 8, timeStart: '06:00', timeEnd: '22:00', days: [1,1,1,1,1,1,1] },
//     priority: 'normal',                   // ou 'emergency' para preemptar
//   })).jobId;
// Emergencia (preempcao imediata): api.emergency({ name, snapshot: snapshot(), targets: ['PMV-003'] });
