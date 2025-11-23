// We can call it the same beacuse why would we have a pc version function? And whatever. The one which will work is this one.
// And it's actually using variables that are defined in the main.js. So it's kinda like 1 file.
function lossesImgClick() {
  lossesState = !lossesState;
  childElements.forEach(el => {el.style.transform = "translateX(-100%)"})
  
  if (lossesState) {
    lossesDiv.style.transform = "translateY(0)";
    lossesImg.style.transform = "translateY(450px)";


    childElements.forEach((el, i) => {
      el.style.transition = "transform 0.5s ease";
      setTimeout(() => {
        el.style.transform = "translateY(0)";
      }, i * 80);
    });

  } else {
    lossesDiv.style.transform = "translateY(-100%)";
    lossesImg.style.transform = "translateY(0)";
  }
}