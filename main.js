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
    console.log('mode keys', Object.keys(modes));
    for (const mode of Object.keys(modes)) {
        console.log({ mode });
        const option = document.createElement('option');
        option.textContent = mode;
        fragment.appendChild(option);
    }
    modesEl.innerHTML = '';
    modesEl.appendChild(fragment);
}

updateNoteOptions();
updateModeOptions();

// How to generate tones w/ web API: https://marcgg.com/blog/2016/11/01/javascript-audio/
document.querySelector('#tone').addEventListener('click', () => {
    // makeTone();
    console.log({
        rootNote: rootNoteEl.value,
        mode: modes[modesEl.value],
        modeIndex: modesEl.value,
        modes,
    });
    // console.log(
    //     'getFrequenciesFromMode',
    //     getFrequenciesFromMode(rootNoteEl.value, modes[modesEl.value])
    // );
    // const frequencies = getFrequenciesFromMode(rootNoteEl.value, modes[modesEl.value]);
    play();
});

/**
 * @param {string} rootNote
 * @param {number[]} mode
 * @returns {number[]} Sequence of frequencies to play
 */
function getFrequenciesFromMode(rootNote, mode) {
    console.log({ mode });
    const rootNoteIndex = noteMap.findIndex(([root]) => rootNote === root);
    if (rootNoteIndex === -1) {
        console.error(`Invalid root note: ${rootNote}`);
        return;
    }
    // loop mode; each item is added to counter, then counter is how many from rootNoteIndex
    // I should grab frequency
    const notes = [];
    let offset = 0;
    mode.forEach((semitone) => {
        console.log(`${offset} + ${semitone} = ${offset + semitone}`);
        offset += Number(semitone);
        console.log({ offset }, noteMap[offset]);
        notes.push(noteMap[offset][1]);
    });
    // for (const semitone in mode) {
    //     console.log(`${offset} + ${semitone} = ${offset + semitone}`)
    //     offset += Number(semitone);
    //     console.log({ offset }, noteMap[offset]);
    //     notes.push(noteMap[offset][1]);
    // }
    // for (let i = 0, offset = 0; i < mode.length; i++) {
    //     const currentSemitone = mode[i];
    //     offset += currentSemitone;
    //     /** @const {number} frequency */
    //     const [, frequency] = noteMap[offset];
    //     notes.push(frequency);
    // }
    return notes;
}

/**
 * Play the given arrow of notes (numbers) assuming 0 is the root note and subsequent numbers are in the selected mode
 * @param {number[]} noteList The list of notes to play in the selected mode & root
 */
function play() {
    const o = useOscillator();
    // get duration - input[type="number"]
    const duration = durationEl.value;
    // ----
    // call func that sets freq, waits, duration, then sets the next freq in array
    const frequencies = getFrequenciesFromMode(
        rootNoteEl.value,
        modes[modesEl.value]
    );
    // playEachForDuration(frequencies, duration, );
    // o.frequency.value = someFreq;
    // wait duration
    // o.frequency.value = someOtherFreq;
    // wait duration
    async function playThenWait(freqIndex) {
        if (freqIndex >= frequencies.length) {
            o.stop();
        }
        // ! # TODO figure out why this is erroring at o.frequency
        o.frequency.value = frequencies[freqIndex];
        await waitSeconds(duration);
        playThenWait(freqIndex + 1);
    }

    playThenWait(0);
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
