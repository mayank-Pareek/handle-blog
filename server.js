/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: MAYANK KUMAR      Student ID: 145998217        Date: 20 FEB 2023
 *
 *  Cyclic Web App URL: https://grumpy-pear-dove.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/mayank-Pareek/web322-app
 *
 ********************************************************************************/

var path = require("path");
var express = require("express");
var app = express();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

var blogService = require("./blog-service");
var port = process.env.PORT || 8080;
cloudinary.config({
  cloud_name: "dkhyicipr",
  api_key: "549913765539575",
  api_secret: "hgt0yVKd1uqGAWhvVpNe_AzIgXc",
  secure: true,
});
const upload = multer();
app.use(express.static("public"));
app.use(express.json());
app.get("/", function (req, res) {
  res.redirect("/about");
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
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

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    blogService.addPost(req.body).then(() => {
      res.redirect("/posts");
    });
  }
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
  const { category, minDate } = req.query;

  if (category) {
    blogService
      .getPostsByCategory(parseInt(category))
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else if (minDate) {
    blogService
      .getPostsByMinDate(minDate)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else {
    blogService
      .getAllPosts()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.json({ message: error });
      });
  }
});

app.get("/post/:value", (req, res) => {
  const { value } = req.params;

  blogService
    .getPostById(value)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/addPost.html"));
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

app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});
