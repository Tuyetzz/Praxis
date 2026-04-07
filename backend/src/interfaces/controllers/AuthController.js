const loginUser = require("../../usecases/user/LoginUser");
const registerUser = require("../../usecases/user/RegisterUser");
const logoutUser = require("../../usecases/user/LogoutUser");
const refreshTokenUseCase = require("../../usecases/user/RefreshTokenUseCase");

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const metadata = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await loginUser.execute(email, password, metadata);
      
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  async register(req, res) {
    try {
      const result = await registerUser.execute(req.body);
      return res.status(201).json({
        success: true,
        message: "Account registered successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const metadata = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await refreshTokenUseCase.execute(refreshToken, metadata);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await logoutUser.execute(refreshToken);
      
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();