const generateRandomString = ( length ) => {

  let password = '';

  let base = "0123456789";

  for ( let i = 0; i <= length - 1; i++ ) {

    password += base.charAt( Math.floor( Math.random() * base.length ) );

  }

  return password;

};

export { generateRandomString };
