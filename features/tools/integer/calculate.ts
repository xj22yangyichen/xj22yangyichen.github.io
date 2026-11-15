const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
export const MAX_INTEGER = TWO ** BigInt(60);
const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37].map(BigInt);

export function parseInteger(input: string): bigint {
  const text = input.trim();
  if (!/^[0-9]+$/.test(text)) throw new Error("invalid-integer");
  const normalized = text.replace(/^0+/, "") || "0";
  if (normalized.length > 19) throw new Error("out-of-range");
  const value = BigInt(normalized);
  if (value > MAX_INTEGER) throw new Error("out-of-range");
  return value;
}

function checkRange(n: bigint) {
  if (n < ZERO || n > MAX_INTEGER) throw new Error("out-of-range");
}

function powerMod(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = ONE;
  while (exponent > ZERO) {
    if (exponent % TWO === ONE) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent /= TWO;
  }
  return result;
}

export function isPrime(n: bigint): boolean {
  checkRange(n);
  if (n < TWO) return false;
  for (const p of SMALL_PRIMES) {
    if (n % p === ZERO) return n === p;
  }
  let d = n - ONE;
  let s = 0;
  while (d % TWO === ZERO) {
    d /= TWO;
    s++;
  }
  // These witnesses make Miller–Rabin deterministic below 2^64.
  // https://ceur-ws.org/Vol-1326/020-Forisek.pdf
  for (const witness of [2, 325, 9375, 28178, 450775, 9780504, 1795265022]) {
    const base = BigInt(witness) % n;
    if (base === ZERO) continue;
    let x = powerMod(base, d, n);
    if (x === ONE || x === n - ONE) continue;
    let passed = false;
    for (let r = 1; r < s; r++) {
      x = (x * x) % n;
      if (x === n - ONE) {
        passed = true;
        break;
      }
    }
    if (!passed) return false;
  }
  return true;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== ZERO) [a, b] = [b, a % b];
  return a;
}

function divisor(n: bigint): bigint {
  // Pollard rho with bounded attempts: retry a different polynomial on cycles.
  for (let c = ONE; ; c++) {
    let x = TWO;
    let y = TWO;
    for (let step = 0; step < 200_000; step++) {
      x = (x * x + c) % n;
      y = (y * y + c) % n;
      y = (y * y + c) % n;
      const d = gcd(x > y ? x - y : y - x, n);
      if (d === n) break;
      if (d > ONE) return d;
    }
  }
}

export function primeFactors(n: bigint): bigint[] {
  checkRange(n);
  if (n < TWO) throw new Error("no-factorization");
  const factors: bigint[] = [];
  for (const p of SMALL_PRIMES) {
    while (n % p === ZERO) {
      factors.push(p);
      n /= p;
    }
  }
  function split(value: bigint) {
    if (value === ONE) return;
    if (isPrime(value)) {
      factors.push(value);
      return;
    }
    const factor = divisor(value);
    split(factor);
    split(value / factor);
  }
  split(n);
  return factors.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function formatFactors(factors: readonly bigint[]): string {
  const powers = new Map<bigint, number>();
  for (const factor of factors)
    powers.set(factor, (powers.get(factor) ?? 0) + 1);
  return Array.from(powers, ([prime, exponent]) =>
    exponent === 1 ? String(prime) : `${prime}^${exponent}`,
  ).join(" × ");
}
