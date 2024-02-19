import './style.css';
import { modes, noteMap } from './constants';
import { useDuration } from './src/useDuration';
import { play, stop } from './src/play';
import { useScanner } from './src/useScanner';

const { updateDurationOutput } = useDuration();
updateDurationOutput();

const getDisplay = () => document.getElementById('display');

let barcode = '0';
function getBarcodeAsArray() {
    return barcode.split('').map(Number);
}
function clearBarcode() {
    barcode = '0';
    getDisplay().innerHTML = '';
}

/** @param {number} barcode */
function updateBarcodeDisplay(barcode) {
    const docFrag = document.createDocumentFragment();
    getBarcodeAsArray().forEach((n) => {
        const span = document.createElement('span');
        span.textContent = n;
        span.setAttribute('data-playing', 'false');
        docFrag.appendChild(span);
    });
    const display = getDisplay();
    if (!display) {
        alert('output#display disappeared');
        return;
    }
    display.appendChild(docFrag);
    const animationPulseClass = 'anim-pulse';
    display.classList.add(animationPulseClass);
    setTimeout(() => display.classList.remove(animationPulseClass), 1000);
}

/** @param {string} code */
function handleSuccess(code) {
    if (isNaN(Number(code))) {
        console.error(`Invalid code: ${code}`);
        return;
    }
    barcode = code;
    updateBarcodeDisplay();
    document.getElementById('tone')?.removeAttribute('disabled');
}
const { render } = useScanner(handleSuccess);
render();

document.getElementById('rescan').addEventListener('click', () => {
    render();
    clearBarcode();
});
document.getElementById('stop').addEventListener('click', () => {
    stop();
    handleFinish();
});

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

/**
 * @param {number} toneFrequency
 * @param {number} index
 */
function handleEachTone(_toneFrequency, index) {
    const digit = getDisplay()?.querySelector(`span:nth-child(${index + 1})`);
    if (!digit) {
        console.warn(`No digit exist in markup at index ${index}`);
        return;
    }
    digit.previousElementSibling?.setAttribute('data-playing', false);
    digit.setAttribute('data-playing', true);
}
function handleFinish() {
    getDisplay()
        ?.querySelector('span[data-playing="true"]')
        .setAttribute('data-playing', false);
}

// How to generate tones w/ web API: https://marcgg.com/blog/2016/11/01/javascript-audio/
document
    .querySelector('#tone')
    .addEventListener('click', () =>
        play(getBarcodeAsArray(), handleEachTone, handleFinish)
    );
