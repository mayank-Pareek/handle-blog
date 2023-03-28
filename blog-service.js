// var posts = [];
// var categories = [];
// const { rejects } = require("assert");
// const fs = require("fs");
// const { resolve } = require("path");
// const moment = require("moment");
const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "ddqmsmio",
  "ddqmsmio",
  "U2JESdVtzZgxSGQ1BZx2CgD7Umh7ea5Q",
  {
    host: "peanut.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var initialize = () => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   fs.readFile("./data/posts.json", "utf8", (err, data) => {
  //     if (err) {
  //       reject("Unable to posts.json file");
  //     } else {
  //       posts = JSON.parse(data);
  //       fs.readFile("./data/categories.json", "utf8", (err, data) => {
  //         if (err) {
  //           reject("Unable to categories.json file");
  //         } else {
  //           categories = JSON.parse(data);
  //           resolve();
  //         }
  //       });
  //     }
  //   });
  // });
};

var getAllPosts = () => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   if (posts.length === 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(posts);
  //   }
  // });
};

var getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   let publishedPosts = posts.filter((post) => post.published === true);
  //   if (publishedPosts.length === 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(publishedPosts);
  //   }
  // });
};

var getCategories = () => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   if (categories.length === 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(categories);
  //   }
  // });
};

var addPost = (postData) => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   if (postData.published === undefined) {
  //     postData.published = false;
  //   } else postData.published = false;
  //   postData.id = parseInt(posts.length + 1);
  //   postData.category = parseInt(postData.category);
  //   postData.postDate = moment().format("YYYY-MM-DD");
  //   posts.push(postData);
  //   resolve(postData);
  // });
};

var getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   let postsByCategory = posts.filter((post) => post.category === category);
  //   if (postsByCategory.length === 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(postsByCategory);
  //   }
  // });
};

var getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   let postsByMinDate = posts.filter(
  //     (post) => new Date(post.postDate) >= new Date(minDateStr)
  //   );
  //   if (postsByMinDate.length === 0) {
  //     reject("no results returned");
  //   } else {
  //     resolve(postsByMinDate);
  //   }
  // });
};

var getPostById = (id) => {
  return new Promise((resolve, reject) => {
    reject();
  });
  // return new Promise((resolve, reject) => {
  //   let post = posts.find((post) => post.id === Number(id));
  //   if (!post) {
  //     reject("no result returned");
  //   } else {
  //     resolve(post);
  //   }
  // });
};

// var getPublishedPostsByCategory = (category) => {
//   return new Promise((resolve, reject) => {
//     let publishedPosts = posts.filter(
//       (post) => post.published === true && post.category == category
//     );
//     if (publishedPosts.length === 0) {
//       reject("no results returned");
//     } else {
//       resolve(publishedPosts);
//     }
//   });
// };
var getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    reject();
  });
};
module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
};
