#!/usr/bin/env node
/**
 * cfonts-plus.js
 * @description CFonts增强版
 * base example 基础用法示例: 
 *   node cfonts-plus.js "Hello Utralkill lymsum" -f block -c cyan,magenta -l 2 --line-height 1.5 -a center -op lymsum.png
 * all params cli: 
 *   node cfonts-plus.js lymsum utralkill -f block -c red,blue -b transparent -a left -l 2 -z 1 -s true -space -m 21 --gradient red,blue -i -t -r true -e node -fs 20 -pd 20 -sc 1 -sf 0 -op lymsum.png
 * 异常示例：-z 5 行高，太大会超出，用1 -m 10每行最大字符数，超出自动换行 -sc 2放大倍数一般设置为1，sf 0(1,2)分别为单文件、多文件，多行
 *   node cfonts-plus.js lymsum utralkill -f block -c red,blue -b transparent -a left -l 2 -z 5 -s true -space -m 10 --gradient red,blue -i -t -r true -e node -fs 20 -pd 20 -sc 2 -op lymsum.png
 * 
 * ver: 1.0.0
 * author: stone lee
 * email: lymsum@outlook.com
 */

import fs from 'fs';
import CFonts from 'cfonts';
import {createCanvas} from 'canvas';
// import ansiToJson from 'ansi-to-json';
// import minimist from 'minimist';  // minimist库可解决args[++i]问题(参数后不带值时会取到下一个参数名做为其值)，但暂时未使用，程序已做了逻辑处理
import showWelcome from './cli-welcome.js';
// import typeWriter from './typeWriter.js';  //打字机效果输出到终端

// ---------------------- 定义全局变量 ----------------------
let texts = '';
let options = {};
let extra = {};
let outputFile = 'lymsum.png';
let textArray = [];

// 获取终端宽度
const termWidth = process.stdout.columns || 80;  //默认80行

// 拉伸参数
const stretchFactor = 1; // 拉伸倍数，lymsum注：会出现多行阴影问题，所以只能设置1
const shadowLines = 0; // 阴影行数（可调）

// ---------------------- 通用功能模块 ----------------------

class Cli {
  constructor() {
    throw new Error("Cli类不能被实例化");
  }
  /**
   * 命令行参数处理函数
   * 说明：修复了参数不带值时js中args[++i]的坑
   */
  static argsProcessing() {
    // 解析命令行参数（支持短参数和长参数）
    const args = process.argv.slice(2); // 获取命令行参数, minimist(process.argv.slice(2))暂时不要
    console.log(`✅ ---argsProcessing:---args: ${args}`);

    if (args.length === 0) {
        console.error('❌ 请输入要渲染的文字，用法: node cfonts-plus.js "<name>"');
        console.log(`✅ 完整示例: node cfonts-plus.js "Utralk lymsum ver" -f block -c red,blue -b transparent -a left -l 2 -z 5 -s true -space -m 10 --gradient red,blue -i -t -r true -e node -sc 1 -fs 15 -pd 10 -sf 0 -op lymsum.png`);
        process.exit(1);
    }

    const name = args[0];
    console.log(`你好, ${name}! 这是你的 cfonts-plus.js CLI 脚本入口函数。`);
    console.log(`✅ args: ${JSON.stringify(args)}`);

    // 类属性
    let texts = '';
    const options = {};
    const extra = {};
    let outputFile = 'lymsumcli.png';

    // 新处理方法，先获取texts文件，再获取option参数
    // 是否找到第一个startsWith('-')的参数，后面找到"-"开头的参数不加进texts中
    let isFirst = false; 

    // 获取texts
    let optionseq = 0;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('-')) {
        optionseq = i;
        break;
      }
      else {
        // console.log(`✅ ---arg-text:--- ${arg}`);
        textArray.push(arg);
      }
    }

    texts = textArray.join(' '); // 保持空格分格
    console.log(`✅ ---argsProcessing:---: ${optionseq} texts: ${texts} textArray: ${textArray}`);

    // 简单参数解析器, optionseq是第一个参数(即-开头)的序号，旧方法是从0开始，可以找出texts
    for (let i = optionseq; i < args.length; i++) {
      const arg = args[i];
      // console.log(`✅ arg: ${arg}`);

      if (!arg.startsWith('-') && !isFirst) {  //&& !text
        // console.log(`✅ arg: ${arg}`);
        // console.log(`✅ text: ---${text}---`);
        // 第一个非参数项作为文字
        if ( typeof texts === "undefined" || texts === null || texts.trim() === "") 
          texts = arg;
        else
          texts = `${texts} ${arg}`; 

      } else {
        isFirst = true;
        console.log(`✅ arg: ${arg} ${isFirst}`);
        if (arg === '--font' || arg === '-f') {
          options.font = args[++i];
          // console.log(`✅ font: ---${args[++i]}---`);
        } else if (arg === '--colors' || arg === '-c') {
          options.colors = args[++i].split(',');
          // console.log(`✅ colors: ---${args[++i].split(',')}---`);
        } else if (arg === '--background' || arg === '-b') {
          options.background = args[++i] || 'transparent';  // 空就取透明
        } else if (arg === '--align' || arg === '-a') {
          options.align = args[++i];
        } else if (arg === '--letter-spacing' || arg === '-l') {
          options.letterSpacing = parseFloat(args[++i]);  //2
        } else if (arg === '--line-height' || arg === '-z') {
          options.lineHeight = parseFloat(args[++i]);  //5
        // } else if (arg === '--line-height' || arg === '-h') {
        //   options.lineHeight = parseFloat(args[++i]);
        } else if (arg === '--spaceless' || arg === '-s') {
          // if (!args[i+1].startsWith('-'))  // 不带值时处理
          //   options.spaceless = args[++i];
          // else
          //   options.spaceless = 'false';
          options.spaceless = Cli.argsPlus(args, i,'false');
        } else if (arg === '--space' || arg === '-space') {
          // if (!args[i+1].startsWith('-'))  // 不带值时处理
          //   options.space = args[++i];
          // else
          //   options.space = 'false';
          options.space = Cli.argsPlus(args, i,'false');
        } else if (arg === '--max-length' || arg === '-m') {
          options.maxLength = args[++i];  //10
        } else if (arg === '--gradient' || arg === '-g') {
          options.gradient = args[++i].split(',');
        } else if (arg === '--independentGradient' || arg === '-i') { //cfonts --gradient red,blue --independent-gradient 两色
          // if (!args[i+1].startsWith('-'))  // 不带值时处理
          //   options.independentGradient = args[++i];
          // else
          //   options.independentGradient = 'false';
          options.independentGradient = Cli.argsPlus(args, i,'false');
        } else if (arg === '--transitionGradient' || arg === '-t') { //cfonts --gradient red,blue,green --transition-gradient 三色
          // if (!args[i+1].startsWith('-'))  // 不带值时处理
          //   options.transitionGradient = args[++i];
          // else
          //   options.transitionGradient = 'false';
          options.transitionGradient = Cli.argsPlus(args, i,'false');
        } else if (arg === '--raw-mode' || arg === '-r') {
          // if (!args[i+1].startsWith('-'))  // 不带值时处理
          //   options.rawMode = args[++i];
          // else
          //   options.rawMode = 'false';
          options.rawMode = Cli.argsPlus(args, i,'false');
        } else if (arg === '--env' || arg === '-e') {
          options.env = args[++i] || 'node';  //cfonts --env [ "node", "browser" ]
        } else if (arg === '--scale' || arg === '-sc') {
          extra.scale = parseFloat(args[++i]);  //当args[++i]为0时, parseFloat()会变为空,则最后取1，不放大不缩小
        } else if (arg === '--fontSize' || arg === '-fs') {
          extra.fontSize = parseFloat(args[++i]);  //当args[++i]为0时, parseFloat()会变为空,则最后取20
        } else if (arg === '--padding' || arg === '-pd') {
          extra.padding = parseFloat(args[++i]);  //args[++i]可以为0，表示无边界
        } else if (arg === '--singleFile' || arg === '-sf') {
          extra.singleFile = parseInt(args[++i]);  //args[++i]可以为0-单文件,1-多文件,2-多行
          console.log(`---argsProcessing---singleFile1:--- ${extra.singleFile}`);
        } else if (arg === '--output' || arg === '-op') {
          outputFile = args[++i];
        } 
      } 
    }

    // 检查文字
    if (!texts) {
      console.error('❌ 请输入要渲染的文字，例如: node cfonts-png.js "Hello" -f block -o out.png');
      process.exit(1);
    }

    // console.log(`---args---: ${JSON.stringify(extra)}`);

    extra.scale = extra.scale || 1; //空或0时设置为1
    extra.fontSize = extra.fontSize || 20;
    extra.padding = extra.padding || 20;
    extra.singleFile = extra.singleFile || 0;
    outputFile = outputFile || 'lymsumcli.png';
    console.log(`---argsProcessing---singleFile2:--- ${extra.singleFile}`);

    // const background = extra.background || 'transparent';

    console.log(`---argsProcessing---all: ${texts} ${JSON.stringify(options)} ${JSON.stringify(extra)} ${outputFile}`);
    return {texts, options, extra, outputFile};
  }

  static argsPlus(args, j, val) {
    let ops='';
    if (!args[j+1].startsWith('-'))  // 不带值时处理
      ops = args[++j];
    else
      ops = val;

    return ops;
  }
}

