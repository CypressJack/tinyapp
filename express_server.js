const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
let username;

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set("view engine", "ejs");

app.post('/login', (req, res)=> {
  username = req.body.username;
  console.log(username);
  res.cookie('username', username);
  res.redirect('/urls');
})

app.get("/urls", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"], 
    urls: urlDatabase
   };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/change", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const id = req.params.id;
  if (newLongURL.length !== 0) {
    urlDatabase[id] = newLongURL;
    res.redirect(`/urls/${id}`);
  } else {
    res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.url.slice(3);
  const longURL = urlDatabase[shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
