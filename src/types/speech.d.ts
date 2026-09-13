/**
 * Web Speech API 的最小类型声明
 * ─────────────────────────────────────────────
 * 说明：TS 内置 lib.dom 已包含 SpeechRecognitionResult / ResultList / Alternative，
 * 但尚未包含 SpeechRecognition、SpeechRecognitionEvent、SpeechRecognitionErrorEvent
 * （该 API 在各浏览器仍带前缀、实现不一）。这里按项目实际用到的成员做最小声明，
 * 以便语音输入功能保持类型安全，而不必到处写 `as any`。
 */

interface SpeechRecognitionEvent extends Event {
  /** 本次回调中第一个发生变化的结果下标 */
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface Window {
  /** 标准命名（Chrome 33+ / Edge 79+） */
  SpeechRecognition?: SpeechRecognitionConstructor;
  /** WebKit 前缀命名（Safari / 旧版 Chrome） */
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}
