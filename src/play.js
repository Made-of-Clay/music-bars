import { useDuration } from './useDuration';
import { waitSeconds } from './waitSeconds';
import { modes, noteMap } from '../constants';

const { getDurationValue } = useDuration();

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
    const notes = [];

    let offset = rootNoteIndex;
    mode.forEach((semitone) => {
        offset += Number(semitone);
        notes.push(noteMap[offset][1]);
    });

    // * Okay to be this rigid, b/c 0-9 is complete range of barcode ints
    const ninthOffset = mode[1];
    const tenthOffset = mode[1] + mode[2];
    const ninthNote = noteMap[offset + ninthOffset];
    const tenthNote = noteMap[offset + tenthOffset];
    notes.push(ninthNote[1]);
    notes.push(tenthNote[1]);

    return notes;
}

const noop = () => {};
let innerStop = noop;
let isPlaying = false;
export function stop() {
    isPlaying = false;
    innerStop();
}

/**
 * @callback OnEachToneCallback
 * @param {number} toneFrequency
 * @param {number} index
 * @returns void
 */
/**
 * @callback OnPlaybackStop
 * @returns void
 */
/**
 * Play the given arrow of notes (numbers) assuming 0 is the root note and subsequent numbers are in the selected mode
 * @param {number[]} frequencyIndexOrder Order of requencies to play
 * @param {OnEachToneCallback} handleTone
 * @param {OnPlaybackStop} handleFinish
 */
export async function play(frequencyIndexOrder, handleTone, handleFinish) {
    const context = new AudioContext();
    const o = context.createOscillator();
    o.connect(context.destination);
    const rootNoteEl = document.querySelector('#rootNote');
    const modesEl = document.querySelector('#modes');
    const duration = getDurationValue();
    const frequencies = getFrequenciesFromMode(
        rootNoteEl.value,
        modes[modesEl.value]
    );
    console.log({ frequencies });

    // ? I have to assign it this way; doesn't like when I treat innerStop as o.stop alias 🤷‍♂️
    innerStop = () => o.stop();

    const freqOrder = frequencyIndexOrder.map((i) => frequencies[i]);

    // Just loops mode; eventually need a func to play tone array of mixed indexes
    async function playThenWait(freqIndex, freqList) {
        if (freqIndex >= freqList.length && isPlaying) {
            o.stop();
            return;
        } else if (
            freqIndex < freqList.length &&
            freqIndex !== 0 &&
            !isPlaying
        ) {
            return;
        }
        // if (!isPlaying) {
        //     o.stop();
        //     return;
        // }
        o.frequency.value = freqList[freqIndex];
        if (!isPlaying) {
            o.start();
            isPlaying = true;
        }
        handleTone && handleTone(freqList[freqIndex], freqIndex);
        await waitSeconds(duration);
        await playThenWait(freqIndex + 1, freqList);
    }

    await playThenWait(0, freqOrder);
    try {
        console.log('stopping');
        handleFinish && handleFinish();
        o.stop();
        innerStop = noop;
    } catch (_) {}
}
