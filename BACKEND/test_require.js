try {
  const authRoutes = require("./routes/auth");
  console.log("AUTH_ROUTES_LOADED:", typeof authRoutes === 'function' ? "YES" : "NO");
  console.log("STACK:", authRoutes.stack ? authRoutes.stack.map(s => s.route && s.route.path).filter(Boolean) : "NO_STACK");
} catch (e) {
  console.error("LOAD_FAILED:", e.message);
}
