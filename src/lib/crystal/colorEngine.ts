export function computeTargetHue(keywordCount: number, daysActive: number, emotionHue?: number): number {
  if (emotionHue !== undefined) return emotionHue;
  const base = (keywordCount * 37 + daysActive * 13) % 360;
  return base;
}

export function breathe(time: number, speed: number, amplitude: number): number {
  return Math.sin(time * speed) * amplitude;
}

export function lerpHue(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  return ((a + diff * t) + 360) % 360;
}

export function hslToHex(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
