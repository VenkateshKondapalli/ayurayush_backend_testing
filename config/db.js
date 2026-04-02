const mongoose = require("mongoose");
const logger = require("../utils/logger");

mongoose
    .connect(process.env.MONGO_DB_URL, {
        dbName: "ayurayush",
    })
    .then(() => {
        logger.info("DB connected");
    })
    .catch((err) => {
        logger.error("DB connection error", { error: err.message });
        process.exit(1);
    });
