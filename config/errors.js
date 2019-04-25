const errors = {
  defaultError: {
    code: 400,
    message: 'Default Error',
  },
  unauthorized: {
    code: 401,
    message: 'Unauthorized',
  },
  forbidden: {
    code: 403,
    message: 'Access denied',
  },
  notFound: {
    code: 404,
    message: 'Not found',
  },
  duplication: {
    code: 409,
    message: 'Duplication of existing entity was detected',
  },
  fileSizeError: {
    code: 400,
    message: 'Limit of file size exceeded',
  },
  fileFieldError: {
    code: 400,
    message: 'Invalid field name for file input',
  },
};

export {errors};
