const playBtn = document.querySelector('#play');
const rescanBtn = document.querySelector('#rescan');
const stopBtn = document.querySelector('#stop');

const hiddenClass = 'is-hidden';

export function useButtonManager() {
    function hideAll() {
        playBtn.classList.add(hiddenClass);
        rescanBtn.classList.add(hiddenClass);
        stopBtn.classList.add(hiddenClass);
    }
    function showPlay() {
        playBtn.classList.remove(hiddenClass);
    }
    function showRescan() {
        rescanBtn.classList.remove(hiddenClass);
    }
    function showStop() {
        stopBtn.classList.remove(hiddenClass);
    }
    function hidePlay() {
        playBtn.classList.add(hiddenClass);
    }
    function hideRescan() {
        rescanBtn.classList.add(hiddenClass);
    }
    function hideStop() {
        stopBtn.classList.add(hiddenClass);
    }
    return {
        hideAll,
        showPlay,
        showRescan,
        showStop,
        hidePlay,
        hideRescan,
        hideStop,
    };
}
