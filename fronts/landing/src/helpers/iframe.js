export default {
  isIframed: window.top !== window,
  postMessage(message) {
    window.top?.postMessage(message, '*');
  },
  onMessage(callback) {
    window.addEventListener('message', callback);
  },
  offMessage(callback) {
    window.removeEventListener('message', callback);
  },
};