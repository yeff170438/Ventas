const bcrypt = require('bcrypt');

bcrypt.hash('123', 10).then(hash => {
  console.log('Hash:', hash);
});
