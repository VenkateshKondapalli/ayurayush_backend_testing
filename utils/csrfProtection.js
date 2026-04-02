const logger = require("./logger");

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const getRequestOrigin = (req) => {
    const origin = req.get("origin");
    if (origin) return origin;

    const referer = req.get("referer");
    if (!referer) return null;

    try {
        return new URL(referer).origin;
    } catch {
        return null;
    }
};

const csrfOriginCheckMiddleware = (req, res, next) => {
    // Skip for safe methods
    if (SAFE_METHODS.includes(req.method)) {
        return next();
    }

    // Skip for same-server requests (smoke tests, seed scripts, internal calls)
    if (!req.headers.origin && !req.headers.referer) {
        // Only allow if request is from localhost
        const ip = req.ip || req.connection.remoteAddress;
        const isLocalhost =
            ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";

        if (isLocalhost) {
            logger.info(
                "CSRF check: allowing localhost request without origin headers",
                {
                    method: req.method,
                    path: req.originalUrl,
                    ip: ip,
                },
            );
            return next();
        }

        logger.warn(
            "CSRF origin check failed: non-localhost request without origin",
            {
                method: req.method,
                path: req.originalUrl,
                ip: ip,
            },
        );

        return res.status(403).json({
            isSuccess: false,
            message: "Request origin not allowed",
        });
    }

    const allowedOrigins = [
        process.env.FRONTEND_URL_LOCAL,
        process.env.FRONTEND_URL_VERCEL,
        process.env.FRONTEND_URL_CUSTOM_DOMAIN,
    ].filter(Boolean);

    const requestOrigin = getRequestOrigin(req);

    const isAllowed = allowedOrigins.some(
        (allowed) => requestOrigin && requestOrigin.startsWith(allowed),
    );

    if (!isAllowed) {
        logger.warn("CSRF origin check failed", {
            method: req.method,
            path: req.originalUrl,
            requestOrigin: requestOrigin || "missing",
        });

        return res.status(403).json({
            isSuccess: false,
            message: "Request origin not allowed",
        });
    }

    return next();
};

module.exports = { csrfOriginCheckMiddleware };
