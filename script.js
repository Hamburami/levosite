const showsTitle = document.getElementById("shows-title");
const musicTitle = document.getElementById("music-title");
const socialTitle = document.getElementById("social-title");

const showsContent = document.getElementById("shows-content");
const musicContent= document.getElementById("music-content");
const socialContent = document.getElementById("social-content");

class section {
    constructor(title, content) {
        this.title = title;
        this.content = content;
        this.display = content.style.display;
    }

    collapse() {
        console.log(this.title);
        console.log(this.content.style.display === "none");
        console.log(this.display);
        this.content.style.display = this.content.style.display === "none" ? this.display : "none";
    }
}

const showsSection = new section(showsTitle, showsContent);
const musicSection = new section(musicTitle, musicContent);
const socialSection = new section(socialTitle, socialContent);


showsTitle.addEventListener("click", () => {
    showsSection.collapse();
});

musicTitle.addEventListener("click", () => {
    musicSection.collapse();
});

socialTitle.addEventListener("click", () => {
    socialSection.collapse();
});

