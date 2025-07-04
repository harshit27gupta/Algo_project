// artillery-helpers.js
module.exports = {
  setUserId: function (context, events, done) {
    // Generate a random string (8 chars)
    context.vars.userId = Math.random().toString(36).substring(2, 10);
    return done();
  }
}; 