// ...existing code...
const uploadInput = document.getElementById('uploadInput');
const previewContainer = document.getElementById('previewContainer');
const downloadBtn = document.querySelector('.download');
const additionalText = document.getElementById('additionalText');
const fillerCheckbox = document.getElementById('fillerCheckbox');
const counter = document.getElementById('counter');
const progressCounter = document.getElementById('progressCounter');
const emptyText = document.getElementById('emptyText');
const zipProgressBarContainer = document.getElementById('zipProgressBarContainer');
const zipProgressBar = document.getElementById('zipProgressBar');
const zipProgressPercent = document.getElementById('zipProgressPercent');

let filesSorted = [];

additionalText.addEventListener('input', () => {
    downloadBtn.disabled = additionalText.value.trim() === '';
    emptyText.style.display = additionalText.value.trim() === '' ? 'block' : 'none';
});

downloadBtn.disabled = true;
emptyText.style.display = 'block';

function updateDownloadBtnState() {
    if (filesSorted.length === 0 || additionalText.value.trim() === '') {
        downloadBtn.disabled = true;
        downloadBtn.style.backgroundColor = '#ccc';
    } else {
        downloadBtn.disabled = false;
        downloadBtn.style.backgroundColor = '#ffcb47';
    }
}

additionalText.addEventListener('input', updateDownloadBtnState);

function previewImages() {
    previewContainer.innerHTML = '';
    filesSorted = Array.from(uploadInput.files)
        .sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
        });

    counter.textContent = `0/${filesSorted.length} images loaded...`;
    let loadedCount = 0;

    downloadBtn.disabled = true;
    downloadBtn.style.backgroundColor = '#ccc';

    filesSorted.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '150px';
            img.style.margin = '5px';
            previewContainer.appendChild(img);
            loadedCount++;
            counter.textContent = `${loadedCount}/${filesSorted.length} images loaded...`;
            if (loadedCount === filesSorted.length) {
                updateDownloadBtnState();
            }
        };
        reader.readAsDataURL(file);
    });
}

async function fileToJpeg(file) {
    return new Promise((resolve) => {
        if (file.type === 'image/jpeg') {
            resolve(file);
        } else {
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = function (e) {
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        const jpegFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg", lastModified: file.lastModified });
                        resolve(jpegFile);
                    }, 'image/jpeg');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

async function downloadImages() {
    if (additionalText.value.trim() === '') return;

    downloadBtn.disabled = true;
    downloadBtn.style.backgroundColor = '#ccc';
    zipProgressBarContainer.style.display = 'block';
    zipProgressBar.value = 0;
    zipProgressPercent.textContent = '0%';

    const zip = new JSZip();
    let processed = 0;
    progressCounter.textContent = `0/${filesSorted.length} images processed...`;

    for (let i = 0; i < filesSorted.length; i++) {
        let file = filesSorted[i];
        file = await fileToJpeg(file);

        let baseName = additionalText.value.trim() + '-' + (i + 1);
        if (fillerCheckbox.checked) baseName += '-filler';
        const fileName = baseName + '.jpg';

        zip.file(fileName, file);

        processed++;
        progressCounter.textContent = `${processed}/${filesSorted.length} images processed...`;
        zipProgressBar.value = Math.round((processed / filesSorted.length) * 100);
        zipProgressPercent.textContent = `${zipProgressBar.value}%`;
    }

    zipProgressBar.value = 0;
    zipProgressPercent.textContent = '0%';

    const zipName = '!' + additionalText.value.trim() + '.zip';

    zip.generateAsync({ type: "blob" }, (metadata) => {
        zipProgressBar.value = Math.round(metadata.percent);
        zipProgressPercent.textContent = `${Math.round(metadata.percent)}%`;
    }).then(function (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = zipName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        zipProgressBar.value = 100;
        zipProgressPercent.textContent = '100%';
        downloadBtn.disabled = false;
        updateDownloadBtnState();
        zipProgressBarContainer.style.display = 'none';
    });
}