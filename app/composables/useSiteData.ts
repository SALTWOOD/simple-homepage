interface Friend {
  name: string
  desc: string
  avatar: string
  link: string
}

interface TechBadge {
  label: string
  color: string
  logo: string
}

const friendAvatarBase = 'https://saltwood.top:5244/d/友链头像/'

export const friends: Friend[] = [
  {
    name: '夏沫花火zzz🌙 (Muska_Ami)のLife',
    desc: 'Keep doing, keep loving.',
    avatar: `${friendAvatarBase}夏沫花火.png`,
    link: 'https://1l1.icu/'
  },
  {
    name: '烟墨的屑站点',
    desc: '林花谢了春红，太匆匆。无奈朝来寒雨，晚来风。',
    avatar: `${friendAvatarBase}烟墨.png`,
    link: 'https://ymbit.cn/'
  },
  {
    name: '米露小窝',
    desc: '放弃个性，就和死了没什么区别',
    avatar: `${friendAvatarBase}米露.png`,
    link: 'https://milu.ink/'
  },
  {
    name: '阿龙的笔记',
    desc: '阿巴阿巴…',
    avatar: `${friendAvatarBase}阿龙.png`,
    link: 'https://www.alongw.cn/'
  },
  {
    name: '零狼の小窝',
    desc: '404 Not Found.',
    avatar: `${friendAvatarBase}ZeroWolf.png`,
    link: 'https://zerowolf.cn/'
  },
  {
    name: '晓雨杂记',
    desc: '也许我们会分别，但我们将永远不会忘记彼此。',
    avatar: `${friendAvatarBase}Big_Cake.png`,
    link: 'https://lihaoyu.cn/'
  },
  {
    name: "Daiyangcheng's Blog",
    desc: 'dyc 的碎碎念',
    avatar: `${friendAvatarBase}Daiyangcheng.png`,
    link: 'https://www.daiyangcheng.cn/'
  }
]

export const techBadges: TechBadge[] = [
  { label: 'TypeScript', color: '3178C6', logo: 'typescript' },
  { label: '.NET', color: '512BD4', logo: 'dotnet' },
  { label: 'F%23', color: '378BBA', logo: 'fsharp' },
  { label: 'Python', color: '3776AB', logo: 'python' },
  { label: 'PHP', color: '777BB4', logo: 'php' },
  { label: 'JavaScript', color: 'F7DF1E', logo: 'javascript' },
  { label: 'Java', color: 'ED8B00', logo: 'openjdk' },
  { label: 'Vue.js', color: '4FC08D', logo: 'vue.js' },
  { label: 'Node.js', color: '339933', logo: 'node.js' },
  { label: 'HTML5', color: 'E34F26', logo: 'html5' },
  { label: 'Bun', color: '000000', logo: 'bun' },
  { label: 'Go', color: '00ADD8', logo: 'go' },
  { label: 'Rust', color: '000000', logo: 'rust' },
  { label: 'Vuetify', color: '1867C0', logo: 'vuetify' },
  { label: 'Docker', color: '2496ED', logo: 'docker' },
  { label: 'C%2B%2B', color: '00599C', logo: 'c%2B%2B' },
  { label: 'PostgreSQL', color: '4169E1', logo: 'postgresql' },
  { label: 'MySQL', color: '4479A1', logo: 'mysql' },
  { label: 'MariaDB', color: '003545', logo: 'mariadb' },
  { label: 'Redis', color: 'DC382D', logo: 'redis' }
]
