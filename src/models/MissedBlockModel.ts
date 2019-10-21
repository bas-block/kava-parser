import { ObjectId } from "bson";

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

/**
 * Model for a single message.
 *
 * @type {"mongoose".Schema}
 */
const missedBlockSchema = new Schema(
  {
    height: {
      type: Number,
      required: true,
      index: true
    },
    validators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Validator"
      }
    ]
  },
  {
    id: false,
    versionKey: false,
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  }
);

missedBlockSchema.virtual("success").get(function() {
  if (this.hasOwnProperty("error")) {
    return this.error === "";
  }
});

missedBlockSchema.plugin(mongoosePaginate);

export const MissedBlock = mongoose.model("MissedBlock", missedBlockSchema);
