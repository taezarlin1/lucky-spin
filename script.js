function randomColor(){
    r = Math.floor(Math.random() * 255);
    g = Math.floor(Math.random() * 255);
    b = Math.floor(Math.random() * 255);
    return {r,g,b}
}
function toRad(deg){
    return deg * (Math.PI / 180.0);
}
function randomRange(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}
// get percent between 2 number
function getPercent(input,min,max){
    return (((input - min) * 100) / (max - min))/100
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const width = document.getElementById("canvas").width
const height = document.getElementById("canvas").height

const centerX = width/2
const centerY = height/2
const radius = width/2


let excelData = []; // Store Excel data
// Load data when page opens
loadSavedData();
// Load saved data from Local Storage (if available)
function loadSavedData() {
    const savedData = localStorage.getItem("excelData");
    if (savedData) {
        excelData = JSON.parse(savedData);
    }
}
// Read Excel File
document.getElementById('uploadExcel').addEventListener('change', function (event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });

        let sheetName = workbook.SheetNames[0]; // Get first sheet
        let sheet = workbook.Sheets[sheetName];

        excelData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
        saveData(); // Save to Local Storage
    };

    reader.readAsArrayBuffer(file);
});

// Save Data to Local Storage
function saveData() {
    localStorage.setItem("excelData", JSON.stringify(excelData));
}

let currentDeg = 0
let step = 360/excelData.length
let colors = []
let itemDegs = {}
let recievedItem = "";

for(let i = 0 ; i < excelData.length + 1;i++){
    colors.push(randomColor())
}

function createWheel(){
    // items = document.getElementsByTagName("textarea")[0].value.split("\n");
    step = 360/excelData.length
    colors = []
    for(let i = 0 ; i < excelData.length + 1;i++){
        colors.push(randomColor())
    }
    draw()
}
draw()

function draw(){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, toRad(0), toRad(360))
    ctx.fillStyle = `rgb(${33},${33},${33})`
    ctx.lineTo(centerX, centerY);
    ctx.fill()

    let startDeg = currentDeg;
    for(let i = 0 ; i < excelData.length; i++, startDeg += step){
        let endDeg = startDeg + step

        color = colors[i]
        let colorStyle = `rgb(${color.r},${color.g},${color.b})`

        ctx.beginPath();
        rad = toRad(360/step);
        ctx.arc(centerX, centerY, radius - 2, toRad(startDeg), toRad(endDeg))
        let colorStyle2 = `rgb(${color.r - 30},${color.g - 30},${color.b - 30})`
        ctx.fillStyle = colorStyle2
        ctx.lineTo(centerX, centerY);
        ctx.fill()

        ctx.beginPath();
        rad = toRad(360/step);
        ctx.arc(centerX, centerY, radius - 30, toRad(startDeg), toRad(endDeg))
        ctx.fillStyle = colorStyle
        ctx.lineTo(centerX, centerY);
        ctx.fill()

        // draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(toRad((startDeg + endDeg)/2));
        ctx.textAlign = "center";
        if(color.r > 150 || color.g > 150 || color.b > 150){
            ctx.fillStyle = "#000";
        }
        else{
            ctx.fillStyle = "#fff";
        }
        ctx.font = 'bold 24px Pyidaungsu';
        ctx.fillText(excelData[i].name, 270, 10);  // text places
        ctx.restore();

        // check winner
        if( startDeg%360 > 90 &&  endDeg % 360 < 90 ){
                
            document.getElementById("selectedItem").textContent = excelData[i].name
            recievedItem = excelData[i].name
            
            // setTimeout(function(){
            //     // applause.play();
            //     document.getElementById("customModal").style.display = "flex";
            // }, 6000)
            
        } 

        // if (excelData.length > 2){
        //     // check winner
        //     if(startDeg%360 < 360 && startDeg%360 > 270  && endDeg % 360 > 0 && endDeg%360 < 90 ){
                
        //         document.getElementById("selectedItem").textContent = excelData[i].name
        //         recievedItem = excelData[i].name
                
        //     } 
        // } else {
        //     if(!(startDeg%360 < 180 &&  endDeg % 360 > 0 )){
                
        //         document.getElementById("selectedItem").textContent = excelData[i].name
        //         recievedItem = excelData[i].name
                
        //     } 
        // }
        
    }
}


let speed = 0
let maxRotation = randomRange(360* 3, 360 * 6)
let pause = false
function animate(){
    
    if(pause){
        return
    }
    speed = easeOutSine(getPercent(currentDeg ,maxRotation ,0)) * 20
    if(speed < 0.01){
        speed = 0
        pause = true
        document.getElementById("customModal").style.display = "flex";
        applause.play();
    }
    currentDeg += speed
    // console.log(`Animation going at ${currentDeg} degree`)
    // wheel.play();
    draw()
    window.requestAnimationFrame(animate);
}

function spin(){
    if(speed != 0){
        return
    }
    wheel.play();
    // maxRotation = 0;
    currentDeg = 0
    maxRotation = randomRange(360*3, 360*6)
    createWheel()
    draw();
    pause = false
    window.requestAnimationFrame(animate);
    
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

function recieveModal() {
    excelData = excelData.filter(data => data.name !== recievedItem); // Remove row
    document.getElementById("customModal").style.display = "none";
    localStorage.setItem("excelData", JSON.stringify(excelData));
    createWheel()
    draw();
}