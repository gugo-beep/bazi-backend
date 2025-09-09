// preserveOrderSerializer.js

// 这是一个简化的序列化器，用于演示如何保留对象键的顺序
const preserveOrderSerializer = {
    /**
     * 判断此序列化器是否适用于给定的值
     * @param {*} val - Jest 传递过来的值
     * @returns {boolean} - 如果是普通对象，则返回true，由本文件处理
     */
    test(val) {
      // 我们让它处理所有非null的、构造函数为Object的普通对象
      return val && !val.nodeType && typeof val === 'object' && val.constructor === Object;
    },
  
    /**
     * 将JavaScript对象序列化为快照字符串
     * @param {*} val - 要序列化的对象
     * @param {Object} config - 配置对象
     * @param {string} indentation - 缩进字符串
     * @param {number} depth - 当前深度
     * @param {Object} refs - 引用
     * @param {Function} printer - Jest内置的打印函数，用于递归序列化子属性
     * @returns {string} - 格式化后的快照字符串
     */
    serialize(val, config, indentation, depth, refs, printer) {
      const keys = Object.keys(val); // Object.keys() 在现代JS中会保留定义顺序
      let result = '{\n';
  
      keys.forEach((key, i) => {
        const newIndentation = indentation + config.indent;
        const keyString = `${newIndentation}${key}: `;
        
        // 使用 Jest 的 printer 函数来递归处理值，这样可以正确处理嵌套对象、数组、函数等
        const valString = printer(val[key], config, newIndentation, depth + 1, refs);
        
        result += `${keyString}${valString}`;
        
        // 如果不是最后一个键，则添加逗号和换行符
        if (i < keys.length - 1) {
          result += ',\n';
        } else {
          result += '\n';
        }
      });
  
      result += `${indentation}}`;
      return result;
    },
  };

export default preserveOrderSerializer;