/* Evendraft AU: marks the page as scripted before it paints, so entrances can start hidden. If site.js has not
   started 2.5 seconds later, the mark comes off and every section shows as it is: content is never left hidden. */
document.documentElement.classList.add("js");
setTimeout(function () {
  if (!window.EVD_READY) document.documentElement.classList.remove("js");
}, 2500);
