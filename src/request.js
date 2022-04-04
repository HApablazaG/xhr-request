const defaultOptions = JSON.stringify({
  method: 'GET',
  uri: '',
  qs: {},
  header: {},
  body: null
});

/**
 * Make an asynchronously request, wrapping the XMLHttpRequest on a Promise.
 *
 * @param {object} options
 * @param {string} options.method - The http request method.
 * @param {string} options.uri - The defined url for the request.
 * @param {object} options.qs - An object that represent the query section for the request.
 * @param {object} options.header - An object with the corresponding headers for the request.
 * @param {*} options.body - The body to be send on the request.
 * @param {boolean} options.json - Shortcut for setting the header 'responseType' to 'json'.
 * @param {Object} options.multipartData - Shortcur for setting body with multi part data, adding the corresponding header.
 * @param {object} options.form - Shortcut for setting a json body, adding the corresponding header. This option will take priority over multipartData.
 * @returns The Promise for the request.
 */
function request (options = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!options.uri) {
        reject(new Error(`The value for the uri option can't be empty.`));
      }

      const opts = {
        ...JSON.parse(defaultOptions),
        ...options
      };

      let queryString = '';
      for (let key in opts.qs) {
        if (Array.isArray(opts.qs[key])) {
          opts.qs[key].forEach(value => {
            queryString += queryString ? '&' : '?';
            queryString += `${key}[]=${encodeURIComponent(value)}`;
          });
        } else {
          queryString += queryString ? '&' : '?';
          queryString += `${key}=${encodeURIComponent(opts.qs[key])}`;
        }
      }

      const req = new XMLHttpRequest();
      req.open(opts.method, String(opts.baseUrl).concat(opts.uri, queryString));

      // Set body for multipar/form-data option.
      if (opts.multipartData && !opts.form) {
        let formData = new FormData();
        for (let key in opts.multipartData) {
          if (Object.hasOwnProperty.call(opts.multipartData, key)) {
            let value = opts.multipartData[key];

            if (Array.isArray(value) && value.length > 0) {
              value.forEach(d => formData.append(key, d));
            } else {
              formData.append(key, value);
            }
          }
        }

        opts.header.enctype = 'multipart/form-data';
        opts.body = formData;
      }

      // Set body and header for the 'form' option.
      if (opts.form) {
        opts.body = JSON.stringify(opts.form);
        opts.header['Content-type'] = 'application/json; charset=utf-8';
      }

      // Set request headers
      for (let key in opts.header) {
        req.setRequestHeader(key, opts.header[key]);
      }

      if (opts.responseType) {
        req.responseType = opts.responseType;
      }

      if (opts.json) {
        req.responseType = 'json';
      }

      // Set all request state change handlers.
      req.onabort = () => {
        let error = new Error('The request to the server has been aborted.');
        error.status = req.status;

        reject(error);
      };
      req.onerror = () => {
        let error = new Error('The request to the server ended unexpectedly.');
        error.status = req.status;

        reject(error);
      };
      req.ontimeout = () => {
        let error = new Error('The request exceeded the maximum waiting time without receiving a response.');
        error.status = req.status;

        reject(error);
      };
      req.onload = () => {
        if (req.status >= 200 && req.status < 300) {
          resolve(req.response);
        } else {
          let error = new Error('The request has ended with an error status response.');
          error.status = req.status;

          if (typeof req.response === 'object') {
            Object.assign(error, req.response);
          }

          reject(error);
        }
      };

      req.send(opts.body);
    } catch (error) {
      reject(error);
    }
  });
}

export default request;
