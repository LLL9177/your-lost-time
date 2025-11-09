"use strict";

const dimmerDiv = document.querySelector(".dimmer");
dimmerDiv.classList.remove("hidden")

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const username = getCookie("username");

const popupRegister = document.querySelector(".popup-register");
const popupDimmer = document.querySelector(".popup-dimmer")

if (!username) {
  popupRegister.classList.remove("hidden");
  popupDimmer.classList.remove("fully_hidden")
}

// background
const randomizedNumber = Math.floor(Math.random()*3);
const backgroundPhotosList = [
  "../static/images/1.jpg",
  "../static/images/2.jpg",
  "../static/images/3.jpg"
];

document.body.style.backgroundImage = `url("${backgroundPhotosList[randomizedNumber]}")`;
document.body.style.backgroundRepeat = "no-repeat";
document.body.style.backgroundSize = "cover";

// flashes
const flashesDOMElement = document.querySelector(".flashes");
if (flashesDOMElement) {
  const timeLine = document.querySelector(".timer-line");
  const flashesText = document.querySelector(".timer-line p");
  let timeLineWidth = 450; // px

  flashesDOMElement.classList.remove("hidden")

  let timeLineSubstraction = setInterval(function () {
    if (timeLineWidth <= 0) {
      clearInterval(this.timeLineSubstraction);
      flashesDOMElement.classList.add("hidden");
    }

    timeLine.style.width = `${timeLineWidth}px`;
    timeLineWidth--;  
  }, 10);
}

// convert to minutes and hours
const lostTime = document.querySelector(".time-lost-counter");
let lostTimeM = Number(lostTime.innerText);
let lostTimeH = convertToHours(lostTimeM);
lostTimeM -= lostTimeH*60;

if (lostTimeH == 0) {
  lostTime.innerText = `${lostTimeM}m`;
} else if (lostTimeM == 0) {
  lostTime.innerText = `${lostTimeH}h`;
} else {
  lostTime.innerText = `${lostTimeH}h ${lostTimeM}m`;
}

function convertToHours(minutes) {
  return Math.floor(minutes/60);
}
