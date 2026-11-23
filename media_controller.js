
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const emptyState = document.getElementById("emptyState");
const toolPanel = document.getElementById("toolPanel");
const statusText = document.getElementById("status");

let currentImageURL = null;

const settings = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0
};

function updateStatus(message) {
    statusText.textContent = message;
}

function uploadImage(file) {
    if (!file || !file.type.startsWith("image/")) {
        updateStatus("Please select an image");
        return;
    }

    if (currentImageURL) {
        URL.revokeObjectURL(currentImageURL);
    }

    currentImageURL = URL.createObjectURL(file);
    previewImage.src = currentImageURL;
    previewImage.hidden = false;
    emptyState.style.display = "none";

    updateStatus("Image loaded");
    updatePreview();
}

imageInput.addEventListener("change", event => {
    uploadImage(event.target.files[0]);
});

function updatePreview() {
    previewImage.style.filter = `
        brightness(${settings.brightness}%)
        contrast(${settings.contrast}%)
        saturate(${settings.saturation}%)
        grayscale(${settings.grayscale}%)
        blur(${settings.blur}px)
    `;
}

function createSlider(name, label, min, max, value, unit = "") {
    const group = document.createElement("div");
    group.className = "control-group";

    const title = document.createElement("label");
    title.textContent = `${label}: ${value}${unit}`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = value;

    slider.addEventListener("input", () => {
        settings[name] = Number(slider.value);
        title.textContent = `${label}: ${slider.value}${unit}`;
        updatePreview();
    });

    group.append(title, slider);
    return group;
}

function showAdjustments() {
    toolPanel.replaceChildren();

    toolPanel.append(
        createSlider("brightness", "Brightness", 0, 200, settings.brightness, "%"),
        createSlider("contrast", "Contrast", 0, 200, settings.contrast, "%"),
        createSlider("saturation", "Saturation", 0, 200, settings.saturation, "%"),
        createSlider("grayscale", "Grayscale", 0, 100, settings.grayscale, "%"),
        createSlider("blur", "Blur", 0, 10, settings.blur, "px")
    );

    addResetButton();
}

function addResetButton() {
    const button = document.createElement("button");
    button.className = "control-button";
    button.textContent = "Reset Adjustments";

    button.addEventListener("click", () => {
        settings.brightness = 100;
        settings.contrast = 100;
        settings.saturation = 100;
        settings.grayscale = 0;
        settings.blur = 0;

        showAdjustments();
        updatePreview();
    });

    toolPanel.append(button);
}

function showFilters() {
    toolPanel.replaceChildren();

    const filters = [
        { name: "Original", values: [100, 100, 100, 0] },
        { name: "Vintage", values: [105, 90, 75, 15] },
        { name: "Warm", values: [110, 105, 120, 0] },
        { name: "Black & White", values: [100, 110, 0, 100] },
        { name: "Soft", values: [110, 90, 90, 0] }
    ];

    filters.forEach(filter => {
        const button = document.createElement("button");
        button.className = "control-button";
        button.textContent = filter.name;

        button.addEventListener("click", () => {
            settings.brightness = filter.values[0];
            settings.contrast = filter.values[1];
            settings.saturation = filter.values[2];
            settings.grayscale = filter.values[3];

            showFilters();
            updatePreview();
            updateStatus(filter.name + " filter applied");
        });

        toolPanel.append(button);
    });
}

function showTextTool() {
    toolPanel.replaceChildren();

    const label = document.createElement("label");
    label.textContent = "Text overlay";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter your text";

    const button = document.createElement("button");
    button.className = "control-button";
    button.textContent = "Add Text";

    button.addEventListener("click", () => {
        if (!previewImage.src) {
            updateStatus("Upload an image first");
            return;
        }

        const text = input.value.trim();

        if (!text) {
            updateStatus("Enter some text");
            return;
        }

        const overlay = document.createElement("div");
        overlay.textContent = text;
        overlay.style.position = "absolute";
        overlay.style.top = "50%";
        overlay.style.left = "50%";
        overlay.style.transform = "translate(-50%, -50%)";
        overlay.style.color = "white";
        overlay.style.fontSize = "28px";
        overlay.style.fontWeight = "bold";
        overlay.style.textShadow = "2px 2px 5px black";
        overlay.style.pointerEvents = "none";

        document.querySelector(".preview").append(overlay);

        updateStatus("Text added to preview");
    });

    toolPanel.append(label, input, button);
}

function showEffects() {
    toolPanel.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
        "Explore blur, contrast, saturation and other visual adjustments in the Adjust panel.";

    toolPanel.append(message);
}

function showMedia() {
    toolPanel.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
        "Upload an image using the Upload Image button to start editing.";

    toolPanel.append(message);
}

const tools = {
    media: showMedia,
    adjust: showAdjustments,
    filters: showFilters,
    text: showTextTool,
    effects: showEffects
};

document.querySelectorAll(".tool").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".tool").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const selectedTool = button.dataset.tool;
        tools[selectedTool]?.();

        updateStatus(selectedTool + " selected");
    });
});

showMedia();
