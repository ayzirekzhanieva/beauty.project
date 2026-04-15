const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Нет токена доступа" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
}

function ownerOnly(req, res, next) {
  if (req.user.role !== "OWNER") {
    return res.status(403).json({ message: "Доступ только для владельца салона" });
  }
  next();
}

module.exports = {
  authMiddleware,
  ownerOnly,
};