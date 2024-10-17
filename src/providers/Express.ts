/**
 * Represents the Express server configuration and initialization.
 * Author: Isom D. <isom19901122@gmail.com>
 */

import express from 'express';
import Locals from './Locals';
import ExceptionHandler from '../exception/Handler';
import Routes from './Routes';
import Https from 'https'; // Import HTTPS module
import { Server as HttpsServer } from 'https'; // Import HTTPS Server type
import Http, { Server as HttpServer } from 'http'
import Kernel from '../api/middlewares/Kernel';
import Log from '../api/middlewares/Log';
import path from 'path';
import fs from 'fs';

class Express {
    public express: express.Application;
    public server: HttpsServer | HttpServer;

    /**
     * Initializes the Express server with middleware and routes.
     */
    public constructor() {
        this.express = express();

        // const privateKeyPath = path.join("src/providers/ssl", "private.key");
        // const certPath = path.join("src/providers/ssl", "certificate.crt");
        // this.server = Https.createServer({ // Create HTTPS server
        //     key: fs.readFileSync(privateKeyPath),
        //     cert: fs.readFileSync(certPath)
        // }, this.express);

        this.server = Http.createServer(this.express);

        this.mountDotEnv();
        this.mountMiddlewares();
        this.mountRoutes();
    }

    /**
     * Mounts environment variables.
     */
    private mountDotEnv(): void {
        this.express = Locals.init(this.express);
    }

    /**
     * Mounts middleware to the Express app.
     */
    private mountMiddlewares(): void {
        this.express = Kernel.init(this.express);
    }

    /**
     * Mounts API routes to the Express app.
     */
    private mountRoutes(): void {
        this.express = Routes.mountApi(this.express);
    }

    /**
     * Initializes the Express server and starts listening on the configured port.
     */
    public init(): any {
        const port: number = Locals.config().port;

        const publicPath = path.resolve(__dirname, '../../public');
        this.express.use(express.static(publicPath));

        // Registering Exception & Error Handlers
        this.express.use(ExceptionHandler.logErrors);
        this.express.use(ExceptionHandler.clientErrorHandler);
        this.express.use(ExceptionHandler.errorHandler);
        this.express = ExceptionHandler.notFoundHandler(this.express);

        // Start the server on the specified port
        this.server
            .listen(port, () => {
                return Log.info(`Express :: Running @ 'https://0.0.0.0:${port}'`); // Change protocol to HTTPS
            })
            .on('error', (_error) => {
                return Log.error(`Express :: Error: ${_error.message}`);
            });
    }
}

/** Export the Express module */
export default new Express();
