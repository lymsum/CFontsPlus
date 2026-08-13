// 安装依赖：
// npm install cfonts canvas
// 也可以用ansi-to-image直接输出png--lymsum
// npx cfonts "My Banner" --font block --colors yellow,red > banner.txt
// npx cfonts "My Banner" --font block --colors cyan,magenta | ansi-to-image > banner.png

// const fs = require('fs');
// const { createCanvas } = require('canvas');
// const CFonts = require('cfonts');

import fs from 'fs';
import CFonts from 'cfonts';
import {createCanvas} from 'canvas';
// import ansiToJson from 'ansi-to-json';

/**
 * 解析带 24 位 ANSI 颜色码的字符串为 [{text, color}]
 */
function parseAnsi24bit(line) {
  // 正则匹配模式
  const regexPattern = /\x1b\[38;2;(\d+);(\d+);(\d+)m([^\x1b]+)/g;
  // ANSI 颜色码匹配
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  const segments = [];
  let match;
  let lastIndex = 0;

  while ((match = regexPattern.exec(line)) !== null) {
    // console.log(`✅ line: ${line} : ${line.length}`);
    const [full, r, g, b, text] = match;
    // 如果前面有无色文字，先加进去
    if (match.index > lastIndex) {
      const plainText = line.slice(lastIndex, match.index).replace(ansiRegex, '');
      if (plainText) {
        segments.push({ text: plainText, color: '#FFFFFF' });
      }
    }
    segments.push({ text, color: `rgb(${r},${g},${b})` });
    lastIndex = regexPattern.lastIndex;
  }

  // 剩余无色文字
  if (lastIndex < line.length) {
    const plainText = line.slice(lastIndex).replace(ansiRegex, '');
    if (plainText) {
      segments.push({ text: plainText, color: '#FFFFFF' });
    }
  }

  return segments;
}

function saveCFontsColorPNG_HD(text, options, outputPath, extra = {}) {
  const scale = extra.scale || 2;
  const fontSize = extra.fontSize || 20;
  const padding = extra.padding || 20;
  const background = extra.background || 'transparent';

  console.log(`✅ scale: ${scale}`);
  console.log(`✅ fontSize: ${fontSize}`);
  console.log(`✅ padding: ${padding}`);
  console.log(`✅ background: ${background}`);


  // 1. 渲染带 ANSI 颜色码的字符串
  const rendered = CFonts.render(text, options);  // const {rendered} = CFonts.render(text, options);
  // 1.1. 获取终端宽度
  const termWidth = process.stdout.columns || 80;
  const stretchFactor = 1; // 拉伸倍数，lymsum注：会出现多行阴影问题，所以只能设置1
  const shadowLines = 0; // 阴影行数（可调）
  // ANSI 颜色码匹配
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  // 1.2. 按行处理，去掉多余空白并居中
  // const centered = rendered
  // const lines = rendered.string.split('\n')
  const centered = rendered.string.split('\n')

  const oklines = centered
    .map(line => {
        const trimmed = line.replace(/^\s+|\s+$/g, ''); // 去掉左右空格
        const padSize = Math.max(0, Math.floor((termWidth - trimmed.length) / 2));
        return ' '.repeat(padSize) + trimmed;
    });
    // .join('\n');

  const lines = oklines
    // .flatMap(line => Array(stretchFactor).fill(line)) // 每行重复;
    .flatMap((line, idx) => {
    // .flatMap(line => {
        // 如果是阴影行，只保留一次
        if (idx >= centered.length - shadowLines) return [line];
        // 否则重复
        return Array(stretchFactor).fill(line);

        // 以下代码是去掉阴影多次输出的，没有实现效果，所以不要lymsum
        // 分离颜色码和纯文本
        // const parts = line.split(ansiRegex).filter(Boolean);
        // const codes = line.match(ansiRegex) || [];
        // console.log(`✅ parts: ${parts[5]}`);
        // console.log(`✅ codes: ${codes}`);

        // 如果只有一种颜色（主体），直接重复
        // if (codes.length <= 2) {
        //     return Array(stretchFactor).fill(line);
        // }

        // 如果有两种颜色（主体+阴影）
        // 只重复主体部分（假设主体在前）
        // const mainColor = codes[0];
        // const shadowColor = codes[2] || '';
        // const reset = '\x1b[0m';

        // console.log(`✅ mainColor: ${mainColor}`);

        // const mainPart = `${mainColor}${parts[1]}${reset}`;
        // const shadowPart = `${shadowColor}${parts[3] || ''}${reset}`;

        // return Array(stretchFactor).fill(mainPart + shadowPart);
    });
    // .join('\n');
  // 1.3. 获取行数组，可以同前一步同时处理，这里多了一步join
  // const lines = centered.string.split('\n');

  // 2. 解析每一行的颜色段
  const parsedLines = lines.map(parseAnsi24bit);

  console.log(`✅ parsedLines: ${parsedLines.length}`);

  // 3. 计算最大字符数
  const maxChars = Math.max(
    ...parsedLines.map(line => line.reduce((sum, seg) => sum + seg.text.length, 0))
  );

  console.log(`✅ maxChars: ${maxChars}`);

  // 4. 画布大小
  const charWidth = fontSize * 0.6;
  const width = (maxChars * charWidth + padding * 2) * scale;
  const height = (parsedLines.length * fontSize + padding * 2) * scale;

  console.log(`✅ charWidth: ${charWidth}`);
  console.log(`✅ width: ${width}`);
  console.log(`✅ height: ${height}`);

  // 5. 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  if (background === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.font = `${fontSize * scale}px monospace`;
  ctx.textBaseline = 'top';

  // 6. 绘制
  parsedLines.forEach((segments, rowIndex) => {
    let x = padding * scale;
    const y = (padding + rowIndex * fontSize) * scale;

    segments.forEach(seg => {
      ctx.fillStyle = seg.color;
      ctx.fillText(seg.text, x, y);
      x += seg.text.length * charWidth * scale;
    });
  });

  // 7. 保存 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 彩色 PNG 已保存到: ${outputPath}`);
}

function directSave() {
    // 测试
    // cfonts Ultrakill -f block -a left -c red,yellow,cyan -g red,red -b transparent -i
    // cfonts Ultrakill -f block -a left -c red,yellow,cyan -g red,red -b transparent -t
    saveCFontsColorPNG_HD(
    'Ultrakill',
    {
        font: 'block',       // 字体样式: block, slick, chrome, tiny, simpleBlock, simple3d,etc.
        align: 'center',     // 对齐方式center
        colors: ['red', 'yellow', 'cyan'], // 按行着色（不渐变）['cyan', 'magenta'] 好象只有前两色起作用，前景色和影色
        background: 'transparent', //, // blue
        letterSpacing: 1,
        lineHeight: 2,  // 5
        // space: true,
        // spaceless: true,
        gradient: ['red', 'red'],  // -g red,yellow按字符渐变（和 CLI 一样）， 只能两色，跟collors中颜色无关
        transitionGradient: true, // -t 多色过渡梯度，渐变更平滑Use to define that a gradient is a transition between the colors
        // independentGradient: true, //-i Use to define that a gradient is applied independently for each line
        // "raw-mode": true
        maxLength: '0'
    },
    'Ultrakill_color_rgb.png',
    {
        scale: 4,
        fontSize: 5,
        padding: 20,
        background: '#000000'
    }
    );
}

// 主标题,渲染并保存，输出多行时就多次调用
function saveCFontsColorBig(text) {
    saveCFontsColorPNG_HD(text, {
        font: 'block',          // -f字体类型：block(粗大), simple(简洁), tiny(小字体), simpleBlock, slick, chrome, huge, simple3d, etc.
        align: 'center',        // -a对齐方式：left, center, right
        colors: ['cyan', 'magenta'], // -c按行着色（不渐变）['cyan', 'magenta'] 好象只有前两色起作用，前景色和阴影色
        background: 'transparent',   // -b背景色green
        letterSpacing: 2,       // 字间距,默认为2,数值越大间距越大，可设置为4，紧凑设置为1
        lineHeight: 1.5,        // 行高倍数,默认为1,数值越大间距越大，可设置为2
        space: true,            // 保留空格
        // spaceless: true,
        maxLength: '0',         // 单行最大长度（0 表示不限制）,用过8.1
        gradient: ['cyan', 'magenta'], // -g渐变色,要跟colors一样，lymsum注：两色时可跟-i配合使用,三色时须跟-t一起使用，按字符渐变（和 CLI 一样）
        independentGradient: false,   // -i独立行梯度计算，渐变是否独立应用到每行,默认为false, Use to define that a gradient is applied independently for each line
        transitionGradient: false,    // -t多色过渡梯度，渐变是否平滑过渡,默认为false,Use to define that a gradient is a transition between the colors
        // "raw-mode": true
        env: 'node'             // 运行环境：node 或 browser,确保是纯文本模式
    },
    outputFile,
    {
        scale: 10, // 高清倍数
        fontSize: 1, //42，36，26
        padding: 1,
        background: 'transparent' // PNG 背景色，#000000可改 'transparent'
    }
    );
}

// 副标题
function saveCFontsColorSimple(text) {
    saveCFontsColorPNG_HD(text, {
        font: 'simple',               // 简洁字体
        align: 'center',
        colors: ['yellow'],
        letterSpacing: 1,
        lineHeight: 1,
        env: 'node'
    },
    outputFile,
    {
        scale: 1, // 高清倍数
        fontSize: 1, //42，36，26
        padding: 1,
        background: 'transparent' // PNG 背景色，#000000可改 'transparent'
    }
    );
}

// 额外说明
function saveCFontsColorTiny(text) {
    saveCFontsColorPNG_HD(text, {
        font: 'tiny',                  // 小字体
        align: 'center',
        colors: ['green'],
        letterSpacing: 1,
        lineHeight: 1,
        env: 'node'
    },
    outputFile,
    {
        scale: 1, // 高清倍数
        fontSize: 1, //42，36，26
        padding: 1,
        background: 'transparent' // PNG 背景色，#000000可改 'transparent'
    }
    );
}

// ---------------------- CLI 入口 ----------------------

// node saveCFontsColor24bitHD_args.js Ultrakill

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 请输入要渲染的文字，例如: node banner.js "Hello World"');
  process.exit(1);
}

const text = args.join(' '); // 支持多词
const outputFile = 'Ultrakill_color_rgb_args.png';

saveCFontsColorBig(text);
// saveCFontsColorSimple('Version 1.0.0');
// saveCFontsColorTiny('Powered by cfonts');