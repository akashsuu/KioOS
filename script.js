javascript
// KioOS
// simple desktop system

const password = "1234";

let activeWindow = null;
let highestZ = 10;


// -------------------------
// STARTUP
// -------------------------

window.addEventListener("load", function () {

    const bootScreen = document.getElementById("boot-screen");
    const loginScreen = document.getElementById("login-screen");
    const desktop = document.getElementById("desktop");

    console.log("KioOS: system loaded");

    // Hide desktop while booting
    desktop.style.display = "none";
    loginScreen.style.display = "none";
    bootScreen.style.display = "flex";

    // Finish boot after 2 seconds
    setTimeout(function () {

        console.log("KioOS: boot complete");

        bootScreen.style.display = "none";
        loginScreen.style.display = "flex";

        const password = document.getElementById("password");

        if (password) {
            password.focus();
        }

    }, 2000);

});


// -------------------------
// LOGIN
// -------------------------

document.getElementById("login-button").addEventListener("click", login);

document.getElementById("password").addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        login();
    }

});


function login() {

    const input = document.getElementById("password");
    const error = document.getElementById("login-error");

    if (input.value === password) {

        error.textContent = "";

        document.getElementById("login-screen").style.display = "none";
        document.getElementById("desktop").style.display = "block";

        input.value = "";

    } else {

        error.textContent = "WRONG PASSWORD";

        input.value = "";
        input.focus();

    }

}


// -------------------------
// OPEN APPLICATIONS
// -------------------------

const appWindows = {

    files: "files-window",
    terminal: "terminal-window",
    browser: "browser-window",
    notes: "notes-window",
    calculator: "calculator-window",
    settings: "settings-window"

};


document.querySelectorAll("[data-app]").forEach(function (element) {

    element.addEventListener("dblclick", function () {

        openApp(element.dataset.app);

    });

});


function openApp(appName) {

    const windowId = appWindows[appName];

    if (!windowId) {
        return;
    }

    const windowElement = document.getElementById(windowId);

    windowElement.style.display = "block";

    highestZ++;
    windowElement.style.zIndex = highestZ;

    activeWindow = windowElement;

    addTaskbarApp(appName);

}


// -------------------------
// START MENU
// -------------------------

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");


startButton.addEventListener("click", function () {

    if (startMenu.style.display === "block") {

        startMenu.style.display = "none";

    } else {

        startMenu.style.display = "block";

    }

});


document.querySelectorAll("#start-menu [data-app]").forEach(function (button) {

    button.addEventListener("click", function () {

        openApp(button.dataset.app);

        startMenu.style.display = "none";

    });

});


// -------------------------
// WINDOW BUTTONS
// -------------------------

document.querySelectorAll(".window").forEach(function (windowElement) {

    const buttons =
        windowElement.querySelectorAll(".window-buttons button");

    // minimize
    buttons[0].addEventListener("click", function () {

        windowElement.style.display = "none";

    });


    // maximize
    buttons[1].addEventListener("click", function () {

        if (windowElement.classList.contains("maximized")) {

            windowElement.classList.remove("maximized");

        } else {

            windowElement.classList.add("maximized");

        }

    });


    // close
    buttons[2].addEventListener("click", function () {

        windowElement.style.display = "none";

        removeTaskbarApp(windowElement.id);

    });


    // click window to bring it forward
    windowElement.addEventListener("mousedown", function () {

        highestZ++;

        windowElement.style.zIndex = highestZ;

        activeWindow = windowElement;

    });

});


// -------------------------
// TASKBAR
// -------------------------

function addTaskbarApp(appName) {

    const windowId = appWindows[appName];

    if (document.querySelector(
        '[data-task="' + windowId + '"]'
    )) {
        return;
    }


    const button = document.createElement("button");

    button.className = "taskbar-app";

    button.dataset.task = windowId;

    button.textContent = appName.toUpperCase();


    button.addEventListener("click", function () {

        const windowElement =
            document.getElementById(windowId);


        if (windowElement.style.display === "none") {

            windowElement.style.display = "block";

            highestZ++;
            windowElement.style.zIndex = highestZ;

        } else {

            windowElement.style.display = "none";

        }

    });


    document
        .getElementById("taskbar-apps")
        .appendChild(button);

}


function removeTaskbarApp(windowId) {

    const button =
        document.querySelector(
            '[data-task="' + windowId + '"]'
        );

    if (button) {
        button.remove();
    }

}


// -------------------------
// MAKE WINDOWS DRAGGABLE
// -------------------------

