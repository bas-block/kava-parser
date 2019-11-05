import * as winston from "winston";
import { Message } from "../models/MessageModel";
import { Transaction } from "../models/TransactionModel";
import { Validator } from "../models/ValidatorModel";
import { ITransaction } from "./CommonInterfaces";

export class MessageParser {
  public async parseMessages(transactions: any) {
    if (typeof transactions === "undefined") return Promise.resolve();
    if (transactions.length === 0) return Promise.resolve();

    transactions.map((transaction: ITransaction) => {
      const messages = transaction.msgs;
      console.log(messages);
      if (messages.length === 0) return Promise.resolve();

      console.log(messages);

      const promises = messages.map(async (message: any) => {
        return await Message.findOneAndUpdate(
          { tx_hash: transaction.hash },
          message,
          {
            upsert: true,
            new: true
          }
        ).catch((error: Error) => {
          winston.error(`Could not save message with error: ${error}`);
        });
      });

      return Promise.all(promises).then(() => {
        winston.info("Processed " + messages.length + " messages.");
      });

      // return Transaction.findOneAndUpdate(
      //   { hash: transaction.hash },
      //   { $push: { msgs: messages.length } }
      // )
      //   .then(() => {
      //     winston.info("Processed " + messages.length + " messages.");
      //   })
      //   .catch((error: Error) => {
      //     winston.error(
      //       `Could not update message to transaction hash ${transaction.hash} with error: ${error}`
      //     );
      //   });
    });

    return Promise.resolve(transactions);
  }
}
