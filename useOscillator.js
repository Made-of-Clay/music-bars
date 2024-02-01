/** @type {AudioContext | null} audioContext */
let audioContext = null;

/** @type {OscillatorNode | null} oscillator */
let oscillator = null;

function setupOscillator() {
    if (oscillator) return;
    oscillator = audioContext.createOscillator();
    oscillator.connect(audioContext.destination);
}

/**
 * @returns {OscillatorNode} Instantiated oscillator node
 */
export function useOscillator() {
    if (!audioContext) audioContext = new AudioContext();
    setupOscillator();
}
