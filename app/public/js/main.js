let timeStartedDT
let timeEndedDT


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
    let timeStarted = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    timeStartedDT = today.getTime();
    document.getElementById('time_started').innerText = "Start der Arbeitszeit: " + timeStarted + "\n";
  }
}

function endTime() {
  if (document.getElementById('time_started').innerText == "") {alert("Bitte zuerst Startzeit eingeben"); return};
  if (document.getElementById('time_ended').innerText == "") {
    const today = new Date();
    let timeEnded = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    timeEndedDT = today.getTime();
    document.getElementById('time_ended').innerText = "Ende der Arbeitszeit: " + timeEnded+ "\n";
    let timeWorked = timeEndedDT - timeStartedDT;
    document.getElementById('time_worked_min').innerText = "Zeit gearbeitet in Minuten: " + (timeWorked/60000).toFixed(2);
    //change to only show full minutes, not seconds; is there for testing
    sendTimeToServer(timeStartedDT, timeEndedDT, timeWorked);
  }
}

function startTimeInput(){
  if (document.getElementById('time_started').innerText == "") {
    const timeStartedInput = document.getElementById('time_started_input');
    let timeStarted = timeStartedInput.value;
    document.getElementById('time_started').innerText = timeStarted;
    console.log(timeStarted, typeof timeStarted);
  };
};

function sendTimeToServer(timeStartedDT, timeEndedDT, timeWorked){
  fetch ("/data" , {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      time_started: timeStartedDT,
      time_ended: timeEndedDT,
      time_worked: timeWorked
    })
  })
  .then(response => response.text())

};

function endTimeInput(time_ended_late) {
  if (document.getElementById('time_ended').innerText == "") {
    const timeEndedInput = document.getElementById('time_ended_input');
    let timeEnded = time_ended_late;
    document.getElementById('time_ended').innerText = timeEnded;
  }
}

