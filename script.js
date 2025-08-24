// ====== Elements ======
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture');
const toggleBtn = document.getElementById('toggle-camera');
const colorPreview = document.getElementById('color-preview');
const colorResult = document.getElementById('color-result');
const priceEl = document.getElementById('price');
const savePricesBtn = document.getElementById('save-prices');
const priceGoodInput = document.getElementById('price-good');
const priceFairInput = document.getElementById('price-fair');
const priceBadInput = document.getElementById('price-bad');

// ====== Camera handling ======
let currentFacingMode = 'environment';
let streamRef = null;

async function startCamera() {
  try {
    if (streamRef) streamRef.getTracks().forEach(t => t.stop());
    streamRef = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: currentFacingMode } },
      audio: false
    });
    video.srcObject = streamRef;
  } catch (e) {
    console.error('Gagal akses kamera:', e);
    alert('Gagal akses kamera. Pastikan izin kamera diaktifkan.');
  }
}

toggleBtn.addEventListener('click', async () => {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  await startCamera();
});

// Start on load
startCamera();

// ====== Price settings (persisted) ======
function loadPrices(){
  const saved = JSON.parse(localStorage.getItem('rk_prices') || '{}');
  if (saved.good) priceGoodInput.value = saved.good;
  if (saved.fair) priceFairInput.value = saved.fair;
  if (saved.bad) priceBadInput.value = saved.bad;
}
function savePrices(){
  const data = {
    good: Number(priceGoodInput.value||0),
    fair: Number(priceFairInput.value||0),
    bad: Number(priceBadInput.value||0),
  };
  localStorage.setItem('rk_prices', JSON.stringify(data));
  alert('Harga disimpan.');
}
savePricesBtn.addEventListener('click', savePrices);
loadPrices();

function getPrices(){
  return {
    good: Number(priceGoodInput.value||0),
    fair: Number(priceFairInput.value||0),
    bad: Number(priceBadInput.value||0),
  };
}

// ====== Scan handling ======
captureBtn.addEventListener('click', () => {
  if (!video.videoWidth) return;

  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Crop area inside guide-box  (centered)
  const cropW = Math.floor(canvas.width * 0.6);
  const cropH = Math.floor(canvas.height * 0.35);
  const cropX = Math.floor((canvas.width - cropW) / 2);
  const cropY = Math.floor(canvas.height - cropH - canvas.height * 0.10); // align with guide

  const imageData = ctx.getImageData(cropX, cropY, cropW, cropH);
  const avg = getAverageColor(imageData.data);

  // Show preview color
  colorPreview.style.background = `rgb(${avg.r}, ${avg.g}, ${avg.b})`;

  const result = detectStatus(avg);
  renderResult(avg, result);
});

function getAverageColor(data){
  let r=0,g=0,b=0;
  const total = data.length/4;
  for (let i=0;i<data.length;i+=4){
    r += data[i];
    g += data[i+1];
    b += data[i+2];
  }
  return {
    r: Math.round(r/total),
    g: Math.round(g/total),
    b: Math.round(b/total),
  };
}

// ====== Thresholds (based on your data + placeholders) ======
/*
  Data kamu (Sheet2):
    Merah Kecoklatan contoh RGB: (80,19,26), (94,17,11), (90,38,27)
  Kita jadikan range yang sedikit longgar:
    R: 70–110, G: 10–50, B: 10–40
*/
function isMerahKecoklatan({r,g,b}){
  return (r>=70 && r<=110) && (g>=10 && g<=50) && (b>=10 && b<=40);
}

// Perkiraan sementara - nanti ganti dengan data real kamu
function isMerahKekuningan({r,g,b}){
  return (r>=120 && r<=200) && (g>=80 && g<=150) && (b>=10 && b<=90) && r>g && b<g;
}
function isKuningTerang({r,g,b}){
  return (r>=200 && g>=200) && (b>=80);
}

function detectStatus(rgb){
  const prices = getPrices();

  if (isMerahKecoklatan(rgb)){
    return {label:'Merah Kecoklatan (Sangat Layak)', cls:'merah-kecoklatan', price:prices.good};
  }
  if (isMerahKekuningan(rgb)){
    return {label:'Merah Kekuningan (Masih Layak)', cls:'merah-kekuningan', price:prices.fair};
  }
  if (isKuningTerang(rgb)){
    return {label:'Kuning Terang (Tidak Layak)', cls:'kuning-terang', price:prices.bad};
  }
  return {label:'Tidak Dikenali', cls:'', price:0};
}

function renderResult(rgb, result){
  colorResult.innerHTML = `
    Warna rata-rata: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})<br>
    Status terdeteksi: <strong class="${result.cls.replace(/\s+/g,'-')}">${result.label}</strong>
  `;
  priceEl.textContent = result.price ? 'Rp ' + result.price.toLocaleString('id-ID') : '-';
}
