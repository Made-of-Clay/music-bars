import './style.css';
import { Html5QrcodeScanner } from 'html5-qrcode';

const scanLog = [];

const output = document.querySelector('output');
function updateOutput() {
    output.innerHTML = scanLog.join('<br>');
}

function onScanSuccess(decodedText, decodedResult) {
    const time = new Date().toLocaleTimeString();
    const item = `${decodedText} @ ${time}`;
    if (!scanLog.includes(item)) scanLog.push(item);
    updateOutput();
}

var html5QrcodeScanner = new Html5QrcodeScanner('reader', {
    fps: 10,
    qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);
