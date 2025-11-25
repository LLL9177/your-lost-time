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


// get losses book data
daysNextIndex = 0;

let xhr = new XMLHttpRequest();
xhr.responseType = "json";
xhr.open("post", "/get/day-data");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.send(JSON.stringify({ username: username }));
xhr.onload = () => {
  const resp = xhr.response;
  console.log(resp);
  if (resp.length === 0) { return 0 } // basically ragequit

  function newPopupLosses() {
    const popupLossesTemplate = document.querySelector(".losses-day");
    const createPair = popupLossesTemplate.cloneNode(true);
    createPair.id = daysNextIndex;
    createPair.style.transition = "transform, 0.5s ease";
    createPair.style.position = "static";
    daysNextIndex++;
    document.querySelector(".popup-losses_content").appendChild(createPair);

    return createPair
  }

  function evaluateDayLostTime(obj) {
    let result = 0;
    for (let value of Object.values(obj)) {
      result += value;
    };

    return "lost: " + result;
  }

  let popups = [];
  for (const [date, times] of Object.entries(resp)) {
    for (const [time, value] of Object.entries(times)) {
      const newElement = newPopupLosses();
      newElement.querySelector(".time-of-day").innerText = time;
      newElement.querySelector(".popup-losses_lost-time").innerText = value;
      newElement.querySelector(".date").innerText = date; // assign here
      newElement.querySelector(".lost-in-day").innerText = evaluateDayLostTime(times);
      newElement.classList.remove("hidden");
      newElement.querySelector(".dropdown-arrow_container").addEventListener("click", handleDropdwonArrowClick);
      popups.push(newElement);
    };
  };

};
xhr.onerror = () => {
  console.error(xhr.error);
};


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
let lossesState = false; // true for opened


function lossesImgClick() {
  const childElements = Array.from(lossesDivChild.children);
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
    lossesImg.style.transform = "translateX(0)";
  }
}


// losses book content
// first for styles. handle dropdown arrow click
let arrowState = false // true for opened info.
const moreInfo = document.querySelector(".more-info");
const lossSomeLine = document.querySelector(".loss_some-line");
const lostInDay = document.querySelector(".lost-in-day");
function handleDropdwonArrowClick() {
  arrowState = !arrowState;
  const targetHeight = parseFloat(getComputedStyle(moreInfo).height)-5;
  const dropDownArrow = this.querySelector('.dropdown-arrow');
  console.log(dropDownArrow);
  
  if (arrowState) {
    dropDownArrow.classList.add("open");
    lostInDay.style.paddingBottom = targetHeight+15+"px";
    setTimeout(() => {
      // lostInDay.style.transition = "padding-bottom 0s ease";
      // lostInDay.style.paddingBottom = 0+"px";
      moreInfo.style.visibility = "visible";
      moreInfo.style.opacity = "1"
      // animation of line
      let lossSomeLineHeight = 0;
      let lineAnimationInterval = setInterval(() => {
        if (lossSomeLineHeight < targetHeight) {
          lossSomeLineHeight+=10;
          lossSomeLine.style.height = lossSomeLineHeight+"px";
        } else {
          clearInterval(lineAnimationInterval);
        }
      }, 1);
    }, 100);
  } else {
    dropDownArrow.classList.remove("open");
    lostInDay.style.transition = "padding-bottom 0.1s ease";
    moreInfo.style.opacity = "0";
    setTimeout(() => {
      moreInfo.style.visibility = "hidden";
      lostInDay.style.paddingBottom = targetHeight+15+"px";
      setTimeout(() => {
        // lossSomeLine.style.height = "0px";
        lostInDay.style.paddingBottom = 0+"px";
      }, 100);
    }, 100);
  }
};

// closing cross for mobile
function closeCross() {
  lossesImgClick();
}