class CFontsPlus {
  constructor() {
    throw new Error("CFontsPlus类不能被实例化");
  }

  /**
   * textSaveFile
   * @param {*} text 
   * @param {*} options 
   * @param {*} extra 
   * @param {*} outputFile 
   * @param {*} termWidth 
   * @param {*} stretchFactor 
   * @param {*} shadowLines 
   * @description 
   */
  static textSaveFile(text, options, extra, outputFile, termWidth, stretchFactor, shadowLines) {
    let tmpRender = [];
    const singleFile = extra.singleFile || 0;
    console.log(`textRender-singleFile: ${singleFile}`);
    console.log(`textRender-termWidth: ${termWidth}`);
    console.log(`textRender-stretchFactor: ${stretchFactor}`);
    console.log(`textRender-shadowLines: ${shadowLines}`);
    if (typeof text !== 'string' || text.trim() === '') {
        throw new Error('文本必须是非空字符串');
    }
    
    if (singleFile == 0) {
      console.log(`---singleFile---: ${singleFile} ${text}`);
      CFontsPlus.renderAndSaveFile(text, options,extra,outputFile);
    }
    else if (singleFile == 1) {
      for(const tmptext of text.split(' ')) {
        console.log(`---singleFile---: ${singleFile} ${text} ${tmptext}`);
        // 多文件名自动在原文件名扩展名前加text值
        const lastDotIndex = outputFile.lastIndexOf('.');
        const newOutputFile = outputFile.substring(0,lastDotIndex) + `_${tmptext}` + outputFile.substring(lastDotIndex);
        CFontsPlus.renderAndSaveFile(tmptext, options,extra,newOutputFile);
      }
    }
    else {
      // tmpRender = textHDColorPlain(text, options, termWidth, stretchFactor, shadowLines);
      // 多文件名自动在原文件名扩展名前加text值
      const lastDotIndex = outputFile.lastIndexOf('.');
      const newOutputFile = outputFile.substring(0,lastDotIndex) + `_${text}` + outputFile.substring(lastDotIndex);
      CFontsPlus.renderAndSaveMultibleLinesFile(text, options, extra, outputFile, termWidth, stretchFactor, shadowLines);
    }
  }

  /**
   * renderAndSaveFile
   * @param {*} texts 
   * @param {*} options 
   * @param {*} extra 
   * @param {*} outputFile 
   * @description CFonts.render各种输入效果
   */
  static renderAndSaveFile(texts, options, extra, outputFile) {
    // renderToFile(render, background='transparent', fontSize=20, padding=10, scale=1, outputFile='output.png') 
    console.log(`---testRender-start:--- ${JSON.stringify(options)} ${JSON.stringify(extra)}`);
    // CFonts.render扩展
    const rendered = CFontsPlus.render(texts, options, extra);
    // const lines = rendered.render;
    const width = rendered.width;
    const height = rendered.height;
    // console.log(`---testRender-lines---: ${lines}`);
    // console.log(`---testRender-lines---: ${width} ${height}`);

    // 初始化背景和字体
    const background = options.background;
    const fontSize = extra.fontSize;
    const scaleSize = options.lineHeight * extra.scale;
    const padding = extra.padding;

    // 创建画布(可以多画布)
    const manager = new CanvasManager();
    let canvas = manager.createCanvas(1, width, height, padding); //png or jpg createCanvas(width, height, 'image')
    let ctx = manager.getContext(1,'2d');
    // 初始化Context
    manager.initContext(ctx, background, width, height, fontSize, scaleSize, padding, 'center');
    // 单个字符串数组写入canvas
    manager.renderArrayToCanvas(ctx, rendered.render, rendered.startX, rendered.startY, rendered.charHeight, scaleSize); //与initContext对应，center时: 70, top时: 50
    
    // 通过forEach()逐字符输出 
    // "\u001b[36m██╗  ██╗\u001b[0m\n
    //  \u001b[36m██║  ██║\u001b[0m\n..."
    console.log(`=== string ===${rendered.startY}`);
    // console.log(JSON.stringify(rendered.string)); // 一次性输出彩色 ASCII 字
    // console.log(`${rendered.array.join('\n')}`);
    // console.log(`rendered.lines: ${rendered.lines}`);

    console.log('=== array ===');
    // rendered.array.forEach(line => console.log(line)); // 按行输出

    showWelcome();
    // CFontsPlus.typeWriter(rendered.string, 1);
    // CFontsPlus.typeWriter(lines.join('\n'), 1);

    console.log(`✅ canvas: ${canvas.width} ${canvas.height} ${outputFile}`);
  
    console.log(`canvas: ${canvas} ${ctx}`);
    // const outputFile = 'lymsumtmp.png';

    console.log(`✅ canvas: ${options.lineHeight} ${extra.scale}`);
    if (options.lineHeight>1 || extra.scale>1) {
      console.log(`✅ canvas: ${options.lineHeight} ${extra.scale}`);

      const scaleId = 2;
      const result = manager.scaleCanvas(manager, canvas, scaleId, background, fontSize, scaleSize, padding, 'center');

      manager.saveCanvasToFile(result.canvas, outputFile);
    }
    else {
      manager.saveCanvasToFile(canvas, outputFile);
    }
  }

  /**
   * renderAndSaveMultibleLinesFile
   * @param {*} text 
   * @param {*} options 
   * @param {*} extra 
   * @param {*} outputFile 
   * @param {*} termWidth 
   * @param {*} stretchFactor 
   * @param {*} shadowLines 
   * @description 把多个render数据，输出到多行文本的单个文件
   */
  static renderAndSaveMultibleLinesFile(text, options, extra, outputFile, termWidth, stretchFactor, shadowLines) {
    // text为"lymsum Utralkill"的原始文件
    // 定义font宽和高与字体大小比例
    const FONTWIDTH_RATIO = 0.80;
    const FONTHEIGHT_RATIO = 1.2; //计算结果为5/3，但不知准不准

    let renderLineCountsArray = [];
    let maxCharsArray = [];
    let widthArray = [];
    let heightArray = [];
    let renderArray = [];

    // 参数(宽和高)验证
    const charWidth = extra.fontSize * FONTWIDTH_RATIO; //单字符宽度
    const charHeight = extra.fontSize * FONTHEIGHT_RATIO;  //单字符高度

    // for(const key in render)  {
    for(const tmptext of text.split(' ')) {
      let rendered = CFontsPlus.render(tmptext, options, extra);
      const lines = rendered.render;
      const width = rendered.width;
      const height = rendered.height;
      maxCharsArray.push(width);
      renderArray.push(rendered);

      // 画布大小
      widthArray.push(width + extra.padding * 2);  //左右边距不缩放，缩放为：(maxChars * charWidth + extra.padding * 2) * extra.scale
      heightArray.push(height + extra.padding * 2); //(textRenderLineCounts * charHeight + extra.padding * 2)  * extra.scale
    }

    // 计算最大宽和总高度
    const maxWidth = Math.max(...widthArray);
    const totalHeigh = heightArray.reduce((sum, val) => {
        // 只累加数值类型，忽略非数值
        if (typeof val === "number" && !isNaN(val)) {
            return sum + val;
        }
        return sum;
    }, 0); //此处0表示sum从0开始算

    // 初始化背景和字体
    const background = options.background;
    const fontSize = extra.fontSize;
    const scaleSize = options.lineHeight * extra.scale;
    const padding = extra.padding;
    
    console.log(`=======================lymsum here =================================`);
    // 创建画布(可以多画布)
    const manager = new CanvasManager();
    let canvas = manager.createCanvas(text, maxWidth, totalHeigh, extra.padding); //png or jpg createCanvas(width, height, 'image')
    const ctx = manager.getContext(text,'2d');

    manager.initContext(ctx, background, maxWidth, totalHeigh, fontSize, scaleSize, padding, 'top');

    // 写入多行文本
    let i = 0;
    let cur_y = 0;
    for(const tmprender of renderArray)  {
      console.log(`---cur_y[${i}]--- ${cur_y}`);
      // 单个字符串数组写入canvas
      manager.renderArrayToCanvas(ctx, tmprender.render, tmprender.startX, tmprender.startY + cur_y, tmprender.charHeight, scaleSize); //与initContext对应，center时: 70, top时: 50
      cur_y += heightArray[i];
      i += 1;
    }
    // 7. 保存 PNG
    // 文件名自动在原文件名扩展名前加text值
    const lastDotIndex = outputFile.lastIndexOf('.');
    // 因为replace只替换第一个匹配的字符，这里用RegExp(' ','g')正则表达式替换，其中g表示全局，也可用t表示只替换第一个
    const newOutputFile = outputFile.substring(0,lastDotIndex) + `_${text.replace(RegExp(' ','g'), '-')}` + outputFile.substring(lastDotIndex);

    manager.saveCanvasToFile(canvas, newOutputFile);
    // const buffer = canvas.toBuffer('image/png');
    // fs.writeFileSync(newOutputFile, buffer);
    // console.log(`✅ 彩色 PNG 已保存到: ${newOutputFile}`);
  }

