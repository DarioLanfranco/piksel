(function () {
  var viewer = document.querySelector('model-viewer');
  if (!viewer) return;
  if (!customElements.get('model-viewer')) {
    var s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }
})();
