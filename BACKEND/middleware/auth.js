const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("x-auth-token");
  const authHeader = req.header("Authorization") || req.header("authorization");

  if (!token && authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    if (token) {
      token = token.trim();
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "aroundu_secret"); // ✅ Fixed
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message); // ✅ log pannrom
    return res.status(401).json({ msg: "Token is not valid" });
  }
};