"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../common/Utils");
const TransactionModel_1 = require("../models/TransactionModel");
const xss = require("xss-filters");
class TransactionController {
    constructor() {
        this.defaultLimit = 25;
        this.maxLimit = 50;
        this.readAllTransactions = (req, res) => {
            // validate query input
            const validationErrors = TransactionController.validateQueryParameters(req);
            if (validationErrors) {
                Utils_1.sendJSONresponse(res, 400, validationErrors);
                return;
            }
            // extract query parameters
            const queryParams = this.extractQueryParameters(req);
            // build up query
            const query = {};
            TransactionModel_1.Transaction.paginate(query, {
                page: queryParams.page,
                limit: queryParams.limit,
                sort: { time: -1 },
                populate: [
                    {
                        path: "msgs"
                    },
                    {
                        path: "signatures"
                    }
                ]
            })
                .then((transactions) => {
                Utils_1.sendJSONresponse(res, 200, transactions);
            })
                .catch((err) => {
                Utils_1.sendJSONresponse(res, 404, err);
            });
        };
    }
    readOneTransaction(req, res) {
        if (!req.params || !req.params.hash) {
            Utils_1.sendJSONresponse(res, 404, { message: "No Hash in request" });
            return;
        }
        // validate transaction ID
        //req.checkParams("transactionId", "Transaction ID must be alphanumeric").isAlphanumeric();
        const validationErrors = req.validationErrors();
        if (validationErrors) {
            Utils_1.sendJSONresponse(res, 400, validationErrors);
            return;
        }
        const tx_hash = xss.inHTMLData(req.params.hash);
        TransactionModel_1.Transaction.findOne({
            hash: tx_hash
        })
            .populate({
            path: "msgs",
            populate: {
                path: "msgs",
                model: "Message"
            }
        })
            .populate({
            path: "signatures",
            populate: {
                path: "signatures",
                model: "Account"
            }
        })
            .exec()
            .then((transaction) => {
            if (!transaction) {
                Utils_1.sendJSONresponse(res, 404, { message: "transaction Hash not found" });
                return;
            }
            Utils_1.sendJSONresponse(res, 200, transaction);
        })
            .catch((err) => {
            Utils_1.sendJSONresponse(res, 404, err);
        });
    }
    static validateQueryParameters(req) {
        req
            .checkQuery("page", "Page needs to be a number")
            .optional()
            .isNumeric();
        req
            .checkQuery("startBlock", "startBlock needs to be a number")
            .optional()
            .isNumeric();
        req
            .checkQuery("endBlock", "endBlock needs to be a number")
            .optional()
            .isNumeric();
        req
            .checkQuery("limit", "limit needs to be a number")
            .optional()
            .isNumeric();
        //req.checkQuery("address", "address needs to be alphanumeric and have a length 42").isAlphanumeric().isLength({ min: 42, max: 42 });
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
        // address parameter
        const address = xss.inHTMLData(req.query.address).toLowerCase();
        // start block parameter
        let startBlock = parseInt(xss.inHTMLData(req.query.startBlock));
        if (isNaN(startBlock) || startBlock < 1) {
            startBlock = 1;
        }
        // end block parameter
        let endBlock = parseInt(xss.inHTMLData(req.query.endBlock));
        if (isNaN(endBlock) || endBlock < 1 || endBlock < startBlock) {
            endBlock = 9999999999;
        }
        return {
            address: address,
            startBlock: startBlock,
            endBlock: endBlock,
            page: page,
            limit
        };
    }
}
exports.TransactionController = TransactionController;
//# sourceMappingURL=TransactionController.js.map