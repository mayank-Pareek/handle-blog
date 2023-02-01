var path = require("path");
var express = require("express");
var app = express();
var blogService = require("./blog-service");
var categories = require("./data/categories.json");
var posts = require("./data/posts.json");
var port = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.json());
app.get("/", function (req, res) {
  res.redirect(path.join(__dirname, "/about"));
});

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/public/css/main.css", function (req, res) {
  res.set("Content-Type", "text/css");
  res.sendFile(path.join(__dirname, "public", "css", "main.css"));
});

app.get("/blog", (req, res) => {
  blogService
    .getPublishedPosts()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("/posts", (req, res) => {
  blogService
    .getAllPosts()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});

blogService
  .initialize()
  .then(() => {
    app.listen(port, function () {
      console.log(`Express http server listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error starting the server:", error);
  });
