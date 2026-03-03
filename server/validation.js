// Basic validation utilities (rate limiting, sanity checks) - included for completeness (not extensively used in demo).

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

module.exports = { clamp };