# 🔐 Password Generator

A small, secure password generator that runs entirely in your browser. No dependencies, no build step, and passwords never leave the page.

## Features

- Length from 4 to 64 characters
- Choose lowercase, uppercase, numbers and symbols
- Option to avoid look-alike characters (`I l 1 O 0 o`)
- Every chosen character type is guaranteed to appear at least once
- Strength meter showing the estimated entropy in bits
- One-click copy, with a fallback when the clipboard is blocked

## Why it's secure

- **Cryptographic randomness.** It uses `crypto.getRandomValues`, not `Math.random`. `Math.random` is not designed for security, and its output can be predictable.
- **No modulo bias.** Turning a random 32-bit number into an index with `n % poolSize` makes some characters slightly more likely. `randomInt()` uses *rejection sampling*: it throws away the few values that would cause bias and draws again.
- **Fair shuffle.** The guaranteed characters are mixed in with a Fisher–Yates shuffle, so they aren't always at the start.
- **Nothing is sent anywhere.** There are no network requests. The page works offline.

## Strength estimate

Entropy ≈ `length × log₂(pool size)` bits. For example, 16 characters from all four sets (88 characters) give about 103 bits.

| Bits  | Label       |
|-------|-------------|
| < 40  | Weak        |
| 40–59 | Fair        |
| 60–79 | Strong      |
| 80+   | Very strong |

This is the strength of a *randomly generated* password. It doesn't apply to passwords people make up, which are far more predictable.

## Project structure

| File               | Purpose                                                  |
|--------------------|----------------------------------------------------------|
| `index.html`       | Page layout                                              |
| `style.css`        | Styling                                                  |
| `password.js`      | Generation and entropy logic (no DOM, testable in Node)  |
| `script.js`        | UI: options, strength meter, copy button                 |
| `password.test.js` | Tests                                                    |

## Run it

Open `index.html` in a browser, or serve it locally:

```bash
python -m http.server 8000
```

The copy button needs `http://localhost` or `https://`. On `file://` it selects the text so you can press Ctrl+C.

## Run the tests

Requires Node.js 18+:

```bash
node --test
```

## License

[MIT](LICENSE)
