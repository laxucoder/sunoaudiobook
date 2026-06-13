const passport = require("passport");
exports.protect = passport.authenticate("jwt", { session: false });
const { User } = require("../models");

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admins only." });
  }
};

exports.optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) {
      req.user = user;
      return next();
    }

    const tokenFromCookie = req.cookies?.accessToken;

    if (tokenFromCookie) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(
          tokenFromCookie,
          process.env.JWT_ACCESS_SECRET,
        );
        User.findByPk(decoded.id)
          .then((dbUser) => {
            if (dbUser) req.user = dbUser;
            next();
          })
          .catch(() => next());

        return;
      } catch (e) {
        console.log("Token expired or invalid");
      }
    }
    next();
  })(req, res, next);
};
