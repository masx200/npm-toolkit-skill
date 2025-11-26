#!/usr/bin/env node

/**
 * 精确行替换工具
 * 解决 Claude Code 自带文本编辑工具不稳定的问题
 * 用法: node file-editor.js <文件路径> <行号> <"替换文本">
 */

const fs = require('fs');
const path = require('path');

function printUsage() {
  console.log('用法: node file-editor.js <文件路径> <行号> <"替换文本">');
  console.log('示例: node file-editor.js src/app.js 5 "const x = 10;"');
  process.exit(1);
}

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length < 3) {
  printUsage();
}

const filePath = args[0];
const lineNumber = parseInt(args[1], 10);
const replaceText = args[2];

// 验证参数
if (isNaN(lineNumber) || lineNumber < 1) {
  console.error('错误：行号必须是大于0的数字');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`错误：文件不存在: ${filePath}`);
  process.exit(1);
}

try {
  // 1. 创建备份文件
  const backupPath = `${filePath}.bak`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`✅ 已创建备份文件: ${backupPath}`);

  // 2. 读取文件内容并按行分割
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');

  // 3. 验证行号范围
  if (lineNumber > lines.length) {
    console.error(`错误：行号 ${lineNumber} 超出文件总行数 ${lines.length}`);
    process.exit(1);
  }

  // 4. 替换指定行（数组索引从0开始，所以减1）
  const oldLine = lines[lineNumber - 1];
  lines[lineNumber - 1] = replaceText;

  // 5. 写回文件
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

  // 6. 输出结果
  console.log(`✅ 成功替换第 ${lineNumber} 行`);
  console.log(`📌 原内容: ${oldLine}`);
  console.log(`📝 新内容: ${replaceText}`);
  console.log(`💾 文件已保存: ${filePath}`);
  console.log(`🔄 如需恢复，请使用: cp "${backupPath}" "${filePath}"`);

} catch (error) {
  console.error(`❌ 操作失败: ${error.message}`);

  // 尝试恢复备份
  const backupPath = `${filePath}.bak`;
  if (fs.existsSync(backupPath)) {
    console.log(`📌 正在尝试从备份恢复...`);
    fs.copyFileSync(backupPath, filePath);
    console.log(`✅ 文件已恢复为原始状态`);
  }

  process.exit(1);
}
