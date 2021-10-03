import { Request, Response } from 'express';
import { readFile } from 'fs';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Duplex } from 'stream';
import { Buffer } from 'buffer';

import { requestHandler, ProxyElement } from './handlers/requestHandler';
import { requestHandlerHttps } from './handlers/requestHandlerHttps';
import { responseWrapper } from './common/responseWrapper';

const express = require('express');
const app = express();
const history: ProxyElement[] = [];

const PORT_STATIC = 8000;
const PORT = 8080;

app.get('/', (req: Request, res: Response) => {
    const help = `
        <div>слушает на порту ${PORT}</div>
        <div>на порту ${PORT_STATIC} веб-интерфейс</div>
        <div>/requests – список запросов</div>
        <div>/requests/id – вывод 1 запроса</div>
        <div>/repeat/id – повторная отправка запроса</div>
        <div>/scan/id – сканирование запроса</div>
    `;
    res.send(responseWrapper(help));
})

app.get('/requests', (req: Request, res: Response) => {
    const response = `
        <div>requests</div>
        ${history.map((item, index) => `
            <div>id ${index}</div>
            <div>${item?.req?.headers?.host}</div>
            <div>path: ${item?.optionPath}</div>
            <hr>
        `)}
    `;
    res.send(responseWrapper(response));
})

app.get('/requests/:id', (req: Request, res: Response) => {
    const item = history[Number(req.params.id)];
    const response = item
        ? `<div>${item?.req?.headers?.host}</div>
           <div>path: ${item?.optionPath}</div>
           <div>Ответ:</div>
           <div>${item?.body}</div>
           <hr>`
        : `<div>Нет запроса с id = ${req.params.id}</div>`;
    res.send(responseWrapper(response));
})

app.get('/repeat/:id', (req: Request, res: Response) => {
    const item = history[Number(req.params.id)];
    switch (item?.type) {
        case 'http':
            requestHandler(item.req, item.clientSocket, history);
            break;
        case 'https':
            requestHandlerHttps(item.req, item.clientSocket, new Buffer('a'), history);
            break;
    }
    const response = item
        ? `
            <div>${item?.req?.headers?.host} повторно!</div>
            <div>
                <div>path: ${item?.optionPath}</div>
                <div>Ответ:</div>
                <div>${item?.body}</div>
            </div>
            <hr>`
        : `<div>Нет запроса с id = ${req.params.id}</div>`;
    res.send(responseWrapper(response));
})

app.get('/scan/:id', (req: Request, res: Response) => {
    readFile('./dict/dict.txt', 'utf8', (err, data) => {
        const vac: string[] = data.split('\n');
        const proxyElement = history[Number(req.params.id)];
        const answer = proxyElement
            ? vac.map(item => `<div><span>404</span>${item}</div>`).join('')
            : `<div>Нет запроса с id = ${req.params.id}</div>`;

        res.send(responseWrapper(answer));
    });
});

app.listen(PORT_STATIC);

const server = createServer((
    req: IncomingMessage,
    res: ServerResponse,
) => requestHandler(req, res, history));

server.listen(PORT);

server.on('connect', (
    req: IncomingMessage,
    clientSocket: Duplex,
    head: Buffer,
) => requestHandlerHttps(req, clientSocket, head, history));
