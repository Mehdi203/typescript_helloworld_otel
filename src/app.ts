require('./tracer.ts')('app-services'); //this should be the first line
import express from 'express'

const app = express();
const PORT = process.env.PORT || "3200";

async function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  //index endpoint
  app.get('/', async(req, res) => {
    const sleepTime = Math.random()*100;
    await sleep(sleepTime);
    res.status(200).send('Hello World ');
  });
  
  //another endpoint
  app.get('/api', async function (req, res) {
    // send back Medeo message
    res.type('json')
    res.send(JSON.stringify({medeo:"skin"}))
  })
  
  
  app.listen(parseInt(PORT, 10), () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
  });