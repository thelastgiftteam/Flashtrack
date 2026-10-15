import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, useDraggable, useDroppable, pointerWithin, rectIntersection, MeasuringStrategy,
} from '@dnd-kit/core';
import AdminFrame from '../../components/console/AdminFrame';
import { Card, Button, Modal, Empty, Loading, AccessPill, Tabs, call, toast, fmtWhen } from '../../components/console/ui';
import { STAGES } from '../../lib/leads';

// New signups to call, set up and turn into paying brands.
// Board: drag cards between stages (long-press on phones, or use "Move to").
// Table: the same brands as rows.

const waNum = p => { const d = String(p || '').replace(/\D/g, ''); return d.length === 10 ? '91' + d : d; };
const when = t => fmtWhen(t).replace(/^Just/, 'just');
const initials = s => String(s || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const COLOR = { new: '#DF1515', called: '#E0AC00', setup: '#2563EB', paid: '#16884F', lost: '#8E8E98' };
const PICKABLE = STAGES.filter(s => s.value !== 'paid');

function NoteModal({ row, onClose, onSaved }) {
  const [text, setText] = useState('');
  const [stage, setStage] = useState(row.stage === 'new' ? 'called' : row.stage);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      if (text.trim()) await call(`/api/admin/brands/${row.id}/note`, { method: 'POST', body: { text } });
      if (stage !== row.stage && row.stage !== 'paid') await call(`/api/admin/brands/${row.id}`, { method: 'PATCH', body: { leadStage: stage } });
      toast('Saved'); onSaved();
    } catch (e) { toast(e.message, 'err'); setBusy(false); }
  }
  return (
    <Modal title={`Call notes · ${row.name}`} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button busy={busy} onClick={save} disabled={!text.trim() && stage === row.stage}>Save</Button></>}>
      <div className="fc-form">
        <label className="fc-field"><span className="fc-label">What happened?</span>
          <textarea className="fc-textarea" style={{ minHeight: 110 }} autoFocus value={text} onChange={e => setText(e.target.value)}
            placeholder="e.g. Ships ~300 parcels a month. Will upload tomorrow. Call back Friday." /></label>
        {row.stage !== 'paid' && (
          <label className="fc-field"><span className="fc-label">Move to</span>
            <select className="fc-select" value={stage} onChange={e => setStage(e.target.value)}>
              {PICKABLE.map(s => <option key={s.value} value={s.value}>{s.label} · {s.hint}</option>)}
            </select></label>
        )}
        {row.stage !== 'paid' && <p className="fc-hint">They move to “Paid” by themselves once you tap +1 month on the brand.</p>}
      </div>
    </Modal>
  );
}

// Stops a tap on a button or menu inside a card from starting a drag
const noDrag = { onMouseDown: e => e.stopPropagation(), onTouchStart: e => e.stopPropagation(), onKeyDown: e => e.stopPropagation() };

