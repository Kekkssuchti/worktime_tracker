const express = require('express');
const path = require('path'); 
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();


const requestMiddleware = require('./middleware/requestMiddleware.js');
const staticFileMiddleware = require('./middleware/staticFileMiddleware.js');



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

//database

const db = new sqlite3.Database('../data/worktime2db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
    dbinnit();
});

const dummydataArbeitstag = {ArbeiterID: 1, date: "2020-06-01", timeStarted:"16:12", timeEnded:"18:40", timeBreak:50, timeWorked:98.09};
const dummydataPerson = {Vorname: "Hans" , Nachname: "Müller"}; 
const dummydataBaustelle = {Name: "Baustelle3", Stadt: "Stadt1", PLZ: "12345", Strasse: "Strasse1", Hausnummer: "1"};

const dummydataArbeitslog = {ArbeitstagID: 1, BaustelleID: 1};
const dummydataArbeitslog_self = {id: 1, date: "2020-06-01", BaustelleID:1};

function dbinnit() {
  
  db.serialize(function() {
    createTables();

    insertArbeiter(dummydataPerson);
    insertBaustelle(dummydataBaustelle);
    insertArbeitstag(dummydataArbeitstag);
    insertArbeitslog(dummydataArbeitslog);

    selectAll();

    db.close();
  });

}


//insert data
function insertArbeiter(data) {
  const sqlArbeiter =
    `INSERT INTO Arbeiter (Vorname, Name)
    VALUES (?, ?)`
  db.run(sqlArbeiter, [data.Vorname, data.Nachname], function(err) {
    if (err) {
      console.error(err.message);
    }
    console.log('Arbeiter inserted with id ',  this.lastID);
  })};

function insertBaustelle(data) {
  const sqlbaustelle =  
  `INSERT INTO Baustelle (Name, Stadt, PLZ, Strasse, Hausnummer) 
  VALUES (?, ?, ?, ?, ?)`
  db.run(sqlbaustelle, [data.Name, data.Stadt, data.PLZ, data.Strasse, data.Hausnummer], function (err) {
    if (err) {
      console.error(err.message);
    }
    console.log('Baustelle inserted with id ',  this.lastID);
  })}

function insertArbeitstag(data) {
  const sqlarbeitstag = 
    `INSERT INTO Arbeitstag (ArbeiterID, Datum, Startzeit, Endzeit, Pausenzeit, Arbeitszeit) 
    VALUES (?, ?, ?, ?, ?, ?)`
  db.run(sqlarbeitstag, [data.ArbeiterID, data.date, data.timeStarted, data.timeEnded, data.timeBreak, data.timeWorked], function (err) {
    if (err) {
      console.error(err.message);
    }
    console.log('Arbeitstag inserted with id ',  this.lastID);
  })}

function insertArbeitslog(data) {
  const sqlArbeitslog =
    `INSERT INTO Arbeitslog (ArbeitstagID, BaustelleID)
    VALUES (?,?)`
  db.run(sqlArbeitslog, [data.ArbeitstagID, data.BaustelleID],function (err) {
    if (err) {
      console.error(err.message);
    }
    console.log('Arbeitslog inserted with id ',  this.lastID);
  })}

//select data 
function selectAll() {
  db.all(`SELECT * FROM Arbeiter`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    rows.forEach(function(row) {
      console.log("arbeiter: "+row.id+ ": "+  row.Name, row.Vorname);
    });
  });
  db.all(`SELECT * FROM Baustelle`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    rows.forEach(function(row) {
      console.log("baustelle: "+row.id+ ": "+  row.Name, row.Stadt, row.PLZ, row.Strasse, row.Hausnummer);
    });
  });
  db.all(`SELECT * FROM Arbeitstag`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    rows.forEach(function(row) {
      console.log("arbeitstag: "+row.id+ ": "+  row.ArbeiterID, row.Datum, row.Startzeit, row.Endzeit, row.Pausenzeit, row.Arbeitszeit);
    });
  });
  db.all(`SELECT * FROM Arbeitslog`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    rows.forEach(function(row) {
      console.log("arbeitslog: "+row.id+ ": "+  row.ArbeitstagID, row.BaustelleID);
    });
  });
}


//create table
function createTables(arbeiter = false, baustelle = false, arbeitstag = false, arbeitslog = false) {
  if (arbeiter) {
    createArbeiterTable();
  }
  
  if (baustelle) {
    createBaustelleTable();
  }
  
  if (arbeitstag) {
    createArbeitstagTable();
  }
  
  if (arbeitslog) {
    createArbeitslogTable();
  }
}

function createArbeiterTable() {
  db.run(`CREATE TABLE IF NOT EXISTS Arbeiter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Vorname TEXT,
    Name TEXT
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table Arbeiter created.');
  });
}

function createBaustelleTable() {
  db.run(`CREATE TABLE IF NOT EXISTS Baustelle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT,
    Stadt TEXT,
    PLZ INTEGER,
    Strasse TEXT,
    Hausnummer TEXT
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table Baustelle created.');
  });
}

function createArbeitstagTable() {
  db.run(`CREATE TABLE IF NOT EXISTS Arbeitstag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ArbeiterID INTEGER,
    Datum TEXT,
    Startzeit TEXT,
    Endzeit TEXT,
    Pausenzeit INTEGER,
    Arbeitszeit INTEGER,
    FOREIGN KEY (ArbeiterID) REFERENCES Arbeiter(id)
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table Arbeitstag created.');
  });
}

function createArbeitslogTable() {
  db.run(`CREATE TABLE IF NOT EXISTS Arbeitslog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ArbeitstagID INTEGER,
    BaustelleID INTEGER,
    FOREIGN KEY (ArbeitstagID) REFERENCES Arbeitstag(id)
    FOREIGN KEY (BaustelleID) REFERENCES Baustelle(id)
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Table Arbeitslog created.');
  });
}



app.listen(port, () => console.log(`App listening on port ${port}!`));