
/* ADVANCED IMAGE ENGINE */

window.advancedTransform = {
    rotation: 0,
    flipX: 1,
    flipY: 1
};

const advancedHistory = [];
let historyPosition = -1;

function saveEditorHistory() {
    const snapshot = {
        ...settings,
        ...window.advancedTransform
    };

    advancedHistory.splice(historyPosition + 1);
    advancedHistory.push(snapshot);

    if (advancedHistory.length > 30) {
        advancedHistory.shift();
    }

    historyPosition = advancedHistory.length - 1;
}

function applyAdvancedTransform() {
    const t = window.advancedTransform;

    previewImage.style.transform =
        `rotate(${t.rotation}deg) scale(${t.flipX}, ${t.flipY})`;
}

function rotateImage(degrees) {
    window.advancedTransform.rotation =
        (window.advancedTransform.rotation + degrees) % 360;

    applyAdvancedTransform();
    saveEditorHistory();
    updateStatus("Rotation updated");
}

function flipImage(direction) {
    const t = window.advancedTransform;

    if (direction === "horizontal") {
        t.flipX *= -1;
    } else {
        t.flipY *= -1;
    }

    applyAdvancedTransform();
    saveEditorHistory();
    updateStatus("Image flipped");
}

function restoreHistory(snapshot) {
    settings.brightness = snapshot.brightness;
    settings.contrast = snapshot.contrast;
    settings.saturation = snapshot.saturation;
    settings.grayscale = snapshot.grayscale;
    settings.blur = snapshot.blur;

    window.advancedTransform = {
        rotation: snapshot.rotation,
        flipX: snapshot.flipX,
        flipY: snapshot.flipY
    };

    updatePreview();
    applyAdvancedTransform();
}

function undoEdit() {
    if (historyPosition <= 0) {
        updateStatus("Nothing to undo");
        return;
    }

    historyPosition--;
    restoreHistory(advancedHistory[historyPosition]);
    updateStatus("Undo successful");
}

function redoEdit() {
    if (historyPosition >= advancedHistory.length - 1) {
        updateStatus("Nothing to redo");
        return;
    }

    historyPosition++;
    restoreHistory(advancedHistory[historyPosition]);
    updateStatus("Redo successful");
}

function addAdvancedToolbar() {
    const editor = document.querySelector(".editor-area");

    const toolbar = document.createElement("div");
    toolbar.className = "advanced-toolbar";

    const actions = [
        ["Rotate Left", () => rotateImage(-90)],
        ["Rotate Right", () => rotateImage(90)],
        ["Flip Horizontal", () => flipImage("horizontal")],
        ["Flip Vertical", () => flipImage("vertical")],
        ["Undo", undoEdit],
        ["Redo", redoEdit]
    ];

    actions.forEach(([label, action]) => {
        const button = document.createElement("button");
        button.textContent = label;
        button.addEventListener("click", action);
        toolbar.append(button);
    });

    editor.insertBefore(toolbar, editor.querySelector(".timeline"));
}

function exportTransformedImage() {
    if (!previewImage.src || previewImage.hidden) {
        updateStatus("Upload an image first");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const rotation =
        ((window.advancedTransform.rotation % 360) + 360) % 360;

    const sideways = rotation === 90 || rotation === 270;
    const width = previewImage.naturalWidth;
    const height = previewImage.naturalHeight;

    canvas.width = sideways ? height : width;
    canvas.height = sideways ? width : height;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(
        window.advancedTransform.flipX,
        window.advancedTransform.flipY
    );

    ctx.filter = `
        brightness(${settings.brightness}%)
        contrast(${settings.contrast}%)
        saturate(${settings.saturation}%)
        grayscale(${settings.grayscale}%)
        blur(${settings.blur}px)
    `;

    ctx.drawImage(
        previewImage,
        -width / 2,
        -height / 2,
        width,
        height
    );

    canvas.toBlob(blob => {
        if (!blob) {
            updateStatus("Export failed");
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "rish-advanced-edit.png";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        updateStatus("Advanced image exported");
    }, "image/png");
}

addAdvancedToolbar();
saveEditorHistory();

document.getElementById("exportButton").addEventListener(
    "click",
    event => {
        event.stopImmediatePropagation();
        exportTransformedImage();
    },
    true
);
