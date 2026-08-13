
import CFonts from 'cfonts';

CFonts.render(
  'Hello World\nThis is line 2\nAnd line 3', // 多行用 \n 分隔
  {
    font: 'block',               // 字体样式
    align: 'left',               // 对齐方式
    colors: ['cyan', 'magenta'], // 渐变色
    background: 'transparent',   // 背景透明
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: 0,
    env: 'node',                 // 确保是 Node 环境
    writeToFile: true,           // 启用写文件
    destination: './cfonts-png.png'  // 输出 PNG 文件路径
  }
);

console.log('PNG 文件已生成：cfonts-png.png');