import cfonts from 'cfonts';

// 渲染
const { string } = cfonts.render('Hello World', {
  font: 'block',
  align: 'left',
  colors: ['red', 'yellow'], // 主体色 + 阴影色
  background: 'transparent',
  letterSpacing: 1,
  lineHeight: 1,
  gradient: false,
  env: 'node'
});

const stretchFactor = 3;

// ANSI 颜色码匹配
const ansiRegex = /\x1b\[[0-9;]*m/g;

const stretched = string
  .split('\n')
  .flatMap(line => {
    // 分离颜色码和纯文本
    const parts = line.split(ansiRegex).filter(Boolean);
    const codes = line.match(ansiRegex) || [];

    // 如果只有一种颜色（主体），直接重复
    if (codes.length <= 2) {
      return Array(stretchFactor).fill(line);
    }

    // 如果有两种颜色（主体+阴影）
    // 只重复主体部分（假设主体在前）
    const mainColor = codes[0];
    const shadowColor = codes[2] || '';
    const reset = '\x1b[0m';

    const mainPart = `${mainColor}${parts[0]}${reset}`;
    const shadowPart = `${shadowColor}${parts[1] || ''}${reset}`;

    return Array(stretchFactor).fill(mainPart + shadowPart);
  })
  .join('\n');

console.log(stretched);
