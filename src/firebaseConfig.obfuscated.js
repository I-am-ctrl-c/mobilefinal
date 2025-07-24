/*
 * Firebase 配置混淆器
 * 简单的字符串变换，增加逆向工程难度
 */

// 简单的字符串编码函数
function encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

// 分割字符串并混淆
function obfuscateConfig(config) {
  const keys = Object.keys(config);
  const values = Object.values(config);
  
  // 将配置分散到多个变量中
  const parts = {};
  
  keys.forEach((key, index) => {
    const value = values[index];
    // 将每个值编码并分割
    const encoded = encode(value);
    const mid = Math.floor(encoded.length / 2);
    
    parts[`_${key}_a`] = encoded.substring(0, mid);
    parts[`_${key}_b`] = encoded.substring(mid);
  });
  
  return parts;
}

// 重构配置
function reconstructConfig(parts) {
  const config = {};
  const keyMap = {
    '_apiKey_a': 'apiKey',
    '_authDomain_a': 'authDomain', 
    '_projectId_a': 'projectId',
    '_storageBucket_a': 'storageBucket',
    '_messagingSenderId_a': 'messagingSenderId',
    '_appId_a': 'appId'
  };
  
  Object.keys(keyMap).forEach(partKey => {
    const originalKey = keyMap[partKey];
    const aKey = `_${originalKey}_a`;
    const bKey = `_${originalKey}_b`;
    
    if (parts[aKey] && parts[bKey]) {
      const combined = parts[aKey] + parts[bKey];
      config[originalKey] = decode(combined);
    }
  });
  
  return config;
}

// 混淆后的配置部分
const configParts = {
  _apiKey_a: "QUl6YVN5Q3k2NDFxNHQyQ1Np",
  _apiKey_b: "aVZieUhEempGX1lEUUEteHJvdjZz",
  _authDomain_a: "eGd5bS01MDQ3Yi5maXJlYmFz",
  _authDomain_b: "ZWFwcC5jb20=",
  _projectId_a: "eGd5bS01MDQ3Yg==",
  _projectId_b: "",
  _storageBucket_a: "eGd5bS01MDQ3Yi5maXJlYmFz",
  _storageBucket_b: "ZXN0b3JhZ2UuYXBw",
  _messagingSenderId_a: "MzQyNTMwOTgy",
  _messagingSenderId_b: "NTI0",
  _appId_a: "MToMzQyNTMwOTgyNTI0OndlYjoz",
  _appId_b: "NjIyYjhiYTkxMDEwMzM4YTI3ZmY5"
};

// 导出重构后的配置
export default reconstructConfig(configParts);

// 清理函数（可选，进一步混淆）
setTimeout(() => {
  // 延迟清理，防止静态分析
  if (typeof window !== 'undefined') {
    delete window.configParts;
    delete window.reconstructConfig;
    delete window.decode;
  }
}, 100);
