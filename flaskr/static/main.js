"use strict";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const username = getCookie("username");
console.log(username);

const popupRegister = document.querySelector(".popup-register");

if (!username) {
  popupRegister.classList.remove("hidden");
}

// background
const randomizedNumber = Math.float(Math.random(0, 3));
const backgroundPhotosList = [
  "../static/images/1.jpg",
  "../static/image/2.jpg",
  "../static/image/3.jpg"
]

doocument.body.style.backgroundImage = `url("${backgroundPhotosList[randomizedNumber]}")`