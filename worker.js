// worker.js - ANTI-OPTIMIZATION CPU BURNER
// JIT Defeater: Random Memory Access + Crypto-like Math

const BUFFER_SIZE = 1024 * 1024; // 4MB Buffer per thread
const memory = new Int32Array(BUFFER_SIZE);

self.onmessage = function (e) {
    if (e.data === 'start') {
        burn();
    }
};

function burn() {
    let acc = 0;
    while (true) {
        // Unpredictable Memory Access (Cache Trashing)
        // Forces CPU to wait for RAM, generating heat in memory controller too
        for (let i = 0; i < 50000; i++) {
            const idx = (Math.random() * BUFFER_SIZE) | 0;
            memory[idx] = (memory[idx] + i + acc) ^ 0xDEADBEEF;
            acc += memory[idx];

            // Floating Point Stress
            Math.pow(Math.random(), Math.random());
        }
    }
}
