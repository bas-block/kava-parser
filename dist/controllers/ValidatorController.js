"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../common/Utils");
const ValidatorModel_1 = require("../models/ValidatorModel");
const xss = require("xss-filters");
class ValidatorController {
    constructor() {
        this.defaultLimit = 25;
        this.maxLimit = 50;
        this.readAllValidators = (req, res) => {
            // validate query input
            const validationErrors = ValidatorController.validateQueryParameters(req);
            if (validationErrors) {
                Utils_1.sendJSONresponse(res, 400, validationErrors);
                return;
            }
            // extract query parameters
            const queryParams = this.extractQueryParameters(req);
            // build up query
            const query = {};
            ValidatorModel_1.Validator.paginate(query, {
                page: queryParams.page,
                limit: queryParams.limit,
                sort: { "details.description.identity": -1 }
            }).then((validators) => {
                Utils_1.sendJSONresponse(res, 200, validators);
            }).catch((err) => {
                Utils_1.sendJSONresponse(res, 404, err);
            });
        };
    }
    static validateQueryParameters(req) {
        req.checkQuery("page", "Page needs to be a number").optional().isNumeric();
        req.checkQuery("limit", "limit needs to be a number").optional().isNumeric();
        return req.validationErrors();
    }
    extractQueryParameters(req) {
        // page parameter
        let page = parseInt(xss.inHTMLData(req.query.page));
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        // limit parameter
        let limit = parseInt(xss.inHTMLData(req.query.limit));
        if (isNaN(limit)) {
            limit = this.defaultLimit;
        }
        else if (limit > this.maxLimit) {
            limit = this.maxLimit;
        }
        else if (limit < 1) {
            limit = 1;
        }
        return {
            page: page,
            limit
        };
    }
}
exports.ValidatorController = ValidatorController;
//# sourceMappingURL=ValidatorController.js.map