  /**
   * 
   * @param {*} text 文本字符数据，
   * @param {*} options 
   * @param {*} extra 
   * @returns 
   */
  static render(text,options,extra) {
    // 定义font宽和高与字体大小比例,这是在cmd命令窗(或Terminal)属性设置的：Line Height和Cell Width,默认是1.2和0.6
    const FONTWIDTH_RATIO = 0.8; 
    const FONTHEIGHT_RATIO = 1.2; //计算结果为5/3，但不知准不准

    const background = options.background;
    const fontSize = extra.fontSize;
    const scaleSize = options.lineHeight * extra.scale;
    const padding = extra.padding;
    const scale = extra.scale;

    const charWidth = fontSize * FONTWIDTH_RATIO;
    const charHeight = fontSize * FONTHEIGHT_RATIO;

    // const texts = 'lymsum utralkill ver';
    console.log(`render-start: ${JSON.stringify(options)} ${JSON.stringify(extra)}`)

    // const rendered = CFonts.render(texts,{ font: 'block', colors: ['red', 'yellow'], gradient:['red','blue','gray'], transitionGradient: true });
    const rendered = CFonts.render(text, options);
    // ansi颜色转为24bit true color的[{text:'',color:''},...]格式的数组
    const lines = rendered.array.map(CFontsPlus.parseAnsi24bit);
    // const lines = rendered.array;
    // console.log(`lines: ${JSON.stringify(lines)}`);

    // 计算render行数, 值为10，同CFonts.render.string.length值，但比CFonts.render.array.length前后各加2个
    const textRenderLineCounts = rendered.array.length;  // width height:2024 448  
    // const textRenderLineCounts = rendered.string.split('\n').length;  // width height:2024 544
    // 一行render文字最长的字符数，与text文本长度有关
    const maxChars = Math.max(
      // ...为展开运算符，把数组中元素独立数组，如[1,2,3]变为1,2,3
      // ...lines.map(line => line.split('\n').length)  // line.reduce()要求line是一个数组，否则出错
      //text属性可能不存在时用下面方法
      ...lines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))
      // ...lines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? createCanvas.measureText(seg.text) : 0), 0))
      // ...rendered.string.split('\n').map(line => line.length)
    );
    // 画布大小,height要重点注意，决定行是否被截掉,行间空隙也是要控制
    // const width = maxChars * charWidth * scale + padding * 2 + 700;  //左右边距不缩放，缩放为：(maxChars * charWidth + extra.padding * 2) * extra.scale
    // const height = textRenderLineCounts * charHeight * scale + padding * 2; //(textRenderLineCounts * charHeight + extra.padding * 2)  * extra.scale
    // 跟options.max-length(字符数)有关，超过会自动换行，所以这里尺寸要配套,"lymsum utralkill"含空格16个字符，设置小于16时就会换行
    let actualWidth = maxChars * charWidth * scaleSize;
    console.log(`---terminal---:std: ${process.stdout.columns} ${options.maxLength}`);
    // if(process.stdout.columns < options.maxLength) {
    //   actualWidth = charWidth * options.maxLength;
    // }
    const actualHeight = textRenderLineCounts * charHeight * scaleSize;  
    // const width = maxChars * Math.min(options.maxLength, text.length); // + options.letterSpacing * (options.maxLength-1); //+字符间空隙像素值,fontsize;  
    // const height = textRenderLineCounts * charHeight * options.lineHeight * extra.scale;  


    console.log(`---render---: text.length(字符数): ${text.length} lines: ${textRenderLineCounts} maxchars: ${maxChars} width: ${actualWidth}: height: ${actualHeight}`);
    // console.log(`---render-lines---: ${JSON.stringify(lines)}`);

    // 数组方式，调用时要用result[0].render等方式获取
    // const result = [];
    // result.push({'render': lines, 'width': width, 'height': height});
    // 对象方式，调用时用result.render方式获取，更方便，也可以直接return {'render': lines, 'width': width, 'height': height}
    const result = {};
    const key = 'render'; // 动态设置属性名
    result[key] = lines;  //方括号（[]）操作符，可以处理动态的属性名
    // 使用实际的宽和高值
    result.width = actualWidth + extra.padding * 2; //点(.)操作符，适用于大多数场景
    result.height = actualHeight + extra.padding * 2;
    result.startX = extra.padding;
    result.startY = extra.padding; //(textRenderLineCounts*charHeight-charHeight)/2 - extra.padding;
    result.charHeight = charHeight * scaleSize;
    console.log(`---render---: options.lineHeight ${options.lineHeight} fontSize ${fontSize} width ${actualWidth} height ${actualHeight}`);

    return result;
  }

  /**
   * 解析带 24 位 ANSI 颜色码的字符串为 [{text, color}]
   * @param line ANSI 颜色码行数据
   */
  static parseAnsi24bit(line) {
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

  /**
   * 左右空白字符去除
   * @param render 需要去除空白的字符串
   * @param termWidth 终端宽度
   * @return result 返回去除后的字符串，格式保持不变
   */
  static whitespaceTrim(render, termWidth) {
      const whitespaceRegex = /^\s+|\s+$/g; //^\s+: 开头1个或多个空格,|\s+: 结尾1个或多个空格，/g全局查找
      console.log(`whitespaceTrim-render: ${render}`);
      // 这里已换行
      let result = render;
        // .map(line => {
        //     console.log(`whitespaceTrim-line: ${line}`);
        //     const trimmed = line.replace(whitespaceRegex, ''); // 去掉左右空格
        //     // console.log(`whitespaceTrim-trimmed: ${trimmed}`);
        //     const padSize = Math.max(0, Math.floor((termWidth*20*0.6 - trimmed.length) / 2));
        //     return ' '.repeat(padSize) + trimmed;
        // });
        // .join('\n'); // 拼接成多行字符串（从array -> string时用）
      return result;
  }

  /**
   * 拉伸渲染
   * render字符通过重复行方式拉伸渲染，扩大字符高度，有阴影的部分不拉伸功能
   * 描述：拉伸后出现多重阴影问题。
   * @param render 需要拉伸的字符串
   * @param stretchFactor 拉伸因子(倍数)，默认为1
   * @param shadowLines 重复阴影行数(可调)，默认为0
   * @return
   */
  static stretchRender(render, stretchFactor, shadowLines) {
    // let stretchFactor = stretchFactor || 1; // 拉伸因子(倍数)，lymsum注：会出现多行阴影问题，所以只能设置1
    // let shadowLines = shadowLines || 0; // 阴影行数（可调）

    let result = render
      // .flatMap(line => Array(stretchFactor).fill(line)) // 每行重复;
      .flatMap((line, idx) => {
      // .flatMap(line => {
          // 如果是阴影行，只保留一次这里renderlength是10，前后含4个空行
          if (idx >= render.length - shadowLines) return [line];
          // 否则重复
          return Array(stretchFactor).fill(line);
      });
      // .join('\n');

      return result;
  }

  /**
   * typeWriter
   * @param {*} render 这是CFonts.render.array数组数据
   * @param {*} delay 
   * @description 打字机效果终端输出
   */
  static typeWriter(render, delay = 20) {
    let i = 0;
    function printNext() {
      if (i < render.length) {
        process.stdout.write(render[i]);
        i++;
        setTimeout(printNext, delay);
      }
    }
    printNext();
  }
}

/**
 * CanvasManager类
 */
class CanvasManager {
  constructor() {
      this.canvases = new Map();
  }
  
  /**
   * createCanvas
   * @param {*} id 
   * @param {*} width 
   * @param {*} height 
   * @param {*} type 
   * @returns 
   */
  createCanvas(id, width, height, padding, type = 'image') {
    console.log(`----createCanvas------${id} ${width} ${height} ${padding}`);
    const cur_width = width; // + padding * 2;
    const cur_height = height; // + padding * 2;
    const canvas = createCanvas(cur_width, cur_height, type);
    this.canvases.set(id, {
        canvas,
        ctx: canvas.getContext('2d'),
        createdAt: new Date(),
        type
    });
    return canvas;
  }

