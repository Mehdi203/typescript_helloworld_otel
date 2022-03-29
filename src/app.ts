require('./tracer.ts')('app-services'); //this should be the first line
import express from 'express'

const app = express();

app.get('/', (req, res) =>{
    res.send('Hello');
});

app.listen(3200, () => console.log('Server running'));