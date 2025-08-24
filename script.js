const showsElem = document.getElementById("shows");
const showsTitle = document.getElementById("shows-title-nav");

const musicElem = document.getElementById("music");
const musicTitle = document.getElementById("music-title-nav");

const socialElem = document.getElementById("social");
const socialTitle = document.getElementById("social-title-nav");

let isVertical = false;


class section {
    constructor(title, content) {
        this.title = title;
        this.content = content;
        this.display = content.style.display;
    }

     show() {
        this.content.style.display = this.display;
        this.title.classList.remove("state-disabled");
        this.title.classList.add("state-enabled");
    }

    hide() {
        this.content.style.display = "none";
        this.title.classList.remove("state-enabled");
        this.title.classList.add("state-disabled");
    }

    collapse() {
        if (this.content.style.display === "none") {
            this.show();
        } else {
            this.hide();
        }
    }

}

const showsSection = new section(showsTitle, showsElem);
const musicSection = new section(musicTitle, musicElem);
const socialSection = new section(socialTitle, socialElem);


showsTitle.addEventListener("click", () => {
    showsSection.show();
    musicSection.hide();
    socialSection.hide();
});

musicTitle.addEventListener("click", () => {
    showsSection.hide();
    musicSection.show();
    socialSection.hide();
});

socialTitle.addEventListener("click", () => {
    showsSection.hide();
    musicSection.hide();
    socialSection.show();
});


function determineWindowSize(x) {
    if (x.matches && !isVertical) {
        musicSection.show();
        showsSection.hide();
        socialSection.hide();
    }
    isVertical = x.matches;
    if (isVertical) {
        // Do something for vertical layout
    } else {
        socialSection.show();
        showsSection.show();
        musicSection.show();
    }
}

let x = window.matchMedia("(max-width: 1095px)");

x.addEventListener("change", function() {
  determineWindowSize(x);
});

determineWindowSize(x); //Run this once when the page is loaded

