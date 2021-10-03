"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var http_1 = require("http");
var buffer_1 = require("buffer");
var requestHandler_1 = require("./handlers/requestHandler");
var requestHandlerHttps_1 = require("./handlers/requestHandlerHttps");
var responseWrapper_1 = require("./common/responseWrapper");
var express = require('express');
var app = express();
var history = [];
var PORT_STATIC = 8000;
var PORT = 8080;
app.get('/', function (req, res) {
    var help = "\n        <div>\u0441\u043B\u0443\u0448\u0430\u0435\u0442 \u043D\u0430 \u043F\u043E\u0440\u0442\u0443 " + PORT + "</div>\n        <div>\u043D\u0430 \u043F\u043E\u0440\u0442\u0443 " + PORT_STATIC + " \u0432\u0435\u0431-\u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441</div>\n        <div>/requests \u2013 \u0441\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432</div>\n        <div>/requests/id \u2013 \u0432\u044B\u0432\u043E\u0434 1 \u0437\u0430\u043F\u0440\u043E\u0441\u0430</div>\n        <div>/repeat/id \u2013 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u0430\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430</div>\n        <div>/scan/id \u2013 \u0441\u043A\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043F\u0440\u043E\u0441\u0430</div>\n    ";
    res.send((0, responseWrapper_1.responseWrapper)(help));
});
app.get('/requests', function (req, res) {
    var response = "\n        <div>requests</div>\n        " + history.map(function (item, index) {
        var _a, _b;
        return "\n            <div>id " + index + "</div>\n            <div>" + ((_b = (_a = item === null || item === void 0 ? void 0 : item.req) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.host) + "</div>\n            <div>path: " + (item === null || item === void 0 ? void 0 : item.optionPath) + "</div>\n            <hr>\n        ";
    }) + "\n    ";
    res.send((0, responseWrapper_1.responseWrapper)(response));
});
app.get('/requests/:id', function (req, res) {
    var _a, _b;
    var item = history[Number(req.params.id)];
    var response = item
        ? "<div>" + ((_b = (_a = item === null || item === void 0 ? void 0 : item.req) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.host) + "</div>\n           <div>path: " + (item === null || item === void 0 ? void 0 : item.optionPath) + "</div>\n           <div>\u041E\u0442\u0432\u0435\u0442:</div>\n           <div>" + (item === null || item === void 0 ? void 0 : item.body) + "</div>\n           <hr>"
        : "<div>\u041D\u0435\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0441 id = " + req.params.id + "</div>";
    res.send((0, responseWrapper_1.responseWrapper)(response));
});
app.get('/repeat/:id', function (req, res) {
    var _a, _b;
    var item = history[Number(req.params.id)];
    switch (item === null || item === void 0 ? void 0 : item.type) {
        case 'http':
            (0, requestHandler_1.requestHandler)(item.req, item.clientSocket, history);
            break;
        case 'https':
            (0, requestHandlerHttps_1.requestHandlerHttps)(item.req, item.clientSocket, new buffer_1.Buffer('a'), history);
            break;
    }
    var response = item
        ? "\n            <div>" + ((_b = (_a = item === null || item === void 0 ? void 0 : item.req) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.host) + " \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E!</div>\n            <div>\n                <div>path: " + (item === null || item === void 0 ? void 0 : item.optionPath) + "</div>\n                <div>\u041E\u0442\u0432\u0435\u0442:</div>\n                <div>" + (item === null || item === void 0 ? void 0 : item.body) + "</div>\n            </div>\n            <hr>"
        : "<div>\u041D\u0435\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0441 id = " + req.params.id + "</div>";
    res.send((0, responseWrapper_1.responseWrapper)(response));
});
app.get('/scan/:id', function (req, res) {
    (0, fs_1.readFile)('./dict/dict.txt', 'utf8', function (err, data) {
        var vac = data.split('\n');
        var proxyElement = history[Number(req.params.id)];
        var answer = proxyElement
            ? vac.map(function (item) { return "<div><span>404</span>" + item + "</div>"; }).join('')
            : "<div>\u041D\u0435\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0441 id = " + req.params.id + "</div>";
        res.send((0, responseWrapper_1.responseWrapper)(answer));
    });
});
app.listen(PORT_STATIC);
var server = (0, http_1.createServer)(function (req, res) { return (0, requestHandler_1.requestHandler)(req, res, history); });
server.listen(PORT);
server.on('connect', function (req, clientSocket, head) { return (0, requestHandlerHttps_1.requestHandlerHttps)(req, clientSocket, head, history); });
