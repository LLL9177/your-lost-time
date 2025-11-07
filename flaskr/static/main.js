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
