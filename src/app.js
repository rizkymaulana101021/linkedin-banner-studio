/**
 * LinkedIn Banner Studio
 * Core Canvas Engine & State Manager
 */

// Canvas & Context
const canvas = document.getElementById('bannerCanvas');
const ctx = canvas.getContext('2d');
const W = 1584;
const H = 396;

// Elements
const toggleAvatar = document.getElementById('toggleAvatar');
const toggleGrid = document.getElementById('toggleGrid');
const avatarOverlay = document.getElementById('avatarOverlay');
const avatarPreviewImg = document.getElementById('avatarPreviewImg');
const btnMainDownload = document.getElementById('btnMainDownload');
const btnQuickDownload = document.getElementById('btnQuickDownload');
const btnCopyClipboard = document.getElementById('btnCopyClipboard');

// Inputs
const inputName = document.getElementById('inputName');
const inputStatus = document.getElementById('inputStatus');
const inputTitle = document.getElementById('inputTitle');
const inputSubtitle = document.getElementById('inputSubtitle');
const inputUniv = document.getElementById('inputUniv');
const inputContact = document.getElementById('inputContact');
const inputSkills = document.getElementById('inputSkills');

// Photo controls
const fileUpload = document.getElementById('fileUpload');
const dropZone = document.getElementById('dropZone');
const photoX = document.getElementById('photoX');
const photoScale = document.getElementById('photoScale');
const showPhoto = document.getElementById('showPhoto');
const photoXVal = document.getElementById('photoXVal');
const photoScaleVal = document.getElementById('photoScaleVal');

// Chroma Key controls
const enableChroma = document.getElementById('enableChroma');
const chromaControls = document.getElementById('chromaControls');
const chromaColor = document.getElementById('chromaColor');
const chromaTolerance = document.getElementById('chromaTolerance');
const chromaTolVal = document.getElementById('chromaTolVal');

// Global State
let currentTheme = 'tech';
let userPhoto = new Image();
let originalUploadedImage = null; // for chroma re-processing
let processedPhotoImage = null;

// Load default sample photo
userPhoto.crossOrigin = 'anonymous';
userPhoto.src = 'assets/sample-photo.png';
userPhoto.onload = () => {
  render();
};

// Tabs Switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-link').forEach(el => {
    el.classList.remove('bg-slate-800', 'text-white');
    el.classList.add('text-slate-400');
  });

  const targetTab = document.getElementById(`tab-${tabName}`);
  const targetBtn = document.getElementById(`tab-${tabName}-btn`);
  if (targetTab) targetTab.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('bg-slate-800', 'text-white');
    targetBtn.classList.remove('text-slate-400');
  }
}

// Themes Switching
function setTheme(theme) {
  currentTheme = theme;
  document.querySelectorAll('.theme-card').forEach(btn => {
    if (btn.dataset.theme === theme) {
      btn.classList.add('border-cyan-500', 'border-2');
      btn.classList.remove('border-slate-800');
    } else {
      btn.classList.remove('border-cyan-500', 'border-2');
      btn.classList.add('border-slate-800');
    }
  });
  render();
}

// Preset Skills
function setSkillsPreset(type) {
  const presets = {
    web: 'TypeScript, React, Next.js, Node.js, PostgreSQL, TailwindCSS, Cloud',
    data: 'Python, SQL, Machine Learning, Pandas, Tableau, Power BI, Deep Learning',
    mobile: 'Flutter, React Native, Kotlin, Swift, REST API, Firebase, UI/UX',
    cloud: 'AWS, Docker, Kubernetes, CI/CD, Terraform, Linux, Microservices'
  };
  if (presets[type]) {
    inputSkills.value = presets[type];
    render();
  }
}

// Draw Badge Pill
function drawBadge(ctx, text, x, y, bg, border, textColor, font) {
  ctx.save();
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const padX = 14;
  const h = 26;
  const w = metrics.width + padX * 2;
  const r = h / 2;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = border;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  ctx.restore();

  return w;
}

