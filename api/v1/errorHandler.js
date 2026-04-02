const logger = require("../../utils/logger");

const errorHandler = (err, req, res, next) => {
    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            isSuccess: false,
            message: "Duplicate entry. Resource already exists.",
        });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            isSuccess: false,
            message: err.message,
        });
    }

    // Custom errors thrown from services (with statusCode)
    if (err.statusCode) {
        const response = { isSuccess: false, message: err.message };
        if (err.data) response.data = err.data;
        return res.status(err.statusCode).json(response);
    }

    // Fallback: unexpected errors
    logger.error("Unhandled error", {
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
    });
    res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
    });
};

module.exports = { errorHandler };
