
class AuthController {
  constructor({ loginUser, registerUser, logoutUser, refreshTokenUseCase }) {
    this.loginUser = loginUser;
    this.registerUser = registerUser;
    this.logoutUser = logoutUser;
    this.refreshTokenUseCase = refreshTokenUseCase;
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const metadata = {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await this.loginUser.execute(email, password, metadata);

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
      const result = await this.registerUser.execute(req.body);
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

      const result = await this.refreshTokenUseCase.execute(refreshToken, metadata);
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
      await this.logoutUser.execute(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = AuthController;