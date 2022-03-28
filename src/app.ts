//import express from 'express';
import express from 'express'

import init from './tracer';
//const { tracer } = init('app-services', 8091);
init('app-services', 8091);

const app = express();

app.get('/', (req, res) =>{
    res.send('Hello');
});

app.listen(3200, () => console.log('Server running'));