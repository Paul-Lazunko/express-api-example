const reservedQueryParams = ['page', 'perPage', 'search', 'searchBy', 'sort', 'sortBy'];

const reservedBooleanQueryParams = ['isActive', 'isProcessed', 'isCooked', 'isDelivered', 'isPaid', 'isDeclined'];

const reqQueryFormatterService = {
  format: req => {
    let query = {},
      sorting = {},
      pagination = {};

    let search = req.query.search ? req.query.search : '';
    let searchBy = req.query.searchBy;
    let page = req.query.page || 1;
    let perPage = req.query.perPage || 10;
    let sort = req.query.sort === 'desc' ? -1 : 1;
    let sortBy = req.query.sortBy;
    let from = req.query.from;
    let to = req.query.to;

    if (from) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$gte = from;
    }

    if (to) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lt = to;
    }

    for (let param in req.query) {
      if (!reservedQueryParams.includes(param) && !Array.isArray(req.query[param])) {
        query[param] = req.query[param];
      } else if (reservedBooleanQueryParams.includes(param)) {
        query[param] = !!req.query[param];
      } else if (Array.isArray(req.query[param])) {
        req.query[param].map(o => {
          query[param] = query[param] || {};
          query[param][o.key] = o.value;
        });
      }
    }
    console.log({query});

    if (search && searchBy) {
      let searchFields = searchBy.split(',');
      query.$or = [];
      searchFields.map(field => {
        let searchItemRegExp = new RegExp(search, 'ig');
        if (!!field) {
          let item = {};
          item[field] = {$regex: searchItemRegExp};
          query.$or.push(item);
        }
      });
    }
    pagination.skip = perPage * (page - 1);
    pagination.limit = perPage;

    if (sortBy) {
      sorting = {};
      sorting[sortBy] = sort;
    }

    return {query, sorting, pagination};
  },
};

export {reqQueryFormatterService};
