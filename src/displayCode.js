// * Developer Note
// This code as a module should be fine, but if I ever need "instance-specific"
// data preserved between uses, I'll need to use a hook/composable (curry) pattern.

let display = null;
export function getDisplay() {
    if (!display) {
        display = document.getElementById('display');
    }

    return display;
}

let barcode = '0';
export const setBarcode = (value) => (barcode = value);
export function getBarcodeAsArray() {
    return barcode.split('').map(Number);
}
export function clearBarcode() {
    barcode = '0';
    getDisplay().innerHTML = '';
}

/** @param {number} barcode */
export function updateBarcodeDisplay(barcode) {
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
