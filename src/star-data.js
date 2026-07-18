// ============================================
// 星座数据（适配 Celestial-Drift 场景尺寸）
// ============================================
import * as THREE from 'three';

function pos(theta, phi, r) {
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// ============ 北斗七星（中心主区，半径14） ============
const DR = 14;
const _bd = {
  tianshu:  pos(0.20, 1.26, DR),
  tianxuan: pos(0.32, 1.16, DR),
  tianji:   pos(0.44, 1.12, DR),
  tianquan: pos(0.56, 1.18, DR),
  yuheng:   pos(0.66, 1.22, DR),
  kaiyang:  pos(0.76, 1.26, DR),
  yaoguang: pos(0.86, 1.28, DR),
};

export const BIG_DIPPER = {
  id: 'big-dipper', name: '北斗七星',
  focus: new THREE.Vector3(0.50, 1.20, 14),
  stars: {
    tianshu: { id:'tianshu', name:'天枢', label:'天枢 · 本科初期', status:'active', type:'career', year:'2020-2021', position:_bd.tianshu,
      content:{ title:'本科初期 · 破晓时分', description:'初入校园，对未来充满好奇与憧憬。参加了第一次编程竞赛，第一次完成完整的课程项目。', highlights:['校园编程竞赛','早期原创作品','编程入门记录'], quote:'这是我黑暗岁月里，第一颗稳定发光的星。' } },
    tianxuan: { id:'tianxuan', name:'天璇', label:'天璇 · 课余沉淀', status:'dormant', type:'career', year:'', position:_bd.tianxuan, content:null },
    tianji: { id:'tianji', name:'天玑', label:'天玑 · 科研学习', status:'active', type:'career', year:'2021-2022', position:_bd.tianji,
      content:{ title:'科研学习 · 探知求真', description:'进入实验室，开始接触学术研究与科研方法论。参与导师课题项目，学习文献检索与论文写作。', highlights:['学术项目参与','实验成果分析','论文文献综述'], quote:'这是我黑暗岁月里，一颗稳定发光的星。' } },
    tianquan: { id:'tianquan', name:'天权', label:'天权 · 首次实习', status:'active', type:'career', year:'2022-2023', position:_bd.tianquan,
      content:{ title:'首次实习 · 职场初探', description:'第一次踏入互联网公司，从校园走向职场。学会了团队协作、代码规范、项目流程。', highlights:['互联网实习','项目复盘','职场协作'], quote:'这是我黑暗岁月里，一颗稳定发光的星。' } },
    yuheng: { id:'yuheng', name:'玉衡', label:'玉衡 · 业余生活', status:'dormant', type:'life', year:'', position:_bd.yuheng, content:null },
    kaiyang: { id:'kaiyang', name:'开阳', label:'开阳 · 深度实习', status:'active', type:'career', year:'2023-2024', position:_bd.kaiyang,
      content:{ title:'深度实习 · 能力突破', description:'进入核心业务团队，参与专项工作项目。从执行者向主导者转变，技术栈拓宽。', highlights:['专项项目主导','跨团队协作','技术突破'], quote:'这是我黑暗岁月里，一颗稳定发光的星。' } },
    yaoguang: { id:'yaoguang', name:'摇光', label:'摇光 · 当下与未来', status:'active', type:'career', year:'2024-至今', position:_bd.yaoguang,
      content:{ title:'当下与未来 · 星辰大海', description:'站在当下回望，每一颗星都记录了曾经的自己。新的星光还在继续点亮。', highlights:['个人原创项目','作品集','未来规划'], quote:'人活无数瞬间，星亮漫漫长夜。所有细碎闪光，都是人生的支点。' } },
  },
  connections: [['tianshu','tianxuan'],['tianxuan','tianji'],['tianji','tianquan'],['tianquan','yuheng'],['yuheng','kaiyang'],['kaiyang','yaoguang']],
};

// ============ 猎户座（右侧，半径12） ============
const OR = 12;
const _or = {
  betelgeuse: pos(-0.04, 1.13, OR),
  bellatrix:  pos(-0.12, 1.08, OR),
  alnitak:    pos(0.00, 1.26, OR),
  alnilam:    pos(-0.04, 1.28, OR),
  mintaka:    pos(-0.08, 1.30, OR),
  rigel:      pos(0.04, 1.40, OR),
  saiph:      pos(-0.10, 1.44, OR),
};
export const ORION = {
  id: 'orion', name: '猎户座',
  focus: new THREE.Vector3(-0.03, 1.26, 12),
  stars: {
    betelgeuse: { id:'betelgeuse', name:'参宿四', label:'参宿四 · 前端开发', status:'active', type:'career', year:'', position:_or.betelgeuse, content:{ title:'前端开发', description:'熟练掌握 HTML/CSS/JavaScript，熟悉 React、Vue 等现代前端框架。', highlights:['React/Vue/TypeScript','Three.js/WebGL','响应式布局'], quote:'' } },
    bellatrix: { id:'bellatrix', name:'参宿五', label:'参宿五 · 后端开发', status:'active', type:'career', year:'', position:_or.bellatrix, content:{ title:'后端开发', description:'熟悉 Python/Node.js 后端开发，了解数据库设计与API设计。', highlights:['Python/Node.js','数据库设计','RESTful API'], quote:'' } },
    alnitak: { id:'alnitak', name:'参宿一', label:'参宿一', status:'dormant', type:'career', year:'', position:_or.alnitak, content:null },
    alnilam: { id:'alnilam', name:'参宿二', label:'参宿二', status:'dormant', type:'career', year:'', position:_or.alnilam, content:null },
    mintaka: { id:'mintaka', name:'参宿三', label:'参宿三', status:'dormant', type:'career', year:'', position:_or.mintaka, content:null },
    rigel: { id:'rigel', name:'参宿七', label:'参宿七 · 数据分析', status:'active', type:'career', year:'', position:_or.rigel, content:{ title:'数据分析', description:'掌握数据分析基本方法论，能够通过数据驱动决策。', highlights:['数据可视化','统计分析','SQL/Excel'], quote:'' } },
    saiph: { id:'saiph', name:'参宿六', label:'参宿六 · 工具与部署', status:'active', type:'career', year:'', position:_or.saiph, content:{ title:'工具与部署', description:'熟练使用 Git 进行版本管理，了解 CI/CD 流程与云服务部署。', highlights:['Git/GitHub','CI/CD','云服务部署'], quote:'' } },
  },
  connections: [['betelgeuse','alnitak'],['bellatrix','alnilam'],['alnitak','alnilam'],['alnilam','mintaka'],['rigel','saiph'],['saiph','mintaka'],['rigel','alnitak']],
};

// ============ 仙女座（左上，半径12） ============
const AR = 12;
const _an = { alpheratz: pos(0.72, 0.90, AR), mirach: pos(0.80, 0.96, AR), almach: pos(0.88, 0.92, AR), delta: pos(0.78, 0.84, AR) };
export const ANDROMEDA = {
  id: 'andromeda', name: '仙女座',
  focus: new THREE.Vector3(0.80, 0.90, 12),
  stars: {
    alpheratz: { id:'alpheratz', name:'壁宿二', label:'壁宿二 · 摄影', status:'active', type:'life', year:'', position:_an.alpheratz, content:{ title:'摄影 · 光影定格', description:'喜欢用镜头记录生活中的美好瞬间。无论是城市街角还是旅途中的风景。', highlights:['街拍摄影','旅行风光','星空摄影'], quote:'' } },
    mirach: { id:'mirach', name:'奎宿九', label:'奎宿九 · 文字与阅读', status:'active', type:'life', year:'', position:_an.mirach, content:{ title:'文字与阅读', description:'阅读是精神的旅行，写作是内心的对话。喜欢在书籍中寻找不同的世界观。', highlights:['读书笔记','随笔写作','知识分享'], quote:'' } },
    almach: { id:'almach', name:'天大将军一', label:'天大将军一 · 音乐', status:'active', type:'life', year:'', position:_an.almach, content:{ title:'音乐 · 心灵共振', description:'音乐是生活中不可或缺的伴奏。从后摇到古典，不同旋律陪伴不同时刻。', highlights:['后摇/氛围音乐','古典入门','播放精选'], quote:'' } },
    delta: { id:'delta_and', name:'奎宿五', label:'奎宿五 · 旅行', status:'active', type:'life', year:'', position:_an.delta, content:{ title:'旅行 · 世界漫游', description:'向往远方，热爱探索。每一次旅行都是对日常的短暂逃离。', highlights:['旅行足迹','城市探索','旅行摄影'], quote:'' } },
  },
  connections: [['alpheratz','mirach'],['mirach','almach'],['almach','delta_and'],['delta_and','alpheratz']],
};

// ============ 天琴座（左下，半径12） ============
const LR = 12;
const _ly = { vega: pos(0.72, 1.42, LR), beta: pos(0.80, 1.50, LR), gamma: pos(0.65, 1.38, LR), delta: pos(0.70, 1.50, LR), epsilon: pos(0.76, 1.35, LR) };
export const LYRA = {
  id: 'lyra', name: '天琴座',
  focus: new THREE.Vector3(0.73, 1.43, 12),
  stars: {
    vega: { id:'vega', name:'织女一', label:'织女一 · 创作输出', status:'active', type:'life', year:'', position:_ly.vega, content:{ title:'创作 · 表达自我', description:'用文字、代码和图像表达想法。创作的快乐在于从无到有的过程。', highlights:['独立项目','技术博客','数字艺术'], quote:'' } },
    beta: { id:'lyra_beta', name:'渐台二', label:'渐台二 · 视频剪辑', status:'active', type:'life', year:'', position:_ly.beta, content:{ title:'视频 · 剪辑与记录', description:'喜欢用视频记录生活中有趣的片段。剪辑是对记忆的二次创作。', highlights:['Vlog制作','主题短片','视频后期'], quote:'' } },
    gamma: { id:'lyra_gamma', name:'织女二', label:'织女二 · 手工制作', status:'active', type:'life', year:'', position:_ly.gamma, content:{ title:'手工 · 指尖的温度', description:'拼图、模型、手帐——缓慢而专注的时光是最好的放松。', highlights:['拼图','模型制作','手帐记录'], quote:'' } },
    delta: { id:'lyra_delta', name:'织女三', status:'dormant', type:'life', year:'', position:_ly.delta, content:null },
    epsilon: { id:'lyra_epsilon', name:'织女四', status:'dormant', type:'life', year:'', position:_ly.epsilon, content:null },
  },
  connections: [['vega','beta'],['vega','gamma'],['beta','gamma'],['beta','lyra_delta'],['vega','lyra_epsilon']],
};

// ============ 天蝎座（右下，半径12） ============
const SR = 12;
const _sc = { antares: pos(0.18, 1.48, SR), dschubba: pos(0.12, 1.42, SR), akrab: pos(0.26, 1.55, SR), pi: pos(0.16, 1.52, SR), rho: pos(0.06, 1.46, SR) };
export const SCORPIUS = {
  id: 'scorpius', name: '天蝎座',
  focus: new THREE.Vector3(0.16, 1.48, 12),
  stars: {
    antares: { id:'antares', name:'心宿二', label:'心宿二 · 技术突破', status:'active', type:'career', year:'', position:_sc.antares, content:{ title:'技术突破 · 攻克难关', description:'每一个技术难题的攻克都是一次蜕变。最难熬的时刻往往也是成长最快的阶段。', highlights:['性能优化','复杂调试','架构升级'], quote:'' } },
    dschubba: { id:'dschubba', name:'房宿三', label:'房宿三 · 项目经验', status:'active', type:'career', year:'', position:_sc.dschubba, content:{ title:'项目经验 · 从0到1', description:'完整经历项目从立项到上线的全流程。需求分析、技术方案、迭代开发。', highlights:['全流程管理','需求方案设计','持续交付'], quote:'' } },
    akrab: { id:'akrab', name:'尾宿一', label:'尾宿一 · 竞赛与荣誉', status:'active', type:'career', year:'', position:_sc.akrab, content:{ title:'竞赛与荣誉', description:'在竞赛中检验能力，用奖项记录成长的里程碑。', highlights:['算法竞赛','创新大赛','学术荣誉'], quote:'' } },
    pi: { id:'scorpius_pi', name:'尾宿二', status:'dormant', type:'career', year:'', position:_sc.pi, content:null },
    rho: { id:'scorpius_rho', name:'尾宿三', status:'dormant', type:'career', year:'', position:_sc.rho, content:null },
  },
  connections: [['antares','dschubba'],['antares','akrab'],['dschubba','scorpius_pi'],['scorpius_pi','scorpius_rho'],['akrab','scorpius_pi']],
};

// ============ 微型星座（半径10） ============
const MR = 10;
export const TRIANGULUM = {
  id: 'triangulum', name: '三角座',
  stars: {
    alpha: { id:'tri_alpha', name:'三角一', label:'三角一 · 数据分析', status:'active', type:'career', year:'', position:pos(0.14, 1.04, MR), content:{ title:'数据分析', description:'数据驱动决策，从数据中发现规律。', highlights:['统计','可视化','A/B测试'], quote:'' } },
    beta: { id:'tri_beta', name:'三角二', label:'三角二 · 产品思维', status:'active', type:'career', year:'', position:pos(0.06, 1.10, MR), content:{ title:'产品思维', description:'理解产品从需求到落地的完整链路。', highlights:['需求分析','用户研究','MVP设计'], quote:'' } },
    gamma: { id:'tri_gamma', name:'三角三', label:'三角三 · 项目管理', status:'active', type:'career', year:'', position:pos(0.20, 1.10, MR), content:{ title:'项目管理', description:'优秀的项目规划与执行力。', highlights:['敏捷开发','进度管理','跨团队协作'], quote:'' } },
  },
  connections: [['tri_alpha','tri_beta'],['tri_beta','tri_gamma'],['tri_gamma','tri_alpha']],
};

export const CORONA = {
  id: 'corona', name: '南冕座',
  stars: {
    alpha: { id:'cor_alpha', name:'冕一', label:'冕一 · 作品落地', status:'active', type:'career', year:'', position:pos(0.52, 1.46, MR), content:{ title:'作品落地', description:'从想法到成品，重视代码质量与交付。', highlights:['全栈','代码质量','持续部署'], quote:'' } },
    beta: { id:'cor_beta', name:'冕二', label:'冕二 · 开源贡献', status:'active', type:'career', year:'', position:pos(0.58, 1.42, MR), content:{ title:'开源贡献', description:'相信开源的力量，参与社区贡献。', highlights:['GitHub','技术社区','Code Review'], quote:'' } },
    gamma: { id:'cor_gamma', name:'冕三', label:'冕三 · 文档写作', status:'active', type:'career', year:'', position:pos(0.46, 1.42, MR), content:{ title:'文档写作', description:'善于将复杂的技术方案写成清晰文档。', highlights:['技术文档','API文档','设计文档'], quote:'' } },
    delta: { id:'cor_delta', name:'冕四', status:'dormant', type:'career', year:'', position:pos(0.54, 1.50, MR), content:null },
  },
  connections: [['cor_alpha','cor_beta'],['cor_beta','cor_gamma'],['cor_gamma','cor_alpha'],['cor_alpha','cor_delta']],
};

export const EQUULEUS = {
  id: 'equuleus', name: '小马座',
  stars: {
    alpha: { id:'equ_alpha', name:'小马一', label:'小马一 · 快速学习', status:'active', type:'career', year:'', position:pos(0.40, 1.34, MR), content:{ title:'快速学习', description:'面对新技术快速上手，保持终身学习。', highlights:['技术探索','知识迁移','学习效率'], quote:'' } },
    beta: { id:'equ_beta', name:'小马二', label:'小马二 · 技术视野', status:'active', type:'career', year:'', position:pos(0.46, 1.32, MR), content:{ title:'技术视野', description:'关注前沿趋势，保持广度与深度。', highlights:['技术调研','趋势分析','方案对比'], quote:'' } },
    gamma: { id:'equ_gamma', name:'小马三', label:'小马三 · 问题解决', status:'active', type:'career', year:'', position:pos(0.44, 1.38, MR), content:{ title:'问题解决', description:'善于拆解和定位根因，系统性思维。', highlights:['根因分析','Debug','系统性思维'], quote:'' } },
  },
  connections: [['equ_alpha','equ_beta'],['equ_beta','equ_gamma'],['equ_gamma','equ_alpha']],
};

export const VULPECULA = {
  id: 'vulpecula', name: '狐狸座',
  stars: {
    alpha: { id:'vul_alpha', name:'狐一', label:'狐一 · 沟通表达', status:'active', type:'life', year:'', position:pos(0.60, 1.00, MR), content:{ title:'沟通表达', description:'用简洁语言传达复杂概念。', highlights:['技术分享','汇报演示','跨团队沟通'], quote:'' } },
    beta: { id:'vul_beta', name:'狐二', label:'狐二 · 英语能力', status:'active', type:'life', year:'', position:pos(0.55, 1.04, MR), content:{ title:'英语能力', description:'良好的英文阅读与沟通能力。', highlights:['英文阅读','专业文档','日常交流'], quote:'' } },
    gamma: { id:'vul_gamma', name:'狐三', label:'狐三 · 设计审美', status:'active', type:'life', year:'', position:pos(0.65, 0.96, MR), content:{ title:'设计审美', description:'对美学有追求，关注UI/UX细节。', highlights:['UI设计','交互体验','视觉规范'], quote:'' } },
    delta: { id:'vul_delta', name:'狐四', status:'dormant', type:'life', year:'', position:pos(0.68, 1.02, MR), content:null },
  },
  connections: [['vul_alpha','vul_beta'],['vul_beta','vul_gamma'],['vul_gamma','vul_delta'],['vul_delta','vul_alpha']],
};

// ============ 汇总 ============
export const ALL_CONSTELLATIONS = [
  BIG_DIPPER, ORION, ANDROMEDA, LYRA, SCORPIUS,
  TRIANGULUM, CORONA, EQUULEUS, VULPECULA,
];

export const PERSONAL = {
  about: '你好，欢迎来到我的星空。\n\n这是一个将个人成长经历可视化星河的个人网站。北斗七星承载我从本科到现在的关键节点，猎户座记录我的技能栈，仙女座和天琴座存放生活中的热爱与闪光。\n\n我相信人生由无数短暂的闪光瞬间组成——平淡的日常如同无尽黑夜，而个人的成长、成果、热爱与生活碎片，都是黑暗中支撑自我前行的星星。',
  contact: { email: 'your-email@example.com', github: 'https://github.com/yourusername', blog: '' },
};

export function getStarById(id) {
  for (const c of ALL_CONSTELLATIONS)
    if (c.stars[id]) return { ...c.stars[id], constellationId: c.id, constellationName: c.name };
  return null;
}
