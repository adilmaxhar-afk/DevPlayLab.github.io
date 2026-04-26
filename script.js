// Global variables
let canvas, ctx, parts = [], selectedPart = null, isDragging = false;
let mouseX = 0, mouseY = 0;

// Regional pricing
const REGIONAL_PRICES = {
    'PK': { amount: 280, currency: 'PKR' },
    'US': { amount: 100, currency: 'USD' },
    'default': { amount: 100, currency: 'USD' }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initCanvas();
    setupEventListeners();
    updateStats();
    requestAnimationFrame(gameLoop);
});

// Canvas setup
function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Responsive canvas
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// Event listeners
function setupEventListeners() {
    // Tool buttons
    document.querySelectorAll('.tool-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            addPart(type);
        });
    });

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', () => {
        parts = [];
        selectedPart = null;
        updateStats();
    });

    // Properties panel
    document.getElementById('colorPicker').addEventListener('change', updateSelectedPart);
    document.getElementById('sizeSlider').addEventListener('input', updateSelectedPart);
    document.getElementById('posX').addEventListener('input', updateSelectedPart);
    document.getElementById('posY').addEventListener('input', updateSelectedPart);

    // Canvas events
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', stopDrag);
    canvas.addEventListener('click', selectPart);

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportGame);

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('downloadBtn').addEventListener('click', downloadGame);
    document.getElementById('discordBtn').addEventListener('click', sendToDiscord);

    // Buy buttons (demo)
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert(`💳 Redirecting to Stripe for ${btn.dataset.country} payment...\n\n(Full payment integration coming soon!)`);
        });
    });
}

// Add part to scene
function addPart(type) {
    const newPart = {
        id: Date.now(),
        type,
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        size: 3,
        color: document.getElementById('colorPicker').value,
        rotation: 0
    };
    parts.push(newPart);
    selectedPart = newPart;
    updatePropertiesPanel();
    updateStats();
}

// Canvas interaction
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left
