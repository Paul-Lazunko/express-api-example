const BadRequestHandler =   (error, req, res, next) => {

  console.log(error);

  if ( error.error && error.error.isJoi ) {
    let property = Object.keys(error.value)[0];
    let path = error.type;
    res
      .status(400)
      .json({
        status: false,
        error: {
          message: error.error.message,
          property,
          path
        }
      });

  } else if( error.code === 11000 ) {

    res
      .status(409)
      .json({
        status: false,
        error: {
          message: 'Duplication Error',
          property: 'entity',
          path: 'database'
        }
      });

  } else {

    res
      .status(error.code ? error.code : 400)
      .json({
        status: false,
        error: {
          message: error.message,
          property: error.property,
          path: error.path,
        }
      });

  }
};

export { BadRequestHandler };
