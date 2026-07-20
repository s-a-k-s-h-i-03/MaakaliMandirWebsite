import "./config/env.js";
import { createAdminUser } from "./models/AdminModel.js";
import { hashPassword } from "./services/authService.js";
import { logger } from "./utils/logger.js";

const hashed = await hashPassword("admin123");

await createAdminUser("admin", hashed);

logger.info("Admin created");
process.exit();
