import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BurnMode.module.css';

/* ── 常量文案 ── */
const TEXT = {
  placeholder: '在这里写下隐秘的思绪…',
  burnBtnLabel: '焚烧',
  confirmTitle: '确认焚烧？',
  confirmDesc: '这些文字将永远消失，无法找回',
};

/* ── Canvas 背景粒子系统 ── */
class ParticleEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number; opacity: number;
    life: number; maxLife: number;
  }> = [];
  running = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', this.resize);
    this.loop();
  }

  resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  spawnParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.3 + Math.random() * 0.6),
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.2,
      life: 0,
      maxLife: 200 + Math.random() * 300,
    };
  }

  loop = () => {
    if (!this.running) return;
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.particles.length < 40 && Math.random() < 0.3) {
      this.particles.push(this.spawnParticle());
    }

    this.particles = this.particles.filter(p => {
      p.life++;
      if (p.life >= p.maxLife) return false;
      p.x += p.vx;
      p.y += p.vy;
      const progress = p.life / p.maxLife;
      const alpha = p.opacity * (1 - progress) * (1 - progress);
      ctx.fillStyle = `rgba(255, 210, 150, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    requestAnimationFrame(this.loop);
  };

  destroy() {
    this.running = false;
    window.removeEventListener('resize', this.resize);
  }
}

/* ═════════════════════════════════════════════════
   BurnMode 组件
   ═════════════════════════════════════════════════ */
export default function BurnMode() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [burning, setBurning] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const recognitionRef = useRef<any>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);

  /* ── Canvas 粒子引擎 ── */
  useEffect(() => {
    if (!canvasRef.current) return;
    engineRef.current = new ParticleEngine(canvasRef.current);
    return () => engineRef.current?.destroy();
  }, []);

  /* ── 自动聚焦 ── */
  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  /* ── 关闭（淡出回首页） ── */
  const handleClose = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => navigate('/'), 600);
  }, [navigate]);

  /* ── 语音输入 ── */
  const handleMicClick = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音输入');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(prev => prev + transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.start();
    setListening(true);
  }, [listening]);

  /* ── 焚烧确认 ── */
  const handleBurnClick = useCallback(() => {
    if (!text.trim() || burning) return;
    setShowConfirm(true);
  }, [text, burning]);

  /* ── 确认焚烧 ── */
  const handleConfirmBurn = useCallback(() => {
    setShowConfirm(false);
    if (navigator.vibrate) navigator.vibrate(50);
    setBurning(true);

    const textarea = textareaRef.current;
    const container = particleContainerRef.current;
    if (!textarea || !container) return;

    /* 文字区域瞬间隐藏，营造文字直接变成碎片的视觉 */
    textarea.style.opacity = '0';

    /* ── 文字碎片粒子（100颗，每颗独立运动轨迹） ── */
    const rect = textarea.getBoundingClientRect();
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = styles.burnParticle;

      /* 粒子起点在 textarea 区域内 */
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;

      /* 每颗粒子独立的位移 & 旋转 */
      const tx = (Math.random() - 0.5) * 200;
      const ty = Math.random() * 300 + 100;
      const tr = Math.random() * 720;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = `${Math.random() * 4 + 2}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.setProperty('--tr', `${tr}deg`);

      container.appendChild(particle);

      /* 动画结束自动清理 */
      setTimeout(() => particle.remove(), 2000);
    }

    /* 1.5s 后恢复 textarea 并淡出回首页 */
    setTimeout(() => {
      textarea.style.opacity = '1';
      setText('');
      setFadingOut(true);
      setTimeout(() => navigate('/'), 800);
    }, 1500);
  }, [navigate]);

  /* ── ESC 关闭 ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  return (
    <div className={`${styles.page} ${burning ? styles.burning : ''} ${fadingOut ? styles.fadingOut : ''}`}>
      {/* Canvas 背景粒子层 */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* 文字碎片粒子容器 */}
      <div ref={particleContainerRef} className={styles.particleContainer} />

      {/* 环境光晕 */}
      <div className={styles.ambientGlow} />
      {!burning && <div className={styles.lampGlow} />}

      {/* ── 顶部栏 ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={`material-symbols-outlined ${styles.topBarIcon}`}>light_mode</span>
          <span className={styles.topBarLabel}>灰烬模式</span>
        </div>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="关闭">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* ── 中央书写区 ── */}
      <main className={styles.writingArea}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={TEXT.placeholder}
          value={text}
          onChange={e => { if (!burning) setText(e.target.value); }}
          disabled={burning}
          autoFocus
          spellCheck={false}
        />

        {/* 语音输入按钮 */}
        {!burning && (
          <div className={styles.micArea}>
            <button
              className={`${styles.micBtn} ${listening ? styles.micBtnListening : ''}`}
              onClick={handleMicClick}
              aria-label={listening ? '停止录音' : '语音输入'}
            >
              <span className="material-symbols-outlined">
                {listening ? 'mic_off' : 'mic'}
              </span>
            </button>
          </div>
        )}
      </main>

      {/* ── 焚烧按钮 ── */}
      {!burning && !fadingOut && (
        <div className={styles.burnBtnWrap}>
          <button
            className={`${styles.burnBtn} ${text.trim() ? styles.burnBtnActive : styles.burnBtnDisabled}`}
            onClick={handleBurnClick}
            disabled={!text.trim()}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>local_fire_department</span>
            <span className={styles.burnBtnText}>{TEXT.burnBtnLabel}</span>
          </button>
        </div>
      )}

      {/* ── 焚烧确认弹框 ── */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>
            <div className={styles.confirmTitle}>{TEXT.confirmTitle}</div>
            <div className={styles.confirmDesc}>{TEXT.confirmDesc}</div>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={() => setShowConfirm(false)}>
                再想想
              </button>
              <button className={styles.confirmOk} onClick={handleConfirmBurn}>
                焚烧
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
