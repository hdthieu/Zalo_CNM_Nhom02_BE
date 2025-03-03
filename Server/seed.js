require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./models/User");

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Hàm tạo dữ liệu giả
const generateFakeUsers = (count = 10) => {
    let users = [];
    for (let i = 0; i < count; i++) {
        users.push({
            username: faker.internet.userName(),
            password: faker.internet.password(),
            avatar: faker.image.avatar(),
            status: faker.helpers.arrayElement(["online", "offline"]),
            friends: [],
            createdAt: new Date(),
        });
    }
    return users;
};

// Hàm insert dữ liệu
const seedDatabase = async () => {
    try {
        await User.deleteMany(); // Xóa dữ liệu cũ
        const fakeUsers = generateFakeUsers(10); // Tạo 10 user giả
        await User.insertMany(fakeUsers); // Chèn vào DB
        console.log("✅ Fake data inserted successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error inserting data:", error);
        process.exit(1);
    }
};

// Chạy seed data
seedDatabase();