// Render User Photo
function drawUserPhoto(ctx, img, bannerW, bannerH, scale, offsetX) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const aspect = img.width / img.height;
  const drawH = bannerH * scale;
  const drawW = drawH * aspect;
  const x = bannerW - drawW - 40 + offsetX;
  const y = bannerH - drawH + 10;

  ctx.save();
  // Soft drop shadow behind user
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = -6;
  ctx.shadowOffsetY = 10;

  ctx.drawImage(img, x, y, drawW, drawH);
  ctx.restore();
}

// Main Render Loop
function render() {
  ctx.clearRect(0, 0, W, H);

  const name = inputName.value.trim() || 'Your Name';
  const status = inputStatus.value.trim();
  const title = inputTitle.value.trim();
  const subtitle = inputSubtitle.value.trim();
  const univ = inputUniv.value.trim();
  const contact = inputContact.value.trim();
  const skills = inputSkills.value.split(',').map(s => s.trim()).filter(Boolean);
  const pOffset = parseInt(photoX.value, 10);
  const pScale = parseInt(photoScale.value, 10) / 100;
  const drawCutout = showPhoto.checked;
  const showGrid = toggleGrid.checked;

  const activePhoto = processedPhotoImage || userPhoto;

  // 1. THEME: TECH DARK
  if (currentTheme === 'tech') {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a0f1d');
    grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    // Cyan glow on right
    const glow = ctx.createRadialGradient(W - 320, H / 2, 40, W - 320, H / 2, 380);
    glow.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
    glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(W - 700, 0, 700, H);

    // Accent lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(330, 0); ctx.lineTo(370, H); ctx.stroke();

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(345, 0); ctx.lineTo(385, H); ctx.stroke();

    if (drawCutout) {
      drawUserPhoto(ctx, activePhoto, W, H, pScale, pOffset);
    }

    const startX = 395;

    if (status) {
      drawBadge(ctx, status, startX, 42, 'rgba(16, 185, 129, 0.15)', 'rgba(52, 211, 153, 0.4)', '#34d399', 'bold 12px "Plus Jakarta Sans"');
    }

    ctx.font = 'bold 44px "Plus Jakarta Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, startX, 115);

    ctx.font = 'bold 20px "Plus Jakarta Sans"';
    const titleGrad = ctx.createLinearGradient(startX, 0, startX + 500, 0);
    titleGrad.addColorStop(0, '#38bdf8');
    titleGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = titleGrad;
    ctx.fillText(title, startX, 152);

    ctx.font = '15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitle, startX, 188);

    ctx.font = '600 15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(univ, startX, 218);

    let bx = startX;
    skills.forEach(sk => {
      const bw = drawBadge(ctx, sk, bx, 255, 'rgba(30, 41, 59, 0.8)', 'rgba(71, 85, 105, 0.6)', '#e2e8f0', '13px "Plus Jakarta Sans"');
      bx += bw + 12;
    });

    ctx.font = '13px "Plus Jakarta Sans"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(contact, startX, 335);

  // 2. THEME: EXECUTIVE NAVY & GOLD
  } else if (currentTheme === 'executive') {
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#0b192c');
    grad.addColorStop(1, '#1e3e62');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(380, 0); ctx.lineTo(290, H); ctx.lineTo(0, H);
    ctx.fill();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(380, 0); ctx.lineTo(290, H); ctx.stroke();

    if (drawCutout) {
      drawUserPhoto(ctx, activePhoto, W, H, pScale, pOffset);
    }

    const startX = 390;

    if (status) {
      drawBadge(ctx, status, startX, 42, 'rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.5)', '#fef08a', 'bold 12px "Plus Jakarta Sans"');
    }

    ctx.font = 'bold 44px "Plus Jakarta Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, startX, 115);

    ctx.font = 'bold 20px "Plus Jakarta Sans"';
    ctx.fillStyle = '#fde047';
    ctx.fillText(title, startX, 152);

    ctx.font = '15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(subtitle, startX, 188);

    ctx.font = '600 15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(univ, startX, 218);

    let bx = startX;
    skills.forEach(sk => {
      const bw = drawBadge(ctx, sk, bx, 255, 'rgba(15, 23, 42, 0.8)', 'rgba(148, 163, 184, 0.4)', '#f1f5f9', '13px "Plus Jakarta Sans"');
      bx += bw + 12;
    });

    ctx.font = '13px "Plus Jakarta Sans"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(contact, startX, 335);

  // 3. THEME: EMERALD MINIMALIST
  } else if (currentTheme === 'emerald') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W - 350, H / 2, 50, W - 350, H / 2, 400);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(W - 700, 0, 700, H);

    if (drawCutout) {
      drawUserPhoto(ctx, activePhoto, W, H, pScale, pOffset);
    }

    const startX = 390;

    ctx.font = 'bold 13px "JetBrains Mono"';
    ctx.fillStyle = '#34d399';
    ctx.fillText('// ' + (status || 'PROFESSIONAL PORTFOLIO'), startX, 55);

    ctx.font = 'bold 44px "Plus Jakarta Sans"';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(name, startX, 115);

    ctx.font = 'bold 20px "Plus Jakarta Sans"';
    ctx.fillStyle = '#34d399';
    ctx.fillText(title, startX, 152);

    ctx.font = '15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitle, startX, 188);

    ctx.font = '600 15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(univ, startX, 218);

    let bx = startX;
    skills.forEach(sk => {
      const bw = drawBadge(ctx, sk, bx, 255, 'rgba(30, 41, 59, 0.8)', 'rgba(52, 211, 153, 0.35)', '#e2e8f0', '13px "Plus Jakarta Sans"');
      bx += bw + 12;
    });

    ctx.font = '13px "Plus Jakarta Sans"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(contact, startX, 335);

  // 4. THEME: CREATIVE VIOLET MESH
  } else if (currentTheme === 'violet') {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f0a23');
    grad.addColorStop(1, '#241242');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W - 350, H / 2, 50, W - 350, H / 2, 420);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
    glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(W - 700, 0, 700, H);

    if (drawCutout) {
      drawUserPhoto(ctx, activePhoto, W, H, pScale, pOffset);
    }

    const startX = 390;

    if (status) {
      drawBadge(ctx, status, startX, 42, 'rgba(168, 85, 247, 0.18)', 'rgba(192, 132, 252, 0.45)', '#f3e8ff', 'bold 12px "Plus Jakarta Sans"');
    }

    ctx.font = 'bold 44px "Plus Jakarta Sans"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, startX, 115);

    ctx.font = 'bold 20px "Plus Jakarta Sans"';
    const titleGrad = ctx.createLinearGradient(startX, 0, startX + 450, 0);
    titleGrad.addColorStop(0, '#c084fc');
    titleGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = titleGrad;
    ctx.fillText(title, startX, 152);

    ctx.font = '15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#d8b4fe';
    ctx.fillText(subtitle, startX, 188);

    ctx.font = '600 15px "Plus Jakarta Sans"';
    ctx.fillStyle = '#f3e8ff';
    ctx.fillText(univ, startX, 218);

    let bx = startX;
    skills.forEach(sk => {
      const bw = drawBadge(ctx, sk, bx, 255, 'rgba(59, 7, 100, 0.6)', 'rgba(168, 85, 247, 0.45)', '#f5d0fe', '13px "Plus Jakarta Sans"');
      bx += bw + 12;
    });

    ctx.font = '13px "Plus Jakarta Sans"';
    ctx.fillStyle = '#d8b4fe';
    ctx.fillText(contact, startX, 335);
  }
}

