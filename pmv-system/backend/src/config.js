import 'dotenv/config';
const ak = process.env.VNNOX_AK || '';
const as = process.env.VNNOX_AS || '';
const mockEnv = (process.env.MOCK_MODE || '').toLowerCase();
export const cfg = {
  port: Number(process.env.PORT || 4000),
  pollMs: Number(process.env.POLL_MS || 15000),
  vnnox: {
    ak, as,
    baseUrl: (process.env.VNNOX_BASE_URL || 'https://open-us.vnnox.com').replace(/\/+$/, ''),
  },
  // Modo simulado se pedido explicitamente OU se faltam credenciais.
  mock: mockEnv === 'true' || !ak || !as,
};
