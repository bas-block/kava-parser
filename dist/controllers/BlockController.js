"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../common/Utils");
const BlockModel_1 = require("../models/BlockModel");
const xss = require("xss-filters");
class BlockController {
    constructor() {
        this.defaultLimit = 25;
        this.maxLimit = 50;
        this.readAllBlocks = (req, res) => {
            // validate query input
            const validationErrors = BlockController.validateQueryParameters(req);
            if (validationErrors) {
                Utils_1.sendJSONresponse(res, 400, validationErrors);
                return;
            }
            // extract query parameters
            const queryParams = this.extractQueryParameters(req);
            // build up query
            const query = {};
            query.height = { "$gte": queryParams.startBlock, "$lte": queryParams.endBlock };
            BlockModel_1.Block.paginate(query, {
                page: queryParams.page,
                limit: queryParams.limit,
                sort: { time: -1 },
            }).then((blocks) => {
                Utils_1.sendJSONresponse(res, 200, blocks);
            }).catch((err) => {
                Utils_1.sendJSONresponse(res, 404, err);
            });
        };
    }
    static validateQueryParameters(req) {
        req.checkQuery("page", "Page needs to be a number").optional().isNumeric();
        req.checkQuery("startBlock", "startBlock needs to be a number").optional().isNumeric();
        req.checkQuery("endBlock", "endBlock needs to be a number").optional().isNumeric();
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
            startBlock: startBlock,
            endBlock: endBlock,
            page: page,
            limit
        };
    }
}
exports.BlockController = BlockController;
//# sourceMappingURL=BlockController.js.map