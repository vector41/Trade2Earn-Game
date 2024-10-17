"use strict";
/**
 * Represents the Express server configuration and initialization.
 * Author: Isom D. <isom19901122@gmail.com>
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Locals_1 = __importDefault(require("./Locals"));
const Handler_1 = __importDefault(require("../exception/Handler"));
const Routes_1 = __importDefault(require("./Routes"));
const http_1 = __importDefault(require("http"));
const Kernel_1 = __importDefault(require("../api/middlewares/Kernel"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
const path_1 = __importDefault(require("path"));
class Express {
    /**
     * Initializes the Express server with middleware and routes.
     */
    constructor() {
        this.express = (0, express_1.default)();
        // const privateKeyPath = path.join("src/providers/ssl", "private.key");
        // const certPath = path.join("src/providers/ssl", "certificate.crt");
        // this.server = Https.createServer({ // Create HTTPS server
        //     key: fs.readFileSync(privateKeyPath),
        //     cert: fs.readFileSync(certPath)
        // }, this.express);
        this.server = http_1.default.createServer(this.express);
        this.mountDotEnv();
        this.mountMiddlewares();
        this.mountRoutes();
    }
    /**
     * Mounts environment variables.
     */
    mountDotEnv() {
        this.express = Locals_1.default.init(this.express);
    }
    /**
     * Mounts middleware to the Express app.
     */
    mountMiddlewares() {
        this.express = Kernel_1.default.init(this.express);
    }
    /**
     * Mounts API routes to the Express app.
     */
    mountRoutes() {
        this.express = Routes_1.default.mountApi(this.express);
    }
    /**
     * Initializes the Express server and starts listening on the configured port.
     */
    init() {
        const port = Locals_1.default.config().port;
        const publicPath = path_1.default.resolve(__dirname, '../../public');
        this.express.use(express_1.default.static(publicPath));
        // Registering Exception & Error Handlers
        this.express.use(Handler_1.default.logErrors);
        this.express.use(Handler_1.default.clientErrorHandler);
        this.express.use(Handler_1.default.errorHandler);
        this.express = Handler_1.default.notFoundHandler(this.express);
        // Start the server on the specified port
        this.server
            .listen(port, () => {
            return Log_1.default.info(`Express :: Running @ 'https://0.0.0.0:${port}'`); // Change protocol to HTTPS
        })
            .on('error', (_error) => {
            return Log_1.default.error(`Express :: Error: ${_error.message}`);
        });
    }
}
/** Export the Express module */
exports.default = new Express();
