import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorldStore } from '../../stores/useWorldStore';
import { mockAmbers } from '../../mocks/mockMemorySanctuary';
import type { MemoryAmber } from '../../mocks/mockMemorySanctuary';
import styles from './MemorySanctuary.module.css';

/* ── 展厅分组 ── */
const EXHIBITIONS = ['第一展厅', '第二展厅', '第三展厅'] as const;

export default function MemorySanctuary() {
  const navigate = useNavigate();
  const unsealWorld = useWorldStore(s => s.unsealWorld);

  /* ── 搜索 ── */
  const [searchQuery, setSearchQuery] = useState('');

  /* ── 解封确认弹框 ── */
  const [unsealTarget, setUnsealTarget] = useState<MemoryAmber | null>(null);

  /* ── 解封成功 Toast ── */
  const [showToast, setShowToast] = useState('');

  /* ── 将 mock 转为可用状态，同时同步 worldStore 中被解封的状态 ── */
  const worlds = useWorldStore(s => s.worlds);
  const amberList = useMemo(() => {
    return mockAmbers.map(amber => {
      const world = worlds.find(w => w.id === amber.worldId);
      return {
        ...amber,
        isSealed: world ? world.isSealed : amber.isSealed,
      };
    });
  }, [worlds]);

  /* ── 搜索过滤 ── */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return amberList;
    const q = searchQuery.toLowerCase();
    return amberList.filter(
      a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [amberList, searchQuery]);

  /* ── 按展厅分组 ── */
  const grouped = useMemo(() => {
    const map: Record<string, MemoryAmber[]> = {};
    for (const ex of EXHIBITIONS) map[ex] = [];
    for (const amber of filtered) {
      if (map[amber.exhibition]) {
        map[amber.exhibition].push(amber);
      } else {
        /* 兜底 */
        map['第三展厅'].push(amber);
      }
    }
    return map;
  }, [filtered]);

  /* ── 点击琥珀 → 前往世界详情页 ── */
  const handleAmberClick = useCallback((amber: MemoryAmber) => {
    if (navigator.vibrate) navigator.vibrate(10);
    navigate(`/world/${amber.worldId}`);
  }, [navigate]);

  /* ── 点击解封 → 弹确认框 ── */
  const handleUnsealClick = useCallback((e: React.MouseEvent, amber: MemoryAmber) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(12);
    setUnsealTarget(amber);
  }, []);

  /* ── 确认解封 ── */
  const confirmUnseal = useCallback(async () => {
    if (!unsealTarget) return;
    if (navigator.vibrate) navigator.vibrate(12);
    await unsealWorld(unsealTarget.worldId);
    setUnsealTarget(null);
    setShowToast(`「${unsealTarget.name}」已解封，恢复了原来的色彩`);
    setTimeout(() => setShowToast(''), 2500);
    setTimeout(() => navigate('/'), 600);
  }, [unsealTarget, unsealWorld, navigate]);

  /* ── 返回首页 ── */
  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  /* ── 搜索无结果 ── */
  const isSearchEmpty = searchQuery.trim().length > 0 && filtered.length === 0;

  /* ── 弹框动画类 ── */
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = useCallback((amber: MemoryAmber) => {
    setUnsealTarget(amber);
    requestAnimationFrame(() => setModalVisible(true));
  }, []);
  const hideModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setUnsealTarget(null), 200);
  }, []);

  return (
    <div className={styles.page}>
      {/* ── TopAppBar：返回 + 标题 + 搜索 ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <button className={styles.backBtn} onClick={handleBack} aria-label="返回首页">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className={styles.titleGroup}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#625f50' }}>spa</span>
              <h1 className={styles.title}>记忆圣殿</h1>
            </div>
          </div>
          <div className={styles.searchWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#7A776E' }}>search</span>
            <input
              className={styles.searchInput}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索琥珀与记忆..."
            />
            {searchQuery && (
              <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 引言 ── */}
      <section className={styles.intro}>
        <p className={styles.quote}>
          &ldquo;每一颗琥珀，都封存着一个不再流逝的世界。&rdquo;
        </p>
        <div className={styles.divider} />
      </section>

      {/* ── 搜索无结果 ── */}
      {isSearchEmpty && (
        <div className={styles.searchEmpty}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3 }}>search_off</span>
          <p className={styles.searchEmptyText}>未找到相关琥珀</p>
        </div>
      )}

      {/* ── 展厅分组展示 ── */}
      {!isSearchEmpty && EXHIBITIONS.map(ex => {
        const ambers = grouped[ex];
        if (!ambers || ambers.length === 0) return null;
        return (
          <div key={ex} className={styles.shelfSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>{ex}</span>
              <div className={styles.sectionLine} />
            </div>
            <div className={styles.shelf}>
              {ambers.map(amber => (
                <div
                  key={amber.id}
                  className={styles.amberCard}
                  onClick={() => handleAmberClick(amber)}
                >
                  {/* 琥珀球 */}
                  <div className={`${styles.amberOrb} ${amber.isSealed ? styles.amberSealed : styles.amberUnsealed}`}>
                    {amber.isSealed && (
                      <div className={styles.amberGlow} />
                    )}
                    <img
                      className={styles.amberBg}
                      src={amber.imageUrl}
                      alt=""
                      loading="lazy"
                    />
                    <span className={`material-symbols-outlined ${styles.amberIcon}`}>
                      {amber.icon}
                    </span>
                  </div>
                  {/* 名称 */}
                  <h3 className={styles.amberName}>{amber.name}</h3>
                  {/* 解封按钮（仅封存态显示） */}
                  {amber.isSealed && (
                    <button
                      className={styles.unsealBtn}
                      onClick={e => { showModal(amber); handleUnsealClick(e, amber); }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                      <span className={styles.unsealLabel}>解封</span>
                    </button>
                  )}
                  {/* 已解封标记 */}
                  {!amber.isSealed && (
                    <span className={styles.unsealedBadge}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                      已解封
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── 全部为空（无封存数据） ── */}
      {!isSearchEmpty && filtered.length === 0 && (
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>lock</span>
          <p className={styles.emptyText}>尚未发现深层记忆</p>
        </div>
      )}

      {/* ── 底部安全区 ── */}
      <div className={styles.bottomSpacer} />

      {/* ═══════════════ 解封确认弹框 ═══════════════ */}
      {unsealTarget && (
        <div className={styles.overlay} onClick={hideModal}>
          <div
            className={`${styles.modal} ${modalVisible ? styles.modalShow : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={hideModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className={styles.modalBody}>
              {/* 小琥珀球 */}
              <div className={styles.modalOrb}>
                <img
                  className={styles.modalOrbBg}
                  src={unsealTarget.imageUrl}
                  alt=""
                  loading="lazy"
                />
                <span className={`material-symbols-outlined ${styles.modalOrbIcon}`}>
                  {unsealTarget.icon}
                </span>
              </div>
              <h2 className={styles.modalTitle}>{unsealTarget.name}</h2>
              <p className={styles.modalDesc}>{unsealTarget.description}</p>
              <button className={styles.modalAction} onClick={confirmUnseal}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                解封此记忆
              </button>
              <p className={styles.modalHint}>解封后，此世界将恢复色彩并出现在首页</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {showToast && (
        <div className={styles.toast}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>check_circle</span>
          {showToast}
        </div>
      )}
    </div>
  );
}
