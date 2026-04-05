const jwt = require("jsonwebtoken");

// Middleware strictly needs to be a function
module.exports = function (req, res, next) {
  let token = req.header("x-auth-token");
  const authHeader = req.header("Authorization") || req.header("authorization");

  if (!token && authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    if (token) {
      token = token.trim();
      // Remove double quotes if present, common if token is stringified in localStorage
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, "aroundu_secret");
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};