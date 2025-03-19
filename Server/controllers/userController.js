const userService = require("../services/UserService");
const asyncHandler = require("express-async-handler");

exports.registerUser = asyncHandler(async (req, res) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

exports.authUser = asyncHandler(async (req, res) => {
  try {
    const authenticatedUser = await userService.authUser(req.body);
    res.json(authenticatedUser);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

exports.checkUser = async (req, res) => {
  try {
    const { username } = req.params;
    const exists = await userService.checkUserExists(username);
    res.json({ exists });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addNewUser = async (req, res) => {
  try {
    const user = req.body;
    const newUser = await userService.addUser(user);
    res.json({ user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
