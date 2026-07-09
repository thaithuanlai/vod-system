
function requireAdmin(req, res, next) {
  if (req.headers['x-user-role'] !== 'admin') {
    return res.status(403).json({ success: false, message: 'Yêu cầu quyền admin để thực hiện thao tác này' });
  }
  next();
}

module.exports = requireAdmin;
