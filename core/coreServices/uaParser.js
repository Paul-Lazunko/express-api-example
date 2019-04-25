import uaParser from 'ua-parser-js';

let userAgent = ua => {
  let parser = new uaParser(ua);
  let data = parser.getResult();
  return [[data.os.name, data.os.version].join(' '), [data.browser.name, data.browser.version].join(' ')].join(' | ');
};

export {userAgent};
