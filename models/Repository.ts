import { Schema, model, Document } from "mongoose";

const repositorySchema = new Schema({
  title: {
    type: String,
    required: [true, "The title is necessary"],
  },
  description: {
    type: String,
    required: [true, "The description is necessary"],
  },
  url: {
    type: String,
    required: [true, "The url is necessary"],
  },
  tags: {
    type: [String],
    required: false,
  },
  user: {
    type: String,
    required: [true, "The user is necessary"],
  },
  userID : {
    type: String,
    required: [true, "The userID is necessary"],
  },
  saved: {
    type: Boolean,
    required: false,
    default: false,
  },
});

interface IRepository extends Document {
  title: String;
  description: String;
  url: String;
  tags: [String];
  user: String;
  saved: Boolean;
}

export const Repository = model<IRepository>("Repository", repositorySchema);