function MoveMenu({ row, onMove }) {
  if (row.stage === 'paid') return null; // the column says it's automatic
  return (
    <select className="fc-kb-move" value="" aria-label={`Move ${row.name}`} onChange={e => e.target.value && onMove(row, e.target.value)} {...noDrag}>
      <option value="">Move to…</option>
      {PICKABLE.filter(s => s.value !== row.stage).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
    </select>
  );
}

function LeadCard({ row, onNote, onMove, overlay = false }) {
  return (
    <div className={`fc-kb-card ${overlay ? 'is-overlay' : ''}`}>
      <div className="fc-kb-top">
        <Link href={`/admin/brands/${row.id}`} className="fc-kb-name" {...noDrag}>{row.name}</Link>
        <span className={`fc-kb-av ${row.managerId ? '' : 'is-none'}`} title={row.manager ? `Manager: ${row.manager}` : 'No manager yet'}>
          {row.manager ? initials(row.manager) : '—'}
        </span>
      </div>
      <div className="fc-kb-sub">
        {row.contactName ? `${row.contactName} · ` : ''}signed up {when(row.createdAt)}
      </div>
      <div className="fc-kb-chips">
        {row.shipments > 0
          ? <span className="fc-kb-chip is-ok">✓ {row.shipments} parcels</span>
          : <span className="fc-kb-chip is-warn">No parcels yet</span>}
        {row.views > 0 && <span className="fc-kb-chip">{row.views} checked</span>}
        <AccessPill access={row.access} />
      </div>
      {row.lastNote && (
        <div className="fc-kb-note"><span className="fc-clamp2">“{row.lastNote.text}”</span>
          <span className="fc-kb-note-by">{row.lastNote.by} · {when(row.lastNote.at)}</span></div>
      )}
      <div className="fc-kb-actions" {...noDrag}>
        {row.phone && <a className="fc-kb-ico" href={`tel:${row.phone}`} title={`Call ${row.phone}`} aria-label={`Call ${row.phone}`}>📞</a>}
        {row.phone && <a className="fc-kb-ico is-wa" href={`https://wa.me/${waNum(row.phone)}`} target="_blank" rel="noreferrer" title="WhatsApp" aria-label="WhatsApp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" /></svg>
        </a>}
        <button className="fc-kb-btn" onClick={() => onNote(row)}>{row.stage === 'new' ? 'Log call' : 'Note'}</button>
        <MoveMenu row={row} onMove={onMove} />
      </div>
    </div>
  );
}

function DraggableCard({ row, onNote, onMove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: row.id, data: { row }, disabled: row.stage === 'paid' });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`fc-kb-drag ${isDragging ? 'is-ghost' : ''} ${row.stage === 'paid' ? 'is-fixed' : ''}`}>
      <LeadCard row={row} onNote={onNote} onMove={onMove} />
    </div>
  );
}

function Column({ stage, rows, onNote, onMove, dragging }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value }); // Paid takes the drop so it can say no (else it lands next door)
  const blocked = dragging && stage.value === 'paid';
  return (
    <section ref={setNodeRef} className={`fc-kb-col ${isOver && !blocked ? 'is-over' : ''} ${blocked ? 'is-blocked' : ''} ${isOver && blocked ? 'is-no' : ''}`}>
      <header className="fc-kb-head">
        <span className="fc-kb-dot" style={{ background: COLOR[stage.value] }} />
        <b>{stage.label}</b><span className="fc-kb-count">{rows.length}</span>
        <span className="fc-kb-hint">{stage.value === 'paid' ? 'Automatic' : stage.hint}</span>
      </header>
      <div className="fc-kb-body">
        {rows.map(r => <DraggableCard key={r.id} row={r} onNote={onNote} onMove={onMove} />)}
        {!rows.length && <div className="fc-kb-empty">{stage.value === 'paid' ? 'Brands appear here after +1 month' : 'Drop a card here'}</div>}
      </div>
    </section>
  );
}

// The column under the finger or pointer; if it's between columns, the one it overlaps most
// Re-measure columns while dragging, so a board that scrolls sideways still drops in the right place
const MEASURE = { droppable: { strategy: MeasuringStrategy.Always } };
const dropTarget = args => { const hit = pointerWithin(args); return hit.length ? hit : rectIntersection(args); };

