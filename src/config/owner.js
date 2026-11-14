const { verifyIdToken } = require('./firebase');

// Anonymous device IDs from the app look like "dev_<24 chars>". "uid_" keys belong to
// signed-in Google accounts and must only ever come from a verified ID token.
const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const RESERVED_IDS = new Set(['anon_device', 'pwa_client_web']);

function isValidDeviceId(id) {
  return typeof id === 'string' && DEVICE_ID_PATTERN.test(id) && !id.startsWith('uid_') && !RESERVED_IDS.has(id);
}

/**
 * Works out who is making the request.
 * - Bearer token present → must verify, owner = "uid_<uid>" (invalid token → 401).
 * - Otherwise → a valid anonymous device ID (anything else → 400).
 * Returns { owner } or { status, error }.
 */
async function resolveOwner(req, deviceId) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const user = await verifyIdToken(header.slice(7));
    if (!user) return { status: 401, error: 'Sign-in expired. Please sign in again.' };
    return { owner: `uid_${user.uid}` };
  }
  if (isValidDeviceId(deviceId)) return { owner: deviceId };
  return { status: 400, error: 'A valid deviceId or sign-in is required' };
}

module.exports = { resolveOwner, isValidDeviceId };
