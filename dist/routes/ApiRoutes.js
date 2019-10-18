"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const StatusController_1 = require("../controllers/StatusController");
const BlockController_1 = require("../controllers/BlockController");
const TransactionController_1 = require("../controllers/TransactionController");
const ValidatorController_1 = require("../controllers/ValidatorController");
const AccountController_1 = require("../controllers/AccountController");
const router = express.Router();
exports.router = router;
const statusController = new StatusController_1.StatusController();
const transactionController = new TransactionController_1.TransactionController();
const validatorController = new ValidatorController_1.ValidatorController();
const accountController = new AccountController_1.AccountController();
const blockController = new BlockController_1.BlockController();
router.get("/", statusController.getStatus);
// URLs for blocks
router.get("/blocks", blockController.readAllBlocks);
// URLs for transactions
router.get("/txs", transactionController.readAllTransactions);
router.get("/txs/:hash", transactionController.readOneTransaction);
// URLs for validators
router.get("/validators", validatorController.readAllValidators);
// URLs for accounts
router.get("/accounts", accountController.readAllAccounts);
//# sourceMappingURL=ApiRoutes.js.map