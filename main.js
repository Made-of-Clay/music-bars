import './style.css';
import { modes, noteMap } from './constants';
import { useDuration } from './src/useDuration';
import { play } from './src/play';
import { useScanner } from './src/useScanner';

const { updateDurationOutput } = useDuration();
updateDurationOutput();

let barcode = '0';
function getBarcodeAsArray() {
    return barcode.split('').map(Number);
}

/** @param {string} code */
function handleSuccess(code) {
    barcode = code;
    document.getElementById('display').innerText = code;
    document.getElementById('tone')?.removeAttribute('disabled');
    console.log(code);
}
const { render } = useScanner(handleSuccess);
render();

const rootNoteEl = document.querySelector('#rootNote');
const modesEl = document.querySelector('#modes');

function updateNoteOptions() {
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
document
    .querySelector('#tone')
    .addEventListener('click', () => play(getBarcodeAsArray()));