  /**
   * initContext
   * @param {*} ctx 
   * @param {*} background 初始化Context背景色
   * @param {*} width 
   * @param {*} height 
   * @param {*} fontsize 
   * @param {*} scaleSize 缩放尺寸 取值lineHeight*scale，行高倍数，默认为1，缩放倍数，默认为1
   * @param {*} padding 边距，需要考虑边距的是否要放大 
   * @param {*} align 文本Baseline，默认top
   * @description 初始化canvas Context
   */
  initContext(ctx, background, width, height, fontSize, scaleSize, padding, align='top') {
    // 初始化Context背景色
    const bg = background || 'transparent';
    const cur_width = width; // * scaleSize + padding * 2;
    const cur_height = height; // * scaleSize+ padding * 2;
    const cur_scaledFontSize = fontSize * scaleSize; // 放大后字体大小

    if (bg === 'transparent') {
      ctx.clearRect(0, 0, cur_width, cur_height);
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cur_width, cur_height);
    }

    // font和textBaseline设置
    ctx.font = `bold ${cur_scaledFontSize}pt monospace`; //等宽字体，也可用px sans-serif`;
    ctx.textBaseline = align; // center: y0=70 ，top: y0=50初始值时上下居中
  }

    /**
   * scaleCanvas
   * @param {*} manager 实例化CanvasManager
   * @param {*} baseCanvas 原始放大Canvas
   * @param {*} scaleId 放大Canvas Id
   * @param {*} scaleSize 放大倍数  取值lineHeight(行高倍数) * scale(放大倍数);
   * @param {*} scaledPadding 边距，若原始canvas边距不放大，创建baseCanvas时就不要添加padding,在新Canvas中设定
   * @returns 
   * @description 像素级放大画布，边距不放大
   */
  scaleCanvas(manager, baseCanvas, scaleId, background, fontSize, scaleSize, padding, align='top') {
    console.log(`---scaleCanvas_input scaleId scaleSize:---${scaleId} ${scaleSize} ${padding}`);

    // if (baseCanvas)
    //   console.log(`---scaleCanvas_baseCanvas is not Null:--- ${baseCanvas.width} ${baseCanvas.height}`);
    // 放大画布width,height,不含padding
    const scaledWidth = baseCanvas.width * scaleSize;
    const scaledHeight = baseCanvas.height * scaleSize;

    console.log(`---scaleCanvas:--- ${baseCanvas.width} ${baseCanvas.height} ${scaledWidth} ${scaledHeight}`);

    // 创建放大画布
    let scaledCanvas = manager.createCanvas(scaleId, scaledWidth, scaledHeight, padding, align);
    let scaledCtx = manager.getContext(scaleId, '2d');

    // 最终canvas大小由initContext内部计算，会添加padding值
    this.initContext(scaledCtx, background, baseCanvas.width, baseCanvas.height, fontSize, scaleSize, padding, align);

    // 关闭平滑，保持像素风格
    // scaledCtx.fillText("Smoothing = TRUE", baseCanvas.width * scale + padding * 2, baseCanvas.height * scale + padding * 2);
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(baseCanvas, 0, 0, scaledWidth, scaledHeight);

    const result = {};
    result.canvas = scaledCanvas;
    result.context = scaledCtx;

    return result;
  }

    /**
   * getContext
   * @param {*} id 
   * @returns 
   */
  getContext(id) {
      const item = this.canvases.get(id);
      return item ? item.ctx : null;
  }
  
  /**
   * cleanup
   */
  cleanup() {
      this.canvases.clear();
  }

  /**
   * renderAnsiToCanvas
   * @param {*} ctx 
   * @param {*} ansiString 
   * @param {*} startX 
   * @param {*} startY 
   * @param {*} lineHeight 
   * @description 输入：任何带 ANSI 颜色码的字符串（不仅限于 CFonts）。
   * 输出：Canvas 渲染结果。
   * 可扩展：你可以扩展 ansiColorMap 支持 256 色、RGB 色（\x1b[38;2;r;g;bm 格式）。
   * 跨平台：浏览器端、Node.js + node-canvas 都能用。
   */
  renderAnsiToCanvas(ctx, ansiString, startX, startY, lineHeight) {
    const ansiPattern = ansiRegex();
    const lines = ansiString.split('\n');  //输入是带换行符的字符串，转换为数组，可用forEach操作
    const ansiColorMap = { '31': '#ff5555', '32': '#55ff55', /* ... */ };

    lines.forEach((line, rowIndex) => {
      let x = startX;
      let currentColor = '#ffffff';
      const parts = line.split(ansiPattern);

      parts.forEach(part => {
        if (part === '') return;

        if (/^\x1b\[\d+m$/.test(part)) {
          const code = part.match(/\d+/g)?.[0];
          if (ansiColorMap[code])
            currentColor = ansiColorMap[code];
        } else {
          ctx.fillStyle = currentColor;
          ctx.fillText(part, x, startY + rowIndex * lineHeight);
          x += ctx.measureText(part).width;
        }
      });
    });
  }

  /**
   * renderArrayToCanvas
   * @param {*} ctx 
   * @param {*} textColorArray 
   * @param {*} startX 
   * @param {*} startY 
   * @param {*} charHeight 字符实际高度，fontSize * 1.2合适，测算时5/3 
   * @param {*} scaleSize 行高倍数，取值:lineHeight * scale, CFonts options
   */
  renderArrayToCanvas(ctx, textColorArray, startX=0, startY=0, charHeight, scaleSize) {
    const lines = textColorArray; //输入是[{text:'',color:''},...]形式的数组
    // console.log(`---renderArrayToCanvas-line:---${JSON.stringify(lines)} ${charHeight} ${lineHeight}`);

    lines.forEach((line, rowIndex) => {
      let x = startX;
      let y = startY + rowIndex * charHeight * scaleSize;
      // console.log(`---renderArrayToCanvas-line:---${line.map(a=>a.text)}`);

      line.forEach(part => {
        // console.log(`---renderArrayToCanvas-part:---${part.text}`);
        if (part === '') return;

        ctx.fillStyle = part.color;
        ctx.fillText(part.text, x, y);
        x += ctx.measureText(part.text).width; //精确计算每个字符的css像素值
        // x += part.text.length * charWidth * 0.6;
        // console.log(`---renderArrayToCanvas-line:---${part.text}`);
        let metrics = ctx.measureText(part.text); 
        //所有字在这个字体下的高度
        let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent; 
        // 当前文本字符串在这个字体下用的实际高度
        let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent; 
        
        const fix = ctx.measureText(part.text).actualBoundingBoxAscent + ctx.measureText(part.text).actualBoundingBoxDescent;
        // ctx.fillText(part.text, width / 2, height / 2  + fix/ 2);
        // console.log(`---renderArrayToCanvas-scaleSize:---${fix}`);
      });
    });
  }

  /**
   * saveCanvasToFile
   * @param {*} canvas 
   * @param {*} filename 
   * @param {*} type  必须使用完整的'image/png'
   * @description 保存画布到指定文件，支持png、jpeg、pdf和svg等不同类型,省略png出现错误：
   * TypeError [ERR_INVALID_ARG_TYPE]: 
   * The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined.
   */
  saveCanvasToFile(canvas, filename, type='image/png') {
    // if(canvas.isNaN) return;
    const outputFile = filename || 'lymsumtmp.png';

    // 保存图像
    const buffer = canvas.toBuffer(type); //'image/png'
    // const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(outputFile, buffer);
    
    // const out = fs.createWriteStream(outputFile);
    // const stream = canvas.createPNGStream();
    // stream.pipe(out);
    console.log(`✅ 彩色 PNG 已保存到: ${outputFile}`);
  }

  /**
   * 解析带 24 位 ANSI 颜色码的字符串为 [{text, color}]
   * @param line ANSI 颜色码行数据
   */
  ansiColorToRGB(line) {
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
}


// ---------------------- 业务功能模块 ----------------------

/**
 * 保存自定义缩放图到PNG文件
 * 高清、字符居中、左右空白字符去除、拉伸渲染等功能
 * @param texts
 * @param options
 * @param extra
 * @param outputFile
 * @param termWidth
 * @param stretchFactor
 * @param shadowLines
 */
function saveCFontsHDColorStretchImage(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines) {
  // 1. 渲染带 ANSI 颜色码的字符串CFonts.say()、CFonts.render和CFonts.render.string()
  // CFonts.render中array.length=6,string.split('\n').length=10,前后有四个空白串，包含ansi颜色数据，可以直接输出到控制台
  const rendered = CFonts.render(texts, options);  // rendered对象包含：string和array等
  // console.log(`✅ texts: ${rendered.string}`);
  // 2. 高清、字符居中、左右空白字符去除、拉伸渲染等处理
  // 去掉左右多余空白并居中,这里只取render后的string,不含颜色值之类，并要作换行处理
  const oklines = CFontsPlus.whitespaceTrim(rendered.string.split('\n'), termWidth);
  console.log(`✅ oklines: ${oklines}`);
  // 拉伸
  const lines = CFontsPlus.stretchRender(oklines, stretchFactor, shadowLines);
  console.log(`lines: ${lines.join(' ')}`);
  // 高清解析每一行的颜色段
  const parsedLines = lines.map(CFontsPlus.parseAnsi24bit);   // [{text, color}]
  console.log(`✅ parsedLines: ${JSON.stringify(parsedLines.map(a=>a.join(' ')))}`);

  // 3. 计算最大字符数
  const charWidth = extra.fontSize * 0.6;  //字符宽度，取约定值
  const charHeight = extra.fontSize * 1.2; //字符高度，取约定值
  const maxChars = Math.max(
    ...parsedLines.map(line => line.reduce((sum, seg) => sum + seg.text.length, 0))
  );

  console.log(`✅ fontsize: ${extra.fontSize}`);
  console.log(`✅ scale: ${extra.scale}`);
  console.log(`✅ padding: ${extra.padding}`);
  console.log(`✅ charWidth: ${charWidth}`);
  console.log(`✅ charHeight: ${charHeight}`);
  console.log(`✅ maxChars: ${maxChars}`);

  // 4. 画布大小
  const width = (maxChars * charWidth + extra.padding * 2) * extra.scale;  //两边padding，scale放大系统
  const height = (parsedLines.length * charHeight + extra.padding * 2) * extra.scale;

  console.log(`✅ width: ${width}`);
  console.log(`✅ height: ${height}`);

  // 5. 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  if (options.background === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.font = `bold ${extra.fontSize * extra.scale}pt monospace`;  //extra.fontSize
  ctx.textBaseline = 'top';

  // 6. 绘制
  parsedLines.forEach((segments, rowIndex) => {
    let x = extra.padding * extra.scale;
    const y = (extra.padding + rowIndex * extra.fontSize) * extra.scale; //extra.fontSize
    // console.log(`✅ (x,y): (${x},${y})`);
    segments.forEach(seg => {
      ctx.fillStyle = seg.color;
      ctx.fillText(seg.text, x, y);
      x += seg.text.length * charWidth * extra.scale;
      // console.log(`✅ (x,text): (${x},${seg.text})`);
    });
  });

  // 7. 保存 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputFile, buffer);
  console.log(`✅ 彩色 PNG 已保存到: ${outputFile}`);
}

/**
 * saveCFontsHDColorLine
 * @param {*} texts 
 * @param {*} options 
 * @param {*} extra 
 * @param {*} outputFile 
 * @param {*} termWidth 
 * @param {*} stretchFactor 
 * @param {*} shadowLines 
 * @description 保存自定义缩放图到PNG文件多行输出
 * 高清、字符居中、左右空白字符去除、拉伸渲染等功能
 */
function saveCFontsHDColorLine(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines) {
  // let i = 0;
  // let canvas;
  const tr = text2Render(texts, false, options, termWidth, stretchFactor, shadowLines);
  // console.log(`tr: ------${JSON.stringify(tr.text)}------`);

  // let textline = texts.split(' ');
  // console.log(`✅ textline: ${textline}`);
  // // const manager = new CanvasManager();
  // for(let i=0; i< textline.length; i++) {
  //   console.log(`✅ textline[${i}]: ${textline[i]}`);
  //   // 1. 渲染带 ANSI 颜色码的字符串CFonts.say()、CFonts.render和CFonts.render.string()
  //   // CFonts.render中array.length=6,string.split('\n').length=10,前后有四个空白串，包含ansi颜色数据，可以直接输出到控制台
  //   const rendered = CFonts.render(textline[i], options);  // rendered是一个字典，包含'string'和'array'等,array[0]~array[6]6条
  //   // console.log(`rendered-array: ${JSON.stringify(rendered.array[0])}`);
  //   // console.log(`rendered-lym: ${JSON.stringify(rendered.array[1])}`);
  //   // console.log(`renderedstring: ${JSON.stringify(rendered.string.split('\n')[9])}`);
  //   // 2. 高清、字符居中、左右空白字符去除、拉伸渲染等处理
  //   // 去掉左右多余空白并居中,这里只取render后的string,不含颜色值之类，并要作换行处理
  //   const trimLine = CFontsPlus.whitespaceTrim(rendered.string.split('\n'), termWidth);
  //   // 拉伸
  //   const stretchLines = CFontsPlus.stretchRender(trimLine, stretchFactor, shadowLines);
  //   // console.log(`===========stretchLines: ================${stretchLines.map(line=>line.split('\n').length)}`);
  //   // console.log(`max: ${Math.max(...rendered.lines.map(line => line.length))}`);
  //   console.log(`✅ stretchLines: ${stretchLines.map(line => line.split('\n').reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))}`);

  //   // let aa = rendered.string.split('\n');
  //   // const maxlen = Math.max(...rendered.string.split('\n').map(a => a.length));
  //   // console.log(`maxlen:${rendered.string.split('\n').map(a => a.length)}`);
  //   // 高清解析每一行的颜色段
  //   const parsedLines = stretchLines.map(CFontsPlus.parseAnsi24bit);  //[{text, color}]
  //   console.log(`✅ parsedLines: ${parsedLines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))}`);
  //   console.log(`✅ parsedLines: ${parsedLines.map(line => JSON.stringify(line.color))}`);

  //   // 3. 计算最大字符数
  //   const charWidth = extra.fontSize * 0.6;  //字符宽度，取约定值
  //   const charHeight = extra.fontSize * 1.2; //字符高度，取约定值
  //   const maxChars = Math.max(
  //     // line.reduce()要求line是一个数组，否则出错
  //     ...parsedLines.map(line => line.reduce((sum, seg) => sum + seg.text.length, 0))  // ...为展开运算符，把数组中元素独立数组，如[1,2,3]变为1,2,3
  //     // ...parsedLines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))  //text属性可能不存在时
  //     // ...rendered.string.split('\n').map(line => line.length)
  //   );

  //   console.log(`✅ fontsize: ${extra.fontSize}`);
  //   console.log(`✅ scale: ${extra.scale}`);
  //   console.log(`✅ padding: ${extra.padding}`);
  //   console.log(`✅ charWidth: ${charWidth}`);
  //   console.log(`✅ charHeight: ${charHeight}`);
  //   console.log(`✅ maxChars: ${maxChars}`);

  //   // 4. 画布大小
  //   const width = maxChars * charWidth * extra.scale + extra.padding * 2;  //两边padding，scale放大系统
  //   const height = parsedLines.length * charHeight * extra.scale + extra.padding * 2; //上下padding

  //   console.log(`✅ width: ${width}`);
  //   console.log(`✅ height: ${height}`);

    // console.log(`✅ -----------------parsedLines: ------------${JSON.stringify(parsedLines.length)}`);
    // console.log(`-----------tr: ------${JSON.stringify(tr.Utralkill)}`);

    // saveRenderToFile(tr,options.background, extra.fontSize, extra.padding, extra.scale,textline[i]+'_'+outputFile);
    saveRenderToFile(tr,options.background, extra.fontSize, extra.padding, extra.scale,outputFile);

    // // 5. 创建画布
    // canvas = manager.createCanvas(i, width, height, extra.padding);
    // const ctx = manager.getContext(i, '2d');

    // if (options.background === 'transparent') {
    //   ctx.clearRect(0, 0, width, height);
    // } else {
    //   ctx.fillStyle = options.background;
    //   ctx.fillRect(0, 0, width, height);
    // }

    // ctx.font = `bold ${extra.fontSize * extra.scale}pt monospace`;  //extra.fontSize
    // ctx.textBaseline = 'top';

    // // 6. 绘制
    // parsedLines.forEach((segments, rowIndex) => {
    //   let x = extra.padding * extra.scale;
    //   const y = (extra.padding + rowIndex * extra.fontSize) * extra.scale; //extra.fontSize

    //   segments.forEach(seg => {
    //     ctx.fillStyle = seg.color;
    //     ctx.fillText(seg.text, x, y);
    //     x += seg.text.length * charWidth * extra.scale;
    //   });
    // });
  // }

  // // 7. 保存 PNG
  // const buffer = canvas.toBuffer('image/png');
  // fs.writeFileSync(outputFile, buffer);
  // console.log(`✅ 彩色 PNG 已保存到: ${outputFile}`);
}

/**
 * text2Render
 * @param {*} text 
 * @param {*} singleFile 
 * @param {*} options 
 * @param {*} termWidth 
 * @param {*} stretchFactor 
 * @param {*} shadowLines 
 * @returns 
 * 
 * @description 渲染带 ANSI 颜色码的字符串CFonts.say()、CFonts.render和CFonts.render.string()
 * CFonts.render中array.length=6,string.split('\n').length=10,前后有四个空白串，包含ansi颜色数据，可以直接输出到控制台
 */
function text2Render(text, singleFile=true, options, termWidth, stretchFactor, shadowLines) {
  let render = {};
  // let input = texts.split(' ');
  // console.log(`textRender-lym: ${input}`);
  console.log(`textRender-singleFile: ${singleFile}`);
  if (typeof text !== 'string' || text.trim() === '') {
      throw new Error('文本必须是非空字符串');
  }
  
  if (singleFile) {
    console.log(`textRender-singleFile: ${singleFile} ${text}`);
    render[text] = textHDColorPlain(text, options, termWidth, stretchFactor, shadowLines);
  }
  else {
    for(const tmptext of text.split(' ')) {
      console.log(`textRender-singleFile: ${singleFile} ${tmptext}`);
      render[tmptext] = textHDColorPlain(tmptext, options, termWidth, stretchFactor, shadowLines);
    }
  }

  // console.log(`------render-lym-------: ${JSON.stringify(render.length)}`);
  return render;
}

/**
 * saveRenderToFile
 * @param {*} render 
 * @param {*} background 
 * @param {*} fontSize 
 * @param {*} padding 
 * @param {*} scale 
 * @param {*} outputFile 
 * @description 根据render数据自动保存到多个文件
 */
function saveRenderToFile(render, background='transparent', fontSize=20, padding=10, scale=1, outputFile='output.png') {
  // console.log(`-----------lym-tr: ----${typeof text}--${JSON.stringify(text.lymsum)}`);
  for(const key in render)  {
    let tmpRender = render[key];
    // 多文件名自动在原文件名扩展名前加key值
    const lastDotIndex = outputFile.lastIndexOf('.');
    const newOutputFile = outputFile.substring(0,lastDotIndex) + `_${key}` + outputFile.substring(lastDotIndex);
    renderToFile(tmpRender, background, fontSize, padding, scale, newOutputFile);
  }
}

/**
 * saveTextToMultibleLinesFile
 * @param {*} text 
 * @param {*} options 
 * @param {*} extra 
 * @param {*} outputFile 
 * @param {*} termWidth 
 * @param {*} stretchFactor 
 * @param {*} shadowLines 
 * @description 把多个render数据，输出到多行文本的单个文件
 */
function saveTextToMultibleLinesFile(text, options, extra, outputFile, termWidth, stretchFactor, shadowLines) {
  // text为"lymsum Utralkill"的原始文件
  // 定义font宽和高与字体大小比例
  const FONTWIDTH_RATIO = 0.80;
  const FONTHEIGHT_RATIO = 1.2; //计算结果为5/3，但不知准不准

  let renderLineCountsArray = [];
  let maxCharsArray = [];
  let widthArray = [];
  let heightArray = [];
  let renderArray = [];

  // 参数(宽和高)验证
  const charWidth = extra.fontSize * FONTWIDTH_RATIO; //单字符宽度
  const charHeight = extra.fontSize * FONTHEIGHT_RATIO;  //单字符高度

  // for(const key in render)  {
  for(const tmptext of text.split(' ')) {
    console.log(tmptext);
    const tmpRender = textHDColorPlain(tmptext, options, termWidth, stretchFactor, shadowLines);
    renderArray.push(tmpRender);
    // 一行文字render时实际行数，数据结构查看：console.log(`Json.stringify(${CFonts.render.string})`)
    // 计算画布Height时用到
    const textRenderLineCounts = tmpRender.length;
    renderLineCountsArray.push(textRenderLineCounts); 

    // 一行文字render时最长的字符数，text文本长度有关
    const maxChars = Math.max(
      // ...为展开运算符，把数组中元素独立数组，如[1,2,3]变为1,2,3
      ...tmpRender.map(line => line.reduce((sum, seg) => sum + seg.text.length, 0))  // line.reduce()要求line是一个数组，否则出错
      //text属性可能不存在时用下面方法
      // ...text.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))
      // ...rendered.string.split('\n').map(line => line.length)
    );
    maxCharsArray.push(maxChars);

    // 画布大小
    widthArray.push(maxChars * charWidth * extra.scale + extra.padding * 2);  //左右边距不缩放，缩放为：(maxChars * charWidth + extra.padding * 2) * extra.scale
    heightArray.push(textRenderLineCounts * charHeight * extra.scale + extra.padding * 2); //(textRenderLineCounts * charHeight + extra.padding * 2)  * extra.scale
  }

  // 计算最大宽和总高度
  const maxWidth = Math.max(...widthArray);
  const totalHeigh = heightArray.reduce((sum, val) => {
      // 只累加数值类型，忽略非数值
      if (typeof val === "number" && !isNaN(val)) {
          return sum + val;
      }
      return sum;
  }, 0); //此处0表示sum从0开始算
  
    console.log(`=======================lymsum here =================================`);
  // 创建画布(可以多画布)
  const manager = new CanvasManager();
  let canvas = manager.createCanvas(text, maxWidth, totalHeigh, extra.padding); //png or jpg createCanvas(width, height, 'image')
  const ctx = manager.getContext(text,'2d');

  if (options.background === 'transparent') {
    ctx.clearRect(0, 0, maxWidth, totalHeigh);
  } else {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, maxWidth, totalHeigh);
  }

  ctx.font = `bold ${extra.fontSize * extra.scale}pt monospace`;
  ctx.textBaseline = 'top';

  let cur_y = 0;
  // console.log(`${renderArray.length}`);
  // 6. 绘制
  for(const render of renderArray)  {
    // console.log(`---render---:${JSON.stringify(render)}`);
    // for(const tmptext of render.split(' ')) {
    // const tmpRender = textHDColorPlain(tmptext, options, termWidth, stretchFactor, shadowLines);
    let y = 0;
    render.forEach((segments, rowIndex) => {
      let x = extra.padding; //左右边距不缩放，缩放为：padding * scale
      y = extra.padding + rowIndex * charHeight * extra.scale; //上下边距不缩放，缩放为：(padding + rowIndex * charHeight) * scale
      segments.forEach(seg => {
        ctx.fillStyle = seg.color;
        ctx.fillText(seg.text, x, cur_y+y);
        x += seg.text.length * charWidth * extra.scale;
      });
      // console.log(`---y1---${y} ${cur_y}`);
    });
    cur_y += y;
    // console.log(`---y2---${y} ${cur_y}`);
  }

  // 7. 保存 PNG
  // 文件名自动在原文件名扩展名前加text值
  const lastDotIndex = outputFile.lastIndexOf('.');
  const newOutputFile = outputFile.substring(0,lastDotIndex) + `_${text.replace(' ', '-')}` + outputFile.substring(lastDotIndex);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(newOutputFile, buffer);
  console.log(`✅ 彩色 PNG 已保存到: ${newOutputFile}`);
}

