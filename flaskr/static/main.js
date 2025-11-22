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

// popup
const lossesImg = document.querySelector(".saved-losses");
const lossesDiv = document.querySelector(".popup-losses");
const lossesDivChild = document.querySelector(".popup-losses_content");
const childElements = Array.from(lossesDivChild.children);
let lossesState = false; // true for opened
childElements.forEach(el => {el.style.transform = "translateX(-100%)"})


function lossesImgClick() {
  lossesState = !lossesState;
  childElements.forEach(el => {el.style.transform = "translateX(-100%)"})

  if (lossesState) {
    lossesDiv.style.transform = "translateX(0)";
    lossesImg.style.transform = "translateX(450px)";


    childElements.forEach((el, i) => {
      el.style.transition = "transform 0.5s ease";
      setTimeout(() => {
        el.style.transform = "translateX(0)";
      }, i * 80);
    });

  } else {
    lossesDiv.style.transform = "translateX(-100%)";
    Array.from(lossesDiv.children).forEach(el => {
      el.style.transform = "translateX(0)";
    });
    lossesImg.style.transform = "translateX(0)";
  }
}


// losses book content
// first for styles. handle dropdown arrow click
const dropDownArrow = document.querySelector(".dropdown-arrow");
let arrowState = false // true for opened info.
const moreInfo = document.querySelector(".more-info");
const lossSomeLine = document.querySelector(".loss_some-line");

function hanleDropdownArrowClick() {
  arrowState = !arrowState;
  
  if (arrowState) {
    dropDownArrow.classList.add("open");
    moreInfo.style.visibility = "visible";
    moreInfo.style.position = "static";
    moreInfo.style.opacity = "1";
    
    // animation of line
    let lossSomeLineHeight = 0;
    const targetHeight = parseFloat(getComputedStyle(moreInfo).height)-5;
    let lineAnimationInterval = setInterval(() => {
      if (lossSomeLineHeight < targetHeight) {
        lossSomeLineHeight+=10;
        console.log(lossSomeLineHeight, targetHeight);
        lossSomeLine.style.height = lossSomeLineHeight+"px";
      } else {
        clearInterval(lineAnimationInterval);
      }
    }, 1);
  } else {
    dropDownArrow.classList.remove("open");
    moreInfo.style.visibility = "hidden";
    moreInfo.style.position = "absolute";
    moreInfo.style.opacity = "0";
    lossSomeLine.style.height = "0px";
  }
};