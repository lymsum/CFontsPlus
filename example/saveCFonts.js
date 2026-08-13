// 安装依赖：
// npm install cfonts canvas

// const fs = require('fs');
// const { createCanvas } = require('canvas');
// const CFonts = require('cfonts');

import fs from 'fs';
import CFonts from 'cfonts';
import {createCanvas} from 'canvas';

function saveCFontsToPNG(text, options, outputPath) {
  // 1. 用 cfonts 渲染（无颜色码，方便绘制）
  const rendered = CFonts.render(text, {
    ...options,
    colors: ['system'], // 避免 ANSI 颜色码干扰
  });

  const lines = rendered.string.split('\n'); //rendered.lines; // 纯文本行数组 rendered.string.split('\n');

  // 2. 计算画布大小
  const fontSize = 20; // 像素字体大小
  const padding = 20;
  const width = Math.max(...lines.map(line => line.length)) * (fontSize * 0.6) + padding * 2;
  const height = lines.length * fontSize + padding * 2;

//   console.log(`width:${width}`);

  // 3. 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景色
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // 文本样式
  ctx.fillStyle = '#00FF00'; // 绿色字体
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  // 4. 绘制每一行
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + i * fontSize);
  });

  // 5. 保存 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ PNG 已保存到: ${outputPath}`);
}

// 调用示例
saveCFontsToPNG('Ultrakill', {
    font: 'simpleBlock',       // 字体样式: block, slick, tiny, simpleBlock, simple3d,etc.
    align: 'center',     // 对齐方式
    colors: ['red', 'green', 'green'], // 渐变色['cyan', 'magenta']
    background: 'blue', //transparent
    letterSpacing: 1,
    lineHeight: 1,  // 5
    // space: true,
    spaceless: true,
    gradient: ['red', 'green'] //,
    // "independent-gradient": true,
    // "transition-gradient": true,
    // "raw-mode": true
    // maxLength: '0'
}, 'Ultrakill-new.png');