/**
 * text2File
 * @param {*} text 
 * @param {*} options 
 * @param {*} extra 
 * @param {*} outputFile 
 * @param {*} termWidth 
 * @param {*} stretchFactor 
 * @param {*} shadowLines 
 * @description 
 */
function text2File(text, options, extra, outputFile, termWidth, stretchFactor, shadowLines) {
  let tmpRender = [];
  const singleFile = extra.singleFile || 0;
  console.log(`textRender-singleFile: ${singleFile}`);
  console.log(`textRender-termWidth: ${termWidth}`);
  console.log(`textRender-stretchFactor: ${stretchFactor}`);
  console.log(`textRender-shadowLines: ${shadowLines}`);
  if (typeof text !== 'string' || text.trim() === '') {
      throw new Error('文本必须是非空字符串');
  }
  
  if (singleFile == 0) {
    console.log(`singleFile: ${singleFile}`);
    tmpRender = textHDColorPlain(text, options, termWidth, stretchFactor, shadowLines);
    // console.log(`${tmpRender}`);
    renderToFile(tmpRender, options.background, extra.fontSize, extra.padding, extra.scale, outputFile);
  }
  else if (singleFile == 1) {
    for(const tmptext of text.split(' ')) {
      tmpRender = textHDColorPlain(tmptext, options, termWidth, stretchFactor, shadowLines);
      // console.log(`${tmpRender.map(line=>line.join(' '))}`);

      // 多文件名自动在原文件名扩展名前加key值
      const lastDotIndex = outputFile.lastIndexOf('.');
      const newOutputFile = outputFile.substring(0,lastDotIndex) + `_${tmptext}` + outputFile.substring(lastDotIndex);
      renderToFile(tmpRender, options.background, extra.fontSize, extra.padding, extra.scale, newOutputFile);
    }
  }
  else {
    // tmpRender = textHDColorPlain(text, options, termWidth, stretchFactor, shadowLines);
    saveTextToMultibleLinesFile(text, options, extra, outputFile, termWidth, stretchFactor, shadowLines);
  }
}

