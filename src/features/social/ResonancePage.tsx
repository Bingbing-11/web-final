import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styles from './ResonancePage.module.css';
import {
  mockResonanceClusters,
  ResonanceCluster,
  ClusterNode,
} from '../../mocks/mockResonanceClusters';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/* ── Modal data ── */
interface ModalData {
  type: 'center' | 'satellite';
  content: string;
  emotion?: string;
  emotionHue: number;
  worldName?: string;
  createdAt?: string;
  satName?: string;
  satId?: string; // 卫星节点 ID，用于共鸣状态跟踪
  resonanceCount?: number;
  likedByMe?: boolean;
}

/* ═══════════════════════════════════════════
   动态星空 Canvas
   ═══════════════════════════════════════════ */
function StarField({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = ctx!; // 已在上方做 null 检查

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    c.scale(dpr, dpr);

    /* ── 星星数据 ── */
    interface Star {
      x: number; y: number;
      r: number; baseAlpha: number;
      twinkleSpeed: number; twinkleOffset: number;
      driftX: number; driftY: number;
    }
    const STAR_COUNT = Math.floor((width * height) / 800);
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 2 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.05,
    }));

    /* ── 流星数据 ── */
    interface ShootingStar {
      x: number; y: number;
      len: number; speed: number;
      angle: number; alpha: number;
      life: number; maxLife: number;
    }
    const shootingStars: ShootingStar[] = [];

    function spawnShootingStar() {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.3,
        len: 40 + Math.random() * 60,
        speed: 3 + Math.random() * 4,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 0.8 + Math.random() * 0.2,
        life: 0,
        maxLife: 40 + Math.random() * 30,
      });
    }

    /* ── 星云数据 ── */
    interface Nebula {
      x: number; y: number;
      rx: number; ry: number;
      hue: number; alpha: number;
      phase: number; speed: number;
    }
    const nebulae: Nebula[] = [
      { x: width * 0.25, y: height * 0.35, rx: 80, ry: 50, hue: 260, alpha: 0.04, phase: 0, speed: 0.3 },
      { x: width * 0.7, y: height * 0.6, rx: 60, ry: 40, hue: 300, alpha: 0.03, phase: 1.5, speed: 0.25 },
      { x: width * 0.5, y: height * 0.2, rx: 70, ry: 45, hue: 220, alpha: 0.035, phase: 3, speed: 0.2 },
    ];

    let frame = 0;
    let nextShootingFrame = 80 + Math.floor(Math.random() * 120);

    function draw() {
      frame++;
      c.clearRect(0, 0, width, height);

      /* 星云 */
      for (const n of nebulae) {
        const breathe = Math.sin(frame * 0.008 * n.speed + n.phase) * 0.3 + 1;
        const grd = c.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(1, n.rx * breathe));
        grd.addColorStop(0, `hsla(${n.hue}, 60%, 40%, ${n.alpha * 1.5})`);
        grd.addColorStop(0.5, `hsla(${n.hue}, 50%, 30%, ${n.alpha * 0.6})`);
        grd.addColorStop(1, 'transparent');
        c.fillStyle = grd;
        c.beginPath();
        c.ellipse(n.x, n.y, Math.max(1, n.rx * breathe), Math.max(1, n.ry * breathe), 0, 0, Math.PI * 2);
        c.fill();
      }

      /* 星星 */
      for (const s of stars) {
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const twinkle = Math.sin(frame * 0.03 * s.twinkleSpeed + s.twinkleOffset);
        const alpha = s.baseAlpha + twinkle * 0.2;

        c.beginPath();
        c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        c.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, alpha))})`;
        c.fill();

        /* 亮星加十字光芒 */
        if (s.r > 1.0 && alpha > 0.4) {
          c.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
          c.lineWidth = 0.5;
          c.beginPath();
          c.moveTo(s.x - s.r * 2.5, s.y);
          c.lineTo(s.x + s.r * 2.5, s.y);
          c.moveTo(s.x, s.y - s.r * 2.5);
          c.lineTo(s.x, s.y + s.r * 2.5);
          c.stroke();
        }
      }

      /* 流星 */
      if (frame >= nextShootingFrame) {
        spawnShootingStar();
        nextShootingFrame = frame + 100 + Math.floor(Math.random() * 200);
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.life++;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        const progress = ss.life / ss.maxLife;
        const fadeAlpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = c.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.7, `rgba(200, 200, 255, ${fadeAlpha * ss.alpha * 0.3})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${fadeAlpha * ss.alpha})`);

        c.beginPath();
        c.moveTo(tailX, tailY);
        c.lineTo(ss.x, ss.y);
        c.strokeStyle = grad;
        c.lineWidth = 1.5;
        c.stroke();

        /* 流星头部光点 */
        c.beginPath();
        c.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        c.fillStyle = `rgba(255, 255, 255, ${fadeAlpha * ss.alpha})`;
        c.fill();

        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.starCanvas}
      style={{ width, height }}
    />
  );
}

/* ═══════════════════════════════════════════
   主页面
   ═══════════════════════════════════════════ */
export default function ResonancePage() {
  const [modalData, setModalData] = useState<ModalData | null>(null);
  /* 共鸣点赞状态：记录每条卫星故事的共鸣数和是否已点赞 */
  const [resonanceMap, setResonanceMap] = useState<Record<string, { count: number; liked: boolean }>>({});
  const clusters = USE_MOCK ? mockResonanceClusters : [];

  /* 初始化共鸣状态（从 mock 数据加载） */
  useEffect(() => {
    const map: Record<string, { count: number; liked: boolean }> = {};
    for (const c of clusters) {
      for (const s of c.satellites) {
        if (s.resonanceCount !== undefined || s.likedByMe !== undefined) {
          map[s.id] = {
            count: s.resonanceCount ?? 0,
            liked: s.likedByMe ?? false,
          };
        }
      }
    }
    setResonanceMap(map);
  }, []);

  /* 切换共鸣 */
  const toggleResonance = useCallback((satId: string) => {
    setResonanceMap(prev => {
      const cur = prev[satId] ?? { count: 0, liked: false };
      return {
        ...prev,
        [satId]: {
          count: cur.liked ? cur.count - 1 : cur.count + 1,
          liked: !cur.liked,
        },
      };
    });
  }, []);

  return (
    <div className={styles.page}>
      {/* 全局动态星空 */}
      <div className={styles.globalStars} id="global-stars-mount" />

      {/* 页面描述 */}
      <p className={styles.pageDesc}>相似的故事，在这里汇聚成星</p>

      {/* Cluster list */}
      {clusters.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🌌</div>
          <p>
            共鸣池还是空的
            <br />
            发布日记时选择流入共鸣池
            <br />
            让你的故事遇见相似的灵魂
          </p>
        </div>
      ) : (
        <div className={styles.clusterList}>
          {clusters.map(cluster => (
            <StarCluster
              key={cluster.id}
              cluster={cluster}
              onNodeClick={setModalData}
            />
          ))}
        </div>
      )}

      {/* 居中弹框 */}
      {modalData && (
        <CenteredModal
          data={modalData}
          resonanceMap={resonanceMap}
          onToggleResonance={toggleResonance}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   星系集群组件
   ═══════════════════════════════════════════ */
function StarCluster({
  cluster,
  onNodeClick,
}: {
  cluster: ResonanceCluster;
  onNodeClick: (data: ModalData) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 335, h: 340 });

  /* 响应式测量 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setContainerSize({ w: el.offsetWidth, h: el.offsetHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = containerSize.w / 2;
  const cy = containerSize.h / 2;
  const orbitRadius = Math.min(cx, cy) * 0.58;

  /* 卫星节点位置 */
  const satPositions = useMemo(() => {
    const total = cluster.satellites.length;
    return cluster.satellites.map((sat, i) => {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      return {
        ...sat,
        x: cx + orbitRadius * Math.cos(angle),
        y: cy + orbitRadius * Math.sin(angle),
      };
    });
  }, [cluster.satellites, cx, cy, orbitRadius]);

  const hue = cluster.emotionHue;

  return (
    <div className={styles.cluster} ref={containerRef}>
      {/* 集群内星空（Canvas） */}
      <StarField width={containerSize.w} height={containerSize.h} />

      {/* SVG 连线 + 光晕 */}
      <svg
        viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
        className={styles.connectorSvg}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={`glow-${cluster.id}`}>
            <stop offset="0%" stopColor={`hsl(${hue}, 60%, 55%)`} stopOpacity="0.3" />
            <stop offset="100%" stopColor={`hsl(${hue}, 60%, 55%)`} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* 中心光晕 */}
        <circle cx={cx} cy={cy} r={orbitRadius * 0.55} fill={`url(#glow-${cluster.id})`} />
        {/* 连线 */}
        {satPositions.map(p => (
          <line
            key={p.id}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={`hsl(${hue}, 50%, 55%)`}
            strokeWidth="1"
            opacity="0.25"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* 中央节点 — 自己的省略版故事 */}
      <button
        className={styles.centerNode}
        style={
          {
            left: cx,
            top: cy,
            '--hue': hue,
            background: `radial-gradient(circle, hsla(${hue}, 55%, 32%, 0.92), hsla(${hue}, 40%, 14%, 0.96))`,
            borderColor: `hsl(${hue}, 50%, 55%)`,
          } as React.CSSProperties
        }
        onClick={() =>
          onNodeClick({
            type: 'center',
            content: cluster.centerNode.content,
            emotion: cluster.emotion,
            emotionHue: cluster.centerNode.emotionHue,
            worldName: cluster.centerNode.worldName,
            createdAt: cluster.centerNode.createdAt,
          })
        }
      >
        <span className={styles.centerLabel}>我的故事</span>
        <span className={styles.centerText}>
          {cluster.centerNode.abbreviated}
        </span>
      </button>

      {/* 卫星节点 — 部分匿名用户名 */}
      {satPositions.map((p, idx) => (
        <button
          key={p.id}
          className={styles.satNode}
          style={
            {
              left: p.x,
              top: p.y,
              '--hue': p.emotionHue || hue,
              '--float-delay': `${idx * 0.6}s`,
              background: `hsla(${p.emotionHue || hue}, 38%, 18%, 0.88)`,
              borderColor: `hsla(${p.emotionHue || hue}, 48%, 52%, 0.55)`,
            } as React.CSSProperties
          }
          onClick={() =>
            onNodeClick({
              type: 'satellite',
              content: p.content,
              emotionHue: p.emotionHue || hue,
              satName: p.displayName,
              satId: p.id,
              resonanceCount: p.resonanceCount,
              likedByMe: p.likedByMe,
            })
          }
        >
          <span className={styles.satText}>{p.displayName}</span>
        </button>
      ))}

      {/* 集群底部标签 */}
      <div className={styles.clusterInfo}>
        <span
          className={styles.emotionTag}
          style={{ color: `hsl(${hue}, 60%, 65%)` }}
        >
          {cluster.emotion}
        </span>
        {cluster.keywords.map(kw => (
          <span key={kw} className={styles.keyword}>
            #{kw}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   居中弹框
   ═══════════════════════════════════════════ */
function CenteredModal({
  data,
  resonanceMap,
  onToggleResonance,
  onClose,
}: {
  data: ModalData;
  resonanceMap: Record<string, { count: number; liked: boolean }>;
  onToggleResonance: (satId: string) => void;
  onClose: () => void;
}) {
  const hue = data.emotionHue;
  const isCenter = data.type === 'center';

  /* 获取当前共鸣状态 */
  const satState = data.satId ? resonanceMap[data.satId] : undefined;
  const currentCount = satState?.count ?? data.resonanceCount ?? 0;
  const currentLiked = satState?.liked ?? data.likedByMe ?? false;

  /* 点赞动画 */
  const [heartBurst, setHeartBurst] = useState(false);

  const handleResonance = () => {
    if (!data.satId) return;
    setHeartBurst(true);
    onToggleResonance(data.satId);
    setTimeout(() => setHeartBurst(false), 600);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={e => e.stopPropagation()}
        style={{ borderTopColor: `hsl(${hue}, 50%, 55%)` }}
      >
        {/* 关闭 */}
        <button className={styles.modalClose} onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* 情绪 */}
        <div
          className={styles.modalEmotion}
          style={{ color: `hsl(${hue}, 60%, 60%)` }}
        >
          {isCenter ? data.emotion : '共鸣故事'}
        </div>

        {/* 中央：不显示用户名；卫星：显示匿名用户名 */}
        {isCenter ? (
          data.worldName && (
            <div className={styles.modalWorld}>🌍 {data.worldName}</div>
          )
        ) : (
          <div className={styles.modalAuthor}>{data.satName}</div>
        )}

        {/* 故事内容 */}
        <div className={styles.modalContent}>{data.content}</div>

        {/* 底部行：时间 + 共鸣按钮 */}
        <div className={styles.modalFooter}>
          {data.createdAt && (
            <div className={styles.modalTime}>
              {new Date(data.createdAt).toLocaleDateString('zh-CN')}
            </div>
          )}

          {/* 卫星故事显示共鸣按钮 */}
          {!isCenter && data.satId && (
            <button
              className={`${styles.resonanceBtn} ${currentLiked ? styles.resonanceLiked : ''} ${heartBurst ? styles.resonanceBurst : ''}`}
              onClick={handleResonance}
            >
              <span className={styles.resonanceIcon}>
                {currentLiked ? '❤️' : '🤍'}
              </span>
              <span className={styles.resonanceLabel}>共鸣</span>
              <span className={styles.resonanceCount}>{currentCount}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
