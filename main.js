import './style.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { modes, noteMap } from './constants';
import { useDuration } from './src/useDuration';
import { play } from './src/play';

const scanLog = [];

// const output = document.querySelector('output');
// function updateOutput() {
//     output.innerHTML = scanLog.join('<br>');
// }

const { updateDurationOutput } = useDuration();
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
