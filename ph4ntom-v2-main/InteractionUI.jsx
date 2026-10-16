import React, { useEffect, useRef, useState } from 'react';

const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const qty = n => n.toLocaleString('en-US', { maximumFractionDigits: 8 });
const label = s => s === 'CASH' ? 'Cash' : s;

function Icon({ name, size = 21 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'back' ? <path d="m14 5-7 7 7 7" /> : name === 'close' ? <path d="m6 6 12 12M18 6 6 18" /> : name === 'check' ? <path d="m5 12 4 5L19 7" /> : name === 'settings' ? <><path d="M6 3v7m0 4v7M12 3v12m0 4v2M18 3v3m0 4v11M3 10h6m0 5h6m0-9h6" /></> : name === 'send' ? <path d="m5 12 7-7 7 7M12 5v15" /> : <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>}
  </svg>;
}

export function MotionDialog({ title, onClose, locked = false, sheet = false, children }) {
  const [leaving, setLeaving] = useState(false);
  const root = useRef(null), timer = useRef(null), drag = useRef(null), closing = useRef(false);
  const current = useRef({ onClose, locked }); current.current = { onClose, locked };
  const close = () => {
    if (current.current.locked || closing.current) return;
    closing.current = true; setLeaving(true);
    timer.current = setTimeout(() => current.current.onClose(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
  };
  useEffect(() => {
    const prior = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root.current?.focus();
    return () => { clearTimeout(timer.current); document.body.style.overflow = overflow; prior?.focus?.(); };
  }, []);
  return <div className={'ph-overlay ' + (sheet ? 'ph-overlay-sheet ' : '') + (leaving ? 'ph-leaving' : '')} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={'ph-dialog ' + (sheet ? 'ph-bottom-sheet' : '')} onKeyDown={e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        e.stopPropagation();
        const nodes = [...root.current.querySelectorAll('button:not(:disabled), input, textarea, [tabindex="0"]')].filter(n => n.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!first) { e.preventDefault(); return; }
        if (e.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === root.current)) { e.preventDefault(); first.focus(); }
      }
    }}>
      {sheet && <div className="ph-grab" onPointerDown={e => { if (!locked) { drag.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); } }} onPointerMove={e => { if (drag.current != null) root.current.style.transform = `translateY(${Math.max(0, e.clientY - drag.current)}px)`; }} onPointerUp={e => { if (drag.current != null && e.clientY - drag.current > 80) close(); drag.current = null; root.current.style.transform = ''; }} onPointerCancel={() => { drag.current = null; root.current.style.transform = ''; }}><span /></div>}
      {children(close)}
    </section>
  </div>;
}

function Header({ title, subtitle, close, right, back = false }) {
  return <header className="ph-header"><button className="ph-round" aria-label={back ? 'Back' : 'Close'} onClick={close}><Icon name={back ? 'back' : 'close'} /></button><div className="ph-header-title">{title}{subtitle && <small>{subtitle}</small>}</div>{right}</header>;
}

function PaymentIcon({ symbol, Logo }) {
  if (!['CASH', 'Apple Pay', 'Debit card', 'Bank transfer'].includes(symbol)) return <Logo id={symbol} size={36}/>;
  return <span className="ph-payment-icon" aria-hidden="true">{symbol === 'Apple Pay' ? <span style={{fontSize:11,fontWeight:700}}>Pay</span> : <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{symbol === 'Bank transfer' ? <><path d="m3 8 9-5 9 5H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 21h18"/></> : symbol === 'Debit card' ? <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></> : <><rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="3" fill="#252329" stroke="none"/><path d="M5 8h2M17 16h2" stroke="#252329"/></>}</svg>}</span>;
}

export function AssetPicker({ title, options, selected, onSelect, onClose, Logo }) {
  const [query, setQuery] = useState('');
  return <MotionDialog title={title} onClose={onClose} sheet>{close => <><Header title={title} close={close}/><div className="ph-sheet-body"><input className="ph-search" aria-label="Search payment assets" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)}/>{options.filter(a => (a.name + a.symbol).toLowerCase().includes(query.toLowerCase())).map(a => <button className="ph-asset-row" key={a.symbol} onClick={() => { onSelect(a.symbol); close(); }}><PaymentIcon symbol={a.symbol} Logo={Logo}/><span><strong>{a.name}</strong><small>{a.balance == null ? 'Demo payment method' : qty(a.balance) + ' ' + label(a.symbol)}</small></span>{a.symbol === selected && <span className="ph-selected"><Icon name="check"/></span>}</button>)}</div></>}</MotionDialog>;
}

