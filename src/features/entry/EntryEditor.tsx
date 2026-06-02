import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { useCrystalStore } from '../../stores/useCrystalStore';
import { analyzeEmotion, extractKeywords } from '../../lib/crystal';
import { DEFAULT_CRYSTAL_PARAMS } from '../../lib/crystal/materialEngine';
import { matchScenes } from '../../lib/crystal/sceneEngine';
import styles from './EntryEditor.module.css';

/* ════════════════════════════════════════════════
   常量：所有硬编码文案统一提取
   ════════════════════════════════════════════════ */
const TEXTS = {
  pageTitle: '新回忆',
  pageTitleEdit: '编辑回忆',
  done: '完成',
  doneUpdate: '更新',
  editorPlaceholder: '在这里低语你的想法……',
  releasingMemory: '释放这段回忆？',
  poolQuestion: '你是否愿意让这段回忆流向共鸣池，让其他人也能发现它？',
  flowToPool: '是的，流向共鸣池',
  keepPrivate: '保持私密',
  flowing: '正在流向共鸣池……',
  voiceListening: '……聆听世界低语……',
  voicePause: 'pause',
  voiceMic: 'mic',
  imageTitle: '添加图片',
  attachFileTitle: '添加文件',
  confirmLeave: '放弃编辑？未保存的内容将丢失。',
} as const;

const CAT_ILLUSTRATION_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBCK3GwtgHOVEusvo-eFzKaVBeMkJrVgxDM4PiFcyBBtq7KQ29iH80b6Nfig5TrEsxq-g9fZVcHt_XUeU-sMv9GdsNwzg5YgAKUciSCvjrmkRrmfLlr_ERVErV0oqKtz9930rEVMaY4McX7HpGDt9ALkoMYE07y_tXcZ2MP5C2hy07SIWDlMe4ekcZ8lBnZNtVHPMRf25Nyai80BLMHAZlyr6AD8AlAwUncnYCL-xqnjVOUpqi93BVzfxvX2T88bve1_zNpmMJQCEA';

/*
 * NOTE: document.execCommand is a deprecated API but still widely supported
 * across all major browsers. Future migration plan: replace with a rich text
 * editor library like Slate.js, ProseMirror, or TipTap. For this iteration,
 * execCommand is kept for simplicity and broad compatibility.
 */

type FlowChoice = 'flow' | 'private' | null;

/* ════════════════════════════════════════════════
   EntryEditor — 日记编辑器
   ════════════════════════════════════════════════ */
