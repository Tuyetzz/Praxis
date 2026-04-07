const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { 
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES 
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES 
  });

  const days = parseInt(process.env.REFRESH_TOKEN_EXPIRES); 
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  return { accessToken, refreshToken, expiresAt };
};

module.exports = { hashPassword, comparePassword, generateTokens };