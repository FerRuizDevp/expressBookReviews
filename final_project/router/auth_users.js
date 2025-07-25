const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let users = require('./users');
const regd_users = express.Router();


const isValid = (username) => {
    return users.some(user => user.username === username);
  };
  
const authenticatedUser = (username, password) => {
    const user = users.find((user) => user.username === username && user.password === password);
    return !!user;
  }

// TASK 7
//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    console.log("Login Request:", req.body); // Debug log
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  
    req.session.authorization = {
      accessToken,
      username
    };
  
    return res.status(200).json({ message: "Login successful!", token: accessToken });
  });

  const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, 'access', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
  
      req.username = decoded.username || decoded.data;
      next();
    });
  };

// TASK 8
// Add a book review
regd_users.put("/auth/review/:isbn", authenticate, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.username;

  if (!review) {
    return res.status(400).json({ message: "Review query is required" });
  }

  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews = book.reviews || {};
  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

// TASK 9
// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticate, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.username;
  
    let book = books[isbn];
  
    if (!book || !book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }
  
    delete book.reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;