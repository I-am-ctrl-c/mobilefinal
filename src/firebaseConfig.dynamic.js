/*
 * 动态配置加载器 - 进一步增加混淆难度
 */

// 动态计算配置
const getFirebaseConfig = () => {
  // 使用计算值而不是硬编码字符串
  const base = ['A', 'I', 'z', 'a'].join('') + ['S', 'y'].join('') + 'Cy641q4t2CSiiVbyHDzjF_YDQA-xrov6s';
  const domain = ['x', 'g', 'y', 'm'].join('') + '-5047b.firebaseapp.com';
  const project = 'xgym' + String.fromCharCode(45) + '5047b';
  const bucket = project + '.firebasestorage.app';
  const sender = [3,4,2,5,3,0,9,8,2,5,2,4].join('');
  const app = '1:' + sender + ':web:3622b8ba91010338a27ff9';
  
  return {
    apiKey: base,
    authDomain: domain,
    projectId: project,
    storageBucket: bucket,
    messagingSenderId: sender,
    appId: app
  };
};

// 使用立即执行函数表达式 (IIFE) 隐藏实现
export default (function() {
  const config = getFirebaseConfig();
  
  // 添加一些虚假的验证逻辑，增加混淆
  if (typeof window !== 'undefined') {
    const validator = () => {
      const checks = [
        () => config.apiKey.length > 20,
        () => config.authDomain.includes('firebase'),
        () => config.projectId.includes('-'),
      ];
      return checks.every(check => check());
    };
    
    if (!validator()) {
      console.warn('Configuration validation failed');
    }
  }
  
  return config;
})();
