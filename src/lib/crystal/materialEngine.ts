import type { CrystalParams } from '../../types/crystal';

export function computeMaterialParams(emotionHue?: number, intensity?: number): Partial<CrystalParams> {
  const hue = emotionHue ?? 200;
  const i = intensity ?? 0.5;
  return {
    roughness: 0.1 + (1 - i) * 0.3,
    metalness: 0.1 + i * 0.2,
    clearcoat: 0.5 + i * 0.5,
    transmission: 0.3 + i * 0.5,
    thickness: 0.5 + i * 1.5,
    ior: 1.3 + i * 0.4,
    opacity: 0.6 + i * 0.3,
  };
}

export const DEFAULT_CRYSTAL_PARAMS: CrystalParams = {
  hue: 200,
  saturation: 70,
  lightness: 60,
  opacity: 0.8,
  roughness: 0.15,
  metalness: 0.2,
  clearcoat: 0.8,
  transmission: 0.6,
  thickness: 1.0,
  ior: 1.5,
  particleCount: 50,
  particleSpeed: 0.5,
  envIntensity: 1.0,
  breatheSpeed: 0.5,
  breatheAmplitude: 0.02,
};
