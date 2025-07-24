import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * 构建后处理脚本 - 进一步混淆生成的文件
 * 运行: node scripts/postbuild-obfuscate.js
 */

const DIST_DIR = 'dist';

// 字符串替换映射 - 用随机字符串替换敏感词
const obfuscationMap = {
  'firebase': `fb_${Math.random().toString(36).substr(2, 8)}`,
  'apiKey': `ak_${Math.random().toString(36).substr(2, 8)}`,
  'authDomain': `ad_${Math.random().toString(36).substr(2, 8)}`,
  'projectId': `pid_${Math.random().toString(36).substr(2, 8)}`,
  'storageBucket': `sb_${Math.random().toString(36).substr(2, 8)}`,
  'messagingSenderId': `msi_${Math.random().toString(36).substr(2, 8)}`,
  'appId': `ai_${Math.random().toString(36).substr(2, 8)}`,
};

// 随机字符串注入 - 添加假的配置数据
const decoyStrings = [
  'fake-api-key-12345678901234567890',
  'dummy-project.firebaseapp.com',
  'test-bucket.firebasestorage.app',
  'development-mode-12345',
  'demo-app-id-987654321',
];

async function obfuscateFiles() {
  try {
    console.log('🔒 开始构建后混淆处理...');
    
    // 查找所有 JS 文件
    const jsFiles = await glob(`${DIST_DIR}/**/*.js`);
    
    for (const filePath of jsFiles) {
      console.log(`处理文件: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 替换敏感词汇
      Object.entries(obfuscationMap).forEach(([original, replacement]) => {
        const regex = new RegExp(original, 'g');
        content = content.replace(regex, replacement);
      });
      
      // 在文件开头注入混淆代码
      const obfuscationHeader = `
        /*! Generated ${new Date().toISOString()} */
        void 0;var _0x${Math.random().toString(36).substr(2,6)}="${decoyStrings[Math.floor(Math.random() * decoyStrings.length)]}";
      `.trim();
      
      content = obfuscationHeader + '\n' + content;
      
      // 写回文件
      fs.writeFileSync(filePath, content);
    }
    
    // 处理 CSS 文件中的 sourcemap 引用
    const cssFiles = await glob(`${DIST_DIR}/**/*.css`);
    cssFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      // 移除 sourcemap 注释
      content = content.replace(/\/\*# sourceMappingURL=.*?\*\//g, '');
      fs.writeFileSync(filePath, content);
    });
    
    // 删除 sourcemap 文件
    const mapFiles = await glob(`${DIST_DIR}/**/*.map`);
    mapFiles.forEach(filePath => {
      fs.unlinkSync(filePath);
      console.log(`删除 sourcemap: ${filePath}`);
    });
    
    console.log('✅ 混淆处理完成!');
    console.log(`处理了 ${jsFiles.length} 个 JS 文件`);
    console.log(`删除了 ${mapFiles.length} 个 sourcemap 文件`);
    
  } catch (error) {
    console.error('❌ 混淆处理失败:', error);
    process.exit(1);
  }
}

// 运行混淆处理
obfuscateFiles();
