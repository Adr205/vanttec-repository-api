"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./classes/server"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const repository_routes_1 = __importDefault(require("./routes/repository.routes"));
const server = new server_1.default();
// Body parser
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
// Configurar CORS
server.app.use((0, cors_1.default)({ origin: true, credentials: true }));
// Rutas de servicios
server.app.use('/api/user', user_routes_1.default);
server.app.use('/api/repository', repository_routes_1.default);
server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
});