export default function EntryEditor() {
  const { worldId, entryId } = useParams<{ worldId: string; entryId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.currentUser);
  const addEntry = useEntryStore(s => s.addEntry);
  const updateEntry = useEntryStore(s => s.updateEntry);
  const getEntry = useEntryStore(s => s.getEntry);
  const updateCache = useCrystalStore(s => s.updateCache);

  /* ── 编辑模式判定 ── */
  const isEdit = !!entryId;
  const existingEntry = isEdit ? getEntry(entryId!) : null;

  /* ── 状态 ── */
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [flowChoice, setFlowChoice] = useState<FlowChoice>(null);
  const [hasContent, setHasContent] = useState(false);

  /* ── Refs ── */
  const [editorEl, setEditorEl] = useState<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  /* ── 动态日期 ── */
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 • ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  /* ── 检测编辑器是否有内容（用于 placeholder 判断） ── */
  const checkContent = useCallback(() => {
    const el = editorEl;
    if (!el) return;
    const text = el.innerText?.trim() || '';
    const hasText = text.length > 0;
    setHasContent(hasText);
    // 空时清除格式残留
    if (!hasText) {
      el.innerHTML = '';
    }
  }, [editorEl]);

  /* ── 关闭按钮：返回上一页 ── */
  const handleClose = useCallback(() => {
    if (hasContent && !window.confirm(TEXTS.confirmLeave)) return;
    navigate(-1);
  }, [navigate, hasContent]);

  /* ── 工具栏命令 ── */
  const execFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorEl) editorEl.focus();
  }, [editorEl]);

  /* ── 图片/文件选择 ── */
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 在编辑器中插入图片引用标记
    const reader = new FileReader();
    reader.onload = () => {
      if (editorEl) {
        editorEl.focus();
        document.execCommand('insertHTML', false, `<img src="${reader.result}" alt="插入的图片" style="max-width:100%;border-radius:0.75rem;margin:8px 0;">`);
        checkContent();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // 重置以便重复选择同一文件
  }, [checkContent]);

  const handleAttachSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (editorEl) {
      editorEl.focus();
      document.execCommand('insertHTML', false,
        `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f5f3f0;border-radius:8px;margin:8px 0;font-size:14px;">
          <span class="material-symbols-outlined" style="font-size:18px;">attach_file</span>
          <span>${file.name}</span>
          <span style="color:#888;font-size:12px;">(${(file.size / 1024).toFixed(1)} KB)</span>
        </div>`);
      checkContent();
    }
    e.target.value = '';
  }, [checkContent]);

  /* ── 语音输入（Web Speech API） ── */
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleVoice = useCallback(() => {
    if (isListening) {
      /* 正在监听 → 停止 */
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      /* 不支持语音识别时的降级处理：模拟插入 */
      if (editorEl) {
        editorEl.focus();
        document.execCommand('insertHTML', false,
          `<span style="color:#625f50;opacity:0.5;">${TEXTS.voiceListening}</span>`);
        checkContent();
        setTimeout(() => setIsListening(false), 2500);
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (editorEl) {
        editorEl.focus();
        document.execCommand('insertText', false, transcript);
        checkContent();
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, editorEl, checkContent]);

  /* ── 工具栏键盘跟随（VisualViewport API） ── */
  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;

    const updatePosition = () => {
      if (!toolbarRef.current) return;
      const keyboardVisible = window.innerHeight - vp.height > 120;
      if (keyboardVisible) {
        const offsetBottom = window.innerHeight - vp.height - vp.offsetTop;
        toolbarRef.current.style.bottom = `${offsetBottom + 8}px`;
        toolbarRef.current.style.transform = 'translateX(-50%)';
      } else {
        toolbarRef.current.style.bottom = '';
        toolbarRef.current.style.transform = '';
      }
    };

    vp.addEventListener('resize', updatePosition);
    return () => vp.removeEventListener('resize', updatePosition);
  }, []);

  /* ── 顶部栏阴影：跟随滚动 ── */
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      if (window.scrollY > 20) {
        headerRef.current.classList.add(styles.headerShadow);
      } else {
        headerRef.current.classList.remove(styles.headerShadow);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── 编辑模式：加载已有内容 ── */
  useEffect(() => {
    if (!isEdit || !existingEntry || !editorEl) return;
    editorEl.innerHTML = existingEntry.content;
    setHasContent(true);
  }, [isEdit, existingEntry, editorEl]);

  /* ── beforeunload 拦截 ── */
  useEffect(() => {
    if (!hasContent) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasContent]);

  /* ── 提交保存 ── */
  const saveEntry = useCallback(async (releaseToPool: boolean) => {
    const content = editorEl?.innerHTML || '';
    const textContent = editorEl?.innerText?.trim() || '';
    if (!textContent && !loading) return;
    setLoading(true);

    const { emotion: detectedEmotion, hue } = analyzeEmotion(textContent);
    const keywords = extractKeywords(textContent);

    if (isEdit && entryId) {
      /* 编辑模式：更新已有日记 */
      await updateEntry(entryId, {
        content,
        emotion: detectedEmotion,
        emotionHue: hue,
        keywords,
        status: releaseToPool ? 'published' : 'published',
      });
      navigate(`/world/${worldId}`);
    } else {
      /* 新增模式 */
      const entry = await addEntry({
        worldId: worldId || '',
        userId: user!.id,
        title: '',
        content,
        mode: 'normal',
        status: releaseToPool ? 'published' : 'published',
        emotion: detectedEmotion,
        emotionHue: hue,
        keywords,
      });

      if (entry) {
        const sw = matchScenes(entry);
        const params = { ...DEFAULT_CRYSTAL_PARAMS, hue };
        updateCache(worldId || '', params);
        navigate(`/world/${worldId}`);
      }
    }
    setLoading(false);
  }, [addEntry, updateEntry, editorEl, loading, navigate, updateCache, user, worldId, isEdit, entryId]);

  /* ── "完成"点击 → 弹出共振选择框 ── */
  const handleDone = useCallback(() => {
    const textContent = editorEl?.innerText?.trim() || '';
    if (!textContent || loading) return;
    setFlowChoice(null);
    setShowModal(true);
  }, [editorEl, loading]);

  /* ── 模态框选择 ── */
  const handleFlow = useCallback(() => {
    setFlowChoice('flow');
    // 动画过渡
    setTimeout(() => {
      saveEntry(true);
    }, 1500);
  }, [saveEntry]);

  const handlePrivate = useCallback(() => {
    setFlowChoice('private');
    setShowModal(false);
    saveEntry(false);
  }, [saveEntry]);

  /* ════════════════════════════════════════════
     Render
     ════════════════════════════════════════════ */
  return (
    <div className={styles.page}>
      {/* ═══ 顶部栏 ═══ */}
      <header className={styles.topBar} ref={headerRef}>
        <div className={styles.topBarInner}>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="关闭">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className={styles.topTitle}>{isEdit ? TEXTS.pageTitleEdit : TEXTS.pageTitle}</h1>
          <button
            className={styles.doneBtn}
            onClick={isEdit ? handlePrivate : handleDone}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : (isEdit ? TEXTS.doneUpdate : TEXTS.done)}
          </button>
        </div>
      </header>

      {/* ═══ 主内容 ═══ */}
      <main className={styles.main}>
        {/* ── 日期 ── */}
        <div className={styles.dateRow}>
          <div className={styles.dateDot} />
          <span className={styles.dateText}>{dateStr}</span>
        </div>

        {/* ── 编辑器玻璃面板 ── */}
        <div className={styles.editorPanel}>
          <div
            className={styles.editor}
            ref={node => {
              setEditorEl(node);
              if (node) node.style.webkitUserSelect = 'text';
            }}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={TEXTS.editorPlaceholder}
            onInput={checkContent}
            onFocus={checkContent}
          />

          {/* ── 角落插画（猫咪） ── */}
          <div className={styles.illustrationAnchor}>
            <img
              className={styles.catIllustration}
              src={CAT_ILLUSTRATION_URL}
              alt=""
              draggable={false}
            />
          </div>
        </div>
      </main>

      {/* ═══ 浮动工具栏 ═══ */}
      <div className={styles.toolbar} ref={toolbarRef}>
        <div className={styles.toolbarInner}>
          <div className={styles.toolbarLeft}>
            <button
              className={styles.toolBtn}
              onClick={() => execFormat('bold')}
              title="加粗"
            >
              <span className="material-symbols-outlined">format_bold</span>
            </button>
            <button
              className={styles.toolBtn}
              onClick={() => execFormat('italic')}
              title="斜体"
            >
              <span className="material-symbols-outlined">format_italic</span>
            </button>
            <button
              className={styles.toolBtn}
              onClick={() => execFormat('insertUnorderedList')}
              title="列表"
            >
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>

            <div className={styles.toolDivider} />

            <button
              className={styles.toolBtn}
              onClick={() => imageInputRef.current?.click()}
              title={TEXTS.imageTitle}
            >
              <span className="material-symbols-outlined">image</span>
            </button>
            <button
              className={styles.toolBtn}
              onClick={() => attachInputRef.current?.click()}
              title={TEXTS.attachFileTitle}
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
          </div>

          <button
            className={`${styles.voiceBtn} ${isListening ? styles.voiceActive : ''}`}
            onClick={handleVoice}
            title="语音输入"
          >
            <span className="material-symbols-outlined">
              {isListening ? 'pause' : 'mic'}
            </span>
            <div className={styles.voiceRipple} />
          </button>
        </div>
      </div>

      {/* ═══ 隐藏的文件输入 ═══ */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />
      <input
        ref={attachInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleAttachSelect}
      />

      {/* ═══ 共鸣弹框 ═══ */}
      {showModal && (
        <div className={styles.overlay} onClick={() => { if (!flowChoice) setShowModal(false); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {flowChoice === 'flow' ? (
              /* 流向动画 */
              <div className={styles.flowingState}>
                <span className={`material-symbols-outlined ${styles.flowIcon}`}>water_drop</span>
                <p className={styles.flowingText}>{TEXTS.flowing}</p>
              </div>
            ) : (
              <>
                <div className={styles.modalIconWrap}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                      fontSize: 36,
                      color: 'var(--primary,#625f50)',
                    }}
                  >
                    waves
                  </span>
                </div>
                <h2 className={styles.modalTitle}>{TEXTS.releasingMemory}</h2>
                <p className={styles.modalDesc}>{TEXTS.poolQuestion}</p>
                <div className={styles.modalActions}>
                  <button className={styles.flowBtn} onClick={handleFlow}>
                    {TEXTS.flowToPool}
                  </button>
                  <button className={styles.privateBtn} onClick={handlePrivate}>
                    {TEXTS.keepPrivate}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
