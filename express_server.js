const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
let loggedIn = false;
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  example: {
    id: "example",
    email: "example@example.com",
    password: "example",
  },
};
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  gy78s9: { longURL: "http://www.yahoo.com", userID: "userRandomID" },
  hjo49s: { longURL: "http://www.msn.ca", userID: "example" },
  lro3cs: { longURL: "http://www.amazon.com", userID: "example" },
  qpe451: { longURL: "http://www.github.com", userID: "example" },
};
const cookieParser = require("cookie-parser");

// Returns an object with user info if the email is found, and a false boolean if it is not found
const emailLookup = (email) => {
  let result = {};
  for (user in users)
    if (email === users[user].email) {
      console.log("exists");
      result.exists = true;
      result.id = users[user].id;
      result.email = users[user].email;
      result.password = users[user].password;
      return result;
    } else {
      result.exists = false;
    }
  return result;
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const urlsForUser = (id) => {
  let matches = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      matches[url] = urlDatabase[url];
    }
  }
  return matches;
};

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/login", (req, res) => {
  const currUser = req.cookies["user_id"];
  const templateVars = {
    user: users[currUser],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfo = emailLookup(email);
  if (!userInfo.exists) {
    res.status(403);
  }
  if (userInfo.exists) {
    if (!bcrypt.compareSync(password, userInfo.password)) {
      res.status(403);
      res.redirect('/login');
    }
    if (bcrypt.compareSync(password, userInfo.password)) {
      res.cookie("user_id", userInfo.id);
      res.redirect("/urls");
      loggedIn = true;
    }
  }
  console.log("loggedIn:", loggedIn);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
  loggedIn = false;
});

app.get("/urls", (req, res) => {
  const currUser = req.cookies["user_id"];
  const usersURLS = urlsForUser(currUser);
  const templateVars = {
    loggedIn: loggedIn,
    user: users[currUser],
    urls: usersURLS,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].userID = req.cookies["user_id"];
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase);
});

app.post("/urls/:id/change", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const id = req.params.id;
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID) {
    if (newLongURL.length !== 0) {
      urlDatabase[id].longURL = newLongURL;
      res.redirect(`/urls/${id}`);
    } else {
      res.redirect(`/urls/${id}`);
    }
  } else {
    res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/new", (req, res) => {
  console.log(loggedIn);
  if (loggedIn) {
    const currUser = req.cookies["user_id"];
    const templateVars = {
      user: users[currUser],
    };
    res.render("urls_new", templateVars);
  }
  if (!loggedIn) {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const currUser = req.cookies["user_id"];
  const templateVars = {
    user: users[currUser],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.url.slice(3);
  const longURL = urlDatabase[shortURL].longURL;
  // console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const currUser = req.cookies["user_id"];
  const templateVars = {
    user: users[currUser],
  };
  console.log(currUser);
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const formData = req.body;
  const email = formData.email;
  const password = formData.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userInfo = emailLookup(email);
  if (!userInfo.exists && email.length !== 0 && password.length !== 0) {
    users[userID] = {};
    users[userID].id = userID;
    users[userID].email = email;
    users[userID].password = hashedPassword;
    res.cookie("user_id", users[userID].id);
    res.redirect("/urls");
    loggedIn = true;
  } else if (userInfo.exists) {
    res.status(400);
    res.send("HTTP ERROR 400: Email already Belongs to a user");
  } else {
    res.status(400);
    res.send("HTTP ERROR 400");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
