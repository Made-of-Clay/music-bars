import { Html5QrcodeScanner } from 'html5-qrcode';

/** @param {(code: string) => void} handleSuccess */
export function useScanner(handleSuccess) {
    function onScanSuccess(decodedText, decodedResult) {
        handleSuccess(decodedText);
        html5QrcodeScanner.clear();
    }

    let lastMessage = '';
    function onScanError(message) {
        if (lastMessage === message) return;
        lastMessage = message;
        console.error(message);
    }
    const html5QrcodeScanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: 250,
    });
    function render() {
        // Scanner Docs: https://blog.minhazav.dev/research/html5-qrcode
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

    return { render };
}
