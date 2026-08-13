// 安装依赖：
// npm install cfonts canvas ansi-to-json

// const fs = require('fs');
// const { createCanvas } = require('canvas');
// const CFonts = require('cfonts');
// const ansiToJson = require('ansi-to-json');

import fs from 'fs';
import CFonts from 'cfonts';
import {createCanvas} from 'canvas';
import ansiToJson from 'ansi-to-json';

function ansiToRgbManual(ansiCode) {
  const match = /\x1b\[38;2;(\d+);(\d+);(\d+)m/.exec(ansiCode);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

function saveCFontsColorPNG(text, options, outputPath) {
  // 1. 渲染带 ANSI 颜色码的字符串
  const rendered = CFonts.render(text, options);
  const lines = rendered.string.split('\n'); // 带颜色码的行

  // 2. 解析 ANSI 颜色为 JSON 格式
  const parsedLines = lines.map(line => ansiToJson(line));

  // 3. 计算画布大小
  const fontSize = 20;
  const padding = 20;
  const maxChars = Math.max(...parsedLines.map(line => line.reduce((sum, seg) => sum + seg.content.length, 0)));
  const width = maxChars * (fontSize * 0.6) + padding * 2;
  const height = parsedLines.length * fontSize + padding * 2;

  // 4. 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景色
  if (options.background === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = options.background;  //'#000000';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = 'top';

  // 5. 绘制每一行（分段上色）
  parsedLines.forEach((segments, rowIndex) => {
    let x = padding;
    const y = padding + rowIndex * fontSize;

    segments.forEach(seg => {
      if (!seg.content) return;

      // 如果有颜色信息，使用它，否则默认白色
      ctx.fillStyle = seg.fg ? seg.fg : '#970f0f';
      ctx.fillText(seg.content, x, y);

      // 移动光标
      x += seg.content.length * (fontSize * 0.6);
    });
  });

  console.log(rendered.string);
    //   console.log(parsedLines.map(a=>a.reduce(b=>b.content)));

    // 提取 ANSI 颜色并转成 RGB
    const ansiRegex = /\x1b\[38;2;(\d+);(\d+);(\d+)m/g;
    let match;
    while ((match = ansiRegex.exec(rendered)) !== null) {
        const rgb = ansiToRgb(match[0]); // 转成 [R, G, B]
        console.log(`ANSI: ${match[0]}  =>  RGB: ${rgb}`);
    }
    console.log(`new: ${ansiToRgbManual(rendered)}`);

  // 6. 保存 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 彩色 PNG 已保存到: ${outputPath}`);
}

// 调用示例
saveCFontsColorPNG('Ultrakill', {
    font: 'block',       // 字体样式: block, slick, tiny, simpleBlock, simple3d,etc.
    align: 'left',     // 对齐方式
    // colors: ['red', 'yellow', 'cyan'], // 渐变色['cyan', 'magenta']
    background: 'transparent', // blue
    letterSpacing: 1,
    lineHeight: 1,  // 5
    // space: true,
    spaceless: true,
    gradient: ['red', 'yellow'],
    // independentGradient: true,
    transitionGradient: true,
    // rawMode: true,
    env: 'node'
    // maxLength: '0'
    }, 'Ultrakill_color.png'
);