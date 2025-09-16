const stickerPreload = new Image();
stickerPreload.src = "img/on-the-dot-sticker.png";


const fishImage = document.createElement("img");
fishImage.src = "img/fishonabike.png";
document.body.appendChild(fishImage);

fishImage.style.position = "absolute";
fishImage.style.width = "66px";
fishImage.style.top = "105px";
fishImage.classList.add('invisible-ink');

let progress = 0;
let increment = 0.5;


fishImage.addEventListener('click', (event) => {
    event.stopPropagation();
    setInterval(moveFish, 1);
    fishImage.classList.remove('invisible-ink');
});

function moveFish() {

    if (parseFloat(fishImage.style.left, 10) >= window.innerWidth - parseInt(fishImage.style.width, 10)) {
        increment = -0.5;
        fishImage.style.transform = "rotateY(180deg)";
    }
    if (parseFloat(fishImage.style.left, 10) <= 0) {
        increment = 0.5;
        fishImage.style.transform = "none";
    }
    fishImage.style.left = progress + "px";
    progress += increment;
}




function newSticker(x, y) {
    const sticker = document.createElement("img");
    sticker.src = "img/on-the-dot-sticker.png";
    document.body.appendChild(sticker);

    sticker.style.zIndex = "-1";
    sticker.style.position = "absolute";
    sticker.style.transformOrigin = "center";
    sticker.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 180 - 90}deg)`;
    sticker.style.width = "60px";
    sticker.style.left = x + "px";
    sticker.style.top = y + "px";
}


document.addEventListener("click", function(event) {
    const link = event.target.closest("a");
    const section = event.target.closest("section");
    const footer = event.target.closest("footer");

    if (!link && !section && !footer) {
        newSticker(event.pageX, event.pageY);
    }
});