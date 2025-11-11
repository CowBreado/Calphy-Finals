const docUrl = "https://docs.google.com/document/d/e/2PACX-1vQY24NdsAlkXJuF07SylkH26g8ZkPkFrDR-vUPlasaL--MvqYBSrVujJZGpfV9H4fNTtcIggM0qj4it/pub";

const triviaText = document.getElementById("triviaText");
const triviaImage = document.getElementById("triviaImage");
const moreTriviabtn = document.getElementById("moreTriviabtn");

let triviaList = [];
let imageList = [];
let shown = [];

fetch(docUrl)
  .then(response => response.text())
  .then(html => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = new DOMParser().parseFromString(html, "text/html").querySelector(".doc-content").innerText;

    triviaList = [...text.matchAll(/\{\s*["“”]([\s\S]*?)["“”]\s*\}/g)].map(m => m[1].trim());
    imageList = [...doc.querySelectorAll("img")].map(img => img.src);

    showNextTrivia();
  }).catch(error => console.error("Error loading document:", error));

function showNextTrivia() {
  if (shown.length == triviaList.length) shown = [];

  let index;
  do {
    index = Math.floor(Math.random() * triviaList.length);
  } while (shown.includes(index));

  shown.push(index);

  triviaText.classList.add("opacity-0");
  triviaImage.classList.add("opacity-0");

  setTimeout(() => {
    triviaText.textContent = triviaList[index];
    triviaImage.src = imageList[index];

    triviaText.classList.remove("opacity-0");
    triviaImage.classList.remove("opacity-0");
  }, 600);

  // remove comment to add time interval
  //setInterval(showNextTrivia, 18000);
}

moreTriviabtn.addEventListener("click", showNextTrivia);
