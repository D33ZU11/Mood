// ==================== CONFIG & DATA ====================
const INITIAL_DATA = {
    "Essentials": [
        { label: "Wait", img: "https://cdn-icons-png.flaticon.com/512/2997/2997985.png" },
        { label: "Help", img: "https://cdn-icons-png.flaticon.com/512/1182/1182740.png" },
        { label: "Toilet", img: "https://cdn-icons-png.flaticon.com/512/3014/3014814.png" }
    ],
    "Feelings": [
        { label: "I Love You", img: "https://cdn-icons-png.flaticon.com/512/833/833472.png" },
        { label: "Yes", img: "https://cdn-icons-png.flaticon.com/512/5290/5290058.png" },
        { label: "No", img: "https://cdn-icons-png.flaticon.com/512/5290/5290077.png" }
    ]
};

let database = JSON.parse(localStorage.getItem('visual_board_v4')) || INITIAL_DATA;
let activeRoutine = Array(6).fill(null);
let activeCategory = Object.keys(database)[0];

// ==================== RENDERING ====================
function renderApp() {
    renderRoutine();
    renderFolders();
    renderLibrary();
}

function renderRoutine() {
    const container = document.getElementById('routineDisplay');
    container.innerHTML = activeRoutine.map((item, index) => `
        <div class="slot \( {item ? 'filled' : ''}" data-index=" \){index}">
            ${item ? `
                <img src="\( {item.img}" alt=" \){item.label}">
                <span>${item.label}</span>
            ` : ''}
        </div>
    `).join('');

    // Add click listeners for removing items
    container.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const index = parseInt(slot.dataset.index);
            if (activeRoutine[index]) {
                activeRoutine[index] = null;
                renderApp();
            }
        });
    });
}

function renderFolders() {
    const container = document.getElementById('folderNav');
    container.innerHTML = Object.keys(database).map(cat => `
        <button class="folder-btn \( {activeCategory === cat ? 'active' : ''}" data-category=" \){cat}">
            ${cat}
        </button>
    `).join('');

    container.querySelectorAll('.folder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.category;
            renderApp();
        });
    });
}

function renderLibrary() {
    const container = document.getElementById('cardLibrary');
    const cards = database[activeCategory] || [];

    let html = cards.map((item, idx) => `
        <div class="lib-card-box">
            <div class="delete-icon" data-idx="${idx}">×</div>
            <div class="lib-card" data-item='${JSON.stringify(item)}'>
                <img src="\( {item.img}" alt=" \){item.label}">
                <span>${item.label}</span>
            </div>
        </div>
    `).join('');

    html += `<div class="lib-card-box add-new-btn">+</div>`;
    container.innerHTML = html;

    // Add card listeners
    container.querySelectorAll('.lib-card').forEach(card => {
        card.addEventListener('click', () => {
            const item = JSON.parse(card.dataset.item);
            addToRoutine(item);
        });
    });

    // Delete listeners
    container.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm("Delete this card?")) {
                const idx = parseInt(icon.dataset.idx);
                database[activeCategory].splice(idx, 1);
                saveData();
                renderApp();
            }
        });
    });

    // Add new card
    container.querySelector('.add-new-btn').addEventListener('click', addNewCard);
}

// ==================== ACTIONS ====================
function addToRoutine(item) {
    const emptyIndex = activeRoutine.indexOf(null);
    if (emptyIndex !== -1) {
        activeRoutine[emptyIndex] = item;
        renderApp();
    } else {
        alert("Sequence is full! Remove an item first.");
    }
}

function addNewCard() {
    const label = prompt("Card name:");
    const imgUrl = prompt("Image URL (direct link):");

    if (label && imgUrl) {
        if (!database[activeCategory]) database[activeCategory] = [];
        database[activeCategory].push({ label, img: imgUrl });
        saveData();
        renderApp();
    }
}

function saveData() {
    localStorage.setItem('visual_board_v4', JSON.stringify(database));
}

function clearRoutine() {
    if (confirm("Clear the entire sequence?")) {
        activeRoutine = Array(6).fill(null);
        renderApp();
    }
}

function generateShareLink() {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({
        r: activeRoutine,
        d: database
    }))));

    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `\( {baseUrl}?v= \){payload}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        alert("✅ Link copied!\n\nPaste it into WhatsApp to share with your wife.");
    }).catch(() => {
        alert("Link ready:\n" + shareUrl);
    });
}

// ==================== INIT ====================
window.onload = () => {
    // Load shared data if present
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('v');

    if (shared) {
        try {
            const decoded = JSON.parse(decodeURIComponent(escape(atob(shared))));
            activeRoutine = decoded.r || Array(6).fill(null);
            database = decoded.d || INITIAL_DATA;
            saveData();
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
            console.error("Failed to load shared board");
        }
    }

    renderApp();

    // Button listeners
    document.getElementById('shareBtn').addEventListener('click', generateShareLink);
    document.getElementById('clearRoutine').addEventListener('click', clearRoutine);
};
