const users = [];

class User {
  constructor(id) {
    this.name = '';
    this.id = id;
    this.lives = 5;
    this.score = 0;
  }
}

function addUser(id) {
  if (users.includes(id)) {
    users.splice(users.indexOf(id), 1);
  }
  const newUser = new User(id);
  users.push(newUser);

}

export {
  User,
  users
};
