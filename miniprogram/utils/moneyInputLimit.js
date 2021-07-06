function money(val) {
  let num = val.toString(); //先转换成字符串类型
  if (num.indexOf('.') == 0) { //第一位就是 .
    num = '0' + num
  }
  num = num.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
  num = num.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
  num = num.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  num = num.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
  if (num.indexOf(".") < 0 && num != "") {
    num = parseFloat(num);
  }
  return num
}

module.exports = {
  money
}