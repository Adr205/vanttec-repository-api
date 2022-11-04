import jwt from 'jsonwebtoken';

export default class Token {
    private static seed: string = "este-es-el-seed-de-mi-app-secreto";
    private static expires: string = "7d";

    constructor() {}

    static getJwtToken(payload: any): string {
        return jwt.sign({
            user: payload
        }, this.seed, {expiresIn: this.expires});
    }

    static checkToken(userToken: string) {
        return new Promise((resolve, reject) => {
            jwt.verify(userToken, this.seed, (err, decoded) => {
                if(err) {
                    reject();
                }else {
                    resolve(decoded);
                }
            });
        });
    }
}
