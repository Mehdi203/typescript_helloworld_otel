import express from 'express'

import init from './tracer';
const { tracer } = init('app-services');

const app = express();

app.get('/', (req, res) =>{
    res.send('Hello');
});

app.listen(3200, () => console.log('Server running'));