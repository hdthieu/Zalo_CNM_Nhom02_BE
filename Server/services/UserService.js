const User = require("../Models/User");
const generateToken = require("../config/generateToken");

// dang ky user

exports.registerUser = async ({ fullName, email, password, avatar }) => {
  if (!fullName || !email || !password) {
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email already exists");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const user = await User.create({ fullName, email, password, avatar });
  if (!user) {
    throw new Error("Invalid user data");
  }

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};

// dang nhap user

exports.authUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Please fill all the fields");
  }

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

exports.checkUserExists = async (fullName) => {
  const user = await User.findOne({ fullName });
  return !!user;
};

exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

exports.getAllUsers = async () => {
  return await User.find().select("-password");
};

exports.addUser = async (user) => {
  return await User.create(user);
};

exports.upadateUser = async (userId, user) => {
  const updatedUser = await User.findByIdAndUpdate(userId, user, { new: true });
};

exports.findById = async (userId) => {
  return await User.findById(userId);
};

exports.findByIdAndUpdate = async (userId, user) => {
  return await User.findByIdAndUpdate(userId, user, { new: true });
};

exports.searchFriendRequest = async (userId) => {
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: userId, $options: "i" } },
        { email: { $regex: userId, $options: "i" } },
        { fullname: { $regex: userId, $options: "i" } },
      ],
    }).select("username email phoneNumber friends");
    return { users: users, status: 200, message: "Search successfully" };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};

exports.searchUsers = async (userId, query) => {
  try {
    const currentUser = await User.findById(userId).populate("friends"); // Lấy danh sách bạn bè
    if (!currentUser) {
      return { error: "User not found", status: 404 };
    }

    const friendIds = currentUser.friends.map((friend) =>
      friend._id.toString()
    ); // Danh sách ID bạn bè

    let users = [];

    if (/^\d+$/.test(query)) {
      // Nếu query là số (tìm theo số điện thoại)
      // Tìm trong danh sách bạn bè trước
      users = await User.find({
        _id: { $in: friendIds },
        phoneNumber: { $regex: query, $options: "i" },
      }).select("username phoneNumber avatar");

      // Nếu không có bạn bè nào trùng số điện thoại, tìm người lạ
      if (users.length === 0) {
        users = await User.find({
          phoneNumber: { $regex: query, $options: "i" },
          _id: { $ne: userId }, // Không hiển thị chính mình
        }).select("username phoneNumber avatar");
      }
    } else {
      // Nếu query là chữ (tìm theo tên)
      users = await User.find({
        _id: { $in: friendIds }, // Chỉ tìm trong danh sách bạn bè
        username: { $regex: query, $options: "i" },
      }).select("username phoneNumber avatar");
    }

    return { users, status: 200 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
};
