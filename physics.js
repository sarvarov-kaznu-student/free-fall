const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');

// Set a fixed scale of 8 pixels per meter
let pixelsPerMeter = 8;

// Define translations for English, Kazakh, and Russian
const translations = {
    en: {
        title: "Physics in Action: Free Fall",
        gravityLabel: "Gravity (m/s²):",
        start: "Start",
        reset: "Reset",
        language: "Language:"
    },
    kk: {
        title: "Физика іс жүзінде: Еркін құлау",
        gravityLabel: "Гравитация (м/с²):",
        start: "Бастау",
        reset: "Қалпына келтіру",
        language: "Тіл:"
    },
    ru: {
        title: "Физика в действии: Свободное падение",
        gravityLabel: "Гравитация (м/с²):",
        start: "Старт",
        reset: "Сброс",
        language: "Язык:"
    }
};

let currentLanguage = "en";

// Function to update UI text dynamically
function setLanguage(language) {
    currentLanguage = language;

    // Update HTML elements
    document.getElementById("gravity").previousElementSibling.textContent =
        translations[language].gravityLabel;
    document.querySelector("button:first-of-type").textContent =
        translations[language].start;
    document.querySelector("button:last-of-type").textContent =
        translations[language].reset;
    document.querySelector("label[for='language']").textContent =
        translations[language].language;

    // Redraw canvas title
    drawTitle();
}

// Function to draw the title on the canvas
function drawTitle() {
    ctx.clearRect(0, 0, canvas.width, 50);
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#007BFF";
    ctx.textAlign = "center";
    ctx.fillText(translations[currentLanguage].title, canvas.width / 2, 40);
}

// Set canvas dimensions dynamically
function resizeCanvas() {
    const width = Math.min(window.innerWidth * 0.8, 1500); // 80% of screen width, max 1500px
    const height = Math.min(window.innerHeight * 0.9, 1500); // 90% of screen height, max 1500px
    canvas.width = width;
    canvas.height = height;
    ball.radius = 1 * pixelsPerMeter; // Ball radius representing 1 meter
    ball.x = canvas.width / 2; // Center the ball horizontally
    ball.y = canvas.height * 0.1 + ball.radius; // Start slightly lower (10% of canvas height + radius)
    updateGround();
    drawBall();
}

// Ball properties
let ball = {
    x: 0,
    y: 0,
    radius: 0,
    color: "blue",
    time: 0,
    acceleration: 9.8,
    shadows: []
};

// Ground level
let ground = 0;

// Update ground dynamically when resizing
function updateGround() {
    ground = canvas.height - ball.radius;
}

// Function to draw the ball
function drawBall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawTitle();
    drawShadows();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Function to draw the ground
function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, ground, canvas.width, canvas.height - ground);
}

// Function to draw shadows for each second
function drawShadows() {
    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
    ball.shadows.forEach((shadow) => {
        ctx.beginPath();
        ctx.arc(shadow.x, shadow.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText(
            `${shadow.time}s, ${(shadow.distance / pixelsPerMeter).toFixed(1)}m`,
            shadow.x + ball.radius + 20,
            shadow.y + 5
        );
    });
}

// Simulation state
let isSimulationRunning = false;
let lastShadowTime = 0;
let lastTimestamp = 0;

// Function to start the simulation
function startSimulation() {
    const gravityInput = parseFloat(document.getElementById("gravity").value);
    if (isNaN(gravityInput) || gravityInput <= 0) {
        alert("Please enter a valid positive number for gravity.");
        return;
    }
    ball.acceleration = gravityInput;
    isSimulationRunning = true;
    ball.time = 0;
    ball.shadows = [{ x: ball.x, y: ball.y, time: 0, distance: 0 }];
    lastShadowTime = 0;
    lastTimestamp = performance.now();
    requestAnimationFrame(update);
}

// Function to reset the simulation
function resetSimulation() {
    isSimulationRunning = false;
    ball.time = 0;
    ball.y = canvas.height * 0.1 + ball.radius;
    ball.shadows = [{ x: ball.x, y: ball.y, time: 0, distance: 0 }];
    drawBall();
}

// Function to update the simulation
function update(timestamp) {
    if (!isSimulationRunning) return;

    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    ball.time += deltaTime;
    const displacement =
        0.5 * ball.acceleration * Math.pow(ball.time, 2) * pixelsPerMeter;
    ball.y = canvas.height * 0.1 + ball.radius + displacement;

    if (ball.y + ball.radius >= ground) {
        ball.y = ground - ball.radius;
        isSimulationRunning = false;
    }

    if (Math.floor(ball.time) > lastShadowTime) {
        const shadowDisplacement =
            0.5 * ball.acceleration * Math.pow(lastShadowTime + 1, 2) *
            pixelsPerMeter;
        ball.shadows.push({
            x: ball.x,
            y: canvas.height * 0.1 + ball.radius + shadowDisplacement,
            time: lastShadowTime + 1,
            distance: shadowDisplacement
        });
        lastShadowTime++;
    }

    drawBall();
    requestAnimationFrame(update);
}

// Initialize canvas and listeners
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.onload = () => {
    setLanguage("en");
};


// Make the controls box draggable
const controls = document.getElementById("controls");

// Variables to store the position of the mouse and box
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Mouse down event to start dragging
controls.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - controls.getBoundingClientRect().left;
    offsetY = e.clientY - controls.getBoundingClientRect().top;
    controls.style.cursor = "grabbing";
});

// Mouse move event to reposition the box
document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        controls.style.left = `${e.clientX - offsetX}px`;
        controls.style.top = `${e.clientY - offsetY}px`;
    }
});

// Mouse up event to stop dragging
document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        controls.style.cursor = "grab";
    }
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        // Ensure the box stays within the screen
        const maxLeft = window.innerWidth - controls.offsetWidth;
        const maxTop = window.innerHeight - controls.offsetHeight;

        controls.style.left = `${Math.max(0, Math.min(newX, maxLeft))}px`;
        controls.style.top = `${Math.max(0, Math.min(newY, maxTop))}px`;
    }
});
