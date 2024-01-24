let timeStartedDT
let timeEndedDT
let timeStarted	
let timeBreakDT


const time_options = {
  hour: '2-digit', minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Berlin'
};

document.addEventListener('DOMContentLoaded', () => {
  //current date and time
  const today = new Date();
  const options ={
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric"
  }
  document.getElementById('full_time').innerText = today.toLocaleTimeString("de-DE", options);
});

function startTime() {
  if (document.getElementById('time_started').innerText == "") {
    const today = new Date();
    let timeStarted = today.toLocaleTimeString("de-DE", time_options);
    timeStartedDT = today.getTime();
    document.getElementById('time_started').innerText = "Von: " + timeStarted+ " Uhr bis: ";
  }
}

function endTime() {
  if (document.getElementById('time_started').innerText == "") {alert("Bitte zuerst Startzeit eingeben"); return};
  if (document.getElementById('time_ended').innerText == "") {
    const today = new Date();
    let timeEnded = today.toLocaleTimeString("de-DE", time_options);
    timeEndedDT = today.getTime();
    document.getElementById('time_ended').innerText = timeEnded;
    timeComplete();
  }else {alert("Endzeit bereits eingetragen"); return};
}

function startTimeInput(){
  if (document.getElementById('time_started').innerText == "") {
    const timeStartedInput = document.getElementById('time_started_input');
    timeStarted = timeStartedInput.value;
    //changing the data type from string to datetime for easier handling
    let inputTimeStart = new Date(); //just helps with the conversion, not needed outside of this function
    inputTimeStart.setHours(timeStarted.split(":")[0]);
    inputTimeStart.setMinutes(timeStarted.split(":")[1]);
    timeStartedDT = inputTimeStart.getTime(); //this is the variable that will be sent to the server, now standardized with other inputs
    document.getElementById('time_started').innerText = "Von: " + timeStarted+ " Uhr bis: ";
    event.preventDefault(); //prevents the page from reloading, need new solution since its deprecated
    console.log(timeStartedDT, timeStarted, typeof timeStarted);
  }
};

function endTimeInput() {
  if (document.getElementById('time_started').innerText == "") {alert("Bitte zuerst Startzeit eingeben"); return};
  if (document.getElementById('time_ended').innerText == "") {
    const timeEndedInput = document.getElementById('time_ended_input');
    let timeEnded = timeEndedInput.value;
    //changing the data type from string to datetime for easier handling
    let inputTime = new Date(); //just helps with the conversion, not needed outside of this function
    inputTime.setHours(timeEnded.split(":")[0]);
    inputTime.setMinutes(timeEnded.split(":")[1]);
    timeEndedDT = inputTime.getTime(); //this is the variable that will be sent to the server, now standardized with other inputs
    document.getElementById('time_ended').innerText = timeEnded;
    event.preventDefault();
    console.log(timeEnded, typeof timeEnded, (timeEndedDT- timeStartedDT));
    
  }else {alert("Endzeit bereits eingetragen"); return};
};

function pauseTimeInput(){
  if (document.getElementById('break_time_input').innerText == "") {
    const breakTime = document.getElementById('break_time_input').value;
    console.log(breakTime);
    document.getElementById('time_break').innerText ="Uhr und hast " + breakTime + " Minuten pause gemacht";  
    event.preventDefault();
    timeBreakDT = breakTime * 60000;
    timeComplete();
  }
}

function timeComplete(){
  if (document.getElementById('time_started').innerText == "") {alert("Bitte zuerst Startzeit eingeben"); return};
  if (document.getElementById('time_ended').innerText == "") {alert("Bitte zuerst Endzeit eingeben"); return};
  if(document.getElementById('time_break').innerText == "") {alert("Bitte zuerst Pause eingetragen"); return};
  let timeWorked = timeEndedDT - timeStartedDT - timeBreakDT;
  if (timeWorked <= 0){
    document.getElementById('time_ended').innerText = "";
    document.getElementById('time_started').innerText = "";
    alert("Ungültige Eingabe (Endzeit ist vor Startzeit)");
    location.reload();
  } else{
    document.getElementById('time_worked_min').innerText = "Zeit gearbeitet in Minuten: " + (timeWorked/60000).toFixed(0);
    document.getElementById('time_worked_h').innerText = "Zeit gearbeitet in Stunden: " + (timeWorked/3600000).toFixed(2);
    //change to only show full minutes, not seconds; is there for testing
    sendTimeToServer(timeStartedDT, timeEndedDT, timeBreakDT, timeWorked);
  }
}

function sendTimeToServer(timeStartedDT, timeEndedDT, timeBreakDT, timeWorked){
  fetch ("/data" , {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      time_started: timeStartedDT,
      time_ended: timeEndedDT,
      time_break: timeBreakDT,
      time_worked: timeWorked

    })
  })
  .then(response => response.text())
};

