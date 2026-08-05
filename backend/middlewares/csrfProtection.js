const crypto = require("crypto");

/**
 * Lightweight CSRF Protection (Express 5 compatible)
 *
 * Uses the double-submit cookie pattern:
 *  1. Server generates a random token and sets it as an httpOnly cookie.
 *  2. Client reads the token from the /api/csrf-token endpoint and
 *     sends it back in the X-CSRF-Token header on state-changing requests.
 *  3. Server compares the cookie value with the header value.
 *
 * This replaces the deprecated `csurf` package which is incompatible
 * with Express 5.
 */

const COOKIE_NAME = "_csrf";
const HEADER_NAMES = ["x-csrf-token", "csrf-token"];
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Generate or reuse a CSRF secret stored in a cookie,
 * and expose req.csrfToken() for the /api/csrf-token endpoint.
 */
const csrfProtection = (req, res, next) => {
  // Ensure a CSRF secret cookie exists
  let secret = req.cookies && req.cookies[COOKIE_NAME];
  if (!secret) {
    secret = crypto.randomBytes(32).toString("hex");
    res.cookie(COOKIE_NAME, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });
  }

  // Attach helper so route handlers can read the token
  req.csrfToken = () => secret;

  // Safe methods don't need validation
  if (SAFE_METHODS.includes(req.method.toUpperCase())) {
    return next();
  }

  // For state-changing methods, validate the token
  const headerToken =
    req.headers[HEADER_NAMES[0]] ||
    req.headers[HEADER_NAMES[1]] ||
    (req.body && req.body._csrf) ||
    req.query._csrf;

  if (!headerToken || headerToken !== secret) {
    const err = new Error("Invalid CSRF token");
    err.code = "EBADCSRFTOKEN";
    return next(err);
  }

  next();
};

/**
 * Middleware to skip CSRF for specific routes
 * @param {Array} skipRoutes - Array of route patterns to skip
 */
const skipCSRFForRoutes = (skipRoutes = []) => {
  return (req, res, next) => {
    const shouldSkip = skipRoutes.some((route) => {
      if (typeof route === "string") {
        return req.path.startsWith(route);
      }
      if (route instanceof RegExp) {
        return route.test(req.path);
      }
      return false;
    });

    if (shouldSkip) {
      return next();
    }

    csrfProtection(req, res, next);
  };
};

/**
 * Error handler for CSRF errors
 */
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      error: "Invalid CSRF token",
      message:
        "Your session has expired or the request is invalid. Please refresh the page and try again.",
      code: "CSRF_TOKEN_INVALID",
    });
  }
  next(err);
};

module.exports = {
  csrfProtection,
  skipCSRFForRoutes,
  csrfErrorHandler,
};
