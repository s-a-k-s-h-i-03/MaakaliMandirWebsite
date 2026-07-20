import { ApiResponse } from "../utils/ApiResponse.js";
import { login } from "../models/AdminModel.js";
import { comparePassword, signAdminToken } from "../services/authService.js";

export async function adminLogin(req, res) {
  const { username, password } = req.body;
  const user = await login(username);

  if (!user) {
    return res.status(401).json({ message: "Invalid user" });
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = signAdminToken({ id: user.id });
  return ApiResponse.json(res, { token });
}
