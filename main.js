import './style.css';
import { modes, noteMap } from './constants';
import { useDuration } from './src/useDuration';
import { play, stop } from './src/play';
import { useScanner } from './src/useScanner';
import {
    getDisplay,
    setBarcode,
    getBarcodeAsArray,
    clearBarcode,
    updateBarcodeDisplay,
} from './src/displayCode';
import { useButtonManager } from './src/useButtonManager';

const { updateDurationOutput } = useDuration();
updateDurationOutput();

const {
    hideAll,
    showPlay,
    showRescan,
    showStop,
    hidePlay,
    hideRescan,
    hideStop,
} = useButtonManager();
function handleDisplayChange(isScanning) {
    console.log({ isScanning });
    // all buttons hide when scanning, else,
    if (isScanning) {
        hideAll();
    } else {
        showPlay();
        showRescan();
    }
    // what does it mean that we're not scanning anymore?
}

/** @param {string} code */
function handleSuccess(code) {
    if (isNaN(Number(code))) {
        console.error(`Invalid code: ${code}`);
        return;
    }
    setBarcode(code);
    updateBarcodeDisplay();
    document.getElementById('play')?.removeAttribute('disabled');
}
const { render } = useScanner(handleSuccess, handleDisplayChange);
render();

document.getElementById('rescan').addEventListener('click', () => {
    render();
    clearBarcode();
});
document.getElementById('stop').addEventListener('click', () => {
    stop();
    showPlay();
    showRescan();
    hideStop();
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
    hideStop();
    showPlay();
    showRescan();
}

// How to generate tones w/ web API: https://marcgg.com/blog/2016/11/01/javascript-audio/
document.querySelector('#play').addEventListener('click', () => {
    play(getBarcodeAsArray(), handleEachTone, handleFinish);
    hidePlay();
    hideRescan();
    showStop();
});
