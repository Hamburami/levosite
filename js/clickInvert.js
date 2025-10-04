var root = document.querySelector(':root');
var darkMode = false;
const fly = document.getElementById('fly');

addEventListener("click", (event) => { 
    if (darkMode) {
        document.documentElement.style.cssText = "--primary-text: rgb(122, 34, 28); --time-color: rgb(255,255,255)";
        fly.style.filter = 'invert(0)';
        darkMode = false;
    } else {
        document.documentElement.style.cssText =  "--primary-text: rgb(20, 202, 202); --time-color: rgb(0,0,0)";
        //document.body.style.backgroundColor = 'var(--time-color)';
        fly.style.filter = 'invert(1)';
        darkMode = true;
    }
})

