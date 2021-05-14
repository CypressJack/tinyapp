// Returns an object of user info from the database
const getUserByEmail = (email, database) => {
  let result = {};
  for (const user in database) {
    if (email === database[user].email) {
      result.exists = true;
      result.id = database[user].id;
      result.email = database[user].email;
      result.password = database[user].password;
      return result;
    } else {
      result.exists = false;
    }
  }
  return result;
};
// Returns a random alphanumeric index 5 string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};
// Finds URLs in database created by the searched for user
const urlsForUser = (id, database) => {
  let matches = {};
  for (const url in database) {
    if (database[url].userID === id) {
      matches[url] = database[url];
    }
  }
  return matches;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};
