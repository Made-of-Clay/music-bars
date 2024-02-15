const durationEl = document.body.querySelector('#duration');

function updateDurationOutput() {
    document.body.querySelector('#timePerNote').innerText = durationEl.value;
}

durationEl.addEventListener('input', updateDurationOutput);

updateDurationOutput();

function getDurationValue() {
    return durationEl.value;
}

export function useDuration() {
    return {
        updateDurationOutput,
        getDurationValue,
    };
}