/**
 * textHDColorPlain
 * @param {*} text 
 * @param {*} options 
 * @param {*} termWidth 
 * @param {*} stretchFactor 
 * @param {*} shadowLines 
 * @returns 
 */
function textHDColorPlain(text, options, termWidth, stretchFactor, shadowLines) {
    // rendered是一个字典，包含'string'和'array'等,array[0]~array[6]6条
    console.log(`textHDColorPlain-text: ${text}`);
    const rendered = CFonts.render(text, options); 
    // console.log(`textPlain-rendered: ${rendered.string}`);
    // 2. 高清、字符居中、左右空白字符去除、拉伸渲染等处理
    // 去掉左右多余空白并居中,这里只取render后的string,不含颜色值之类，并要作换行处理
    const trimLine = CFontsPlus.whitespaceTrim(rendered.string.split('\n'), termWidth); //lymsum换行
    // const trimLine = CFontsPlus.whitespaceTrim(rendered.array, termWidth);
    // console.log(`trimLine: ${trimLine}`);
    // const trimLine = rendered.string.split('\n');  
    // 拉伸
    const stretchLines = CFontsPlus.stretchRender(trimLine, stretchFactor, shadowLines);
    // console.log(`stretchLines: ${stretchLines.map(line=>line.split('\n').length)}`);
    // console.log(`max: ${Math.max(...rendered.lines.map(line => line.length))}`);
    // console.log(`✅ stretchLines: 
    //   ${stretchLines.map(line => line.split('\n').reduce(
    //     (sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))}`
    //   );
    // 高清解析每一行的颜色段
    const parsedLines = stretchLines.map(CFontsPlus.parseAnsi24bit);  //[{text, color}]
    // console.log(`✅ parsedLines: ${parsedLines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))}`);
    // console.log(`✅ parsedLines: ${parsedLines.map(line => JSON.stringify(line.color))}`);
    console.log(`textHDColorPlain-output: ${text}`);

    // console.log(`textHDColorPlain-rendered: ${JSON.stringify(rendered)}`);
    // console.log(`textHDColorPlain-parsedLines: ${JSON.stringify(parsedLines)}`);
    
    return parsedLines;
}

