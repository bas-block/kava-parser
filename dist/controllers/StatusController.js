"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../common/Utils");
class StatusController {
    getStatus(req, res) {
        Utils_1.sendJSONresponse(res, 200, {
            status: 'ok'
        });
    }
}
exports.StatusController = StatusController;
//# sourceMappingURL=StatusController.js.map