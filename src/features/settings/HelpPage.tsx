import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import Button from '../../components/common/Button';
import styles from './HelpPage.module.css';

const FAQS = [
  { q: '什么是私域小世界？', a: '私域小世界是一个隐私优先的个人记录应用。你可以创建多个「世界」来分类管理日记，每篇日记都会影响你专属水晶球的视觉变化。所有数据存储在本地，不会上传到任何服务器。' },
  { q: '水晶球是如何变化的？', a: '水晶球的颜色、材质、内部场景都会根据你的日记内容自动变化。你写的情绪、关键词、日记频率都会影响水晶球的外观。它不是「选一个样式」，而是随着你的记录「长成一个」独一无二的形状。' },
  { q: '什么是灰烬模式？', a: '灰烬模式是一种特殊的日记模式。你写下内容后只能阅读一次，之后日记会以焚毁动画消失。这是一种情绪宣泄的方式——写下来，然后放下。' },
  { q: '什么是记忆圣殿？', a: '当你封存一个世界时，它将进入「记忆圣殿」。封存的世界不能再添加日记，水晶球会冻结为记忆标本，成为你回顾过去的特别空间。' },
  { q: '共鸣池是什么？', a: '共鸣池是一个匿名心情分享空间。你可以发布自己的心情碎片，也可以浏览和互动他人的共鸣。可以选择实名或匿名发布，也可以关联到某个世界。' },
  { q: '我的数据安全吗？', a: '所有数据都存储在浏览器的 localStorage 中，不会传输到任何外部服务器。你可以通过设置页面导出数据备份。请定期导出备份以防浏览器清理缓存。' },
  { q: '如何添加好友？', a: '在「好友」页面点击「添加好友」，输入对方的用户名或用户ID即可发送好友请求。对方接受后，你们就可以互相看到对方分享的世界。' },
  { q: '时光机有什么用？', a: '时光机将你所有世界的日记汇聚在一个时间线上。你可以按日期、模式、世界、情绪进行筛选，还可以看到「历史上的今天」——过去同一天的日记回顾。' },
];

const FEATURES = [
  { icon: '📝', title: '多种日记模式', desc: '普通、灰烬、时间胶囊、致未来、收藏五种模式' },
  { icon: '🔮', title: '水晶球视觉系统', desc: '根据日记内容自动变化的三维水晶球' },
  { icon: '🌍', title: '多世界管理', desc: '创建多个世界分类管理不同主题的日记' },
  { icon: '⏳', title: '时光机', desc: '跨世界的日记时间线聚合视图' },
  { icon: '🔥', title: '灰烬阅读', desc: '阅后即焚的特殊阅读体验' },
  { icon: '🏛️', title: '记忆圣殿', desc: '封存世界的永久记忆陈列馆' },
  { icon: '👥', title: '好友系统', desc: '添加好友、管理好友关系' },
  { icon: '✨', title: '共鸣池', desc: '匿名心情分享与互动空间' },
  { icon: '🌙', title: '深夜模式', desc: '定时自动切换深色主题' },
  { icon: '🏷️', title: '情绪感知', desc: '自动识别日记情绪并添加标签' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore(s => s.currentUser);

  const hasWorlds = false; // Simplified - would check from store

  return (
    <div className={styles.page}>
      <div className={styles.title}>❓ 帮助中心</div>

      {/* Quick start for new users */}
      {!hasWorlds && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>🚀 新手引导</div>
          <div className={styles.onboarding}>
            <div className={styles.onboardingSteps}>
              <div className={styles.onboardingStep}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepTitle}>创建世界</div>
                <div className={styles.stepDesc}>创建你的第一个私密世界</div>
              </div>
              <div className={styles.onboardingStep}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepTitle}>写日记</div>
                <div className={styles.stepDesc}>用文字记录此刻的心情</div>
              </div>
              <div className={styles.onboardingStep}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepTitle}>观察水晶</div>
                <div className={styles.stepDesc}>水晶球会随你的记录成长</div>
              </div>
            </div>
            <Button onClick={() => navigate('/world/create')}>开始创建第一个世界</Button>
          </div>
        </div>
      )}

      {/* Feature overview */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>💡 功能介绍</div>
        {FEATURES.map(f => (
          <div key={f.title} className={styles.featureItem}>
            <span className={styles.featureIcon}>{f.icon}</span>
            <div className={styles.featureInfo}>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick guides */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>📖 使用指南</div>
        <div className={styles.guideGrid}>
          <div className={styles.guideCard} onClick={() => navigate('/world/create')}>
            <div className={styles.guideIcon}>🌍</div>
            <div className={styles.guideTitle}>创建世界</div>
            <div className={styles.guideDesc}>不同主题的日记空间</div>
          </div>
          <div className={styles.guideCard} onClick={() => navigate('/')}>
            <div className={styles.guideIcon}>🔮</div>
            <div className={styles.guideTitle}>水晶球</div>
            <div className={styles.guideDesc}>你的情感可视化</div>
          </div>
          <div className={styles.guideCard} onClick={() => navigate('/timecapsule')}>
            <div className={styles.guideIcon}>⏳</div>
            <div className={styles.guideTitle}>时光机</div>
            <div className={styles.guideDesc}>回顾所有记忆</div>
          </div>
          <div className={styles.guideCard} onClick={() => navigate('/resonance')}>
            <div className={styles.guideIcon}>✨</div>
            <div className={styles.guideTitle}>共鸣池</div>
            <div className={styles.guideDesc}>分享心情碎片</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>❔ 常见问题</div>
        {FAQS.map((faq, i) => (
          <div key={i} className={styles.faqItem}>
            <div className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              <span className={`${styles.faqArrow} ${openFaq === i ? styles.open : ''}`}>▶</span>
            </div>
            <div className={`${styles.faqAnswer} ${openFaq === i ? styles.open : ''}`}>{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
