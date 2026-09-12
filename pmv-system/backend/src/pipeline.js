import { renderPng } from './render.js';
import { log } from './store.js';

// Recebe o snapshot do editor, renderiza o PNG e publica (ou insere emergencia) em cada alvo.
export function makePublish(queue, driver) {
  return function publishDesign({ snapshot, targets = [], schedule = {}, priority = 'normal', name = 'Mensagem' }) {
    const png = renderPng(snapshot);
    return queue.add(async () => {
      const results = [];
      for (const device of targets) {
        if (priority === 'emergency') {
          results.push(await driver.emergency({ device, png, name }));
          log({ tipo: 'Publicação', msg: `EMERGÊNCIA '${name}' -> ${device}` });
        } else {
          results.push(await driver.publish({ device, png, schedule, name }));
          log({ tipo: 'Publicação', msg: `'${name}' -> ${device}` });
        }
      }
      return { published: targets, priority, bytes: png.length, results };
    }, { name, targets, priority });
  };
}
