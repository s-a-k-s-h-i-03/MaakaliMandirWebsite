import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import navratriRoutes from "./routes/navratriRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import adminServiceRoutes from "./routes/adminServiceRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import adminGalleryRoutes from "./routes/adminGalleryRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((_req, res, next) => {
  res.charset = "utf-8";
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/health", async (_req, res, next) => {
  try {
    const result = await db.ping();
    return res.status(200).json({
      success: true,
      message: "OK",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});
app.use("/assets", express.static(path.resolve(__dirname, "../assets")));
app.use("/uploads", express.static(path.resolve(__dirname, "uploads"), {
  setHeaders(res) {
    res.setHeader("Cache-Control", "public, max-age=86400");
  },
}));

app.use(authRoutes);
app.use(navratriRoutes);
app.use(donationRoutes);
app.use(eventRoutes);
app.use(adminRoutes);
app.use(serviceRoutes);
app.use(adminServiceRoutes);
app.use(galleryRoutes);
app.use(adminGalleryRoutes);

notFoundHandler(app);
app.use(errorHandler);

export default app;
