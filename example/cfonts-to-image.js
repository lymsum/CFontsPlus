// save as cfonts-to-image.js
// const fs = require('fs');
// const CFonts = require('cfonts');
// const { createCanvas } = require('canvas');

import fs from 'fs';
import cfonts from 'cfonts';
import {createCanvas} from 'canvas';

try {
    // 1. 使用 cfonts 渲染 ASCII 文本（返回字符串）
    const output = cfonts.render('Ultrakill', {
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
    });

    // 2. 将 ASCII 文本按行拆分
    const lines = output.string.split('\n');
    const fontSize = 16; // 每个字符的像素大小
    const width = Math.max(...lines.map(line => line.length)) * fontSize * 0.6;
    const height = lines.length * fontSize;

    // 3. 创建 Canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 背景色（可选）
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // 4. 绘制文字
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = '#0ff'; // 文字颜色
    lines.forEach((line, i) => {
        ctx.fillText(line, 0, (i + 1) * fontSize);
    });

    // 5. 保存为 PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('Ultrakill.png', buffer);

    console.log('✅ 图片已生成: Ultrakill.png');
} catch (err) {
    console.error('❌ 生成图片失败:', err);
}
