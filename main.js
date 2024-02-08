import './style.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useOscillator } from './useOscillator';
import { modes, noteMap } from './constants';

function waitSeconds(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

const scanLog = [];

// const output = document.querySelector('output');
// function updateOutput() {
//     output.innerHTML = scanLog.join('<br>');
// }

const durationEl = document.body.querySelector('#duration');
function updateDurationOutput() {
    document.body.querySelector('#timePerNote').innerText = durationEl.value;
}
durationEl.addEventListener('input', updateDurationOutput);
updateDurationOutput();

function onScanSuccess(decodedText, decodedResult) {
    const time = new Date().toLocaleTimeString();
    const item = `${decodedText} @ ${time}`;
    if (!scanLog.includes(item)) scanLog.push(item);
    updateOutput();
    html5QrcodeScanner.clear();
}

let lastMessage = '';
function onScanError(message) {
    if (lastMessage === message) return;
    lastMessage = message;
    console.error(message);
}

// Scanner Docs: https://blog.minhazav.dev/research/html5-qrcode
const html5QrcodeScanner = new Html5QrcodeScanner('reader', {
    fps: 10,
    qrbox: 250,
});
// html5QrcodeScanner.render(onScanSuccess, onScanError);

const rootNoteEl = document.querySelector('#rootNote');
const modesEl = document.querySelector('#modes');

function updateNoteOptions() {
    // use for..of on noteMap to create options for each note, append them to a document fragment, then append the finished result to the #rootNote select element
    const fragment = document.createDocumentFragment();
    for (const [note] of noteMap) {
        const option = document.createElement('option');
        option.textContent = note;
        fragment.appendChild(option);
    }
    rootNoteEl.innerHTML = '';
    rootNoteEl.appendChild(fragment);
}

function updateModeOptions() {
    const fragment = document.createDocumentFragment();
    for (const mode of Object.keys(modes)) {
        const option = document.createElement('option');
        option.textContent = mode;
        fragment.appendChild(option);
    }
    modesEl.innerHTML = '';
    modesEl.appendChild(fragment);
}

updateNoteOptions();
updateModeOptions();
rootNoteEl.value = 'C4';

// How to generate tones w/ web API: https://marcgg.com/blog/2016/11/01/javascript-audio/
document.querySelector('#tone').addEventListener('click', play);

/**
 * @param {string} rootNote
 * @param {number[]} mode
 * @returns {number[]} Sequence of frequencies to play
 */
function getFrequenciesFromMode(rootNote, mode) {
    const rootNoteIndex = noteMap.findIndex(([root]) => rootNote === root);
    if (rootNoteIndex === -1) {
        console.error(`Invalid root note: ${rootNote}`);
        return;
    }
    // loop mode; each item is added to counter, then counter is how many from rootNoteIndex
    // I should grab frequency
    const notes = [];
    let offset = rootNoteIndex;
    mode.forEach((semitone) => {
        offset += Number(semitone);
        notes.push(noteMap[offset][1]);
    });
    return notes;
}

/**
 * Play the given arrow of notes (numbers) assuming 0 is the root note and subsequent numbers are in the selected mode
 * @param {number[]} noteList The list of notes to play in the selected mode & root
 */
async function play() {
    const context = new AudioContext();
    const o = context.createOscillator();
    o.connect(context.destination);
    const duration = durationEl.value;
    const frequencies = getFrequenciesFromMode(
        rootNoteEl.value,
        modes[modesEl.value]
    );

    let isPlaying = false;
    async function playThenWait(freqIndex) {
        if (freqIndex >= frequencies.length && isPlaying) {
            o.stop();
            return;
        }
        o.frequency.value = frequencies[freqIndex];
        if (!isPlaying) {
            o.start();
            isPlaying = true;
        }
        await waitSeconds(duration);
        await playThenWait(freqIndex + 1);
    }

    await playThenWait(0);
    try {
        console.log('stopping');
        o.stop();
    } catch (_) {}
}
