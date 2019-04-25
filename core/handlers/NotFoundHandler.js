const NotFoundHandler = ( req, res ) => {
  res.status(404).json({
    status: false,
    error: {
      message: 'Not found',
      property: 'route'
    }
  })
};

export { NotFoundHandler };
