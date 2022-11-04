import path from 'path';
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
import express from 'express';
import mongoose from 'mongoose';

export default class Server{
    public app: express.Application;
    public port: number;
    private uri: string;

    constructor(){
        this.app = express();
        this.port = Number(process.env.PORT) || 3011;
        this.uri = process.env.MONGO_URI || '';
    }

    start(callback: Function){
        this.app.listen(this.port, callback);
        this.connectDB();
    }

    // static init(){
    //     this.connectDB();
    // }

     connectDB(){
        mongoose.connect(this.uri, {useNewUrlParser: true}, (err) => {
            if(err) throw err;
            console.log('Base de datos ONLINE');
        });
    }

}