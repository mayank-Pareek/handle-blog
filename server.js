var path = require("path");
const express = require("express");
var app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const clientSessions = require("client-sessions");
const authData = require("./auth-service");
var blogData = require("./blog-service");
require("dotenv").config();
const cors = require("cors");
app.use(cors());
var port = process.env.PORT || 8080;

// set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      // define Handlebars helpers
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.set("view engine", ".hbs");
cloudinary.config({
  cloud_name: "dkhyicipr",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322app",
    duration: 10 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

app.use(function (req, res, next) {
  // make session data available to views
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  // middleware to check if user is logged in
  if (!req.session.user) {
    res.redirect("login");
  } else {
    next();
  }
}

const upload = multer();

app.use(function (req, res, next) {
  // set up global variables for views
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

//Routes
app.get("/", function (req, res) {
  console.log("app.get /");
  res.redirect("/blog");
});

app.get("/about", function (req, res) {
  console.log("app.get about");
  res.render("about");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      if (user) {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory,
        };
        res.redirect("/posts");
      } else {
        throw new Error("Unable to find user");
      }
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err.message,
        userName: req.body.userName,
      });
    });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", (req, res) => {
  const userData = req.body;
  authData
    .registerUser(userData)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.get("/public/css/main.css", function (req, res) {
  res.set("Content-Type", "text/css");
  res.sendFile(path.join(__dirname, "public", "css", "main.css"));
});

app.get("/userHistory", ensureLogin, function (req, res) {
  res.render("userHistory");
});

app.get("/logout", (req, res) => {
  req.session.reset(); // Reset the session
  res.redirect("/"); // Redirect to the home page
});

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];
    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.post(
  "/posts/add",
  upload.single("featureImage"),
  ensureLogin,
  (req, res) => {
    if (req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }

      upload(req).then((uploaded) => {
        processPost(uploaded.url);
      });
    } else {
      processPost("");
    }

    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;
      blogData.addPost(req.body).then(() => {
        res.redirect("/posts");
      });
    }
  }
);

app.post("/categories/add", ensureLogin, (req, res) => {
  for (let key in req.body) {
    if (req.body[key] === "") {
      req.body[key] = null;
    }
  }

  blogData
    .addCategory(req.body)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/categories/add");
    });
});

app.get("/blog/:id", ensureLogin, async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogData.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogData.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/categories", ensureLogin, (req, res) => {
  blogData
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/posts", ensureLogin, (req, res) => {
  const { category, minDate } = req.query;

  if (category) {
    blogData
      .getPostsByCategory(parseInt(category))
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else if (minDate) {
    blogData
      .getPostsByMinDate(minDate)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else {
    blogData
      .getAllPosts()
      .then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((error) => {
        res.render("posts", { message: "no results" });
      });
  }
});

app.get("/post/:value", ensureLogin, (req, res) => {
  const { value } = req.params;

  blogData
    .getPostById(value)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

//Add
app.get("/posts/add", ensureLogin, (req, res) => {
  blogData
    .getCategories()
    .then((data) => {
      res.render("addPost", { categories: data });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});

app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

//Delete
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  const id = req.params.id;
  blogData
    .deleteCategoryById(id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  blogData
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch((error) => {
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});

//Error 404
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

//Server
(async () => {
  try {
    await blogData.initialize();
    await authData.initialize();

    app.listen(port, function () {
      console.log(`Express http server listening on ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
