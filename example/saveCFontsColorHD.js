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
// import rgb from 'ansi-to-rgb';
import ansiToRgb from 'ansi-to-rgb';

/**
 * 保存 cfonts 彩色输出为 PNG（高清版）
 * @param {string} text - 要渲染的文字
 * @param {object} options - cfonts 渲染选项
 * @param {string} outputPath - 输出 PNG 路径
 * @param {object} extra - 额外参数 { scale, fontSize, padding, background }
 */
function saveCFontsColorPNG_HD(text, options, outputPath, extra = {}) {
  const scale = extra.scale || 2; // 高清倍数
  const fontSize = extra.fontSize || 20; // 基础字体大小
  const padding = extra.padding || 20; // 内边距
  const background = extra.background || 'transparent'; // 背景色

  // 1. 渲染带 ANSI 颜色码的字符串
  const rendered = CFonts.render(text, options);
  const lines = rendered.string.split('\n');

  // 2. 解析 ANSI 颜色
//   const parsedLines = lines.map(line => ansiToJson(line)); // ansiToJson
  const parsedLines = lines.map(line => ansiToRgb(line)); // ansiToJson

  // 3. 计算最大字符数（用于画布宽度）
  const maxChars = Math.max(
    ...parsedLines.map(line =>
      line.reduce((sum, seg) => sum + seg.content.length, 0)
    )
  );

  // 4. 计算画布大小（乘以 scale）
  const charWidth = fontSize * 0.6; // 等宽字体宽度比例
  const width = (maxChars * charWidth + padding * 2) * scale;
  const height = (parsedLines.length * fontSize + padding * 2) * scale;

  // 5. 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  if (background === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  // 设置字体（乘以 scale）
  ctx.font = `${fontSize * scale}px monospace`;
  ctx.textBaseline = 'top';

  // 6. 绘制每一行（分段上色）
  parsedLines.forEach((segments, rowIndex) => {
    let x = padding * scale;
    const y = (padding + rowIndex * fontSize) * scale;

    segments.forEach(seg => {
      if (!seg.content) return;

      ctx.fillStyle = seg.fg || '#FFFFFF';
      ctx.fillText(seg.content, x, y);

      x += seg.content.length * charWidth * scale;
    });
  });

  // 7. 保存 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 高清彩色 PNG 已保存到: ${outputPath}`);
}

// 调用示例
saveCFontsColorPNG_HD(
  'Ultrakill',
  {
    font: 'block',       // 字体样式: block, slick, chrome, tiny, simpleBlock, simple3d,etc.
    align: 'left',     // 对齐方式center
    colors: ['red','blue'], // 渐变色['cyan', 'magenta']
    background: 'transparent', // blue
    letterSpacing: 1,
    lineHeight: 1,  // 5
    // space: true,
    spaceless: true,
    gradient: ['red', 'yellow'],
    independentGradient: true,
    transitionGradient: true,
    // rawMode: true,
    env: 'node'
    // maxLength: '0'
  },
  'Ultrakill_color_hd.png',
  {
    scale: 4, // 4x 高清
    fontSize: 20,
    padding: 20,
    background: 'transparent' // #000000黑色背景，可改 'transparent'
  }
);
