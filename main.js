import './style.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useOscillator } from './useOscillator';
import { modes, noteMap } from './constants';

const scanLog = [];

const output = document.querySelector('output');
function updateOutput() {
    output.innerHTML = scanLog.join('<br>');
}

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
    console.log(noteMap);
    for (const [note] of noteMap) {
        console.log({ note });
        const option = document.createElement('option');
        option.textContent = note;
        fragment.appendChild(option);
    }
    rootNoteEl.innerHTML = '';
    rootNoteEl.appendChild(fragment);
}

function updateModeOptions() {
    const fragment = document.createDocumentFragment();
    for (const [mode] in Object.keys(modes)) {
        // console.log({ mode });
        const option = document.createElement('option');
        option.textContent = mode;
        fragment.appendChild(option);
    }
    console.log({ fragment });
    modesEl.innerHTML = '';
    modesEl.appendChild(fragment);
}

updateNoteOptions();
updateModeOptions();

// How to generate tones w/ web API: https://marcgg.com/blog/2016/11/01/javascript-audio/
// TODO write library
document.querySelector('#tone').addEventListener('click', () => {
    makeTone();
});

/**
 * Play the given arrow of notes (numbers) assuming 0 is the root note and subsequent numbers are in the selected mode
 * @param {number[]} noteList The list of notes to play in the selected mode & root
 */
function playNotes(noteList) {
    const o = useOscillator();
    // get selected root note - select#rootNote
    const selectedRootNote = document.querySelector('#rootNote');
    // get selected mode - select#mode
    const selectedMode = document.querySelector('#mode');
    // get duration - input[type="number"]
    const duration = document.querySelector('input[type="number"]').value;
    // set o.frequency.value to matching frequency given the current note in the mode
}

const middleC = 261.6;

function makeTone() {
    const context = new AudioContext();
    const o = context.createOscillator();
    o.connect(context.destination);
    o.frequency.value = 880;
    o.start();
    setTimeout(() => (o.frequency.value = 440), 1000);
    setTimeout(() => o.stop(), 2000);
}
