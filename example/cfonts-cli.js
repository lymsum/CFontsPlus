#!/usr/bin/env node
/**
 * 用法示例：
 * node cfonts-cli.js "Hello World" -f block -c cyan,magenta -l 2 --line-height 1.5 -a center -o banner.png
 */

// const CFonts = require('cfonts');
// const { createCanvas } = require('canvas');
// const fs = require('fs');

import fs from 'fs';
import CFonts from 'cfonts';
import {createCanvas} from 'canvas';
// import ansiToJson from 'ansi-to-json';

// 解析命令行参数（支持短参数和长参数）
const args = process.argv.slice(2);
let text = '';
let outputFile = 'output.png';
const options = { env: 'node' };

// const scale = extra.scale || 2;
// const fontSize = extra.fontSize || 20;
// const padding = extra.padding || 20;
// const background = extra.background || 'transparent';

// 简单参数解析器
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (!arg.startsWith('-') && !text) {
    // 第一个非参数项作为文字
    text = arg;
  } else if (arg === '--font' || arg === '-f') {
    options.font = args[++i];
  } else if (arg === '--colors' || arg === '-c') {
    options.colors = args[++i].split(',');
  } else if (arg === '--letter-spacing' || arg === '-l') {
    options.letterSpacing = parseFloat(args[++i]);
  } else if (arg === '--line-height' || arg === '-z') {
    options.lineHeight = parseFloat(args[++i]);
  } else if (arg === '--spaceless' || arg === '-s') {
    options.spaceless = parseBool(args[++i]);
  // } else if (arg === '--line-height' || arg === '-h') {
  //   options.lineHeight = parseFloat(args[++i]);
  } else if (arg === '--align' || arg === '-a') {
    options.align = args[++i];
  } else if (arg === '--gradient' || arg === '-g') {
    options.gradient = args[++i].split(',');
  } else if (arg === '--transitionGradient' || arg === '-t') {
    options.transitionGradient = args[++i];
  } else if (arg === '--independentGradient' || arg === '-i') {
    options.independentGradient = args[++i];
  } else if (arg === '--output' || arg === '-o') {
    outputFile = args[++i];
  } else if (arg === '--background' || arg === '-b') {
    options.background = args[++i];
  } else if (arg === '--space' || arg === '-s') {
    options.space = args[++i] === 'true';
  } else if (arg === '--max-length' || arg === '-m') {
    options.maxLength = args[++i];
  }
}

// 检查文字
if (!text) {
  console.error('❌ 请输入要渲染的文字，例如: node cfonts-png.js "Hello" -f block -o out.png');
  process.exit(1);
}

// 渲染 ASCII 艺术
const rendered = CFonts.render(text, options);

// 获取渲染的字符和颜色信息
const lines = rendered.array; // 每个元素是 { char, color } 数组
// const lines = rendered.string.split('\n'); // 每个元素是 { char, color } 字符
// const lines = rendered.string;
console.log(`✅ lines: ${lines}`);
const fontSize = 24; // 高清字体大小
const charWidth = fontSize * 0.6;
const charHeight = fontSize * 1.2;

const width = Math.max(...lines.map(line => line.length)) * charWidth;
const height = lines.length * charHeight;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 背景
if (options.background && options.background !== 'transparent') {
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, width, height);
} else {
  ctx.clearRect(0, 0, width, height);
}

// 绘制每个字符（保留颜色）
ctx.font = `${fontSize}px monospace`;
ctx.textBaseline = 'top';

// 6. 绘制
console.log(`✅ lines: ${lines}`);
const outlines = lines.join('\n');
console.log(`✅ outlines: ${outlines}`);

lines.forEach((line, rowIndex) => {
  if (!Array.isArray(line)) 
    line = String(line).split('');
  console.log(`✅ line: ${line}`);
  line.forEach((cell, colIndex) => {
    // console.log(`✅ cell: ---${cell.char}---`);
    if ((cell.char || '').trim() !== '') {
      ctx.fillStyle = cell.color || '#ae2f2f';
      ctx.fillText(cell.char, colIndex * charWidth, rowIndex * charHeight);
    }
  });
});



// lines.forEach(rowIndex => {
//   let x = rowIndex;
//   const y = (rowIndex * fontSize);

//   lines.forEach(seg => {
//     ctx.fillStyle = seg.color;
//     ctx.fillText(seg.text, x, y);
//     x += seg.text.length * charWidth;
//   });
// });

// 保存 PNG
fs.writeFileSync(outputFile, canvas.toBuffer('image/png'));
console.log(`✅ 已生成高清 PNG 文件: ${outputFile}`);
