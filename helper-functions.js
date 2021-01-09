import { PORT } from "./server.js";
export const urlPrefix = "http://localhost";

/**
 * Makes a random hex string of size @param length
 * @param {Number} length desired string length
 *
 * @return {String} random hex string of size `length`
 */
export const makeId = (length) => {
  var result = "";
  var characters = "abcdef0123456789";
  var charactersLength = characters.length;
  if (!(length <= 3)) {
    for (var i = 0; i < length - 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + parseInt(Date.now() / 1000000000).toString(16);
  }
  return parseInt(Date.now() / 1000000000).toString(16);
};

/**
 * generates a response object for requests resulting in a code 400
 */
export const generate400Response = () => {
  return {
    code: "VALIDIATION_FAIL",
    description: "Bad Request",
    message: "Improper paramerter(s)",
    status: 400,
    time_stamp: new Date(Date.now()).toISOString(),
  };
};

/**
 * Sends a custom error object for 500 codes
 * @param {Object} res response
 * @param {Number} status status
 * @param {String} message message
 */
export const sendError = (res, status, message) => (error) => {
  return res.status(status || error.status).json({
    code: "SERVER_ERROR",
    status: status || error.status,
    type: "error",
    message: message || error.message,
    error,
    time_stamp: new Date(Date.now()).toISOString(),
  });
};

/**
 * Formats HATEOAS compliant links for responses.
 * @param {Object} item Item to condition links from
 * @param {String} caller route that was called without '/' prefix.
 * @param {String} type api object type
 * @param {Array} params optional single item response link objects conditioned by string params set here.
 *
 * @return {Object} object representing HATEOAS compliant links
 */
export const hateoasActions = (item, caller, type, params = []) => {
  if (item instanceof Array) {
    return {
      self: {
        href: `${urlPrefix}:${PORT}/${caller}`,
        decription: "caller url",
        method: "GET",
      },
      items: item.map((o) => ({
        href: `${urlPrefix}:${PORT}/api/${type}/${o._id.split("_").pop()}`,
        decription: `individually retreive resource with id: ${o._id}`,
        method: "GET",
      })),
    };
  } else if (item instanceof Object) {
    return {
      self: {
        href: `${urlPrefix}:${PORT}/${caller}`,
        description: "retrieve this resource individually",
        method: "GET",
      },
      ...(params.includes("all") && {
        [`all_${type}s`]: {
          href: `${urlPrefix}:${PORT}/api/${type}`,
          description: "retrieve all resources of this type",
          method: "GET",
        },
      }),
      ...(params.includes("put") && {
        put: {
          href: `${urlPrefix}:${PORT}/api/${type}/${item._id.split("_").pop()}`,
          description: "update all mutable paramerter(s) of this object",
          method: "PUT",
        },
      }),
      ...(params.includes("patch") && {
        patch: {
          href: `${urlPrefix}:${PORT}/api/${type}/${item._id.split("_").pop()}`,
          description:
            "update all or some mutable paramerter(s) of this object",
          method: "PATCH",
        },
      }),
      ...(params.includes("delete") && {
        delete: {
          href: `${urlPrefix}:${PORT}/api/${type}/${item._id.split("_").pop()}`,
          description: "delete this object",
          method: "DELETE",
        },
      }),
    };
  }
};
