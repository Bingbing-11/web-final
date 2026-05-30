import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntryStore } from '../../stores/useEntryStore';
import styles from './BurnView.module.css';

/* ── 灰烬粒子 (Canvas) ── */
interface Ash {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  shape: 'rect' | 'circle';
}

const ASH_COLORS = [
  '#D63031', '#E17055', '#FDCB6E', '#FAB1A0',
  '#E8D5B7', '#C4A882', '#8B6F47', '#FF7675',
  '#FD79A8', '#FFEAA7', '#DFE6E9', '#B2BEC3',
];

function useAshCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ashesRef = useRef<Ash[]>([]);
  const rafRef = useRef<number>(0);

  const spawn = useCallback((count: number) => {
    const ash = ashesRef.current;
    for (let i = 0; i < count; i++) {
      ash.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.5 + Math.random() * 2.5,
        size: 1.5 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.6,
        life: 0,
        maxLife: 120 + Math.random() * 180,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        color: ASH_COLORS[Math.floor(Math.random() * ASH_COLORS.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // 持续生成灰烬
      if (frame < 180) spawn(Math.floor(3 + Math.random() * 4));

      const ash = ashesRef.current;
      for (let i = ash.length - 1; i >= 0; i--) {
        const a = ash[i];
        a.life++;
        a.x += a.vx + Math.sin(a.life * 0.02) * 0.3;
        a.y += a.vy;
        a.vy += 0.01; // gravity
        a.rotation += a.rotSpeed;
        a.opacity = Math.max(0, a.opacity - 0.003);

        if (a.life > a.maxLife || a.y > canvas.height + 20 || a.opacity <= 0) {
          ash.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = a.opacity;
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.fillStyle = a.color;

        if (a.shape === 'rect') {
          ctx.fillRect(-a.size / 2, -a.size / 2, a.size, a.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, a.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 底部灰烬堆积
      if (frame > 60) {
        const gradient = ctx.createLinearGradient(0, canvas.height - 40, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(139, 111, 71, 0)');
        gradient.addColorStop(1, `rgba(139, 111, 71, ${Math.min(0.15, (frame - 60) * 0.001)})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, spawn]);

  return canvasRef;
}

/* ── 单个文字碎片 ── */
interface TextShard {
  id: number;
  char: string;
  delay: number;
  tx: number;
  ty: number;
  rotate: number;
  scale: number;
  duration: number;
}

export default function BurnView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entry = useEntryStore(s => s.getEntry(id || ''));
  const burnEntry = useEntryStore(s => s.burnEntry);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [burning, setBurning] = useState(false);
  const [burnPhase, setBurnPhase] = useState(0); // 0=idle, 1=igniting, 2=shattering, 3=done
  const [glowY, setGlowY] = useState(-100);

  const textContainerRef = useRef<HTMLDivElement>(null);

  const paragraphs = useMemo(() => {
    if (!entry?.content) return [];
    return entry.content.split(/\n+/).filter(p => p.trim());
  }, [entry]);

  // 逐段显示
  useEffect(() => {
    if (burning || !paragraphs.length) return;
    const timer = setInterval(() => {
      setVisibleParagraphs(prev => {
        if (prev >= paragraphs.length) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(timer);
  }, [paragraphs, burning]);

  // 倒计时
  useEffect(() => {
    if (burning) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [burning]);

  // 生成文字碎片
  const shards = useMemo(() => {
    if (burnPhase < 2) return [];
    const result: TextShard[] = [];
    let shardId = 0;
    const text = paragraphs.join('');
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.trim() === '') continue;
      // 判断中文字符宽度更大
      const isCN = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char);
      result.push({
        id: shardId++,
        char,
        delay: Math.random() * 1.5,
        tx: (Math.random() - 0.5) * 300,
        ty: 200 + Math.random() * 500,
        rotate: (Math.random() - 0.5) * 720,
        scale: 0.2 + Math.random() * 0.6,
        duration: 2.5 + Math.random() * 2,
      });
    }
    return result;
  }, [burnPhase, paragraphs]);

  // 灰烬 Canvas
  const ashCanvasRef = useAshCanvas(burnPhase >= 1);

  // BURN 按钮点击
  const handleBurn = useCallback(() => {
    setBurning(true);
    setBurnPhase(1); // 点燃阶段

    // 火焰光带从上往下移动
    let startY = 0;
    const glowInterval = setInterval(() => {
      startY += 3;
      setGlowY(startY);
      if (startY > window.innerHeight) clearInterval(glowInterval);
    }, 16);

    // 1.2秒后开始碎裂
    setTimeout(() => {
      setBurnPhase(2);
    }, 1200);

    // 5秒后导航
    setTimeout(async () => {
      setBurnPhase(3);
      if (id) await burnEntry(id);
      setTimeout(() => navigate('/'), 600);
    }, 5000);
  }, [id, burnEntry, navigate]);

  if (!entry) return <div>日记不存在</div>;

  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <div className={`${styles.page} ${burnPhase >= 2 ? styles.shattering : ''}`}>
      {/* 灰烬粒子 Canvas */}
      <canvas ref={ashCanvasRef} className={styles.ashCanvas} />

      {/* 火焰光带 */}
      {burnPhase >= 1 && burnPhase < 3 && (
        <div className={styles.glowLine} style={{ top: `${glowY}px` }} />
      )}

      {/* 暗角遮罩 */}
      <div className={styles.vignette} />

      {/* 文字内容区域 */}
      <div className={styles.textArea} ref={textContainerRef}>
        {burnPhase < 2 ? (
          // 正常显示段落
          paragraphs.slice(0, visibleParagraphs).map((p, i) => (
            <p key={i} className={styles.paragraph} style={{ animationDelay: `${i * 0.6}s` }}>
              {p}
            </p>
          ))
        ) : (
          // 碎片化显示：每个字符变成独立的碎片
          <div className={styles.shardContainer}>
            {shards.map(s => (
              <span
                key={s.id}
                className={styles.shard}
                style={{
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.duration}s`,
                  '--tx': `${s.tx}px`,
                  '--ty': `${s.ty}px`,
                  '--rotate': `${s.rotate}deg`,
                  '--scale': s.scale,
                } as React.CSSProperties}
              >
                {s.char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      {!burning && (
        <div className={styles.controls}>
          <div className={styles.timerText}>阅读倒计时 {timeLeft}s</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <button className={styles.burnBtn} onClick={handleBurn}>
            <span className={styles.burnBtnIcon}>🔥</span>
            <span>BURN</span>
          </button>
          <div className={styles.burnHint}>焚毁后无法恢复</div>
        </div>
      )}

      {/* 焚毁中提示 */}
      {burnPhase >= 1 && burnPhase < 3 && (
        <div className={styles.burningLabel}>
          <span className={styles.burningIcon}>🔥</span>
          <span>回忆正在化为灰烬...</span>
        </div>
      )}

      {/* 底部灰烬堆积 */}
      {burnPhase >= 2 && (
        <div className={styles.ashPile} />
      )}
    </div>
  );
}
