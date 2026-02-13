/**
 * oO0+ TRIAD CORE // CLIENT MANIFEST
 * CALEB BEARDSLEY // 2026
 * * ROLE: "The Crust" (Visualizer & Audio Sink)
 * CONNECTS: Go (Socket), Rust (WASM Physics), C# (Audio Patterns)
 */

class TriadCore {
    constructor() {
        this.canvas = document.getElementById('demo');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.socket = null; // Connects to Go Hub
        this.particles = new Float32Array(2000 * 4); // x, y, z, life (Shared Memory buffer)
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.isRunning = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    async init() {
        console.log("oO0+ SYSTEM: INITIALIZING CRUST...");
        
        // 1. Load Rust WASM Physics Core (Simulation)
        // const wasm = await WebAssembly.instantiateStreaming(fetch('physics_core.wasm'));
        // this.physics = wasm.instance.exports;

        // 2. Connect to Go WebSocket (Real-time State)
        this.connectNetwork();

        // 3. Request Audio Pattern from C# Service
        // await this.fetchPatterns();

        this.isRunning = true;
        this.loop();
    }

    connectNetwork() {
        // Placeholder for Go Routine connection
        this.socket = new WebSocket('ws://localhost:8080/mantle');
        this.socket.onmessage = (event) => {
            // Unpack binary state from Go
            this.updateState(new Float32Array(event.data)); 
        };
    }

    playNote(freq, decay) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sawtooth'; // Sharp texture
        
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + decay);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + decay);
    }

    loop() {
        if (!this.isRunning) return;
        
        // Clear with "Void" gradient
        const grad = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0, 
            this.width/2, this.height/2, this.width
        );
        grad.addColorStop(0, '#001a00');
        grad.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Rendering logic amplifies here (Visuals only, math delegated to Rust)
        this.ctx.save();
        this.ctx.translate(this.width/2, this.height/2);
        
        // Draw HUD
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 120, 0, Math.PI * 2); // Core Ring
        this.ctx.stroke();

        this.ctx.restore();
        
        requestAnimationFrame(() => this.loop());
    }
}

// Ignition
const core = new TriadCore();
document.getElementById('unlock').addEventListener('click', () => {
    core.init();
    document.getElementById('unlock').style.display = 'none';
});
