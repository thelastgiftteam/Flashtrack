// Signup follow-up stages for the team. "paid" is never stored: a brand with
// a paid-until date counts as paid, whatever stage it was in.
export const STAGES = [
  { value: 'new',    label: 'New',            hint: 'Not called yet' },
  { value: 'called', label: 'Called',         hint: 'Spoke to them' },
  { value: 'setup',  label: 'Set up',         hint: 'Using the page' },
  { value: 'paid',   label: 'Paid',           hint: 'Paying customer' },
  { value: 'lost',   label: 'Not interested', hint: 'Not going ahead' },
];
export const STAGE_SET = new Set(['new', 'called', 'setup', 'lost']); // stages the team can pick
export const stageOf = b => (b.paid_until ? 'paid' : (STAGE_SET.has(b.lead_stage) ? b.lead_stage : 'new'));
export const stageLabel = v => (STAGES.find(s => s.value === v) || STAGES[0]).label;
