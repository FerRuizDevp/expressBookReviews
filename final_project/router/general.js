const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require('./users');
const axios = require('axios');
const public_users = express.Router();

const doesExist = (username) => {
    return users.some((user) => user.username === username);
  };  
  
  //TASK 6
  // Register new user route
  public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    console.log("Register request received:", username, password);
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (doesExist(username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
    console.log("Users now:", users);
    return res.status(201).json({ message: "User registered successfully!" });
  });

//TASK 1
// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));  // pretty print all books
  });

//TASK 2
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });

//TASK 3
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
  
    for (let key in books) {
      if (books[key].author === author) {
        matchingBooks.push(books[key]);
      }
    }
  
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found by that author" });
    }
  });

//TASK 4
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];
  
    for (let key in books) {
      if (books[key].title === title) {
        matchingBooks.push(books[key]);
      }
    }
  
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found with that title" });
    }
  });

//TASK 5
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });

module.exports.general = public_users;

// --------------------
// Tasks 10–13
// --------------------

// Task 10: Get all books using Axios
const getAllBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/');
      console.log("📚 All Books:\n", response.data);
    } catch (error) {
      console.error("❌ Error fetching all books:", error.message);
    }
  };
  
  // Task 11: Get book by ISBN
  const getBookByISBN = async (isbn) => {
    try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      console.log(`📘 Book with ISBN ${isbn}:\n`, response.data);
    } catch (error) {
      console.error(`❌ Error fetching book by ISBN ${isbn}:`, error.message);
    }
  };
  
  // Task 12: Get books by author
  const getBooksByAuthor = async (author) => {
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      console.log(`🖋️ Books by ${author}:\n`, response.data);
    } catch (error) {
      console.error(`❌ Error fetching books by author ${author}:`, error.message);
    }
  };
  
  // Task 13: Get books by title
  const getBooksByTitle = async (title) => {
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      console.log(`📗 Books with title "${title}":\n`, response.data);
    } catch (error) {
      console.error(`❌ Error fetching books by title "${title}":`, error.message);
    }
  };
    
  getAllBooks();
  getBookByISBN("1");
  getBooksByAuthor("Chinua Achebe");
  getBooksByTitle("Things Fall Apart");