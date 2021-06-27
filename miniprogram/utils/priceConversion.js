function priceConversion(data) {
  let newData = '';
  if(data < 10000) {
    newData = data;
  } else if(data >= 10000 && data < 100000000) {
    newData = `${(data / 10000).toFixed(2)}万`;
  } else if(data >= 100000000) {
    newData = `${(data / 100000000).toFixed(2)}亿`;
  }
  return newData;
}

module.exports = {
  priceConversion,
}