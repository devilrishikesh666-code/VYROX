
/* PROJECT MANAGER PRO */

const projectManager = {
    version: "1.0",

    getProjectData() {
        return {
            app: "RISH EDITOR STUDIO",
            version: this.version,
            createdAt: new Date().toISOString(),

            settings: { ...settings },

            transform: {
                ...window.advancedTransform
            }
        };
    },

    saveProject() {
        const data = this.getProjectData();

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "rish-editor-project.json";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        updateStatus("Project backup downloaded");
    },

    restoreProject(data) {
        if (
            !data ||
            data.app !== "RISH EDITOR STUDIO" ||
            !data.settings ||
            !data.transform
        ) {
            throw new Error("Invalid project file");
        }

        const ranges = {
            brightness: [0, 200],
            contrast: [0, 200],
            saturation: [0, 200],
            grayscale: [0, 100],
            blur: [0, 10]
        };

        for (const [key, range] of Object.entries(ranges)) {
            const value = Number(data.settings[key]);

            if (
                !Number.isFinite(value) ||
                value < range[0] ||
                value > range[1]
            ) {
                throw new Error("Invalid project settings");
            }

            settings[key] = value;
        }

        const rotation = Number(data.transform.rotation);
        const flipX = Number(data.transform.flipX);
        const flipY = Number(data.transform.flipY);

        if (
            !Number.isFinite(rotation) ||
            !Number.isInteger(rotation) ||
            Math.abs(rotation) > 360 ||
            ![1, -1].includes(flipX) ||
            ![1, -1].includes(flipY)
        ) {
            throw new Error("Invalid transform settings");
        }

        window.advancedTransform = {
            rotation,
            flipX,
            flipY
        };

        updatePreview();
        applyAdvancedTransform();

        updateStatus("Project restored successfully");
    }
};

const projectPanel = document.createElement("section");

projectPanel.className = "advanced-panel";

projectPanel.innerHTML = `
    <h3>Project Manager</h3>
    <p>Save your editing settings or restore a previous project.</p>

    <div class="media-controls">
        <button type="button" id="saveProjectButton">
            Save Project
        </button>

        <button type="button" id="loadProjectButton">
            Open Project
        </button>
    </div>

    <p class="project-status" id="projectStatus">
        Project manager ready.
    </p>
`;

document.querySelector(".editor-area").append(projectPanel);

const projectFileInput = document.createElement("input");

projectFileInput.type = "file";
projectFileInput.accept = ".json,application/json";
projectFileInput.hidden = true;

document.body.append(projectFileInput);

document.getElementById("saveProjectButton")
    .addEventListener("click", () => {
        projectManager.saveProject();
    });

document.getElementById("loadProjectButton")
    .addEventListener("click", () => {
        projectFileInput.click();
    });

projectFileInput.addEventListener("change", async event => {
    const file = event.target.files[0];

    if (!file) return;

    try {
        if (file.size > 1024 * 1024) {
            throw new Error("Project file is too large");
        }

        const text = await file.text();
        const data = JSON.parse(text);

        projectManager.restoreProject(data);

        document.getElementById("projectStatus")
            .textContent = "Project loaded successfully.";

    } catch (error) {
        document.getElementById("projectStatus")
            .textContent = error.message;

    } finally {
        projectFileInput.value = "";
    }
});
