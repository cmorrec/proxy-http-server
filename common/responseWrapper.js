"use strict";
exports.__esModule = true;
exports.responseWrapper = void 0;
var responseWrapper = function (body) { return "\n<!DOCTYPE html>\n<html lang=\"ru\">\n    <head>\n        <meta charset=\"UTF-8\">\n        <title>\u041A\u0430\u0442\u043D\u043E\u0432, \u0410\u041F\u041E-31</title>\n        <style>\n         * {\n            font-size: 24px;\n         }\n        </style>\n    </head>\n    <body>\n" + body + "\n    </body>\n</html>\n"; };
exports.responseWrapper = responseWrapper;
