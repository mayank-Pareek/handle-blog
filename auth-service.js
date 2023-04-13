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
    let db = mongoose.createConnection(
      "mongodb+srv://mayankkumar:pareek777@senecaweb.t4mlita.mongodb.net/web322app"
    );
    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
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
          newUser.save(function (err) {
            if (err) {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            } else {
              resolve();
            }
          });
        })
        .catch(function (err) {
          reject("There was an error encrypting the password");
        });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName }, function (err, users) {
      if (err) {
        reject("Unable to find user: " + userData.userName);
      } else if (users.length === 0) {
        reject("Unable to find user: " + userData.userName);
      } else {
        bcrypt
          .compare(userData.password, users[0].password)
          .then((result) => {
            if (result) {
              // Update login history and resolve the promise
              const loginHistory = users[0].loginHistory;
              loginHistory.push({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });
              User.updateOne(
                { userName: users[0].userName },
                { $set: { loginHistory: loginHistory } },
                function (err) {
                  if (err) {
                    reject("There was an error verifying the user: " + err);
                  } else {
                    resolve(users[0]);
                  }
                }
              );
            } else {
              reject("Incorrect Password for user: " + userData.userName);
            }
          })
          .catch((err) => {
            reject("There was an error verifying the user: " + err);
          });
      }
    });
  });
};
