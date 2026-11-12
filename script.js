const STRENGTH_COLORS = { Weak: "--weak", Fair: "--fair", Strong: "--strong", "Very strong": "--very-strong" };
const FULL_METER_BITS = 128;

const passwordEl = document.getElementById("password");
const optionsEl = document.getElementById("options");
const lengthEl = document.getElementById("length");
const lengthValueEl = document.getElementById("length-value");
const meterEl = document.getElementById("meter-fill");
const labelEl = document.getElementById("strength-label");
const bitsEl = document.getElementById("bits");
const errorEl = document.getElementById("error");
const copyEl = document.getElementById("copy");

function readOptions() {
  const options = { length: Number(lengthEl.value) };
  for (const box of optionsEl.querySelectorAll("input[type=checkbox]")) options[box.name] = box.checked;
  return options;
}

function update() {
  const options = readOptions();
  lengthValueEl.textContent = options.length;
  try {
    passwordEl.value = generate(options);
    errorEl.textContent = "";
  } catch (err) {
    passwordEl.value = "";
    errorEl.textContent = err.message;
  }

  const bits = entropyBits(options);
  const label = bits ? strengthLabel(bits) : "–";
  labelEl.textContent = label;
  bitsEl.textContent = Math.round(bits);
  meterEl.style.width = `${Math.min(100, (bits / FULL_METER_BITS) * 100)}%`;
  meterEl.style.backgroundColor = STRENGTH_COLORS[label] ? `var(${STRENGTH_COLORS[label]})` : "transparent";
}

async function copy() {
  if (!passwordEl.value) return;
  try {
    await navigator.clipboard.writeText(passwordEl.value);
    copyEl.textContent = "Copied!";
  } catch {
    // Clipboard API blocked (e.g. file:// or an old browser): select the text so Ctrl+C works
    passwordEl.select();
    copyEl.textContent = "Press Ctrl+C";
  }
  setTimeout(() => (copyEl.textContent = "Copy"), 1500);
}

optionsEl.addEventListener("input", update);
document.getElementById("generate").onclick = update;
copyEl.onclick = copy;

update();