/**
 * renderToFile
 * @param {*} render 
 * @param {*} background 
 * @param {*} fontSize 
 * @param {*} padding 
 * @param {*} scale 
 * @param {*} outputFile 
 */
function renderToFile(render, background='transparent', fontSize=20, padding=10, scale=1, outputFile='output.png') {
  // console.log(`-----------lym-tr: ----${typeof text}--${JSON.stringify(text.lymsum)}`);
  // 参数(宽和高)验证
  // 一行文字render时实际行数，数据结构查看：console.log(`Json.stringify(${CFonts.render.string})`)
  // 计算画布Height时用到
  const textRenderLineCounts = render.length;  // 值为10，同CFonts.render.string.length值，但比CFonts.render.array.length前后各加2个
  console.log(`---textRenderLineCounts: ----${textRenderLineCounts} ${render.map(line=>'===================='+JSON.stringify(line)+'==========================')}`);
  const charWidth = fontSize * 0.6; //单字符宽度
  const charHeight = fontSize * 1.2;  //单字符高度
  // 一行文字render时最长的字符数，text文本长度有关
  const maxChars = Math.max(
    // ...为展开运算符，把数组中元素独立数组，如[1,2,3]变为1,2,3
    ...render.map(line => line.reduce((sum, seg) => sum + seg.text.length, 0))  // line.reduce()要求line是一个数组，否则出错
    //text属性可能不存在时用下面方法
    // ...text.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))
    // ...rendered.string.split('\n').map(line => line.length)
  );
  // 画布大小
  const maxWidth = Math.max(maxChars,termWidth*charWidth);
  const width = maxChars * charWidth * scale + padding * 2;  //左右边距不缩放，缩放为：(maxChars * charWidth + extra.padding * 2) * extra.scale
  // const width = maxWidth * scale + padding * 2;
  const height = textRenderLineCounts * charHeight * scale + padding * 2; //(textRenderLineCounts * charHeight + extra.padding * 2)  * extra.scale

  console.log(`renderToFile:---width---: ${width} ---maxWidth---: ${maxWidth}`); 

  // 创建画布(可以多画布)
  const manager = new CanvasManager();
  let canvas = manager.createCanvas(render, width, height, padding); //png or jpg createCanvas(width, height, 'image')
  const ctx = manager.getContext(render,'2d');

  // 背景
  if (options.background === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = options.background;  //|| '#000000';
    // ctx.fillRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);
  }

  // 文本
  ctx.font = `bold ${fontSize * scale}pt monospace`;  //等宽字体，也可用px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top'; //'middle';

  // let x = padding; //左右边距不缩放，缩放为：padding * scale
  let pos_x = 0;
  // render.forEach((line, i) => {
  //   ctx.fillStyle = line.color;
  //   ctx.fillText(line.text, x, padding + i * fontSize);
  // });
  // 6. 绘制
  render.forEach((segments, rowIndex) => {
    let x = padding; //左右边距不缩放，缩放为：padding * scale
    const y = padding + rowIndex * charHeight * scale; //上下边距不缩放，缩放为：(padding + rowIndex * charHeight) * scale
    // console.log(`---segments---: ${JSON.stringify(segments)}`);
    console.log(`---renderToFile-rowIndex---: ${rowIndex}`);
    // console.log(`---y---: ${y}`);
    // console.log(`---x---: ${x}`);
    segments.map((line,i)=>{
      // console.log(`line${i}: ${line.text}`);

      ctx.fillStyle = line.color;
      ctx.fillText(line.text, x, y);
      x = i * charWidth * scale;
      // x = padding + pos_x;
      // console.log(`---x---: ${x}`);
    });
    // segments.forEach(seg => {
      // ctx.fillStyle = options.color || '#00ffff';
      // ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      // ctx.fillStyle = seg.color;
      // ctx.fillText(seg.text, x, y);
      // x += seg.text.length * charWidth * scale;
      // x += seg.text.length * scale;
      // console.log(`---seg.text.length---: ${seg.text.length}`);
    // });
    // if (x > width) {
    //   let x = padding;
    // }
    
  });

  // 7. 保存 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputFile, buffer);
  console.log(`✅ 彩色 PNG 已保存到: ${outputFile}`);
}

/**
 * 
 * @param {*} texts 
 * @param {*} options 
 * @param {*} extra 
 * @param {*} outputFile 
 * @description 保存默认缩放图到PNG文件
 * 高清、字符居中、左右空白字符去除、拉伸渲染等功能
 */
function saveCFontsHDColorImage(texts, options, extra, outputFile) {
  // 使用全局参数
  saveCFontsHDColorStretchImage(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines);
}

/**
 * testRender
 * @description CFonts.render各种输入效果
 */
