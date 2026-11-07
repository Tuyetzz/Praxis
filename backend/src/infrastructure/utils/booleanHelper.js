
const toBoolean = (val) => {
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true';
  }
  return !!val;
};

module.exports = {
  toBoolean
};