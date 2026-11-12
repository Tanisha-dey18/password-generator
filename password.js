// Password generation and strength estimation. No DOM code here, so it can be tested on its own.

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

// Characters that are easy to confuse when reading a password aloud or copying it by hand
const LOOKALIKES = new Set("Il1O0o");

// Browsers have crypto.getRandomValues; older Node versions expose it as webcrypto
const cryptoApi = globalThis.crypto ?? require("crypto").webcrypto;

// A uniformly random integer in [0, max). Uses rejection sampling: plain
// `random % max` would make some values slightly more likely than others.
function randomInt(max) {
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  do {
    cryptoApi.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function buildPool(options) {
  const sets = Object.keys(CHARSETS)
    .filter((name) => options[name])
    .map((name) => [...CHARSETS[name]].filter((ch) => !(options.avoidLookalikes && LOOKALIKES.has(ch))).join(""));
  return { sets, pool: sets.join("") };
}

// Returns a password with at least one character from every chosen set
function generate(options) {
  const { sets, pool } = buildPool(options);
  if (!pool) throw new Error("Choose at least one character type");
  if (options.length < sets.length) throw new Error("Password is too short for the chosen character types");

  const chars = sets.map((set) => set[randomInt(set.length)]);
  while (chars.length < options.length) chars.push(pool[randomInt(pool.length)]);

  // Shuffle so the guaranteed characters aren't always at the start (Fisher–Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// Entropy in bits: how many yes/no guesses an attacker needs on average, roughly.
// Each character chosen from a pool of N adds log2(N) bits.
function entropyBits(options) {
  const { pool } = buildPool(options);
  return pool ? options.length * Math.log2(pool.length) : 0;
}

function strengthLabel(bits) {
  if (bits < 40) return "Weak";
  if (bits < 60) return "Fair";
  if (bits < 80) return "Strong";
  return "Very strong";
}

// Lets Node load this file for testing; ignored in the browser
if (typeof module !== "undefined") {
  module.exports = { CHARSETS, LOOKALIKES, randomInt, generate, entropyBits, strengthLabel };
}