function testRender(texts, options, extra, outputFile) {
  console.log(`---testRender-start:--- ${JSON.stringify(options)} ${JSON.stringify(extra)}`);
  const rendered = CFontsPlus.render(texts, options, extra);
  const lines = rendered.render;
  const width = rendered.width;
  const height = rendered.height;
  // console.log(`---testRender-lines---: ${lines}`);
  console.log(`---testRender-lines---: ${width} ${height}`);

  // 初始化背景和字体
  const background = options.background;
  const fontSize = extra.fontSize;
  const scaleSize = options.lineHeight * extra.scale;
  const padding = extra.padding;

  // const fontsize = 20;
  // const padding = 0;
  // const charWidth = fontSize * 0.6;
  // const charHeight = fontSize * 1.2;
  // const scale = 1;
  // const background = 'transparent';

  // // const texts = 'lymsum utralkill ver';
  // console.log(`testRender-options: ${JSON.stringify(options)}`)

  // // const rendered = CFonts.render(texts,{ font: 'block', colors: ['red', 'yellow'], gradient:['red','blue','gray'], transitionGradient: true });
  // const rendered = CFonts.render(texts, options);
  // // ansi颜色转为24bit true color的[{text:'',color:''},...]格式的数组
  // const lines = rendered.array.map(CFontsPlus.parseAnsi24bit);
  // // console.log(`lines: ${JSON.stringify(lines)}`);

  // // 计算render行数
  // const textRenderLineCounts = rendered.string.split('\n').length;  // 值为10，同CFonts.render.string.length值，但比CFonts.render.array.length前后各加2个
  // // 一行render文字最长的字符数，与text文本长度有关
  // const maxChars = Math.max(
  //   // ...为展开运算符，把数组中元素独立数组，如[1,2,3]变为1,2,3
  //   // ...lines.map(line => line.split('\n').length)  // line.reduce()要求line是一个数组，否则出错
  //   //text属性可能不存在时用下面方法
  //   ...lines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? seg.text.length : 0), 0))
  //   // ...lines.map(line => line.reduce((sum, seg) => sum + (typeof seg.text === "string" ? createCanvas.measureText(seg.text) : 0), 0))
  //   // ...rendered.string.split('\n').map(line => line.length)
  // );
  // // 画布大小
  // const width = maxChars * charWidth * scale + padding * 2 + 700;  //左右边距不缩放，缩放为：(maxChars * charWidth + extra.padding * 2) * extra.scale
  // const height = textRenderLineCounts * charHeight * scale + padding * 2; //(textRenderLineCounts * charHeight + extra.padding * 2)  * extra.scale


  // console.log(`width: ${width}: height: ${height} ${textRenderLineCounts}`);
  
  // 创建画布(可以多画布)
  const manager = new CanvasManager();
  let canvas = manager.createCanvas(1, width, height, padding); //png or jpg createCanvas(width, height, 'image')
  let ctx = manager.getContext(1,'2d');
  manager.initContext(ctx, background, width, height, fontSize, scaleSize, padding, 'center');

  // if (background === 'transparent') {
  //   ctx.clearRect(0, 0, width, height);
  // } else {
  //   ctx.fillStyle = background;
  //   ctx.fillRect(0, 0, width, height);
  // }

  // ctx.font = `bold ${fontSize * scale}pt monospace`;
  // ctx.textBaseline = 'top'; // center: y0=70 ，top: y0=50初始值时上下居中

  // const startY = (6*options.lineHeight*fontSize*1.2 - fontSize*1.2)/2;  //options.lineHeight * 70
  // 单个字符串数组写入canvas
  manager.renderArrayToCanvas(ctx, rendered.render, rendered.startX, rendered.startY, rendered.charHeight, options.lineHeight); //与initContext对应，center时: 70, top时: 50
  
  // 通过forEach()逐字符输出 
  // "\u001b[36m██╗  ██╗\u001b[0m\n
  //  \u001b[36m██║  ██║\u001b[0m\n..."
  console.log(`=== string ===${rendered.startY}`);
  // console.log(JSON.stringify(rendered.string)); // 一次性输出彩色 ASCII 字
  // console.log(`${rendered.array.join('\n')}`);
  // console.log(`rendered.lines: ${rendered.lines}`);

  console.log('=== array ===');
  // rendered.array.forEach(line => console.log(line)); // 按行输出

  showWelcome();
  // CFontsPlus.typeWriter(rendered.string, 1);
  // CFontsPlus.typeWriter(lines.join('\n'), 1);
 
  // let cur_y = 0;
  // let y = 0;
  // lines.forEach((segments, rowIndex) => {
  //   let x = padding; //左右边距不缩放，缩放为：padding * scale
  //   y = 50 + rowIndex * charHeight * scale; //上下边距不缩放，缩放为：(padding + rowIndex * charHeight) * scale
  //   console.log(`---segments:---${segments.map(line=>line.text)}`);
  //   segments.forEach(seg => {
  //     ctx.fillStyle = seg.color;
  //     ctx.fillText(seg.text, x, y);
  //     x += seg.text.length * charWidth * scale; //会造成第一行错位
  //     // console.log(`---segments:---${seg.text}`);
  //   });
  //   // console.log(`---y1---${y} ${cur_y}`);
  //   //  cur_y += y;
  // });
 

  // lines.forEach((segments, rowIndex) => {  //line
  //   let x = padding; //左右边距不缩放，缩放为：padding * scale
  //   let y = padding + rowIndex * charHeight * scale; //上下边距不缩放，缩放为：(padding + rowIndex * charHeight) * scale
  //   // if (!(segments.replace('\n',"").trim()==""))
  //     // console.log(`${JSON.stringify(segments)}`);
  //   // segments.split('\n').forEach(seg => { //column
  //     // ctx.fillStyle = seg.color;
  //     // ctx.fillText(seg.text, x, y);
  //     // x += seg.text.length * charWidth * scale;
  //     // if (!(seg=="")) {
  //       // console.log(`${JSON.stringify(seg)}`)
  //     // }
  //   // });

    
  //   ctx.fillStyle = segments.color;
  //   ctx.fillText(segments.text, x, y);
  //   // x += i * charWidth * scale;

  //   // segments.map((line,i)=>{
  //   //   // console.log(`line${i}: ${line.text}`);

  //   //   // ctx.fillStyle = line.color;
  //   //   // ctx.fillText(line.text, x, y);
  //   //   // x += i * charWidth * scale;
  //   //   console.log(`line.color ${line.color}`);
  //   //   console.log(`line${i}: ${line.text}`);
  //   // });
  // });

  console.log(`✅ canvas: ${canvas.width} ${canvas.height} ${outputFile}`);
 
  console.log(`canvas: ${canvas} ${ctx}`);
  // const outputFile = 'lymsumtmp.png';

  console.log(`✅ canvas: ${options.lineHeight} ${extra.scale}`);
  if (options.lineHeight>1 || extra.scale>1) {
    console.log(`✅ canvas: ${options.lineHeight} ${extra.scale}`);

    const scaleId = 2;
    const result = manager.scaleCanvas(manager, canvas, scaleId, background, fontSize, scaleSize, padding, 'center');

    manager.saveCanvasToFile(result.canvas, outputFile);
  }
  else {
    manager.saveCanvasToFile(canvas, outputFile);
  }

  // const buffer = canvas.toBuffer('image/png');
  // const buffer = canvas.toBuffer('image/jpeg');
  // fs.writeFileSync(outputFile, buffer);
  
  // 保存图像
  // const out = fs.createWriteStream(outputFile);
  // const stream = canvas.createPNGStream();
  // stream.pipe(out);
  // console.log(`✅ 彩色 PNG 已保存到: ${outputFile}`);
}

/**
 * main
 * @description 入口函数,放在前面存在类没有初始化，不能执行，所以一般放在最后比较好
 */
function main() {
    try {
        // example: node cfonts-plus.js "Hello" -f block -o out.png'
        // all params cli: 
        // node cfonts-plus.js lymsum utralkill -f block -c red,blue -b transparent -a left -l 2 -z 1 -s true -space -m 21 --gradient red,blue -i -t -r true -e node -fs 20 -pd 20 -sc 1 -sf 0 -op lymsum.png
        // 注意：-z 5 行高，太大会超出，用1 -m 10每行最大字符数，超出自动换行 -sc 2放大倍数一般设置为1，sf 0(1,2)分别为单文件、多文件，多行
        // node cfonts-plus.js lymsum utralkill -f block -c red,blue -b transparent -a left -l 2 -z 5 -s true -space -m 10 --gradient red,blue -i -t -r true -e node -fs 20 -pd 20 -sc 2 -op lymsum.png
        // 解构赋值
        const args = Cli.argsProcessing();
  
        texts = args.texts;
        options = args.options;
        extra = args.extra;
        outputFile = args.outputFile;

        console.log(`✅ lym-text: ${texts}`);
        console.log(`✅ lym-options: ${JSON.stringify(options)}`);
        console.log(`✅ lym-extra: ${JSON.stringify(extra)}`);
        console.log(`✅ lym-outputFile: ${JSON.stringify(outputFile)}`);

        // console.log(`✅ lym-fonts: ${JSON.stringify(options.font)}`);

        // 保存png图片
        // saveCFontsHDColorStretchImage(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines);
        // saveCFontsHDColorImage(texts, options, extra, outputFile);
        // saveCFontsHDColorLine(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines);
        // text2File(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines);

        // 最新方法，可指定-sf参数(SingleFile)0，1，2表示单一文件、多文件、多行文本输出方式
        // CFontsPlus.renderAndSaveFile(texts, options, extra, outputFile);
        CFontsPlus.textSaveFile(texts, options, extra, outputFile, termWidth, stretchFactor, shadowLines);

        // testRender(texts, options, extra, outputFile);

    } catch (err) {
        // err.stack显示完整堆栈（包含文件路径、行号、列号）,err.message显示简短信息
        console.error("运行出错:", err.stack);
        process.exit(1);
    }
}

// ---------------------- CLI 入口 ----------------------

// 入口判断,仅当直接运行该文件时才执行 main()

// 1、ESM 写法
// if (import.meta.url === `file://${process.argv[1]}`) { // 存在windows反斜杠问题
import { fileURLToPath } from 'url';
const currentFile = fileURLToPath(import.meta.url);
if (currentFile === process.argv[1]) { 
    main();
}

export { main };

// console.log(`file://${process.argv[1]}`);
// console.log(import.meta.url);
// console.log(currentFile);

// 2、CommonJS写法,这里只能用第一种
// if (require.main === module) {
//     main();
// }