// Download Handler
function downloadBanner() {
  canvas.toBlob((blob) => {
    if (!blob) {
      alert('Gagal membuat gambar PNG.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (inputName.value.trim() || 'linkedin-banner')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    a.download = `${safeName}-${currentTheme}-banner.png`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }, 'image/png');
}

// Copy to Clipboard
function copyToClipboard() {
  canvas.toBlob((blob) => {
    if (!blob || !navigator.clipboard) {
      alert('Clipboard tidak didukung. Silakan gunakan tombol Download.');
      return;
    }
    navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]).then(() => {
      const original = btnCopyClipboard.innerHTML;
      btnCopyClipboard.innerHTML = `<span class="text-emerald-400 font-semibold">✓ Disalin!</span>`;
      setTimeout(() => { btnCopyClipboard.innerHTML = original; }, 2000);
    }).catch(err => {
      alert('Gagal menyalin: ' + err.message);
    });
  }, 'image/png');
}

// Photo Processing & Chroma Key
function processChromaKey() {
  if (!originalUploadedImage || !enableChroma.checked) {
    processedPhotoImage = null;
    render();
    return;
  }

  // Create off-screen canvas
  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d');
  const w = originalUploadedImage.width;
  const h = originalUploadedImage.height;
  offCanvas.width = w;
  offCanvas.height = h;

  offCtx.drawImage(originalUploadedImage, 0, 0);
  const imgData = offCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Target color from input
  const hex = chromaColor.value;
  const targetR = parseInt(hex.slice(1, 3), 16);
  const targetG = parseInt(hex.slice(3, 5), 16);
  const targetB = parseInt(hex.slice(5, 7), 16);
  const tol = parseInt(chromaTolerance.value, 10);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      Math.pow(r - targetR, 2) +
      Math.pow(g - targetG, 2) +
      Math.pow(b - targetB, 2)
    );

    if (dist < tol) {
      data[i + 3] = 0; // Transparent
    } else if (dist < tol + 15) {
      data[i + 3] = Math.floor(((dist - tol) / 15) * 255); // Smooth feathering
    }
  }

  offCtx.putImageData(imgData, 0, 0);
  const processedImg = new Image();
  processedImg.onload = () => {
    processedPhotoImage = processedImg;
    render();
  };
  processedImg.src = offCanvas.toDataURL('image/png');
}

