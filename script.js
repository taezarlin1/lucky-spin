const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const wheelWrapper = document.getElementById("wheel-wrapper");

let excelData = [];
let currentAngle = 0;
let selectedItem = null;

// Load saved data from Local Storage
function loadSavedData() {
    const savedData = localStorage.getItem("excelData");
    if (savedData) {
        excelData = JSON.parse(savedData);
        // shuffleData();
        drawWheel();
    }
}
loadSavedData();

// Shuffle the data
function shuffleData() {
    for (let i = excelData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [excelData[i], excelData[j]] = [excelData[j], excelData[i]];
    }
    localStorage.setItem("excelData", JSON.stringify(excelData));
    drawWheel();
}

// Read Excel File
document.getElementById('uploadExcel').addEventListener('change', function (event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });

        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];

        excelData = XLSX.utils.sheet_to_json(sheet);
        saveData();
        shuffleData();
        drawWheel();
    };

    reader.readAsArrayBuffer(file);
});

// Save data
function saveData() {
    localStorage.setItem("excelData", JSON.stringify(excelData));
}

// Draw the wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    const step = 360 / excelData.length;

    let startAngle = 0;
    for (let i = 0; i < excelData.length; i++, startAngle += step) {
        let endAngle = startAngle + step;
        let colorstyle = excelData[i].color || `hsl(${Math.random() * 360}, 80%, 60%)`;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius - 2, toRad(startAngle), toRad(endAngle));
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius - 3, toRad(startAngle), toRad(endAngle));
        ctx.fillStyle = colorstyle;
        ctx.fill();
        ctx.stroke();


        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(toRad(startAngle + step / 2));
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.fillText(excelData[i].name, radius * 0.7, 5);
        ctx.restore();
    }
}

// Convert degrees to radians
function toRad(deg) {
    return deg * (Math.PI / 180);
}

let totalRotation = 0;
// Spin the wheel
function spin() {
    
    if (excelData.length === 0) return;

    let fullSpins = 3; // At least 3 full spins
    let extraRotation = Math.floor(Math.random() * 360); // Random stopping position
    console.log(`Rotation: ${extraRotation}`)
    let newRotation = (fullSpins * 360) + extraRotation;
    let spinDuration = Math.random() * 5 + 5.5;
    if (spinDuration >= 7){
        wheel.src = src="assets/wheel7s-VEED.mp3"
        wheel.play();
    } else {
        wheel.src = src="assets/wheel5s-VEED.mp3"
        wheel.play();
    }

    totalRotation += newRotation; // Accumulate rotation

    // console.log(`extraAngle: ${extraRotation}`);
    // console.log(`finalAngle: ${totalRotation}`);
    console.log(`spin duration: ${spinDuration}`);

    wheelWrapper.style.transition = `transform ${spinDuration}s cubic-bezier(0,0,0,1)`;
    wheelWrapper.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        currentAngle = totalRotation  % 360;
        let step = 360 / excelData.length;
        let winningIndex = Math.floor((360 - currentAngle) / step) % excelData.length;
        selectedItem = excelData[winningIndex];

        document.getElementById("selectedItem").textContent = selectedItem.name;
        document.getElementById("customModal").style.display = "block";
        document.getElementById("selectedItem").style.color = selectedItem.color;
        
        // console.log(`Current angle: ${currentAngle}`)
        const count = 200,
        defaults = {
            origin: { y: 0.7 },
        };

        function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
            })
        );
        }

        fire(0.25, {
        spread: 26,
        startVelocity: 55,
        });

        fire(0.2, {
        spread: 60,
        });

        fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        });

        fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        });

        fire(0.1, {
        spread: 120,
        startVelocity: 45,
        });
        applause.play();
    }, spinDuration * 1000);

    // currentAngle = finalAngle;
}

// Close modal
function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

// Remove received item and redraw
function recieveModal() {
    excelData = excelData.filter(item => item.name !== selectedItem.name);
    saveData();
    drawWheel();
    closeModal();
}

