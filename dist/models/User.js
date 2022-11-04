"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, 'The name is necessary']
    },
    lastName: {
        type: String,
        required: [true, 'The last name is necessary']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'The email is necessary']
    },
    password: {
        type: String,
        required: [true, 'The password is necessary']
    },
    savedRepositories: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Repository',
        default: []
    },
    createdRepositories: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Repository',
        default: []
    }
});
userSchema.method('comparePassword', function (password = '') {
    if (bcrypt_1.default.compareSync(password, this.password)) {
        return true;
    }
    else {
        return false;
    }
});
exports.User = (0, mongoose_1.model)('User', userSchema);
