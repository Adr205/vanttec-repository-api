"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const mongoose_1 = require("mongoose");
const repositorySchema = new mongoose_1.Schema({
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
    userID: {
        type: String,
        required: [true, "The userID is necessary"],
    },
    saved: {
        type: Boolean,
        required: false,
        default: false,
    },
});
exports.Repository = (0, mongoose_1.model)("Repository", repositorySchema);
