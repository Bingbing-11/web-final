import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BurnMode.module.css';

interface Shred {
  id: number;
  char: string;
  x: number;
  y: number;
  sx: number;
  sy: number;
  sr: number;
  delay: number;
}

/* ── 常量文案 ────────────────────────────────────── */
const TEXT = {
  placeholder: '在此写下，写完即焚……',
  burnBtnLabel: '焚烧',
  voiceTitle: '语音输入',
};

/* ── Canvas 背景粒子系统 ─────────────────────────── */
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

    // Spawn
    if (this.particles.length < 40 && Math.random() < 0.3) {
      this.particles.push(this.spawnParticle());
    }

    // Update & Draw
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
  const [shreds, setShreds] = useState<Shred[]>([]);
  const [ashPhase, setAshPhase] = useState<'idle' | 'shredding' | 'ash'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  /* ── Canvas 粒子引擎 ─── */
  useEffect(() => {
    if (!canvasRef.current) return;
    engineRef.current = new ParticleEngine(canvasRef.current);
    return () => engineRef.current?.destroy();
  }, []);

  /* ── 关闭 ─── */
  const handleClose = () => navigate('/');

  /* ── 焚烧 ─── */
  const handleBurn = useCallback(() => {
    if (!text.trim() || burning) return;
    setBurning(true);
    setAshPhase('shredding');

    // 生成字符碎片
    const chars = text.split('');
    const newShreds: Shred[] = chars.map((char, i) => ({
      id: i,
      char: char === ' ' ? ' ' : char,
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 25,
      sx: (Math.random() - 0.5) * 350,
      sy: 180 + Math.random() * 450,
      sr: (Math.random() - 0.5) * 900,
      delay: Math.random() * 0.6,
    }));
    setShreds(newShreds);

    // 碎片化结束后进入灰烬阶段，输入框保留
    setTimeout(() => setAshPhase('ash'), 1600);

    // 灰烬散尽后跳转
    setTimeout(() => navigate('/'), 2800);
  }, [text, burning, navigate]);

  /* ── 键盘快捷键 ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={`${styles.page} ${burning ? styles.burning : ''}`}>
      {/* Canvas 背景粒子层 */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* ── 台灯光晕（扩大覆盖整个书写区） ── */}
      <div className={styles.lampGlowLarge} />
      {!burning && <div className={styles.lampGlowAmbient} />}

      {/* ── 台灯图标 ── */}
      <div className={styles.lamp}>
        <span className={`${styles.lampIcon} material-symbols-outlined`}>light</span>
      </div>

      {/* ── 关闭按钮 ── */}
      <button className={styles.closeBtn} onClick={handleClose} aria-label="关闭">
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* ── 书写区 ── */}
      <div className={styles.writingArea} ref={inputContainerRef}>
        <textarea
          ref={textareaRef}
          className={`${styles.textarea} ${ashPhase === 'idle' ? '' : styles.textareaDim}`}
          placeholder={TEXT.placeholder}
          value={text}
          onChange={e => { if (!burning) setText(e.target.value); }}
          disabled={burning}
          autoFocus
        />
        {ashPhase === 'idle' && (
          <div className={`${styles.cursor} ${text.length > 0 ? styles.cursorHidden : ''}`} />
        )}
      </div>

      {/* ── 底部操作 ── */}
      {!burning && (
        <div className={styles.actions}>
          <button className={styles.voiceBtn} title={TEXT.voiceTitle}>
            <span className="material-symbols-outlined">mic</span>
          </button>
          <button
            className={`${styles.burnBtn} ${!text.trim() ? styles.disabled : ''}`}
            onClick={handleBurn}
            disabled={!text.trim()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>local_fire_department</span>
            {TEXT.burnBtnLabel}
          </button>
        </div>
      )}

      {/* ── 碎片动画层 ── */}
      {shreds.length > 0 && (
        <div className={styles.shreds}>
          {shreds.map(s => (
            <span
              key={s.id}
              className={`${styles.shred} ${ashPhase === 'ash' ? styles.shredAsh : ''}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                '--sx': `${s.sx}px`,
                '--sy': `${s.sy}px`,
                '--sr': `${s.sr}deg`,
                animationDelay: `${s.delay}s`,
              } as React.CSSProperties}
            >
              {s.char}
            </span>
          ))}
        </div>
      )}

      {/* ── 灰烬颗粒层 ── */}
      {ashPhase === 'ash' && (
        <div className={styles.ashParticles}>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`ash-${i}`}
              className={styles.ashParticle}
              style={{
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
