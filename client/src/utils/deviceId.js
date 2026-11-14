// Anonymous per-device ID for the money diary (no sign-up, per PRD "simple device IDs").
const KEY = 'trustlayer_device_id';
let memoryId = null;

function makeId() {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `dev_${rand.slice(0, 24)}`;
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = makeId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Private mode / blocked storage: keep one ID for this page session
    if (!memoryId) memoryId = makeId();
    return memoryId;
  }
}

export function formatInr(amount) {
  const n = Math.round(Number(amount) || 0);
  return `${n < 0 ? '−' : ''}₹${Math.abs(n).toLocaleString('en-IN')}`;
}

export function fillTemplate(text, values) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => (values[k] ?? ''));
}
