"use strict";
exports.__esModule = true;
exports.requestHandlerHttps = void 0;
var ab2str = require('arraybuffer-to-string');
var net_1 = require("net");
var url_1 = require("url");
var requestHandlerHttps = function (req, clientSocket, head, history) {
    var _a, _b, _c, _d, _e, _f;
    var regPath = new RegExp((_d = (_a = req.headers.host) === null || _a === void 0 ? void 0 : _a.slice(0, ((_c = (_b = req.headers.host) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) - 4)) !== null && _d !== void 0 ? _d : '');
    var refererWithoutHost = (_f = (_e = req.headers.referer) === null || _e === void 0 ? void 0 : _e.replace(regPath, '')) !== null && _f !== void 0 ? _f : '';
    var optionPath = refererWithoutHost.substr(refererWithoutHost.indexOf('://') + 3);
    var _g = (0, url_1.parse)("//" + req.url, false, true), port = _g.port, hostname = _g.hostname;
    if (hostname && port) {
        var serverErrorHandler = function (err) { return clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.end("HTTP/1.1 500 " + err.message + "\r\n"); };
        var serverEndHandler = function () { return clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.end("HTTP/1.1 500 External Server End\r\n"); };
        var serverSocket_1 = (0, net_1.connect)(Number(port), hostname);
        var clientEndHandler = function () { return serverSocket_1 === null || serverSocket_1 === void 0 ? void 0 : serverSocket_1.end(); };
        clientSocket.on('error', clientEndHandler);
        clientSocket.on('end', clientEndHandler);
        serverSocket_1.on('error', serverErrorHandler);
        serverSocket_1.on('end', serverEndHandler);
        serverSocket_1.on('connect', function () {
            clientSocket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: Node-VPN');
            var body = '';
            clientSocket.on('data', function (chunk) {
                var json = JSON.parse(JSON.stringify(chunk));
                var uint8 = new Uint8Array(json.data);
                body += ab2str(uint8);
            });
            clientSocket.on('end', function () {
                history.push({
                    req: req,
                    clientSocket: clientSocket,
                    type: 'https',
                    body: body,
                    optionPath: optionPath
                });
            });
            clientSocket.write('\r\n\r\n');
            serverSocket_1.pipe(clientSocket, { end: false });
            clientSocket.pipe(serverSocket_1, { end: false });
        });
    }
    else {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
        clientSocket.destroy();
    }
};
exports.requestHandlerHttps = requestHandlerHttps;