export function TradeMenu({ name, onBuy, onLong, onShort, onClose }) {
  return <div className="ph-trade-menu-overlay" role="dialog" aria-modal="true" aria-label={'Trade ' + name} onClick={onClose}>
    <div className="ph-trade-menu-panel" onClick={e => e.stopPropagation()}>
      <button onClick={onLong}>Long</button>
      <button onClick={onShort}>Short</button>
      <button onClick={onBuy}>Buy</button>
      <button className="ph-trade-menu-close" onClick={onClose} aria-label="Close trade actions">×</button>
    </div>
  </div>;
}

export function TradeReview({ initialQuote, onRefresh, onCommit, onClose, onDone, paymentName, Logo }) {
  const [quote, setQuote] = useState(initialQuote), [phase, setPhase] = useState('review'), [error, setError] = useState('');
  const [details, setDetails] = useState(null), [slippage, setSlippage] = useState('Auto'), [now, setNow] = useState(Date.now());
  const lock = useRef(false), mounted = useRef(true);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => { mounted.current = false; clearInterval(timer); }; }, []);
  const expired = now > quote.expiresAt;
  const refresh = () => { try { setQuote(onRefresh()); setError(''); setPhase('review'); setNow(Date.now()); } catch(e) { setError(e.message); } };
  const confirm = async () => {
    if (lock.current) return;
    if (expired) { refresh(); return; }
    lock.current = true; setPhase('pending'); setError('');
    try { await onCommit(quote); if (mounted.current) setPhase('success'); }
    catch(e) { if (mounted.current) { setError(e.message || 'The demo trade could not be saved.'); setPhase('error'); } }
    finally { lock.current = false; }
  };
  const action = quote.kind === 'fund' ? 'Add Cash' : quote.kind === 'sell' ? 'Sell ' + quote.pay : quote.kind === 'buy' ? 'Buy ' + quote.receive : 'Swap';
  return <MotionDialog title={phase === 'review' ? 'Review ' + action : 'Trade status'} onClose={phase === 'success' ? onDone : onClose} locked={phase === 'pending'}>{close => <>
    {phase === 'review' ? <>
      <Header title={quote.kind === 'fund' ? 'Add Cash' : 'Review'} subtitle={quote.kind === 'fund' ? undefined : action} close={close} back right={quote.kind === 'fund' ? undefined : <button className="ph-round" aria-label="Trade settings" onClick={() => setDetails('settings')}><Icon name="settings"/></button>}/>
      <div className="ph-review-scroll">
        <div className="ph-review-amount">{money(quote.usd).replace(/\.00$/, '')}<span>Demo {quote.kind === 'fund' ? 'funding' : 'trade'}</span></div>
        <div className="ph-review-row"><div><small>{quote.kind === 'sell' ? 'Receive' : quote.kind === 'fund' ? 'Add' : 'Buy'}</small><strong>{qty(quote.output)} {quote.receive}{quote.kind !== 'fund' && <span className="ph-muted"> · Price {money(quote.receivePrice)}</span>}</strong></div>{quote.kind !== 'fund' && <button className="ph-plain" aria-label="Quote details" onClick={() => setDetails('quote')}><Icon name="info" size={19}/></button>}</div>
        <div className="ph-review-row"><div><small>Payment</small><strong>{quote.kind === 'fund' ? (paymentName === 'Debit card' ? 'Card' : paymentName) : label(quote.pay)}<span className="ph-muted"> · {quote.kind === 'fund' ? 'Simulated' : '0.85% demo fee'}</span></strong></div><button className="ph-plain" aria-label="Payment details" onClick={() => setDetails('payment')}>⌄</button></div>
        <div className="ph-review-row"><div><small>{quote.kind === 'fund' ? 'Delivery' : 'Frequency'}</small><strong>{quote.kind === 'fund' ? 'Local demo balance' : 'One time purchase'}</strong></div></div>
        <p className="ph-disclosure">{quote.kind === 'fund' ? 'Adds local demo cash. No payment is collected.' : 'Simulated quote. No on-chain transaction is sent.'}</p>
        {error && <p className="ph-error" role="alert">{error}</p>}
      </div>
      <footer className="ph-footer"><div className="ph-quote-age">{expired ? 'Quote expired — refresh to continue' : 'Quote updates when refreshed'}</div><button className="ph-primary" onClick={confirm}>{expired ? 'Refresh quote' : 'Confirm'}</button></footer>
    </> : <>
      {phase !== 'pending' && <Header title="" close={close}/>}
      <div className="ph-status" aria-live="polite" aria-busy={phase === 'pending'}>
        <div className={'ph-status-mark ' + (phase === 'error' ? 'ph-failure' : '')}>{phase === 'pending' ? <span className="ph-loader"/> : phase === 'success' ? <Icon name="check" size={43}/> : <Icon name="close" size={38}/>}</div>
        <h2>{phase === 'pending' ? (quote.kind === 'fund' ? 'Adding demo cash' : 'Processing demo trade') : phase === 'success' ? (quote.kind === 'fund' ? 'Cash added' : 'Trade complete') : 'Trade not completed'}</h2>
        <p>{phase === 'error' ? error : qty(quote.output) + ' ' + quote.receive}</p>
        {phase === 'success' && <div className="ph-result-card"><div><span>Amount</span><strong>{money(quote.usd)}</strong></div><div><span>Demo fee</span><strong>{money(quote.fee)}</strong></div><div><span>Status</span><strong className="ph-green">Completed locally</strong></div></div>}
        <small>{phase === 'pending' ? 'Updating this device’s demo portfolio…' : 'Demo only · no funds moved'}</small>
      </div>
      <footer className="ph-footer">{phase === 'success' && <button className="ph-primary" onClick={close}>Done</button>}{phase === 'error' && <><button className="ph-primary" onClick={refresh}>Review a new quote</button><button className="ph-secondary" onClick={close}>Back to amount</button></>}</footer>
    </>}
    {details && <MotionDialog title={details === 'settings' ? 'Trade settings' : 'Trade details'} onClose={() => setDetails(null)} sheet>{hide => <><Header title={details === 'settings' ? 'Trade settings' : 'Trade details'} close={hide}/><div className="ph-sheet-body">{details === 'settings' ? <><p className="ph-muted">Slippage preference · demo only</p><div className="ph-segments">{['Auto', '0.5%', '1%', '2%'].map(v => <button key={v} className={slippage === v ? 'ph-active' : ''} onClick={() => setSlippage(v)}>{v}</button>)}</div><p className="ph-disclosure">This preference previews the trading controls. Demo execution uses the displayed fixed quote.</p><button className="ph-primary" onClick={hide}>Done</button></> : <><div className="ph-review-row"><span>You pay</span><strong>{qty(quote.amount)} {label(quote.pay)}</strong></div><div className="ph-review-row"><span>You receive</span><strong>{qty(quote.output)} {quote.receive}</strong></div><div className="ph-review-row"><span>Demo fee</span><strong>{money(quote.fee)}</strong></div><div className="ph-review-row"><span>Network fee</span><strong>None · local demo</strong></div><div className="ph-review-row"><span>Price impact</span><strong>Not simulated</strong></div></>}</div></>}</MotionDialog>}
  </>}</MotionDialog>;
}

