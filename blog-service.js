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

// Define a data models
var Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

var initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject("unable to sync the database");
      });
  });
};

var getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("no posts found");
        }
      })
      .catch((error) => {
        reject("unable to retrieve posts");
      });
  });
};

var getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { published: true } })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("no published posts");
        }
      })
      .catch((error) => {
        reject("unable to retrieve published posts");
      });
  });
};

var getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((categories) => {
        if (categories.length > 0) {
          resolve(categories);
        } else {
          reject("no categories found");
        }
      })
      .catch((error) => {
        reject("unable to retrieve categories");
      });
  });
};

var addPost = (postData) => {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;

    for (let key in postData) {
      if (postData[key] === "") {
        postData[key] = null;
      }
    }

    postData.postDate = new Date();

    Post.create(postData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject("unable to create post");
      });
  });
};

var addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    for (let key in categoryData) {
      if (categoryData[key] === "") {
        categoryData[key] = null;
      }
    }
    Category.create(categoryData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject("unable to create category");
      });
  });
};

var getPostsByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { category: categoryId },
    })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("no results returned");
        }
      })
      .catch((error) => {
        reject("unable to retrieve posts");
      });
  });
};

var getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [Sequelize.Op.gte]: new Date(minDateStr),
        },
      },
    })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("no results returned");
        }
      })
      .catch((error) => {
        reject("unable to retrieve posts");
      });
  });
};

var getPostById = (postId) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { id: postId },
    })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts[0]);
        } else {
          reject("no results returned");
        }
      })
      .catch((error) => {
        reject("unable to retrieve post by id");
      });
  });
};

var getPublishedPostsByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { published: true, category: categoryId } })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("no post found");
        }
      })
      .catch((error) => {
        reject("unable to retrieve posts");
      });
  });
};

var deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then((numDeleted) => {
        if (numDeleted === 1) {
          resolve();
        } else {
          reject("unable to delete category");
        }
      })
      .catch((error) => {
        reject("unable to delete category");
      });
  });
};

var deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id: id,
      },
    })
      .then((numDeleted) => {
        if (numDeleted === 1) {
          resolve();
        } else {
          reject("unable to delete post");
        }
      })
      .catch((error) => {
        reject("unable to delete post");
      });
  });
};

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  addCategory,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
  deleteCategoryById,
  deletePostById,
};
