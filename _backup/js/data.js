// ============================================
// 星图 · Star Atlas — 内容数据
// 紧凑式星座集群布局：
//   中心主区: 北斗七星 (人生履历)
//   右侧近区: 猎户座 (专业技能)
//   左上近区: 仙女座 (精神生活)
//   左下近区: 天琴座 (爱好·音乐·创作)
//   右下近区: 天蝎座 (挑战·成长·转折)
//   星间点缀: 三角座、南冕座、小马座、狐狸座 (微型技能)
// ============================================
import { CONSTELLATION_SPHERE } from './config.js';

// --- Spherical to Cartesian ---
function toCartesian(theta, phi, radius) {
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

// ============================================
// 北斗七星 — 人生主线履历 (中心主区)
// 形状保持清晰"勺子"但间距压缩
// ============================================
const DR = CONSTELLATION_SPHERE.dipperRadius;
const _dipperPos = {};
{
  const raw = {
    tianshu:  { theta: 0.20, phi: 1.26 },  // 斗身左下
    tianxuan: { theta: 0.32, phi: 1.16 },  // 斗身左上
    tianji:   { theta: 0.44, phi: 1.12 },  // 斗身顶
    tianquan: { theta: 0.56, phi: 1.18 },  // 斗身右下/斗柄起点
    yuheng:   { theta: 0.66, phi: 1.22 },  // 斗柄
    kaiyang:  { theta: 0.76, phi: 1.26 },  // 斗柄
    yaoguang: { theta: 0.86, phi: 1.28 },  // 斗柄末端
  };
  for (const [id, pos] of Object.entries(raw)) {
    _dipperPos[id] = {
      ...toCartesian(pos.theta, pos.phi, DR),
      theta: pos.theta, phi: pos.phi, radius: DR,
    };
  }
}

export const BIG_DIPPER = {
  id: 'big-dipper',
  name: '北斗七星',
  focus: { theta: 0.50, phi: 1.20, radius: 160 },
  stars: {
    tianshu: {
      id: 'tianshu', name: '天枢', label: '天枢 · 本科初期',
      status: 'active', type: 'career', year: '2020-2021',
      position: _dipperPos.tianshu,
      content: {
        title: '本科初期 · 破晓时分',
        description: '初入校园，对未来充满好奇与憧憬。参加了第一次编程竞赛，第一次完成完整的课程项目，第一次感受到代码改变世界的力量。那些懵懂但热血的日夜，是后来所有星光的起点。',
        highlights: ['校园编程竞赛参与', '早期原创课程作品', '编程入门学习记录'],
        links: [],
        quote: '这是我黑暗岁月里，第一颗稳定发光的星。',
      },
    },
    tianxuan: {
      id: 'tianxuan', name: '天璇', label: '天璇 · 课余沉淀',
      status: 'dormant', type: 'career', year: '',
      position: _dipperPos.tianxuan, content: null,
    },
    tianji: {
      id: 'tianji', name: '天玑', label: '天玑 · 科研学习',
      status: 'active', type: 'career', year: '2021-2022',
      position: _dipperPos.tianji,
      content: {
        title: '科研学习 · 探知求真',
        description: '进入实验室，开始接触学术研究与科研方法论。参与导师课题项目，学习文献检索与论文写作。在理论与实践的交汇处，逐渐找到自己的研究方向。每一个实验数据的背后，都是对未知的探索。',
        highlights: ['学术研究项目参与', '实验成果与数据分析', '论文阅读与文献综述'],
        links: [],
        quote: '这是我黑暗岁月里，一颗稳定发光的星。',
      },
    },
    tianquan: {
      id: 'tianquan', name: '天权', label: '天权 · 首次实习',
      status: 'active', type: 'career', year: '2022-2023',
      position: _dipperPos.tianquan,
      content: {
        title: '首次实习 · 职场初探',
        description: '第一次踏入互联网公司，从校园走向职场。学会了团队协作、代码规范、项目流程，也经历了加班到深夜的疲惫与产品上线的喜悦。这段经历让我从学生蜕变为职业人。',
        highlights: ['互联网企业实习经历', '工作产出与项目复盘', '职场技能与团队协作'],
        links: [],
        quote: '这是我黑暗岁月里，一颗稳定发光的星。',
      },
    },
    yuheng: {
      id: 'yuheng', name: '玉衡', label: '玉衡 · 业余生活',
      status: 'dormant', type: 'life', year: '',
      position: _dipperPos.yuheng, content: null,
    },
    kaiyang: {
      id: 'kaiyang', name: '开阳', label: '开阳 · 深度实习',
      status: 'active', type: 'career', year: '2023-2024',
      position: _dipperPos.kaiyang,
      content: {
        title: '深度实习 · 能力突破',
        description: '进入更核心的业务团队，参与专项工作项目。从执行者向主导者转变，承担更多业务协作与方案设计。技术栈不断拓宽，工程能力显著提升。每一次挑战都让我更加确信自己选择的道路。',
        highlights: ['专项工作项目主导', '业务协作与跨团队沟通', '技术能力突破案例'],
        links: [],
        quote: '这是我黑暗岁月里，一颗稳定发光的星。',
      },
    },
    yaoguang: {
      id: 'yaoguang', name: '摇光', label: '摇光 · 当下与未来',
      status: 'active', type: 'career', year: '2024-至今',
      position: _dipperPos.yaoguang,
      content: {
        title: '当下与未来 · 星辰大海',
        description: '站在当下回望，每一颗星都记录了曾经的自己。原创项目、作品集汇总、未来规划——新的星光还在继续点亮。保持对技术的好奇，对生活的热爱，下一段旅程才刚刚开始。',
        highlights: ['个人原创项目', '作品集与博客', '未来规划与长期目标'],
        links: [],
        quote: '人活无数瞬间，星亮漫漫长夜。所有细碎闪光，都是人生的支点。',
      },
    },
  },
  connections: [
    ['tianshu', 'tianxuan'], ['tianxuan', 'tianji'],
    ['tianji', 'tianquan'], ['tianquan', 'yuheng'],
    ['yuheng', 'kaiyang'], ['kaiyang', 'yaoguang'],
  ],
};

// ============================================
// 猎户座 — 能力技能星座 (右侧近区)
// ============================================
const OR = CONSTELLATION_SPHERE.majorRadius;
function _positions(raw) {
  const out = {};
  for (const [id, pos] of Object.entries(raw)) {
    out[id] = toCartesian(pos.theta, pos.phi, pos.r || OR);
  }
  return out;
}

const _orionPos = _positions({
  betelgeuse: { theta: -0.04, phi: 1.13 },
  bellatrix:  { theta: -0.12, phi: 1.08 },
  alnitak:    { theta: 0.00, phi: 1.26 },
  alnilam:    { theta: -0.04, phi: 1.28 },
  mintaka:    { theta: -0.08, phi: 1.30 },
  rigel:      { theta: 0.04, phi: 1.40 },
  saiph:      { theta: -0.10, phi: 1.44 },
});

export const ORION = {
  id: 'orion',
  name: '猎户座',
  focus: { theta: -0.03, phi: 1.26, radius: 165 },
  stars: {
    betelgeuse: {
      id: 'betelgeuse', name: '参宿四', label: '参宿四 · 前端开发',
      status: 'active', type: 'career', year: '',
      position: _orionPos.betelgeuse,
      content: {
        title: '前端开发', description: '熟练掌握 HTML/CSS/JavaScript，熟悉 React、Vue 等现代前端框架，关注用户体验与交互设计。追求像素级还原与流畅动画体验。',
        highlights: ['React / Vue / TypeScript', 'Three.js / WebGL', '响应式布局 / CSS动画'],
        links: [], quote: '',
      },
    },
    bellatrix: {
      id: 'bellatrix', name: '参宿五', label: '参宿五 · 后端开发',
      status: 'active', type: 'career', year: '',
      position: _orionPos.bellatrix,
      content: {
        title: '后端开发', description: '熟悉 Python / Node.js 后端开发，了解数据库设计与API设计。在实践中持续学习系统架构与服务部署。',
        highlights: ['Python / Node.js', '数据库设计', 'RESTful API'],
        links: [], quote: '',
      },
    },
    alnitak: {
      id: 'alnitak', name: '参宿一', label: '参宿一',
      status: 'dormant', type: 'career', year: '',
      position: _orionPos.alnitak, content: null,
    },
    alnilam: {
      id: 'alnilam', name: '参宿二', label: '参宿二',
      status: 'dormant', type: 'career', year: '',
      position: _orionPos.alnilam, content: null,
    },
    mintaka: {
      id: 'mintaka', name: '参宿三', label: '参宿三',
      status: 'dormant', type: 'career', year: '',
      position: _orionPos.mintaka, content: null,
    },
    rigel: {
      id: 'rigel', name: '参宿七', label: '参宿七 · 数据分析',
      status: 'active', type: 'career', year: '',
      position: _orionPos.rigel,
      content: {
        title: '数据分析', description: '掌握数据分析基本方法论，能够通过数据驱动决策。熟悉常用数据分析工具与可视化方案。',
        highlights: ['数据可视化', '统计分析', 'SQL / Excel'],
        links: [], quote: '',
      },
    },
    saiph: {
      id: 'saiph', name: '参宿六', label: '参宿六 · 工具与部署',
      status: 'active', type: 'career', year: '',
      position: _orionPos.saiph,
      content: {
        title: '工具与部署', description: '熟练使用 Git 进行版本管理，了解 CI/CD 流程与云服务部署。善于利用工具提升开发效率。',
        highlights: ['Git / GitHub', 'CI/CD', '云服务部署'],
        links: [], quote: '',
      },
    },
  },
  connections: [
    ['betelgeuse', 'alnitak'], ['bellatrix', 'alnilam'],
    ['alnitak', 'alnilam'], ['alnilam', 'mintaka'],
    ['rigel', 'saiph'], ['saiph', 'mintaka'], ['rigel', 'alnitak'],
  ],
};

// ============================================
// 仙女座 — 精神生活星座 (左上近区)
// ============================================
const _andromedaPos = _positions({
  alpheratz: { theta: 0.72, phi: 0.90 },
  mirach:    { theta: 0.80, phi: 0.96 },
  almach:    { theta: 0.88, phi: 0.92 },
  delta:     { theta: 0.78, phi: 0.84 },
});

export const ANDROMEDA = {
  id: 'andromeda',
  name: '仙女座',
  focus: { theta: 0.80, phi: 0.90, radius: 165 },
  stars: {
    alpheratz: {
      id: 'alpheratz', name: '壁宿二', label: '壁宿二 · 摄影',
      status: 'active', type: 'life', year: '',
      position: _andromedaPos.alpheratz,
      content: {
        title: '摄影 · 光影定格', description: '喜欢用镜头记录生活中的美好瞬间。无论是城市街角的日常、旅途中的风景，还是夜晚的星空，每个快门的背后都是一段回忆。',
        highlights: ['街拍摄影', '旅行风光', '星空摄影'],
        links: [], quote: '',
      },
    },
    mirach: {
      id: 'mirach', name: '奎宿九', label: '奎宿九 · 文字与阅读',
      status: 'active', type: 'life', year: '',
      position: _andromedaPos.mirach,
      content: {
        title: '文字与阅读', description: '阅读是精神的旅行，写作是内心的对话。喜欢在书籍中寻找不同的世界观，也偶尔用文字记录自己的思考与感悟。',
        highlights: ['读书笔记', '随笔写作', '知识分享'],
        links: [], quote: '',
      },
    },
    almach: {
      id: 'almach', name: '天大将军一', label: '天大将军一 · 音乐',
      status: 'active', type: 'life', year: '',
      position: _andromedaPos.almach,
      content: {
        title: '音乐 · 心灵共振', description: '音乐是生活中不可或缺的伴奏。从后摇到古典、从电子到民谣，不同类型的旋律陪伴着不同的时刻与情绪。',
        highlights: ['后摇 / 氛围音乐', '古典入门', '播放列表精选'],
        links: [], quote: '',
      },
    },
    delta: {
      id: 'delta_and', name: '奎宿五', label: '奎宿五 · 旅行',
      status: 'active', type: 'life', year: '',
      position: _andromedaPos.delta,
      content: {
        title: '旅行 · 世界漫游', description: '向往远方，热爱探索。每一次旅行都是对日常的短暂逃离，也是重新认识世界与自我的方式。走过的路、遇过的人，都成为了生命中的星光。',
        highlights: ['旅行足迹', '城市探索', '旅行摄影'],
        links: [], quote: '',
      },
    },
  },
  connections: [
    ['alpheratz', 'mirach'], ['mirach', 'almach'],
    ['almach', 'delta_and'], ['delta_and', 'alpheratz'],
  ],
};

// ============================================
// 天琴座 — 爱好·音乐·创作 (左下近区)
// ============================================
const _lyraPos = _positions({
  vega:   { theta: 0.72, phi: 1.42 },
  beta:   { theta: 0.80, phi: 1.50 },
  gamma:  { theta: 0.65, phi: 1.38 },
  delta:  { theta: 0.70, phi: 1.50 },
  epsilon:{ theta: 0.76, phi: 1.35 },
});

export const LYRA = {
  id: 'lyra',
  name: '天琴座',
  focus: { theta: 0.73, phi: 1.43, radius: 165 },
  stars: {
    vega: {
      id: 'vega', name: '织女一', label: '织女一 · 创作输出',
      status: 'active', type: 'life', year: '',
      position: _lyraPos.vega,
      content: {
        title: '创作 · 表达自我', description: '用文字、代码和图像表达想法。做过独立小项目，写过技术博客，也尝试过简单的数字艺术创作。创作的快乐在于从无到有的过程。',
        highlights: ['独立项目开发', '技术博客', '数字艺术'],
        links: [], quote: '',
      },
    },
    beta: {
      id: 'lyra_beta', name: '渐台二', label: '渐台二 · 视频剪辑',
      status: 'active', type: 'life', year: '',
      position: _lyraPos.beta,
      content: {
        title: '视频 · 剪辑与记录', description: '喜欢用视频记录生活中有趣的片段。从简单的Vlog到主题短片，剪辑是对记忆的二次创作。',
        highlights: ['Vlog制作', '主题短片', '视频后期'],
        links: [], quote: '',
      },
    },
    gamma: {
      id: 'lyra_gamma', name: '织女二', label: '织女二 · 手工制作',
      status: 'active', type: 'life', year: '',
      position: _lyraPos.gamma,
      content: {
        title: '手工 · 指尖的温度', description: '在数字世界之外，喜欢做一些需要用双手完成的事情。拼图、模型、手帐——这些缓慢而专注的时光，是最好的放松。',
        highlights: ['拼图', '模型制作', '手帐记录'],
        links: [], quote: '',
      },
    },
    delta: {
      id: 'lyra_delta', name: '织女三', label: '织女三',
      status: 'dormant', type: 'life', year: '',
      position: _lyraPos.delta, content: null,
    },
    epsilon: {
      id: 'lyra_epsilon', name: '织女四', label: '织女四',
      status: 'dormant', type: 'life', year: '',
      position: _lyraPos.epsilon, content: null,
    },
  },
  connections: [
    ['vega', 'beta'], ['vega', 'gamma'],
    ['beta', 'gamma'], ['beta', 'lyra_delta'],
    ['vega', 'lyra_epsilon'],
  ],
};

// ============================================
// 天蝎座 — 挑战·成长·转折 (右下近区)
// ============================================
const _scorpiusPos = _positions({
  antares:  { theta: 0.18, phi: 1.48 },
  dschubba: { theta: 0.12, phi: 1.42 },
  akrab:    { theta: 0.26, phi: 1.55 },
  pi:       { theta: 0.16, phi: 1.52 },
  rho:      { theta: 0.06, phi: 1.46 },
});

export const SCORPIUS = {
  id: 'scorpius',
  name: '天蝎座',
  focus: { theta: 0.16, phi: 1.48, radius: 165 },
  stars: {
    antares: {
      id: 'antares', name: '心宿二', label: '心宿二 · 技术突破',
      status: 'active', type: 'career', year: '',
      position: _scorpiusPos.antares,
      content: {
        title: '技术突破 · 攻克难关', description: '每一个技术难题的攻克，都是一次蜕变。从最初面对bug的焦头烂额，到后来能够独立分析和解决问题，那些最难熬的时刻往往也是成长最快的阶段。',
        highlights: ['性能优化实战', '复杂系统调试', '架构设计升级'],
        links: [], quote: '',
      },
    },
    dschubba: {
      id: 'dschubba', name: '房宿三', label: '房宿三 · 项目经验',
      status: 'active', type: 'career', year: '',
      position: _scorpiusPos.dschubba,
      content: {
        title: '项目经验 · 从0到1', description: '完整经历过的项目从立项到上线的全流程。需求分析、技术方案、迭代开发、测试上线——每一个环节都积累了宝贵的实践经验。',
        highlights: ['全流程项目管理', '需求分析与方案设计', '持续迭代交付'],
        links: [], quote: '',
      },
    },
    akrab: {
      id: 'akrab', name: '尾宿一', label: '尾宿一 · 竞赛与荣誉',
      status: 'active', type: 'career', year: '',
      position: _scorpiusPos.akrab,
      content: {
        title: '竞赛与荣誉', description: '在竞赛中检验自己的能力，用奖项记录成长的里程碑。不是为荣誉本身，而是为每一次全力以赴的过程。',
        highlights: ['算法竞赛', '创新项目大赛', '学术荣誉'],
        links: [], quote: '',
      },
    },
    pi: {
      id: 'scorpius_pi', name: '尾宿二', label: '尾宿二',
      status: 'dormant', type: 'career', year: '',
      position: _scorpiusPos.pi, content: null,
    },
    rho: {
      id: 'scorpius_rho', name: '尾宿三', label: '尾宿三',
      status: 'dormant', type: 'career', year: '',
      position: _scorpiusPos.rho, content: null,
    },
  },
  connections: [
    ['antares', 'dschubba'], ['antares', 'akrab'],
    ['dschubba', 'scorpius_pi'], ['scorpius_pi', 'scorpius_rho'],
    ['akrab', 'scorpius_pi'],
  ],
};

// ============================================
// 微型星座 — 技能标签 (填充星座之间空隙)
// ============================================
const MR = CONSTELLATION_SPHERE.miniRadius;

// --- 三角座 (数据分析能力) ---
const _triPos = _positions({
  alpha: { theta: 0.14, phi: 1.04, r: MR },
  beta:  { theta: 0.06, phi: 1.10, r: MR },
  gamma: { theta: 0.20, phi: 1.10, r: MR },
});
export const TRIANGULUM = {
  id: 'triangulum', name: '三角座',
  stars: {
    alpha: { id: 'tri_alpha', name: '三角一', label: '三角一 · 数据分析',
      status: 'active', type: 'career', year: '', position: _triPos.alpha,
      content: { title: '数据分析', description: '数据是新时代的石油。善于从数据中发现规律、验证假设，用数据驱动决策。', highlights: ['统计分析', '数据可视化', 'A/B测试'], links: [], quote: '' },
    },
    beta: { id: 'tri_beta', name: '三角二', label: '三角二 · 产品思维',
      status: 'active', type: 'career', year: '', position: _triPos.beta,
      content: { title: '产品思维', description: '理解产品从需求到落地的完整链路。关注用户价值，追求技术与产品的平衡。', highlights: ['需求分析', '用户研究', 'MVP设计'], links: [], quote: '' },
    },
    gamma: { id: 'tri_gamma', name: '三角三', label: '三角三 · 项目管理',
      status: 'active', type: 'career', year: '', position: _triPos.gamma,
      content: { title: '项目管理', description: '良好的项目规划与执行力。擅长拆解任务、管理进度、协调资源。', highlights: ['敏捷开发', '进度管理', '跨团队协作'], links: [], quote: '' },
    },
  },
  connections: [['tri_alpha', 'tri_beta'], ['tri_beta', 'tri_gamma'], ['tri_gamma', 'tri_alpha']],
};

// --- 南冕座 (作品与项目成果) ---
const _coronaPos = _positions({
  alpha: { theta: 0.52, phi: 1.46, r: MR },
  beta:  { theta: 0.58, phi: 1.42, r: MR },
  gamma: { theta: 0.46, phi: 1.42, r: MR },
  delta: { theta: 0.54, phi: 1.50, r: MR },
});
export const CORONA = {
  id: 'corona', name: '南冕座',
  stars: {
    alpha: { id: 'cor_alpha', name: '冕一', label: '冕一 · 作品落地',
      status: 'active', type: 'career', year: '', position: _coronaPos.alpha,
      content: { title: '作品落地', description: '从想法到成品，每一步都是修行。重视代码质量与交付效率。', highlights: ['全栈项目', '代码质量', '持续部署'], links: [], quote: '' },
    },
    beta: { id: 'cor_beta', name: '冕二', label: '冕二 · 开源贡献',
      status: 'active', type: 'career', year: '', position: _coronaPos.beta,
      content: { title: '开源贡献', description: '相信开源的力量。参与社区贡献，学习最佳实践，也回馈社区。', highlights: ['GitHub贡献', '技术社区', '代码Review'], links: [], quote: '' },
    },
    gamma: { id: 'cor_gamma', name: '冕三', label: '冕三 · 文档写作',
      status: 'active', type: 'career', year: '', position: _coronaPos.gamma,
      content: { title: '文档写作', description: '好的文档是工程的基石。善于将复杂的设计和技术方案写成清晰易懂的文档。', highlights: ['技术文档', 'API文档', '设计文档'], links: [], quote: '' },
    },
    delta: { id: 'cor_delta', name: '冕四', label: '冕四',
      status: 'dormant', type: 'career', year: '', position: _coronaPos.delta, content: null,
    },
  },
  connections: [
    ['cor_alpha', 'cor_beta'], ['cor_beta', 'cor_gamma'],
    ['cor_gamma', 'cor_alpha'], ['cor_alpha', 'cor_delta'],
  ],
};

// --- 小马座 (快速学习能力) ---
const _equuPos = _positions({
  alpha: { theta: 0.40, phi: 1.34, r: MR },
  beta:  { theta: 0.46, phi: 1.32, r: MR },
  gamma: { theta: 0.44, phi: 1.38, r: MR },
});
export const EQUULEUS = {
  id: 'equuleus', name: '小马座',
  stars: {
    alpha: { id: 'equ_alpha', name: '小马一', label: '小马一 · 快速学习',
      status: 'active', type: 'career', year: '', position: _equuPos.alpha,
      content: { title: '快速学习', description: '面对新技术能够快速上手，保持持续学习的心态。适应变化是技术人最重要的能力之一。', highlights: ['技术探索', '知识迁移', '学习效率'], links: [], quote: '' },
    },
    beta: { id: 'equ_beta', name: '小马二', label: '小马二 · 技术视野',
      status: 'active', type: 'career', year: '', position: _equuPos.beta,
      content: { title: '技术视野', description: '关注行业前沿技术趋势，保持广度与深度的平衡。技术选型时能做出合理判断。', highlights: ['技术调研', '趋势分析', '方案对比'], links: [], quote: '' },
    },
    gamma: { id: 'equ_gamma', name: '小马三', label: '小马三 · 问题解决',
      status: 'active', type: 'career', year: '', position: _equuPos.gamma,
      content: { title: '问题解决', description: '遇到问题不退缩，善于拆解和定位根因。耐心与逻辑是解决复杂问题的钥匙。', highlights: ['根因分析', 'Debug能力', '系统性思维'], links: [], quote: '' },
    },
  },
  connections: [['equ_alpha', 'equ_beta'], ['equ_beta', 'equ_gamma'], ['equ_gamma', 'equ_alpha']],
};

// --- 狐狸座 (创作、表达、内容能力) ---
const _vulPos = _positions({
  alpha: { theta: 0.60, phi: 1.00, r: MR },
  beta:  { theta: 0.55, phi: 1.04, r: MR },
  gamma: { theta: 0.65, phi: 0.96, r: MR },
  delta: { theta: 0.68, phi: 1.02, r: MR },
});
export const VULPECULA = {
  id: 'vulpecula', name: '狐狸座',
  stars: {
    alpha: { id: 'vul_alpha', name: '狐一', label: '狐一 · 沟通表达',
      status: 'active', type: 'life', year: '', position: _vulPos.alpha,
      content: { title: '沟通表达', description: '清晰的表达能力是协作的基石。善于用简洁的语言传达复杂的概念。', highlights: ['技术分享', '汇报演示', '跨团队沟通'], links: [], quote: '' },
    },
    beta: { id: 'vul_beta', name: '狐二', label: '狐二 · 英语能力',
      status: 'active', type: 'life', year: '', position: _vulPos.beta,
      content: { title: '英语能力', description: '具备良好的英文阅读与沟通能力，能够阅读技术文档与论文。', highlights: ['英文技术阅读', '专业文档理解', '日常交流'], links: [], quote: '' },
    },
    gamma: { id: 'vul_gamma', name: '狐三', label: '狐三 · 设计审美',
      status: 'active', type: 'life', year: '', position: _vulPos.gamma,
      content: { title: '设计审美', description: '对美学有追求，关注UI/UX细节。相信好的产品应该兼具功能与美感。', highlights: ['UI设计', '交互体验', '视觉规范'], links: [], quote: '' },
    },
    delta: { id: 'vul_delta', name: '狐四', label: '狐四',
      status: 'dormant', type: 'life', year: '', position: _vulPos.delta, content: null,
    },
  },
  connections: [
    ['vul_alpha', 'vul_beta'], ['vul_beta', 'vul_gamma'],
    ['vul_gamma', 'vul_delta'], ['vul_delta', 'vul_alpha'],
  ],
};

// ============================================
// 个人资料
// ============================================
export const PERSONAL = {
  about: `你好，欢迎来到我的星空。

这是一个将个人成长经历可视化为星河的个人网站。北斗七星承载着我从本科到现在的关键节点，猎户座记录了我的技能栈，仙女座和天琴座存放着生活中的热爱与闪光，天蝎座则标记了那些充满挑战的成长时刻。

我相信人生由无数短暂的闪光瞬间组成——平淡的日常如同无尽黑夜，而个人的成长、成果、热爱与生活碎片，都是黑暗中支撑自我前行的星星。

如果你也喜欢这样的表达方式，欢迎与我交流。`,
  contact: {
    email: 'your-email@example.com',
    github: 'https://github.com/yourusername',
    blog: '',
  },
};

// ============================================
// 汇总导出
// ============================================
export const ALL_CONSTELLATIONS = [
  BIG_DIPPER, ORION, ANDROMEDA, LYRA, SCORPIUS,
  TRIANGULUM, CORONA, EQUULEUS, VULPECULA,
];

// Get all active stars
export function getAllActiveStars() {
  const active = [];
  for (const c of ALL_CONSTELLATIONS) {
    for (const star of Object.values(c.stars)) {
      if (star.status === 'active') {
        active.push({ ...star, constellationId: c.id, constellationName: c.name });
      }
    }
  }
  return active;
}

// Get star by id
export function getStarById(starId) {
  for (const c of ALL_CONSTELLATIONS) {
    if (c.stars[starId]) {
      return { ...c.stars[starId], constellationId: c.id, constellationName: c.name };
    }
  }
  return null;
}
