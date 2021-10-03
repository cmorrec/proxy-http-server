const ab2str = require('arraybuffer-to-string');

import { IncomingMessage, ServerResponse, request } from 'http';
import { Duplex } from "stream";

export interface ProxyElement {
    req: IncomingMessage;
    clientSocket: ServerResponse | Duplex;
    type: 'http' | 'https';
    body: string;
    optionPath: string;
}

export const requestHandler = (
    incomingMessage: IncomingMessage,
    clientSocket: ServerResponse | Duplex,
    history: any,
) => {
    delete incomingMessage.headers['proxy-connection'];
    const regPath = new RegExp(incomingMessage.headers.host ?? '');
    const pathWithoutHost = incomingMessage.url?.replace(regPath, '') ?? '';
    const optionPath = pathWithoutHost.substr(pathWithoutHost.indexOf('://') + 3);
    const options = {
        hostname: incomingMessage.headers.host,
        port: 80,
        path: optionPath,
        method: incomingMessage.method,
        headers: incomingMessage.headers
    };

    const proxy = request(options, (req: IncomingMessage) => {
        !(clientSocket instanceof Duplex) && clientSocket.writeHead(req.statusCode ?? 200, req.headers);

        req.pipe(clientSocket, { end: true });

        let body = '';
        req.on('data', chunk => {
            const json = JSON.parse(JSON.stringify(chunk))
            const uint8 = new Uint8Array(json.data);
            body += ab2str(uint8);
        });
        req.on('end', () => {
            history.push({
                req: incomingMessage,
                clientSocket: clientSocket,
                type: 'http',
                body,
                optionPath,
            });
        });
    });

    incomingMessage.pipe(proxy, { end: true });
}
