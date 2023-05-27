var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
const loginHistorySchema = new Schema({
  dateTime: {
    type: Date,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  loginHistory: [loginHistorySchema],
});

let User;
module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    try {
      let db = mongoose.createConnection(process.env.MONGO_URI);
      db.on("error", (err) => {
        console.log("Error connecting to the MongoDB:", err);
        reject(err);
      });
      db.once("open", () => {
        console.log("Connected to MongoDB");
        const User = db.model("users", userSchema);
        resolve();
      });
    } catch (err) {
      console.log("Error creating MongoDB connection:", err);
      reject(err);
    }
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then(function (hash) {
          // Replace user entered password with hashed version
          userData.password = hash;

          // Save the user to the database
          let newUser = new User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
        })
        .catch(function (err) {
          reject("There was an error encrypting the password");
        });
    }
  });
};

module.exports.checkUser = async function (userData) {
  try {
    const users = await User.find({ userName: userData.userName }).exec();
    if (users.length === 0) {
      throw new Error("Unable to find user: " + userData.userName);
    }
    const result = await bcrypt.compare(userData.password, users[0].password);
    if (result) {
      const loginHistory = users[0].loginHistory;
      loginHistory.push({
        dateTime: new Date().toString(),
        userAgent: userData.userAgent,
      });
      await User.updateOne(
        { userName: users[0].userName },
        { $set: { loginHistory: loginHistory } }
      ).exec();
      return users[0];
    } else {
      throw new Error("Incorrect Password for user: " + userData.userName);
    }
  } catch (err) {
    throw new Error("There was an error verifying the user: " + err);
  }
};
