/**
 * 全局数据源开关（唯一真源）
 * ─────────────────────────────────────────────
 * 设计原则：**默认可用** —— 哪怕没有后端，全站也要能完整走通。
 *
 *   VITE_USE_MOCK = 'true'  → 使用 src/mocks/ 下的本地演示数据（默认）
 *   VITE_USE_MOCK = 'false' → 请求后端真实 API
 *
 * 只有「显式」写成 'false' 时才走后端；未配置、拼写错误或空值一律回落演示数据。
 * 这样可避免「后端没起 → 登录失败 + 所有列表为空 → 整站空白」的连锁故障。
 */

const raw = (import.meta.env.VITE_USE_MOCK as string | undefined)?.trim().toLowerCase();

/** true = 本地演示数据；false = 后端真实 API */
export const USE_MOCK: boolean = raw !== 'false';

/** 是否处于演示模式（供 UI 展示「演示数据」标识） */
export const IS_DEMO: boolean = USE_MOCK;
