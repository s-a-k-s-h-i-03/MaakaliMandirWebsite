let counter = 0;

function nextCounter(): number {
  counter += 1;
  return counter;
}

export function buildSeed(prefix = "pw"): string {
  const stamp = Date.now();
  const serial = nextCounter();
  return `${prefix}-${stamp}-${serial}`;
}

export function buildDigits(length: number, seed: string): string {
  const raw = seed.replace(/\D/g, "") || `${Date.now()}`;
  return raw.slice(-length).padStart(length, "0");
}