document.querySelectorAll(".window").forEach(function (windowElement) {

    const titleBar =
        windowElement.querySelector(".window-title");

    let dragging = false;

    let mouseX = 0;
    let mouseY = 0;


    titleBar.addEventListener("mousedown", function (event) {

        // Don't drag when clicking buttons
        if (event.target.tagName === "BUTTON") {
            return;
        }

        if (windowElement.classList.contains("maximized")) {
            return;
        }


        dragging = true;

        mouseX =
            event.clientX - windowElement.offsetLeft;

        mouseY =
            event.clientY - windowElement.offsetTop;


        highestZ++;

        windowElement.style.zIndex = highestZ;

    });


    document.addEventListener("mousemove", function (event) {

        if (!dragging) {
            return;
        }


        let newX =
            event.clientX - mouseX;

        let newY =
            event.clientY - mouseY;


        // Keep window inside the screen

        if (newX < 0) {
            newX = 0;
        }

        if (newY < 0) {
            newY = 0;
        }


        const maxX =
            window.innerWidth - windowElement.offsetWidth;

        const maxY =
            window.innerHeight - 60 -
            windowElement.offsetHeight;


        if (newX > maxX) {
            newX = maxX;
        }

        if (newY > maxY) {
            newY = maxY;
        }


        windowElement.style.left = newX + "px";
        windowElement.style.top = newY + "px";

    });


    document.addEventListener("mouseup", function () {

        dragging = false;

    });

});


// -------------------------
// CLOCK
// -------------------------

function updateClock() {

    const clock =
        document.getElementById("clock");

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();


    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }


    clock.textContent =
        hours + ":" + minutes;

}


updateClock();

setInterval(updateClock, 1000);


// -------------------------
// TERMINAL
// -------------------------

const terminalInput =
    document.getElementById("terminal-input");

const terminalOutput =
    document.getElementById("terminal-output");


terminalInput.addEventListener("keydown", function (event) {

    if (event.key !== "Enter") {
        return;
    }


    const command =
        terminalInput.value.trim().toLowerCase();


    if (command === "") {
        return;
    }


    printTerminal(
        "AKASH@KIOOS> " + command
    );


    runCommand(command);


    terminalInput.value = "";

});


function printTerminal(text) {

    const line =
        document.createElement("div");

    line.textContent = text;

    terminalOutput.appendChild(line);

}


function runCommand(command) {

    if (command === "help") {

        printTerminal("");
        printTerminal("AVAILABLE COMMANDS");
        printTerminal("------------------");
        printTerminal("help");
        printTerminal("clear");
        printTerminal("date");
        printTerminal("time");
        printTerminal("whoami");
        printTerminal("version");
        printTerminal("about");
        printTerminal("ls");

    }


    else if (command === "clear") {

        terminalOutput.innerHTML = "";

    }


    else if (command === "date") {

        printTerminal(
            new Date().toDateString()
        );

    }


    else if (command === "time") {

        printTerminal(
            new Date().toLocaleTimeString()
        );

    }


    else if (command === "whoami") {

        printTerminal("AKASH");

    }


    else if (command === "version") {

        printTerminal("KioOS v0.1");

    }


    else if (command === "about") {

        printTerminal("KioOS personal web operating system.");
        printTerminal("Built with HTML, CSS and JavaScript.");

    }


    else if (command === "ls") {

        printTerminal("DOCUMENTS/");
        printTerminal("PICTURES/");
        printTerminal("DOWNLOADS/");
        printTerminal("README.TXT");

    }


    else {

        printTerminal(
            "COMMAND NOT FOUND: " + command
        );

    }

}


// -------------------------
// NOTES
// -------------------------

const notesArea =
    document.getElementById("notes-area");


notesArea.value =
    localStorage.getItem("kioos-notes") || "";


notesArea.addEventListener("input", function () {

    localStorage.setItem(
        "kioos-notes",
        notesArea.value
    );

});


// -------------------------
// CALCULATOR
// -------------------------

const calculatorDisplay =
    document.getElementById("calculator-display");

const calculatorButtons =
    document.querySelectorAll(
        ".calculator-buttons button"
    );


calculatorButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const value = button.textContent;


        if (value === "C") {

            calculatorDisplay.value = "";

        }


        else if (value === "=") {

            calculateResult();

        }


        else {

            calculatorDisplay.value += value;

        }

    });

});


function calculateResult() {

    const expression =
        calculatorDisplay.value;


    if (!expression) {
        return;
    }


    // Only allow calculator characters
    if (!/^[0-9+\-*/. ]+$/.test(expression)) {

        calculatorDisplay.value = "ERROR";

        return;

    }


    try {

        calculatorDisplay.value =
            Function(
                "return " + expression
            )();

    }

    catch {

        calculatorDisplay.value = "ERROR";

    }

}


// -------------------------
// BROWSER
// -------------------------

const address =
    document.getElementById("address");


const browserPage =
    document.querySelector(".browser-page");


document.querySelector(
    ".address-bar button:last-child"
).addEventListener("click", function () {

    openWebsite();

});


address.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        openWebsite();

    }

});


function openWebsite() {

    let url = address.value.trim();


    if (!url) {
        return;
    }


    if (!url.startsWith("http://") &&
        !url.startsWith("https://")) {

        url = "https://" + url;

    }


    browserPage.innerHTML =
        "Opening " + url + "...";


    // Open website in a new browser tab.
    // Many websites don't allow iframe embedding.

    window.open(url, "_blank");

}


// -------------------------
// ESC KEY
// -------------------------

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        startMenu.style.display = "none";

    }

});