const express = require('express');




const requestMiddleware = require('./middleware/requestMiddleware.js');
const staticFileMiddleware = require('./middleware/staticFileMiddleware.js');



const app = express();
const port = 3000;

app.use(requestMiddleware.jsonBodyParser);
app.use(staticFileMiddleware.staticFileMiddleware);

