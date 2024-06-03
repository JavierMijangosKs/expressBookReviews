const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//returns boolean
const isValid = (username) => {
  const foundUser = users.find((user) => user.username === username);
  return !!foundUser;
};

//returns boolean
const authenticatedUser = (username, password) => {
  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );
  return !!foundUser;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user.data;
  const { review } = req.query;
  const { isbn } = req.params;
  const foundBook = books[isbn];
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  if (!foundBook) {
    return res.status(404).json({ message: "Book not found" });
  }
  const foundReview = foundBook.reviews[username];
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `Review for the book with ISBN ${isbn} has been ${
      foundReview ? "updated" : "added"
    }`,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.user.data;
  const { isbn } = req.params;
  const foundBook = books[isbn];
  if (!foundBook) {
    return res.status(404).json({ message: "Book not found" });
  }
  const foundReview = foundBook.reviews[username];
  if (foundReview) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: `Review for the book with ISBN ${isbn} by the user ${username} has been deleted`,
    });
  } else {
    res.status(404).json({
      message: `Review for the book with ISBN ${isbn} by the user ${username} not found`,
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
