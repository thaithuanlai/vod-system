const requireAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];

  if (role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Yêu cầu quyền admin để thực hiện thao tác này',
    });
  }

  req.adminUserId = req.headers['x-user-id'];
  next();
};

module.exports = { requireAdmin };
