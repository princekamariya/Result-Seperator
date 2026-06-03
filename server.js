require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const logger  = require("./utils/logger");

const dropdownRoutes = require("./routes/dropdown.routes");
const submissionRoutes = require("./routes/submission.routes");
const adminRoutes      = require("./routes/admin.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/dropdowns", dropdownRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", async (_req, res) => {
    const checks = { db: false, cloudinary: false };

    try {
        await require("./config/db").query("SELECT 1");
        checks.db = true;
    } catch {}

    try {
        await require("./config/cloudinary").api.ping();
        checks.cloudinary = true;
    } catch {}

    const ok = checks.db && checks.cloudinary;
    res.status(ok ? 200 : 503).json({ success: ok, checks });
});

app.use((_req, res) =>
    res.status(404).json({ success: false, message: "Route not found" }),
);

app.use((err, _req, res, _next) => {
    logger.error("Unhandled error: " + err.message);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

app.listen(PORT, () => {
    logger.info("Server running on port " + PORT);
});
