export type EntryMode = 'normal' | 'burn' | 'timecapsule' | 'futurelook' | 'collection';
export type EntryStatus = 'draft' | 'published' | 'burned' | 'sealed';

export interface Entry {
  id: string;
  worldId: string;
  userId: string;
  title: string;
  content: string;
  mode: EntryMode;
  status: EntryStatus;
  emotion?: string;
  emotionHue?: number;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  readCount: number;
  burnedAt?: string;
  sealedUntil?: string;
  capsuleOpenAt?: string;
  worldName?: string;
  worldColor?: string;
}
