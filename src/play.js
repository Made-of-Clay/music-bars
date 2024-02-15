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
export async function play() {
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