export function initialMessages(room) {
  return [
    { id: 'sample-1', user: 'mika', avatar: 'M', text: `Welcome to the ${room.name} demo room.`, sample: true, reactions: {} },
    { id: 'sample-2', user: 'alex', avatar: 'A', text: 'I’m comparing the daily and weekly charts before choosing an amount.', sample: true, reactions: {} },
    { id: 'sample-3', user: 'ren', avatar: 'R', text: 'The review screen shows the quote and fee before you confirm.', sample: true, reactions: {} },
  ];
}

export function ChatPreview({ room, messages, onOpen }) {
  return <div className="ph-chat-preview"><button className="ph-chat-heading" onClick={onOpen}><strong>Live Chat <span>›</span></strong><small>● Demo room</small></button><button className="ph-chat-snippet" onClick={onOpen}><span className="ph-chat-avatar">{messages.at(-1)?.avatar || 'M'}</span><span>{messages.at(-1)?.text || `Join the ${room.name} conversation`}</span><span>›</span></button></div>;
}

export function ChatList({ rooms, getMessages, onOpen, Logo }) {
  const [query, setQuery] = useState('');
  return <div><p className="ph-disclosure">Demo market rooms. Messages stay on this device.</p><input className="ph-search" aria-label="Search chats" placeholder="Search tokens and markets" value={query} onChange={e => setQuery(e.target.value)}/>{rooms.filter(r => (r.name + r.type).toLowerCase().includes(query.toLowerCase())).map(room => <button className="ph-room-row" key={room.id} onClick={() => onOpen(room)}><Logo id={room.symbol} size={42}/><span><strong>{room.name}<small>{room.type}</small></strong><small>{getMessages(room).at(-1)?.text || 'Open conversation'}</small></span><span>›</span></button>)}</div>;
}

