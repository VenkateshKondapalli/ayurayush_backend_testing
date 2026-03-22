const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_DB_URL, {
        dbName: "ayurayush",
    })
    .then(() => {
        console.log("DB connected successfully");
    })
    .catch((err) => {
        console.error("DB connection error:", err.message);
        process.exit(1);
    });
