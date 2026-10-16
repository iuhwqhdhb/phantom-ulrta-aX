export const DEMO_FEE = 0.0085;

export function buildQuote({ kind = 'swap', pay, receive, amount, payPrice = 1, receivePrice = 1, account, now = Date.now() }) {
  if (![amount, payPrice, receivePrice].every(n => Number.isFinite(n) && n > 0)) throw new Error('Enter a valid amount and wait for a price.');
  if (kind !== 'fund' && pay === receive) throw new Error('Choose two different assets.');
  if (kind !== 'fund' && pay === 'CASH' && receive === 'BTC') throw new Error('Choose SOL or another supported token to buy native BTC.');
  const usd = amount * payPrice;
  const fee = kind === 'fund' ? 0 : usd * DEMO_FEE;
  return { id: 'demo-' + now + '-' + Math.random().toString(36).slice(2, 8), kind, pay, receive, amount, payPrice, receivePrice, usd, fee, output: (usd - fee) / receivePrice, account, expiresAt: now + 30000 };
}

export function balanceOf(wallet, symbol, stockSymbols = []) {
  return symbol === 'CASH' ? wallet.cash : stockSymbols.includes(symbol) ? wallet.pos[symbol] || 0 : wallet.hold[symbol] || 0;
}

export function applyDemoQuote(wallet, quote, { now = Date.now(), stockSymbols = [] } = {}) {
  if (now > quote.expiresAt) throw new Error('This quote expired. Refresh it before confirming.');
  if ((wallet.log || []).some(log => log.id === quote.id)) throw new Error('This trade has already completed.');
  if (![quote.amount, quote.output, quote.usd].every(n => Number.isFinite(n) && n > 0)) throw new Error('The quote is unavailable. Please try again.');
  if (quote.kind !== 'fund' && balanceOf(wallet, quote.pay, stockSymbols) + 1e-9 < quote.amount) throw new Error('Your available balance changed. Enter a smaller amount.');
  const next = { ...wallet, hold: { ...wallet.hold }, pos: { ...wallet.pos } };
  const adjust = (symbol, delta) => {
    if (symbol === 'CASH') next.cash = Math.max(0, next.cash + delta);
    else { const group = stockSymbols.includes(symbol) ? next.pos : next.hold; group[symbol] = Math.max(0, (group[symbol] || 0) + delta); }
  };
  if (quote.kind !== 'fund') adjust(quote.pay, -quote.amount);
  adjust(quote.receive, quote.output);
  const kind = quote.kind === 'fund' ? 'Added demo cash' : quote.kind === 'sell' ? 'Sold' : quote.kind === 'buy' ? 'Bought' : 'Swapped';
  next.log = [{ id: quote.id, kind, detail: `${quote.output.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${quote.receive} · Demo`, amount: quote.kind === 'sell' || quote.kind === 'fund' ? quote.output : -quote.usd, at: now, ago: 'now', demo: true, fee: quote.fee, sig: quote.id }, ...(wallet.log || [])].slice(0, 40);
  return next;
}

export function normalizeHistory(rows) {
  if (!Array.isArray(rows)) return [];
  const points = new Map();
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 5 || !row.slice(0, 5).every(Number.isFinite)) continue;
    const [t, o, h, l, c] = row;
    if (t <= 0 || Math.min(o, h, l, c) <= 0 || h < Math.max(o, c) || l > Math.min(o, c) || h < l) continue;
    points.set(t, { t, o, h, l, c });
  }
  return [...points.values()].sort((a, b) => a.t - b.t);
}

export function chartTime(timestamp, range, full = false) {
  if (!Number.isFinite(timestamp)) return '';
  return new Date(timestamp).toLocaleString(undefined, full
    ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : range === 'LIVE' || range === '1D' ? { hour: '2-digit', minute: '2-digit' }
    : range === 'ALL' || range === '1Y' ? { month: 'short', year: '2-digit' }
    : { month: 'short', day: 'numeric' });
}
