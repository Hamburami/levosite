

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
    const headerh1 = event.target.closest("header h1");

    if (!link && !section && !footer && !headerh1 && !event.target.classList.contains('ui')) {
        newSticker(event.pageX, event.pageY);
    }
});



const videoButtons = document.getElementsByClassName("video-button");
const videoContainer = document.getElementById("video-content");

function selectVideo (event) {
    console.log("Video selected");
    
    const clickedButton = event.currentTarget;
    const videoUrl = clickedButton.getAttribute("href");
    const buttonImg = clickedButton.querySelector("img");
    const videoTitle = clickedButton.querySelector("p");
    
    // Animate the image inside the clicked button
    if (buttonImg) {
        buttonImg.style.transition = "transform 0.2s";
        buttonImg.style.transform = "rotate(360deg) translate(0, -10px) scale(1.18)";
        videoTitle.style.transition = "transform 0.2s";
        videoTitle.style.transform = "scale(1.2)";
        clickedButton.style.transition = "filter 0.5s";
        clickedButton.style.filter = "brightness(120%)";
    }
    
    // Wait for animation to complete before clearing
    setTimeout(() => {
        videoContainer.innerHTML = "";
        
        // Create close button
        const closeButton = document.createElement("div");
        closeButton.classList.add("ui");
        closeButton.textContent = "✕";
        closeButton.style.position = "absolute";
        closeButton.style.top = "10px";
        closeButton.style.right = "15px";
        closeButton.style.color = "var(--primary)";
        closeButton.style.fontSize = "2rem";
        closeButton.style.cursor = "pointer";
        closeButton.style.zIndex = "10";
        closeButton.addEventListener("click", videoMenu);
        
        const videoFrame = document.createElement("iframe");
        videoFrame.src = videoUrl + "?autoplay=1";
        videoFrame.width = "95%";
        videoFrame.height = "350px";
        videoFrame.setAttribute("frameborder", "0");
        videoFrame.allow = "autoplay; picture-in-picture";
        videoFrame.allowFullscreen = true;
        videoFrame.setAttribute("autoplay", "1");

        videoContainer.appendChild(closeButton);
        videoContainer.appendChild(videoFrame);
        videoContainer.style.position = "relative";
        videoContainer.classList.remove("otd-section__container--video-menu");
        videoContainer.classList.add("otd-section__container--video-player");
    }, 500);
}

for (let i = 0; i < videoButtons.length; i++) {
    videoButtons[i].addEventListener("click", selectVideo);
}


function videoMenu() {
    videoContainer.innerHTML = `
        <div class="video-button" href="https://www.youtube.com/embed/vxqhaIh028Q">
            <img class="video-button__thumbnail" src="img/thumbnails/passing-time-close.jpeg">
            <p class="video-button__title">Passing Time</p>
        </div>
        <div class="video-button" href="https://www.youtube.com/embed/2DR-yxMZxwI">
            <img class="video-button__thumbnail" src="img/thumbnails/on-the-dot-in-a-hole-small.jpeg">
            <p class="video-button__title">Borghese</p>
        </div>
        <div class="video-button" href="https://www.youtube.com/embed/-vRtMaZXPds">
            <img class="video-button__thumbnail" src="img/thumbnails/calder-throwing-rocks.jpeg">
            <p class="video-button__title">Throwing Rocks</p>
        </div>
    `;
    
    videoContainer.classList.remove("otd-section__container--video-player");
    videoContainer.classList.add("otd-section__container--video-menu");
    
    // Re-attach click listeners to the buttons
    const newButtons = videoContainer.getElementsByClassName("video-button");
    for (let i = 0; i < newButtons.length; i++) {
        newButtons[i].addEventListener("click", selectVideo);
    }
}

