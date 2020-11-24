// all credit to azu: https://github.com/azu/codemirror-typewriter-scrolling/blob/b0ac076d72c9445c96182de87d974de2e8cc56e2/typewriter-scrolling.js
"use strict";
CodeMirror.commands.scrollSelectionToCenter = function (cm) {
    if (cm.getOption("disableInput")) {
        return CodeMirror.Pass;
    }
    var cursor = cm.getCursor('anchor');
    var charCoords = cm.charCoords(cursor, "local");
    var top = charCoords.top;
    var halfLineHeight = (charCoords.bottom - top) / 2;
    var halfWindowHeight = cm.getWrapperElement().offsetHeight / 2;
    var scrollTo = Math.round((top - halfWindowHeight + halfLineHeight));
    cm.scrollTo(null, scrollTo);
};
CodeMirror.defineOption("typewriterScrolling", false, function (cm, val, old) {
    if (old && old != CodeMirror.Init) {
        const linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
        linesEl.style.paddingTop = null;
        cm.off("changes", onChanges);
        cm.off("cursorActivity", onCursorActivity);
        cm.off("refresh", onRefresh);
    }
    if (val) {
        onRefresh(cm);
        cm.on("changes", onChanges);
        cm.on("cursorActivity", onCursorActivity);
        cm.on("refresh", onRefresh);
    }
});
function onChanges(cm, changes) {
    if (cm.getSelection().length !== 0) {
        return;
    }
    for (var i = 0, len = changes.length; i < len; i++) {
        var each = changes[i];
        if (each.origin === '+input' || each.origin === '+delete') {
            cm.execCommand("scrollSelectionToCenter");
            return;
        }
    }
}
function onCursorActivity(cm) {
    const linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
    if (cm.getSelection().length !== 0) {
        linesEl.classList.add("selecting")
    }
    else {
        linesEl.classList.remove("selecting")
    }
    cm.execCommand("scrollSelectionToCenter");
}
function onRefresh(cm) {
    const halfWindowHeight = cm.getWrapperElement().offsetHeight / 2;
    const linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
    linesEl.style.paddingTop = `${halfWindowHeight}px`;
    if (cm.getSelection().length === 0) {
        cm.execCommand("scrollSelectionToCenter");
    }
}