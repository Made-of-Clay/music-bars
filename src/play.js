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
    const n = mode[1]; // rule for 9th note == (rule for 2nd note + octave)
    notes.push(noteMap[offset + n][1]); // get 9th note (ocatave + 1)

    return notes;
}

const noop = () => {};
let innerStop = noop;
export function stop() {
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

    // ? I have to assign it this way; doesn't like when I treat innerStop as o.stop alias 🤷‍♂️
    innerStop = () => o.stop();

    const fakeFreqOrder = frequencyIndexOrder.map((i) => frequencies[i]);

    let isPlaying = false;
    // Just loops mode; eventually need a func to play tone array of mixed indexes
    async function playThenWait(freqIndex, freqList) {
        if (freqIndex >= freqList.length && isPlaying) {
            o.stop();
            return;
        }
        console.log({
            freqList: freqList,
            frequency: freqList[freqIndex],
            freqIndex: freqIndex,
        });
        o.frequency.value = freqList[freqIndex];
        if (!isPlaying) {
            o.start();
            isPlaying = true;
        }
        handleTone && handleTone(freqList[freqIndex], freqIndex);
        await waitSeconds(duration);
        await playThenWait(freqIndex + 1, freqList);
    }

    await playThenWait(0, fakeFreqOrder);
    try {
        console.log('stopping');
        handleFinish && handleFinish();
        o.stop();
        innerStop = noop;
    } catch (_) {}
}
