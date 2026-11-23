
const exportButton = document.getElementById("exportButton");
const themeButton = document.getElementById("themeButton");

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    themeButton.textContent =
        document.body.classList.contains("dark")
        ? "Light Mode"
        : "Dark Mode";
});

function getEditedCanvas() {
    if (!previewImage.src || previewImage.hidden) {
        throw new Error("Please upload an image first.");
    }

    if (!previewImage.complete || !previewImage.naturalWidth) {
        throw new Error("Image is still loading.");
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = previewImage.naturalWidth;
    canvas.height = previewImage.naturalHeight;

    context.filter = `
        brightness(${settings.brightness}%)
        contrast(${settings.contrast}%)
        saturate(${settings.saturation}%)
        grayscale(${settings.grayscale}%)
        blur(${settings.blur}px)
    `;

    context.drawImage(
        previewImage,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return canvas;
}

function exportImage() {
    try {
        const canvas = getEditedCanvas();

        canvas.toBlob(blob => {
            if (!blob) {
                updateStatus("Export failed");
                return;
            }

            const downloadURL = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadURL;
            link.download = "rish-edited-image.png";

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);

            updateStatus("Image exported successfully");
        }, "image/png");

    } catch (error) {
        updateStatus(error.message);
    }
}

exportButton.addEventListener("click", exportImage);

window.addEventListener("beforeunload", () => {
    if (currentImageURL) {
        URL.revokeObjectURL(currentImageURL);
    }
});

updateStatus("RISH EDITOR STUDIO READY");
