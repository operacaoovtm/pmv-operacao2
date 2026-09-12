// Fila com concorrencia, retry e backoff exponencial (para publicacao e comandos).
export class JobQueue {
  constructor({ concurrency = 2, maxRetries = 4 } = {}) {
    this.concurrency = concurrency; this.maxRetries = maxRetries;
    this.q = []; this.active = 0; this.jobs = new Map(); this.seq = 0;
  }
  add(fn, meta = {}) {
    const id = 'job_' + (++this.seq);
    const job = { id, fn, meta, tries: 0, status: 'queued', error: null, result: null, ts: Date.now() };
    this.jobs.set(id, job); this.q.push(job); this._pump();
    return id;
  }
  get(id) { return this.jobs.get(id); }
  list() { return [...this.jobs.values()].slice(-100).reverse(); }
  async _pump() {
    if (this.active >= this.concurrency) return;
    const job = this.q.shift(); if (!job) return;
    this.active++; job.status = 'running';
    try {
      job.result = await job.fn(); job.status = 'done';
    } catch (err) {
      job.tries++; job.error = String((err && err.message) || err);
      const retryable = err && (err.retryable || err.status === 429 || err.status >= 500);
      if (retryable && job.tries <= this.maxRetries) {
        const delay = Math.min(30000, 500 * 2 ** job.tries);
        job.status = 'retry';
        setTimeout(() => { job.status = 'queued'; this.q.push(job); this._pump(); }, delay);
      } else {
        job.status = 'failed';
      }
    } finally {
      this.active--; this._pump();
    }
  }
}
