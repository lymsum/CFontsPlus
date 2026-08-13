// cli-welcome.js
import CFonts from 'cfonts';
import packageJson from "./package.json" with {"type": "json"};
 
function showWelcome() {
    // 主标题
    CFonts.say(packageJson.name.toUpperCase(), {
        font: 'block',
        colors: ['#0088ff', '#00ff88'],
        align: 'center',
        lineHeight: 1
    });
    
    // 版本信息
    CFonts.say(`v${packageJson.version}`, {
        font: 'tiny',
        colors: ['gray'],
        align: 'center'
    });
    
    // 版权信息
    CFonts.say(packageJson.author, {
        font: 'console',
        colors: ['gray'],
        align: 'center'
    });

    // 自适应终端宽度
    CFonts.say('testok靣奇kdklddfkllllllllllllllllllllllllsfdslkflksdflkdslkfsdlkfslkdflksflks超长文本自动折行演示，这是一段用于测试自动折行功能的超长文本内容', {
        maxLength: 40, // 限制最大宽度为40字符
        font: 'simple'
    });

    // 紧凑模式（适合高密度信息展示）
    CFonts.say('new系统状态概览|CPU: 75%|内存: 62%|磁盘: 34%', {
        font: 'tiny',
        spaceless: true, // 无额外空白,比较明显
        space: true,
        lineHeight: 1,   // 紧凑行高0时看不清，行高倍数
        letterSpacing: 1 // 紧凑字符间距0时看不清,像素
    });

}

function generateTable(data) {
  if (data.length === 0) return '';
  
  // 获取表头
  const headers = Object.keys(data[0]);
  // 定义每列宽度（这里设为12，可根据需求调整）
  const colWidth = 12;
  
  // 生成表头行
  const headerLine = `| ${headers.map(h => h.padEnd(colWidth)).join(' | ')} |`;
  // 生成分隔线
  const separatorLine = `| ${headers.map(() => '-'.repeat(colWidth)).join(' | ')} |`;
  // 生成数据行
  const dataLines = data.map(item => 
    `| ${headers.map(h => String(item[h]).padEnd(colWidth)).join(' | ')} |`
  );
  
  // 拼接成完整表格
  return [headerLine, separatorLine, ...dataLines].join('\n');
}

function printAndGetTableLines(data) {
  const tableStr = generateTable(data);
  const lines = tableStr.split('\n').length;
  
  // 打印表格（注意加换行符）
  process.stdout.write(tableStr + '\n');
  
  return lines;
}

export default showWelcome;
