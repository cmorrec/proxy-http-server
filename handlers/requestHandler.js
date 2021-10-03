"use strict";
exports.__esModule = true;
exports.requestHandler = void 0;
var ab2str = require('arraybuffer-to-string');
var http_1 = require("http");
var stream_1 = require("stream");
var requestHandler = function (incomingMessage, clientSocket, history) {
    var _a, _b, _c;
    delete incomingMessage.headers['proxy-connection'];
    var regPath = new RegExp((_a = incomingMessage.headers.host) !== null && _a !== void 0 ? _a : '');
    var pathWithoutHost = (_c = (_b = incomingMessage.url) === null || _b === void 0 ? void 0 : _b.replace(regPath, '')) !== null && _c !== void 0 ? _c : '';
    var optionPath = pathWithoutHost.substr(pathWithoutHost.indexOf('://') + 3);
    var options = {
        hostname: incomingMessage.headers.host,
        port: 80,
        path: optionPath,
        method: incomingMessage.method,
        headers: incomingMessage.headers
    };
    var proxy = (0, http_1.request)(options, function (req) {
        var _a;
        !(clientSocket instanceof stream_1.Duplex) && clientSocket.writeHead((_a = req.statusCode) !== null && _a !== void 0 ? _a : 200, req.headers);
        req.pipe(clientSocket, { end: true });
        var body = '';
        req.on('data', function (chunk) {
            var json = JSON.parse(JSON.stringify(chunk));
            var uint8 = new Uint8Array(json.data);
            body += ab2str(uint8);
        });
        req.on('end', function () {
            history.push({
                req: incomingMessage,
                clientSocket: clientSocket,
                type: 'http',
                body: body,
                optionPath: optionPath
            });
        });
    });
    incomingMessage.pipe(proxy, { end: true });
};
exports.requestHandler = requestHandler;
