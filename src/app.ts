require('./tracer.ts')('app-services');

const express = require('express');

const app = express();

app.get('/', (req, res) =>{
    res.send('Hello');
});

app.listen(3200, () => console.log('Server running'));