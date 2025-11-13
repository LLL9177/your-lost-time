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
  let timeLineWidth = 100; // %

  flashesDOMElement.classList.remove("hidden")

  let timeLineSubstraction = setInterval(function () {
    if (timeLineWidth <= 0) {
      clearInterval(this.timeLineSubstraction);
      flashesDOMElement.classList.add("hidden");
    }

    timeLine.style.width = `${timeLineWidth}%`;
    timeLineWidth-=0.2;  
  }, 10);
}

// convert to minutes, hours and days
class Converter  {
  hours(minutes) {
    return Math.floor(minutes/60);
  };

  days(hours) {
    return Math.floor(hours/24);
  };

  weeks(days) {
    return Math.floor(days/7);
  };
};

const convertTo = new Converter
const lostTime = document.querySelector(".time-lost-counter");
let lostTimeM = Number(lostTime.innerText);
let lostTimeH = convertTo.hours(lostTimeM);
let lostTimeD = convertTo.days(lostTimeH);
let lostTimeW = convertTo.weeks(lostTimeD);
lostTimeM -= lostTimeH*60;
lostTimeH -= lostTimeD*24;
lostTimeD -= lostTimeW*7;

const parts = [];

if (lostTimeW) parts.push(`${lostTimeW}W`);
if (lostTimeD) parts.push(`${lostTimeD}d`);
if (lostTimeH) parts.push(`${lostTimeH}h`);
if (lostTimeM) parts.push(`${lostTimeM}m`);

lostTime.innerText = parts.join(" ") || "0m";


// when you click a button, you get redirected to a register page.
const registerAgainButton = document.querySelector(".register-again");

registerAgainButton.addEventListener("click", function() {
  // Deletes a cookie by setting it to expire in the past
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = '/';
});