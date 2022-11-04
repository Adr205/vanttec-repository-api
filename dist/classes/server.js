"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = Number(process.env.PORT) || 3011;
        this.uri = process.env.MONGO_URI || '';
    }
    start(callback) {
        this.app.listen(this.port, callback);
        this.connectDB();
    }
    // static init(){
    //     this.connectDB();
    // }
    connectDB() {
        mongoose_1.default.connect(this.uri, { useNewUrlParser: true }, (err) => {
            if (err)
                throw err;
            console.log('Base de datos ONLINE');
        });
    }
}
exports.default = Server;
