const connectToDatabase = require("../config/database"); // Kết nối DB
const { ObjectId } = require("mongodb");

// 🟢 Hàm lấy danh sách users
const login = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectToDatabase();
  const users = db.collection('users');

  const user = await users.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
};

const register = async (req, res) => {
  const { email, password } = req.body;
  const db = await connectToDatabase();
  const users = db.collection('users');

  const existingUser = await users.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'Email đã được đăng ký' });

  const hashedPassword = await bcrypt.hash(password, 10);
  await users.insertOne({ email, password: hashedPassword });

  res.status(201).json({ message: 'Đăng ký thành công' });
}

// 🟢 Xuất các function để dùng trong routes
module.exports = { login, register };