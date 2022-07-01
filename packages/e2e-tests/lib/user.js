const nid = require('nid');

const config = require('./config');

module.exports = {
  generateUser,
};

function generateUser() {
  const user = {};
  user.email = config.getEmail(); // Generate a unique address for each user
  user.password = `${nid(4).toUpperCase()}${nid(6)}${Math.floor(
    Math.random() * 100
  )}!$`;
  return user;
}
