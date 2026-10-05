require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const { MONGODB_URI, ADMIN_PASSWORD } = process.env;
const adminId = "6ab7b90eb7e24dcbcc5df379";

async function resetPassword() {
    if (!MONGODB_URI || !ADMIN_PASSWORD) {
        throw new Error("Set MONGODB_URI and ADMIN_PASSWORD in the environment before running this script.");
    }
    await mongoose.connect(MONGODB_URI);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.updateOne({ _id: adminId }, { $set: { password: hashedPassword } });
    console.log("Admin password updated successfully.");
    await mongoose.disconnect();
}

resetPassword().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exitCode = 1;
});
