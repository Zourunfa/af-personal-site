export const profile = {
  siteOrigin: 'https://www.afai.asia',
  name: '阿锋', github: 'https://github.com/Zourunfa',
  wechat: '13298699430', email: '13298699430@163.com',
  blog: 'https://blog.csdn.net/weixin_43342105',
  bilibili: 'https://space.bilibili.com/397400597/lists',
  intro: '一名前端开发者，喜欢把自己的需求和好奇心，做成可以使用的小产品。工作之外，弹吉他、吹口琴，也去不同的地方走走。',
};
export const channels = [
  { name: '旅游与生活', label: 'TRAVEL & LIFE', symbol: '↗', description: '走进山野与城市，也记录日常里值得留下的片刻。', url: 'https://space.bilibili.com/397400597/lists/7619299?type=season' },
  { name: '音乐与即兴', label: 'MUSIC & IMPROVISATION', symbol: '♫', description: '吉他、口琴与随心而起的旋律，把当下弹给你听。', url: 'https://space.bilibili.com/397400597/lists/7619287?type=season' },
  { name: '技术与编程', label: 'CODE & EXPLORATION', symbol: '⌘', description: '写代码、做工具，分享技术实践与探索的过程。', url: 'https://space.bilibili.com/397400597/lists/7619280?type=season' },
] as const;

export type Project = {
  slug: string; name: string; category: string; subtitle: string; description: string;
  tags: readonly string[]; theme: string; number: string; url?: string; repo?: string;
  qrCode?: string; story: string; features: readonly string[]; focus: string; status: string;
};
export const projects: readonly Project[] = [
  {
    slug: 'bili-analyzer', name: 'Bili Analyzer', category: 'AI · KNOWLEDGE',
    subtitle: '让看过的视频，成为留下的知识。',
    description: '面向视频内容的知识管理工具，支持 B 站、抖音和小红书视频的分析与管理。',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Vercel AI SDK'], theme: 'sage', number: '01',
    url: 'https://www.afai.asia/', repo: 'https://github.com/Zourunfa/bili-analyzer',
    story: '视频里经常藏着有价值的观点，但看完之后很难再次找到。这个项目围绕视频分析和知识管理展开，把观看之后的信息整理过程变得更方便。',
    features: ['B 站、抖音和小红书视频内容分析', 'AI 总结、思维导图与视频知识管理', '账号体系及 PostgreSQL 数据持久化'],
    focus: '以 Next.js、Vercel AI SDK、Prisma 和 PostgreSQL 构建完整链路，并针对转写任务设置并发、文件大小与超时限制。',
    status: '线上版本 · 持续开发',
  },
  {
    slug: 'travel-aa', name: '旅行记账 AA', category: 'TRAVEL · MINI PROGRAM',
    subtitle: '一起出发，也把账算清楚。',
    description: '为结伴旅行做的记账 AA 小程序，记录旅途开销，让同行伙伴的账目更清楚。',
    tags: ['Taro 4', 'React 18', 'TypeScript', 'Spring Boot 3', 'MySQL 8'], theme: 'sage', number: '02',
    repo: 'https://github.com/Zourunfa/Bill-splitting-mini-program',
    qrCode: 'travel-aa-minicode.png',
    story: '喜欢旅行，也会在旅途中遇到需要记账、分摊开销的时候。我把这个需求做成了旅行记账 AA 小程序，让生活中的小问题变成一个可以使用的产品。',
    features: ['邀请码组队、共同账本与自定义分摊', '垫付 / 承担统计、转账建议与收款确认', '共享日程、旅行打卡及可确认的 AI 记账草稿'],
    focus: '前端基于 Taro 4、React 和 TypeScript，自部署 Java 17、Spring Boot 3 与 MySQL 8；金额以整数分存储，由服务端校验并计算分摊。',
    status: '微信小程序 · 持续完善',
  },
  {
    slug: 'little-guitar', name: 'Little Guitar', category: 'MUSIC · WEB AUDIO',
    subtitle: '给即兴一点方向，给练习一点乐趣。',
    description: '为 Blues 即兴练习打造的小工具，把音阶、和弦与伴奏放在同一个空间。',
    tags: ['React 19', 'Vite', 'TypeScript', 'Tone.js', 'Web Audio API'], theme: 'sand', number: '03',
    url: 'https://little-guitar.pages.dev', repo: 'https://github.com/Zourunfa/little-guitar',
    story: '弹吉他，也是探索音乐的过程。Little Guitar 把 Blues 音阶、指板位置和伴奏结合起来，让练习从记忆音符走向真正的即兴。',
    features: ['12 个调式、三类 Blues 音阶与可视化指板', '12 / 6 小节和弦进行、鼓组及虚拟乐队伴奏', '实时调音、和弦查找与保音高变速伴奏'],
    focus: '使用 Web Audio API、FFT / HPS 音高检测和 SoundTouchJS AudioWorklet，实现调音、音频合成及保音高变速。',
    status: '在线版本 · 持续完善',
  },
  {
    slug: 'agent-pdf', name: 'Agent PDF', category: 'AI · DOCUMENTS',
    subtitle: '打开文档，也打开一个问题。',
    description: '支持 OCR、向量检索与 AI 问答的 PDF 对话产品，让阅读带着问题发生。',
    tags: ['Next.js 14', 'LangChain.js', 'RAG', 'Pinecone', 'Tesseract.js'], theme: 'lavender', number: '04',
    url: 'https://little-agent-pdf.vercel.app/', repo: 'https://github.com/Zourunfa/agent-PDF',
    story: '面对一份长文档，很多时候我们有一个具体的问题。这个项目尝试将文档识别、检索与对话放到一起，探索更直接的阅读方式。',
    features: ['PDF 文本解析、分块与多轮 AI 问答', 'Tesseract.js OCR 识别扫描件和图片 PDF', 'Pinecone 向量检索与 Upstash Redis 存储'],
    focus: '以 Next.js 14 和 LangChain.js 构建 RAG 流程，结合通义千问、Pinecone、Upstash Redis 与 Vercel Serverless。',
    status: '在线 Demo · 持续开发',
  },
  {
    slug: 'clipflow', name: 'ClipFlow', category: 'TOOLS · CREATIVE',
    subtitle: '让剪辑流程，少一点阻力。',
    description: '一款轻量级视频剪辑工作流工具，探索创作过程中的效率与秩序。',
    tags: ['React 19', 'TypeScript', 'Electron', 'React Flow', 'FFmpeg'], theme: 'rose', number: '05',
    url: 'https://clipflow-website.pages.dev/', repo: 'https://github.com/Zourunfa/clipFlow',
    story: '创作不仅是灵感，也有大量重复的步骤。ClipFlow 从视频剪辑工作流入手，尝试让工具更轻、流程更顺。',
    features: ['节点拖拽、连线、配置、自动布局与视图适配', '工作流模板、本地保存及 JSON 导入导出', '拓扑排序、必填校验与执行状态模拟'],
    focus: '使用 React Flow、dagre 与 Electron 构建桌面工作台，已引入 FFmpeg 相关依赖；当前核心是工作流编排与执行模拟，真实处理链路仍在完善。',
    status: '桌面端 Demo · 编排与模拟执行',
  },
];
