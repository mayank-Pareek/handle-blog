var posts = [];
var categories = [];
const { rejects } = require("assert");
const fs = require("fs");
const { resolve } = require("path");

var initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        reject("Unable to posts.json file");
      } else {
        posts = JSON.parse(data);
        fs.readFile("./data/categories.json", "utf8", (err, data) => {
          if (err) {
            reject("Unable to categories.json file");
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
};

var getAllPosts = () => {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject("no results returned");
    } else {
      resolve(posts);
    }
  });
};

var getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    let publishedPosts = posts.filter((post) => post.published === true);
    if (publishedPosts.length === 0) {
      reject("no results returned");
    } else {
      resolve(publishedPosts);
    }
  });
};

var getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("no results returned");
    } else {
      resolve(categories);
    }
  });
};

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
};
