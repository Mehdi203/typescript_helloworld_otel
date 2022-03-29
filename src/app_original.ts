import express from 'express'

require('./tracer.ts')('app-services');

const app = express();

app.get('/', (req, res) =>{
    res.send('Hello');
});

app.listen(3200, () => console.log('Server running'));