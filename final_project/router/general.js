const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(201)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user." });
});

const getAllBooks = () => Promise.resolve(books);
// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getAllBooks()
    .then((result) => res.status(200).send(JSON.stringify(result)))
    .then(() => console.log("Promise for Task 10 resolved"))
    .catch((err) => res.status(500).send(err));
});

const getBookByISBN = (isbn) => Promise.resolve(books[isbn]);
// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  getBookByISBN(isbn)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.status(200).send(JSON.stringify(result));
    })
    .then(() => console.log("Promise for Task 11 resolved"))
    .catch((err) => res.status(500).send(err));
});

const getBookByAuthor = (author) =>
  Promise.resolve(
    Object.values(books).filter(
      ({ author: bookAuthor }) =>
        bookAuthor.toLowerCase() === author.toLowerCase()
    )
  );
// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  getBookByAuthor(author)
    .then((result) => {
      if (!result.length) {
        return res.status(404).json({
          message: `Books by ${author} not found `,
          booksByAuthor: result,
        });
      }
      res.status(200).send(JSON.stringify({ booksByAuthor: result }));
    })
    .then(() => console.log("Promise for Task 12 resolved"))
    .catch((err) => res.status(500).send(err));
});

const getBookByTitle = (title) =>
  Promise.resolve(
    Object.values(books).filter(
      ({ title: bookTitle }) => bookTitle.toLowerCase() === title.toLowerCase()
    )
  );
// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;
  getBookByTitle(title)
    .then((result) => {
      if (!result.length) {
        return res.status(404).json({
          message: `Books by ${title} not found `,
          booksByTitle: result,
        });
      }
      res.status(200).send(JSON.stringify({ booksByTitle: result }));
    })
    .then(() => console.log("Promise for Task 13 resolved"))
    .catch((err) => res.status(500).send(err));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const foundBook = books[isbn];
  if (!foundBook) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).send(JSON.stringify(foundBook.reviews));
});

module.exports.general = public_users;
