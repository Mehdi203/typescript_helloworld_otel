"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import express from 'express';
const express_1 = __importDefault(require("express"));
const tracer_1 = __importDefault(require("./tracer"));
//const { tracer } = init('app-services', 8091);
(0, tracer_1.default)('app-services', 8091);
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send('Hello');
});
app.listen(3200, () => console.log('Server running'));
