const express = require('express');
const path = require('path'); 
const fs = require('fs');



const requestMiddleware = require('./middleware/requestMiddleware.js');
const staticFileMiddleware = require('./middleware/staticFileMiddleware.js');
const { stringify } = require('querystring');



const app = express();
const port = 3000;

app.use(requestMiddleware.jsonBodyParser);
app.use(staticFileMiddleware.staticFileMiddleware);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

const time_options = {
    hour: '2-digit', minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin'
};

app.post("/data", (req, res) => {
    const timeStartedDT = req.body.time_started;
    const timeEndedDT = req.body.time_ended;
    const timeBreakDT = req.body.time_break;
    const timeWorkedDT = req.body.time_worked;
    const timeStarted = new Date(timeStartedDT).toLocaleTimeString("de-DE", time_options); 
    const timeEnded = new Date(timeEndedDT).toLocaleTimeString("de-DE", time_options);
    const timeBreak = (timeBreakDT/60000).toFixed(0);
    const timeWorked = (timeWorkedDT/60000).toFixed(2); //change to only show full minutes, not seconds; is there for testing

    const timeString = JSON.stringify({timeStarted, timeEnded, timeBreak, timeWorked});
    //not important as it will be replaced by sqlight db
    fs.appendFile("../data/test.txt", timeString + ", \n", (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
    });
    res.send("Data received");
});

app.listen(port, () => console.log(`App listening on port ${port}!`));