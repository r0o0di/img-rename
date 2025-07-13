// Include JSZip

const zip = new JSZip(); // Create a new instance of JSZip



function previewImages() {

    console.log("Starting image preview...");

    const input = document.getElementById('uploadInput');

    const previewContainer = document.getElementById('previewContainer');

    const downloadButton = document.querySelector('button[onclick="downloadImages()"]');

    const images = input.files;

    const counterElement = document.getElementById('counter');

    let isDownloadButtonActive = false;



    let currentImageIndex = 0;



    previewContainer.innerHTML = '';

    downloadButton.style.background = "";

    counterElement.textContent = `0/${images.length} images loaded`;



    function previewNextImage() {

        console.log(`Previewing image ${currentImageIndex + 1} of ${images.length}`);

        downloadButton.style.display = 'block';

        counterElement.style.display = 'block';

        counterElement.textContent = `${currentImageIndex}/${images.length} images loaded`;



        // Check if the download button is active

        if (isDownloadButtonActive) {

            downloadButton.style.background = "#ffcb47";

        } else {

            downloadButton.style.background = "";

        }



        if (currentImageIndex < images.length) {

            previewImage(images[currentImageIndex]);

        } else {

            console.log("All images previewed, showing download button.");

            isDownloadButtonActive = true; // Activate the download button

            downloadButton.style.background = "#ffcb47";

        }

    }



    function previewImage(image) {

        console.log(`Processing image: ${image.name}`);

        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');



        const img = new Image();

        img.src = URL.createObjectURL(image);



        img.onload = function () {

            console.log("Image loaded successfully.");

            downloadButton.style.display = 'none';

            progressCounter.style.display = "none";


            // Display the preview on the page

            const previewImageElement = new Image();

            previewImageElement.src = canvas.toDataURL();

            previewImageElement.classList.add('preview-image');

            previewContainer.appendChild(previewImageElement);



            // Move to the next image

            currentImageIndex++;

            previewNextImage();

        };

    }



    // Start previewing the first image

    previewNextImage();

}



function downloadImages() {

    const input = document.getElementById('uploadInput');

    const images = input.files;

    const fillerCheckbox = document.getElementById('fillerCheckbox');

    const additionalTextField = document.getElementById('additionalText');

    const downloadButton = document.querySelector('button[onclick="downloadImages()"]');

    const progressCounter = document.getElementById('progressCounter');

    let downloadedCount = document.getElementById('downloadedCount').value || 1;



    // Check if the download button is active

    if (downloadButton.style.background !== "rgb(255, 203, 71)") {

        return;

    }



    if (additionalTextField.value.trim() === "") {

        const emptyText = document.getElementById("emptyText");

        alert(emptyText.textContent);

        return;

    }



    const sortedImages = Array.from(images).sort((a, b) => {

        const nameA = a.name.toLowerCase();

        const nameB = b.name.toLowerCase();

        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });

    });



    // Collect images for zip file

    const zipImages = [];



    function downloadNextImage(index) {

        if (index < sortedImages.length) {

            const image = sortedImages[index];

            const canvas = document.createElement('canvas');

            
            const counterElement = document.getElementById('counter');



            const img = new Image();

            img.src = URL.createObjectURL(image);



            img.onload = function () {

                counterElement.style.display = "none";

              
                const jpegDataURL = canvas.toDataURL('image/jpeg', 1);





                const additionalText = additionalTextField.value;

                const suffix = fillerCheckbox.checked ? '-filler' : '';

                const finalFileName = additionalText + '-' + downloadedCount + suffix + '.jpg';



                // Store in zip array

                zipImages.push({ finalFileName, jpegDataURL });



                // Update progress

                progressCounter.style.display = "block";

                downloadedCount++;

                progressCounter.textContent = `${downloadedCount}/${images.length} images processed`;



                downloadNextImage(index + 1);

            };

        } else {

            // When all images are processed, offer ZIP download

            downloadZip(zipImages);

        }

    }



    // Start downloading the first image

    downloadNextImage(0);

}



// Helper function to pad single digits with a leading zero

function padNumber(number) {

    return number < 10 ? '0' + number : number;

}



function calculateMargin(img, direction) {

    const canvas = document.createElement('canvas');

  

    const data = imageData.data;



    return 0;

}



// JSZip function to generate and download the zip file

async function downloadZip(images) {

    const zip = new JSZip();



    // Reference to the progress bar elements

    const progressBarContainer = document.getElementById('zipProgressBarContainer');

    const progressBar = document.getElementById('zipProgressBar');

    const progressPercent = document.getElementById('zipProgressPercent');



    // Reset progress bar and display it

    progressBar.value = 0;

    progressPercent.textContent = '0%';

    progressBarContainer.style.display = 'block';



    // Add images to zip folder

    for (let i = 0; i < images.length; i++) {

        const { finalFileName, jpegDataURL } = images[i];

        const blob = dataURLToBlob(jpegDataURL);

        zip.file(finalFileName, blob);

    }



    // Generate zip with progress tracking

    const zipBlob = await zip.generateAsync({ 

        type: 'blob', 

        compression: 'STORE', // You can use 'DEFLATE' for compression

        streamFiles: true

    }, (metadata) => {

        const percent = Math.floor(metadata.percent);

        progressBar.value = percent; // Update the progress bar value

        progressPercent.textContent = `${percent}%`; // Update the text with percentage

    });



    // After zip is fully generated, download it

    const { finalFileName } = images[0];

    const zipUrl = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');

    a.href = zipUrl;

    a.download = `!${finalFileName.split('-')[0]}.zip`;

    a.click();

    URL.revokeObjectURL(zipUrl);



    // Hide progress bar after download starts

    progressBarContainer.style.display = 'none';

}



// Convert DataURL to Blob

function dataURLToBlob(dataURL) {

    const byteString = atob(dataURL.split(',')[1]);

    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);

    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {

        ia[i] = byteString.charCodeAt(i);

    }

    return new Blob([ab], { type: mimeString });

}
