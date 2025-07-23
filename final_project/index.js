const express = require('express');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

let users = [];

const doesExist = (username) => {
  return users.some(user => user.username === username);
};

app.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// ✅ Session-based JWT Auth Middleware:
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// ✅ Login Endpoint:
const jwt = require("jsonwebtoken");

const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username && user.password === password);
  return !!user;
};

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });

    // ✅ req.session must be defined here
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// ✅ Register Endpoint:
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    }
    return res.status(400).json({ message: "Unable to register user." });
});
 
// ✅ Your existing routes:
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// ✅ Server:
const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));