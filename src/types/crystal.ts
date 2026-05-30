export interface CrystalParams {
  hue: number;
  saturation: number;
  lightness: number;
  opacity: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  transmission: number;
  thickness: number;
  ior: number;
  particleCount: number;
  particleSpeed: number;
  envIntensity: number;
  breatheSpeed: number;
  breatheAmplitude: number;
}

export interface SceneWeights {
  [sceneId: string]: number;
}

export interface SceneTemplate {
  id: string;
  name: string;
  nameZh: string;
  geometry: 'cone' | 'sphere' | 'plane' | 'torus' | 'custom';
  colors: [number, number, number];
  particleColor: [number, number, number];
  keywords: string[];
}
