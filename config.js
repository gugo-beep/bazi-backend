// config.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
// 注意：这里我们假设 config.js 在项目根目录，所以 __dirname 就是项目根目录
const __dirname = path.dirname(__filename);

export default {
  database: {
    bazi: path.resolve(__dirname, './data/bazi_data.db'),
    solarTerms: path.resolve(__dirname, './data/SolarTerms.db')
  },
  // 未来可以扩展其他配置
  // server: {
  //   port: 3000
  // }
};