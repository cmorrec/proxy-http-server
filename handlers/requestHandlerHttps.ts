const ab2str = require('arraybuffer-to-string');

import { connect } from "net";
import { parse as parseUrl } from "url";
import { IncomingMessage, ServerResponse } from 'http';
import { Duplex } from 'stream';
import { Buffer } from 'buffer';

import { ProxyElement } from './requestHandler';

type Error = { message: string; };

export const requestHandlerHttps = (
    req: IncomingMessage,
    clientSocket: Duplex | ServerResponse,
    head: Buffer,
    history: ProxyElement[],
) => {
    const regPath = new RegExp(req.headers.host?.slice(0, (req.headers.host?.length ?? 0) - 4) ?? '');
    const refererWithoutHost = req.headers.referer?.replace(regPath, '') ?? '';
    const optionPath = refererWithoutHost.substr(refererWithoutHost.indexOf('://') + 3);
    const { port, hostname } = parseUrl(`//${req.url}`, false, true);
    if (hostname && port) {
        const serverErrorHandler = (err: Error) => clientSocket?.end(`HTTP/1.1 500 ${err.message}\r\n`);
        const serverEndHandler = () => clientSocket?.end(`HTTP/1.1 500 External Server End\r\n`);
        const serverSocket = connect(Number(port), hostname);
        const clientEndHandler = () => serverSocket?.end();
        clientSocket.on('error', clientEndHandler);
        clientSocket.on('end', clientEndHandler);
        serverSocket.on('error', serverErrorHandler);
        serverSocket.on('end', serverEndHandler);
        serverSocket.on('connect', () => {
            clientSocket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: Node-VPN');

            let body = '';
            clientSocket.on('data', (chunk: any) => {
                let json = JSON.parse(JSON.stringify(chunk));
                let uint8 = new Uint8Array(json.data);
                body += ab2str(uint8);
            });
            clientSocket.on('end', () => {
                history.push({
                    req,
                    clientSocket,
                    type: 'https',
                    body: body,
                    optionPath: optionPath,
                });
            });

            clientSocket.write('\r\n\r\n');
            serverSocket.pipe(clientSocket, { end: false });
            clientSocket.pipe(serverSocket, { end: false });
        })
    } else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
        clientSocket.destroy();
    }
}
