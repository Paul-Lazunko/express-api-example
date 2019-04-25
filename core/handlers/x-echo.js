const xEcho = (req, res, next) => {
  let echo = req.headers['x-echo'];
  if (echo) {
    res.set('x-echo', echo);
  }
  next();
};

export {xEcho};
