const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({}, { strict: false }); // 기존 구조를 유지하고 싶다면 strict: false
const User = mongoose.model("User", userSchema, "users");
const profileSchema = new mongoose.Schema({}, { strict: false }); // 기존 구조를 유지하고 싶다면 strict: false
const Profile = mongoose.model("Profile", profileSchema, "profiles");

module.exports = { User, Profile };
