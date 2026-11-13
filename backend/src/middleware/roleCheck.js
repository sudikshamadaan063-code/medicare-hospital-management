/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specified roles (e.g. 'admin', 'doctor', 'patient')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Requires one of [${roles.join(', ')}].`,
      });
    }

    next();
  };
};

module.exports = { authorize };
