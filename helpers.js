// Returns an object with user info if the email is found, and a false boolean if it is not found
const getUserByEmail = (email, database) => {
  let result = {};
  for (user in database)
    if (email === database[user].email) {
      result.exists = true;
      result.id = database[user].id;
      result.email = database[user].email;
      result.password = database[user].password;
      return result;
    } else {
      result.exists = false;
    }
  return result;
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const urlsForUser = (id, database) => {
  let matches = {};
  for (url in database) {
    if (database[url].userID === id) {
      matches[url] = database[url];
    }
  }
  return matches;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
}