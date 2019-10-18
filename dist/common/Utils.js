"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
/**
 * Fills the status and JSOn data into a response object.
 * @param res response object
 * @param status of the response
 * @param content of the response
 */
function sendJSONresponse(res, status, content) {
    res.status(status);
    res.json(content);
}
exports.sendJSONresponse = sendJSONresponse;
/**
 * Sets delay for given amount of time.
 *
 * @param {number} t
 * @returns {Promise<any>}
 */
function setDelay(t) {
    return new Promise((resolve) => {
        setTimeout(resolve, t);
    });
}
exports.setDelay = setDelay;
Object.defineProperty(Array.prototype, "flatMap", {
    value: function (f) {
        return this.reduce((ys, x) => {
            return ys.concat(f.call(this, x));
        }, []);
    },
    enumerable: false,
});
//# sourceMappingURL=Utils.js.map