// Photo Upload Handler
function handlePhotoUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      userPhoto = img;
      originalUploadedImage = img;
      avatarPreviewImg.src = e.target.result;

      if (enableChroma.checked) {
        processChromaKey();
      } else {
        processedPhotoImage = null;
        render();
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function resetPhoto() {
  userPhoto.src = 'assets/sample-photo.png';
  avatarPreviewImg.src = 'assets/sample-photo.png';
  originalUploadedImage = null;
  processedPhotoImage = null;
  photoX.value = 0;
  photoScale.value = 120;
  photoXVal.textContent = '0 px';
  photoScaleVal.textContent = '120%';
  enableChroma.checked = false;
  chromaControls.classList.add('hidden');
  render();
}

// Event Listeners
[inputName, inputStatus, inputTitle, inputSubtitle, inputUniv, inputContact, inputSkills].forEach(el => {
  el.addEventListener('input', render);
});

toggleAvatar.addEventListener('change', (e) => {
  avatarOverlay.style.opacity = e.target.checked ? '1' : '0';
});

toggleGrid.addEventListener('change', render);

photoX.addEventListener('input', (e) => {
  photoXVal.textContent = `${e.target.value} px`;
  render();
});

photoScale.addEventListener('input', (e) => {
  photoScaleVal.textContent = `${e.target.value}%`;
  render();
});

showPhoto.addEventListener('change', render);

enableChroma.addEventListener('change', (e) => {
  chromaControls.classList.toggle('hidden', !e.target.checked);
  processChromaKey();
});

chromaColor.addEventListener('input', processChromaKey);
chromaTolerance.addEventListener('input', (e) => {
  chromaTolVal.textContent = e.target.value;
  processChromaKey();
});

fileUpload.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handlePhotoUpload(e.target.files[0]);
  }
});

// Drag and drop zone
['dragenter', 'dragover'].forEach(name => {
  dropZone.addEventListener(name, (e) => {
    e.preventDefault();
    dropZone.classList.add('border-cyan-400', 'bg-cyan-500/10');
  });
});

['dragleave', 'drop'].forEach(name => {
  dropZone.addEventListener(name, (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-cyan-400', 'bg-cyan-500/10');
  });
});

dropZone.addEventListener('drop', (e) => {
  if (e.dataTransfer.files.length > 0) {
    handlePhotoUpload(e.dataTransfer.files[0]);
  }
});

btnMainDownload.addEventListener('click', downloadBanner);
btnQuickDownload.addEventListener('click', downloadBanner);
btnCopyClipboard.addEventListener('click', copyToClipboard);
