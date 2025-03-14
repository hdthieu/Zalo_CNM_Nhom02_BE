require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./Models/User");

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Hàm tạo dữ liệu giả
const generateFakeUsers = (count = 5) => {
    let users = [];
    for (let i = 0; i < count; i++) {
        users.push({
            fullName: faker.person.fullName(),
            password: faker.internet.password(),
            avatar: faker.image.avatar(),
            status: faker.helpers.arrayElement(["online", "offline"]),
            friends: [],
            phoneNumber: faker.phone.number(),
            email: faker.internet.email(),
        });
    }
    return users;
};

// Hàm insert dữ liệu
const seedDatabase = async () => {
    try {
        await User.deleteMany();
        const fakeUsers = generateFakeUsers(5); 
        await User.insertMany(fakeUsers); 
        console.log("Fake data inserted successfully!");
        process.exit();
    } catch (error) {
        console.error("Error inserting data:", error);
        process.exit(1);
    }
};

// Chạy seed data
seedDatabase();
