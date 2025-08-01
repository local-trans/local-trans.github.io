/**
 * 生成指定范围内的随机整数
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @returns {number} 返回生成的随机整数
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机浮点数
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @param {number} decimals - 小数位数
 * @returns {number} 返回生成的随机浮点数
 */
function getRandomFloat(min, max, decimals = 2) {
    const randomNum = Math.random() * (max - min) + min;
    return Number(randomNum.toFixed(decimals));
} 