export function ChatRoom({ room, messages, username, onMessages, onClose, onTrade, Logo }) {
  const [draft, setDraft] = useState(''), [menu, setMenu] = useState(null), [notice, setNotice] = useState('');
  const bottom = useRef(null), press = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }, [messages.at(-1)?.id]);
  useEffect(() => () => clearTimeout(press.current), []);
  const send = e => {
    e.preventDefault(); const text = draft.trim(); if (!text) return;
    if (/https?:\/\/|www\./i.test(text)) { setNotice('External links are not supported in this room.'); return; }
    onMessages([...messages, { id: 'local-' + Date.now(), user: username, avatar: username.slice(0, 1).toUpperCase(), text, at: Date.now(), reactions: {} }]); setDraft(''); setNotice('');
  };
  const react = (id, emoji) => {
    onMessages(messages.map(m => { if (m.id !== id) return m; const users = m.reactions?.[emoji] || []; return { ...m, reactions: { ...m.reactions, [emoji]: users.includes(username) ? users.filter(u => u !== username) : [...users, username] } }; })); setMenu(null);
  };
  return <MotionDialog title={room.name + ' chat'} onClose={onClose}>{close => <><Header title={room.name} subtitle={room.type + ' · Demo room'} close={close} back right={<Logo id={room.symbol} size={34}/>}/><div className="ph-room-notice">Sample profiles · your messages are saved on this device</div><div className="ph-message-list"><div className="ph-day-label">Market conversation</div>{messages.map(m => <article key={m.id} className={'ph-message ' + (m.user === username ? 'ph-mine' : '')}><span className="ph-chat-avatar">{m.avatar}</span><div className="ph-message-main"><div className="ph-message-meta"><strong>@{m.user}</strong><small>{m.sample ? 'Sample' : new Date(m.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small><button aria-label={'React to message from ' + m.user} onClick={() => setMenu(m.id)}>···</button></div><div className="ph-message-text" onContextMenu={e => {e.preventDefault();setMenu(m.id);}} onPointerDown={() => { press.current = setTimeout(() => setMenu(m.id), 500); }} onPointerUp={() => clearTimeout(press.current)} onPointerCancel={() => clearTimeout(press.current)} onPointerMove={() => clearTimeout(press.current)}>{m.text}</div><div className="ph-reactions">{Object.entries(m.reactions || {}).filter(([,users]) => users.length).map(([emoji,users]) => <button key={emoji} aria-label={'React ' + emoji} aria-pressed={users.includes(username)} onClick={() => react(m.id, emoji)}>{emoji} {users.length}</button>)}</div></div></article>)}<div ref={bottom}/></div><footer className="ph-chat-footer"><div className="ph-chat-trade"><span>{room.symbol}<small>{room.type}</small></span><button className="ph-trade-button" onClick={onTrade}>Trade</button></div><form onSubmit={send} className="ph-composer"><input aria-label="Message" placeholder="Message" maxLength={500} value={draft} onChange={e => setDraft(e.target.value)}/><button aria-label="Send message" disabled={!draft.trim()} type="submit"><Icon name="send"/></button></form>{notice && <small className="ph-error" role="alert">{notice}</small>}</footer>{menu && <MotionDialog title="Message actions" onClose={() => setMenu(null)} sheet>{hide => <><Header title="React" close={hide}/><div className="ph-sheet-body"><div className="ph-emoji-row">{['👍','🔥','❤️','👀','😂'].map(emoji => <button key={emoji} aria-label={'React ' + emoji} onClick={() => react(menu, emoji)}>{emoji}</button>)}</div>{messages.find(m => m.id === menu)?.user === username && <button className="ph-delete" onClick={() => { onMessages(messages.filter(m => m.id !== menu)); setMenu(null); }}>Delete my message</button>}</div></>}</MotionDialog>}</>}</MotionDialog>;
}
