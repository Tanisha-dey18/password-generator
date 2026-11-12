// Run with: node --test
const test = require("node:test");
const assert = require("node:assert");
const { CHARSETS, LOOKALIKES, randomInt, generate, entropyBits, strengthLabel } = require("./password.js");

const ALL = { length: 16, lower: true, upper: true, digits: true, symbols: true, avoidLookalikes: false };

test("generates the requested length", () => {
  for (const length of [4, 16, 64]) assert.strictEqual(generate({ ...ALL, length }).length, length);
});

test("includes at least one character from every chosen set", () => {
  for (let i = 0; i < 200; i++) {
    const pw = generate({ ...ALL, length: 4 });
    for (const set of Object.values(CHARSETS)) {
      assert.ok([...pw].some((ch) => set.includes(ch)), `${pw} is missing a character from ${set}`);
    }
  }
});

test("only uses characters from chosen sets", () => {
  const pw = generate({ length: 64, digits: true });
  assert.match(pw, /^[0-9]+$/);
});

test("avoids look-alike characters when asked", () => {
  for (let i = 0; i < 50; i++) {
    const pw = generate({ ...ALL, length: 64, avoidLookalikes: true });
    assert.ok(![...pw].some((ch) => LOOKALIKES.has(ch)), pw);
  }
});

test("rejects impossible options", () => {
  assert.throws(() => generate({ length: 10 }), /at least one character type/);
  assert.throws(() => generate({ ...ALL, length: 3 }), /too short/);
});

test("randomInt is roughly uniform", () => {
  const counts = new Array(6).fill(0);
  const n = 60000;
  for (let i = 0; i < n; i++) counts[randomInt(6)]++;
  // Each bucket should be within 5% of n/6 = 10000 (a very loose bound for this sample size)
  for (const c of counts) assert.ok(Math.abs(c - n / 6) < 500, `counts: ${counts}`);
});

test("entropy and labels", () => {
  // 16 chars from a pool of 10 digits = 16 * log2(10) ≈ 53.2 bits
  assert.ok(Math.abs(entropyBits({ length: 16, digits: true }) - 16 * Math.log2(10)) < 1e-9);
  assert.strictEqual(entropyBits({ length: 16 }), 0);
  assert.strictEqual(strengthLabel(30), "Weak");
  assert.strictEqual(strengthLabel(53), "Fair");
  assert.strictEqual(strengthLabel(70), "Strong");
  assert.strictEqual(strengthLabel(100), "Very strong");
});