function Board({ rows, onNote, onMove }) {
  const [active, setActive] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const by = useMemo(() => Object.fromEntries(STAGES.map(s => [s.value, rows.filter(r => r.stage === s.value)])), [rows]);
  return (
    <DndContext sensors={sensors} collisionDetection={dropTarget} measuring={MEASURE} autoScroll={{ threshold: { x: 0.08, y: 0.12 } }}
      onDragStart={e => setActive(e.active.data.current.row)}
      onDragCancel={() => setActive(null)}
      onDragEnd={e => { setActive(null); const to = e.over?.id; const row = e.active.data.current.row; if (to && to !== row.stage) onMove(row, to); }}>
      <div className="fc-kb">
        {STAGES.map(s => <Column key={s.value} stage={s} rows={by[s.value]} onNote={onNote} onMove={onMove} dragging={!!active} />)}
      </div>
      <DragOverlay dropAnimation={{ duration: 180 }}>{active ? <LeadCard row={active} onNote={() => {}} onMove={() => {}} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}

function Table({ rows, me, staff, onNote, onMove, onAssign }) {
  const [tab, setTab] = useState('all');
  const shown = tab === 'all' ? rows : rows.filter(r => r.stage === tab);
  return (
    <>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', badge: rows.length || null },
        ...STAGES.map(s => ({ value: s.value, label: s.label, badge: rows.filter(r => r.stage === s.value).length || null }))]} />
      <Card pad={false}>
        {shown.length === 0 ? <Empty icon="·" title="No one here">Signups from the last 120 days show here.</Empty> : (
          <div className="fc-table-wrap">
            <table className="fc-table fc-cards">
              <thead><tr><th>Brand</th><th>Stage</th><th>Contact</th><th>Using it?</th><th>Trial</th><th>Manager</th><th>Last note</th><th /></tr></thead>
              <tbody>
                {shown.map(r => (
                  <tr key={r.id}>
                    <td className="fc-cards-title">
                      <Link href={`/admin/brands/${r.id}`} className="fc-strong" style={{ color: 'inherit' }}>{r.name}</Link>
                      <div className="fc-small fc-muted">Signed up {when(r.createdAt)}</div>
                    </td>
                    <td data-label="Stage">
                      {r.stage === 'paid' ? <span className="fc-kb-stage" style={{ '--c': COLOR.paid }}>Paid</span> : (
                        <select className="fc-select fc-kb-stagesel" style={{ '--c': COLOR[r.stage] }} value={r.stage} onChange={e => onMove(r, e.target.value)} aria-label="Stage">
                          {PICKABLE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      )}
                    </td>
                    <td data-label="Contact">
                      {r.contactName && <div>{r.contactName}</div>}
                      {r.email && <div className="fc-small fc-muted" style={{ wordBreak: 'break-all' }}>{r.email}</div>}
                      {r.phone ? (
                        <div className="fc-row" style={{ gap: 6, marginTop: 6 }}>
                          <a className="fc-btn fc-btn-ghost fc-btn-sm" href={`tel:${r.phone}`}>📞 {r.phone}</a>
                          <a className="fc-btn fc-btn-wa fc-btn-sm" href={`https://wa.me/${waNum(r.phone)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        </div>
                      ) : <div className="fc-small fc-muted">No phone given</div>}
                    </td>
                    <td data-label="Using it?">
                      {r.shipments > 0
                        ? <><div className="fc-strong" style={{ color: '#16884F' }}>✓ {r.shipments} parcels</div>{r.lastImport && <div className="fc-small fc-muted">last added {when(r.lastImport)}</div>}</>
                        : <div className="fc-strong" style={{ color: '#A16207' }}>No parcels yet</div>}
                      <div className="fc-small fc-muted">{r.views} customer{r.views === 1 ? '' : 's'} checked this week</div>
                    </td>
                    <td data-label="Trial"><AccessPill access={r.access} /></td>
                    <td data-label="Manager">
                      {me.role === 'admin' ? (
                        <select className="fc-select" style={{ width: 'auto', minWidth: 130, padding: '6px 10px' }} value={r.managerId || ''} onChange={e => onAssign(r, e.target.value)}>
                          <option value="">No manager</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name || s.email}</option>)}
                        </select>
                      ) : (r.manager || <span className="fc-muted">No manager</span>)}
                    </td>
                    <td data-label="Last note" style={{ maxWidth: 260 }}>
                      {r.lastNote
                        ? <><div className="fc-small" style={{ lineHeight: 1.45 }}>{r.lastNote.text}</div><div className="fc-small fc-muted">{r.lastNote.by} · {when(r.lastNote.at)}</div></>
                        : <span className="fc-small fc-muted">—</span>}
                    </td>
                    <td className="fc-cards-actions">
                      <Button size="sm" onClick={() => onNote(r)}>{r.stage === 'new' ? 'Log call' : 'Add note'}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

export default function Signups() {
  const [list, setList] = useState(null);
  const [staff, setStaff] = useState([]);
  const [view, setView] = useState('board');
  const [who, setWho] = useState('all');
  const [search, setSearch] = useState('');
  const [noting, setNoting] = useState(null);
  const [n, setN] = useState(0);
  useEffect(() => { call('/api/admin/signups').then(d => setList(d.list)).catch(e => toast(e.message, 'err')); }, [n]);
  useEffect(() => { call('/api/admin/staff').then(d => setStaff(d.staff.filter(s => s.active))).catch(() => {}); }, []);
  useEffect(() => { try { const v = localStorage.getItem('ft_signups_view'); if (v === 'table' || v === 'board') setView(v); } catch { /* fine */ } }, []);
  function pickView(v) { setView(v); try { localStorage.setItem('ft_signups_view', v); } catch { /* fine */ } }

  // Move a card: show it in the new place at once, undo if saving fails
  async function move(row, to) {
    if (to === row.stage) return;
    if (to === 'paid') { toast('Brands move to Paid by themselves when you tap +1 month on the brand.', 'err'); return; }
    if (row.stage === 'paid') { toast('This brand has paid. Change its paid date on the brand page.', 'err'); return; }
    setList(l => l.map(r => (r.id === row.id ? { ...r, stage: to } : r)));
    try {
      await call(`/api/admin/brands/${row.id}`, { method: 'PATCH', body: { leadStage: to } });
      toast(`${row.name} → ${STAGES.find(s => s.value === to).label}`);
    } catch (e) {
      setList(l => l.map(r => (r.id === row.id ? { ...r, stage: row.stage } : r)));
      toast(e.message, 'err');
    }
  }
  async function assign(row, managerId) {
    try { await call(`/api/admin/brands/${row.id}`, { method: 'PATCH', body: { managerId } }); toast('Manager set'); setN(x => x + 1); }
    catch (e) { toast(e.message, 'err'); }
  }

  return (
    <AdminFrame title="Signups" subtitle="Call new brands, help them set up, and turn them into paying customers.">
      {me => {
        if (!list) return <Loading />;
        const s = search.trim().toLowerCase();
        const rows = list.filter(r => (who === 'all' || (who === 'mine' ? r.managerId === me.id : !r.managerId))
          && (!s || [r.name, r.contactName, r.phone, r.email, r.code].some(v => String(v || '').toLowerCase().includes(s))));
        return (
          <div className="fc-stack">
            <style dangerouslySetInnerHTML={{ __html: KB_CSS }} />
            <div className="fc-kb-bar">
              <div className="fc-seg" role="tablist" aria-label="View">
                <button role="tab" aria-selected={view === 'board'} className={view === 'board' ? 'is-on' : ''} onClick={() => pickView('board')}>▦ Board</button>
                <button role="tab" aria-selected={view === 'table'} className={view === 'table' ? 'is-on' : ''} onClick={() => pickView('table')}>☰ Table</button>
              </div>
              <input className="fc-input fc-kb-search" placeholder="Search brand, name, phone or email" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="fc-select" style={{ width: 'auto' }} value={who} onChange={e => setWho(e.target.value)} aria-label="Whose signups">
                <option value="all">Everyone’s</option>
                <option value="mine">Mine</option>
                <option value="none">No manager yet</option>
              </select>
            </div>
            {view === 'board'
              ? <><p className="fc-hint fc-kb-tip">Drag a card to another column. On a phone, press and hold a card to drag it, or use “Move to…”.</p>
                  <Board rows={rows} onNote={setNoting} onMove={move} /></>
              : <Table rows={rows} me={me} staff={staff} onNote={setNoting} onMove={move} onAssign={assign} />}
            {noting && <NoteModal row={noting} onClose={() => setNoting(null)} onSaved={() => { setNoting(null); setN(x => x + 1); }} />}
          </div>
        );
      }}
    </AdminFrame>
  );
}

const KB_CSS = `
.fc-kb-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
.fc-kb-search{flex:1 1 220px;width:auto;}
.fc-seg{display:inline-flex;background:#EFEFF1;border-radius:12px;padding:3px;}
.fc-seg button{border:none;background:transparent;padding:8px 14px;border-radius:9px;font-weight:700;font-size:14px;color:#5C5C66;cursor:pointer;font-family:inherit;}
.fc-seg button.is-on{background:#fff;color:#121212;box-shadow:0 1px 3px rgba(0,0,0,.12);}
.fc-kb-tip{margin:-6px 0 0;}
.fc-kb{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;overflow-x:auto;padding-bottom:8px;align-items:start;scroll-snap-type:x proximity;}
.fc-kb-col{background:#EFEFF1;border-radius:16px;padding:10px;min-width:0;scroll-snap-align:start;transition:background-color .15s,box-shadow .15s;}
.fc-kb-col.is-over{background:#FFF3C4;box-shadow:inset 0 0 0 2px #FEC200;}
.fc-kb-col.is-blocked{opacity:.55;}
.fc-kb-col.is-no{opacity:1;background:#FDECEC;box-shadow:inset 0 0 0 2px #F5B5B8;}
.fc-kb-head{display:flex;align-items:center;gap:8px;padding:4px 4px 10px;flex-wrap:wrap;}
.fc-kb-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.fc-kb-count{background:#fff;border-radius:999px;padding:0 8px;font-size:12px;font-weight:700;}
.fc-kb-hint{flex-basis:100%;font-size:12px;color:#8E8E98;padding-left:17px;margin-top:-4px;}
.fc-kb-body{display:flex;flex-direction:column;gap:8px;min-height:90px;}
.fc-kb-empty{border:2px dashed #D4D4D8;border-radius:12px;padding:22px 10px;text-align:center;font-size:13px;color:#8E8E98;}
.fc-kb-drag{touch-action:manipulation;cursor:grab;outline:none;border-radius:14px;}
.fc-kb-drag:focus-visible{box-shadow:0 0 0 3px #121212;}
.fc-kb-drag.is-ghost{opacity:.35;}
.fc-kb-drag.is-fixed{cursor:default;}
.fc-kb-card{background:#fff;border:1px solid #E4E4E7;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;user-select:none;-webkit-user-select:none;}
.fc-kb-card.is-overlay{cursor:grabbing;transform:rotate(2deg);box-shadow:0 18px 40px -14px rgba(0,0,0,.4);}
.fc-kb-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}
.fc-kb-name{font-weight:800;font-size:15px;line-height:1.3;color:#121212;}
.fc-kb-name:hover{color:#DF1515;}
.fc-kb-av{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#121212;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.fc-kb-av.is-none{background:#fff;color:#A1A1AA;border:1.5px dashed #D4D4D8;}
.fc-kb-sub{font-size:12.5px;color:#71717A;margin-top:-4px;}
.fc-kb-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
.fc-kb-chip{font-size:12px;font-weight:700;border-radius:999px;padding:3px 9px;background:#F4F4F5;color:#3F3F46;}
.fc-kb-chip.is-ok{background:#E7F6EE;color:#16884F;}
.fc-kb-chip.is-warn{background:#FFF3C4;color:#8A5A00;}
.fc-kb-note{background:#FAFAFA;border-left:3px solid #FEC200;border-radius:6px;padding:6px 8px;font-size:12.5px;line-height:1.45;color:#3F3F46;}
.fc-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.fc-kb-note-by{display:block;font-size:11.5px;color:#8E8E98;margin-top:2px;}
.fc-kb-actions{display:flex;gap:6px;align-items:center;padding-top:8px;border-top:1px dashed #E4E4E7;cursor:default;}
.fc-kb-ico{width:34px;height:34px;border-radius:10px;border:1px solid #E4E4E7;display:flex;align-items:center;justify-content:center;font-size:15px;background:#fff;color:#121212;flex-shrink:0;}
.fc-kb-ico.is-wa{background:#1FA855;border-color:#1FA855;color:#fff;}
.fc-kb-btn{height:34px;padding:0 12px;border-radius:10px;border:none;background:#121212;color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;flex-shrink:0;}
.fc-kb-move{height:34px;flex:1;min-width:0;border-radius:10px;border:1px solid #E4E4E7;background:#fff;font-size:13px;font-weight:600;padding:0 8px;font-family:inherit;color:#3F3F46;cursor:pointer;}
.fc-kb-stage,.fc-kb-stagesel{font-weight:700;color:var(--c);}
.fc-kb-stage{display:inline-block;padding:4px 10px;border-radius:999px;background:#E7F6EE;font-size:13px;}
.fc-kb-stagesel{width:auto;padding:6px 10px;border-color:var(--c);}
.fc-kb-move{display:none;}
@media (hover:none),(pointer:coarse){.fc-kb-move{display:block;}}
@media (max-width:1180px){.fc-kb{grid-template-columns:repeat(5,250px);}}
@media (max-width:760px){
  .fc-kb{grid-template-columns:repeat(5,82vw);margin:0 -16px;padding:0 16px 8px;scroll-snap-type:x mandatory;scroll-padding:0 16px;}
  .fc-kb-move{font-size:16px;}
}
`;
