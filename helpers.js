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

module.exports = {
  getUserByEmail
}