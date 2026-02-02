const video = document.getElementById('video');
const liveCanvas = document.getElementById('liveCanvas');
const liveCtx = liveCanvas.getContext('2d');
const finalCanvas = document.getElementById('canvas');
const filterSelect = document.getElementById('filterSelect');
const countdownDisplay = document.getElementById('countdown-display');

const cameraArea = document.getElementById('camera-area');
const previewArea = document.getElementById('preview-area');
const actionBtn = document.getElementById('actionBtn');
const deleteBtn = document.getElementById('deleteBtn');

// 1. Kamera Init
navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 960 } })
    .then(stream => { 
        video.srcObject = stream; 
        video.onloadedmetadata = () => { drawLive(); };
    });

// 2. Live Preview Logic (Mirror & Filters)
function drawLive() {
    const mode = filterSelect.value;
    const w = 1280, h = 960;
    liveCanvas.width = w; liveCanvas.height = h;
    liveCtx.filter = getFilterString(mode);
    
    const halfW = w / 2, halfH = h / 2;
    function drawSection(dx, dy, dw, dh, fx, fy) {
        liveCtx.save();
        liveCtx.translate(dx + (fx ? dw : 0), dy + (fy ? dh : 0));
        liveCtx.scale(fx ? -1 : 1, fy ? -1 : 1);
        liveCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, dw, dh);
        liveCtx.restore();
    }

    if (mode === 'left-mirror') {
        drawSection(0, 0, halfW, h, false, false);
        drawSection(halfW, 0, halfW, h, true, false);
    } else if (mode === 'right-mirror') {
        drawSection(0, 0, halfW, h, true, false);
        drawSection(halfW, 0, halfW, h, false, false);
    } else if (mode === 'top-mirror') {
        drawSection(0, 0, w, halfH, false, false);
        drawSection(0, halfH, w, halfH, false, true);
    } else if (mode === 'quad-mirror') {
        drawSection(0, 0, halfW, halfH, false, false);      
        drawSection(halfW, 0, halfW, halfH, true, false);   
        drawSection(0, halfH, halfW, halfH, false, true);   
        drawSection(halfW, halfH, halfW, halfH, true, true);
    } else if (mode === 'upside-down') {
        drawSection(0, 0, w, h, true, true);
    } else {
        drawSection(0, 0, w, h, true, false);
    }
    requestAnimationFrame(drawLive);
}

// 3. Filter Warna (Fixed Coffin & Solarize)
function getFilterString(f) {
    const filters = {
        noir: 'grayscale(100%) contrast(150%)',
        coffin: 'grayscale(100%) brightness(65%) contrast(160%)',
        blood: 'sepia(100%) saturate(600%) hue-rotate(-50deg)',
        ghost: 'invert(100%) contrast(120%)',
        demon: 'grayscale(100%) contrast(250%) sepia(100%) saturate(500%)',
        voodoo: 'sepia(100%) hue-rotate(60deg) brightness(70%)',
        hollywood: 'contrast(120%) saturate(130%) hue-rotate(-20deg)',
        western: 'sepia(60%) contrast(110%)',
        slasher: 'contrast(150%) saturate(150%) brightness(80%)',
        'silent-film': 'grayscale(100%) contrast(150%) sepia(30%)',
        cyber: 'hue-rotate(300deg) saturate(200%)',
        matrix: 'sepia(100%) hue-rotate(80deg) brightness(80%)',
        thermal: 'invert(100%) hue-rotate(240deg) saturate(400%)',
        vintage: 'sepia(50%) contrast(120%)',
        polaroid: 'sepia(20%) contrast(90%)',
        vaporwave: 'hue-rotate(260deg) saturate(200%)',
        solar: 'invert(100%) hue-rotate(180deg) brightness(1.2) contrast(1.2)',
        acid: 'hue-rotate(90deg) saturate(500%)',
        radioactive: 'grayscale(100%) sepia(100%) saturate(1000%)',
        xray: 'grayscale(100%) invert(100%)'
    };
    return filters[f] || 'none';
}

// 4. Snap & Capture
document.getElementById('snap').onclick = () => {
    if (document.getElementById('useTimer').checked) {
        let count = 3;
        countdownDisplay.style.display = 'block';
        let timer = setInterval(() => {
            countdownDisplay.innerText = count;
            if (count-- <= 0) { clearInterval(timer); countdownDisplay.style.display = 'none'; capture(); }
        }, 1000);
    } else { capture(); }
};

function capture() {
    const flashEl = document.getElementById('flash');
    if (document.getElementById('useFlash').checked) {
        flashEl.classList.add('flash-active');
        setTimeout(() => { executeCapture(true); }, 500);
        setTimeout(() => { flashEl.classList.remove('flash-active'); }, 2500);
    } else { executeCapture(false); }
}

function executeCapture(boost) {
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = 1280; finalCanvas.height = 960;
    finalCtx.save();
    if (boost) finalCtx.filter = 'brightness(1.2) contrast(1.1)';
    finalCtx.drawImage(liveCanvas, 0, 0);
    finalCtx.restore();

    // Reset tombol ke mode Save
    actionBtn.innerText = "SAVE / DOWNLOAD";
    actionBtn.onclick = handleSave;
    deleteBtn.style.display = "inline-block";

    cameraArea.style.display = 'none';
    previewArea.style.display = 'block';
}

// 5. Handle Save & Back
function handleSave() {
    const link = document.createElement('a');
    link.download = 'gothic-cam.png';
    link.href = finalCanvas.toDataURL('image/png');
    link.click();

    // Setelah klik Save, tombol berubah jadi Back
    actionBtn.innerText = "BACK TO CAMERA";
    actionBtn.onclick = handleBack;
    // Sembunyikan tombol delete karena foto sudah disimpan
    deleteBtn.style.display = "none";
}

function handleBack() {
    previewArea.style.display = 'none';
    cameraArea.style.display = 'block';
}

deleteBtn.onclick = handleBack;
