#!/usr/bin/env node

/**
 * typeWriter.js
 * @description 打字机效果终端输出
 * ver: 1.0.0
 * author: stone lee
 * email: lymsum@outlook.com
 */

import CFonts from 'cfonts';

/**
 * typeWriter
 * @param {*} render 这是CFonts.render.array可直接输出的数组数据
 * @param {*} delay 
 * @description 打字机效果终端输出
 */
function typeWriter(render, delay = 20) {
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

/**
 * typeWriter
 * @param {*} text 这是CFonts.render.array可直接输出的数组数据
 * @param {*} delay 
 * @description 打字机效果终端输出
 */
function textTypeWriter(text, options, delay) {
  const render = CFonts.render(text, options).array;
  typeWriter(render, delay);
}

export { typeWriter, textTypeWriter };
