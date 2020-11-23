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
    var lineTop = Math.round((top - halfWindowHeight + halfLineHeight));
    var lineBottom = Math.round(lineTop + (halfLineHeight * 2));
    cm.scrollTo(null, lineTop);
    var linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
    var topEl = linesEl.querySelector('.cm-typewriter-scroll-zen-before');
    topEl.style.height = (lineTop - halfLineHeight + parseInt(linesEl.style.paddingTop)) + 'px';
    var bottomEl = linesEl.querySelector('.cm-typewriter-scroll-zen-after');
    bottomEl.style.top = (lineBottom - halfLineHeight + parseInt(linesEl.style.paddingTop)) + 'px';
};
var shadow = null;
CodeMirror.defineOption("typewriterScrolling", false, function (cm, val, old) {
    if (old && old != CodeMirror.Init) {
        const linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
        linesEl.style.paddingTop = null;
        cm.off("changes", onChanges);
        cm.off("cursorActivity", onCursorActivity);
        cm.off("refresh", onRefresh);
    }
    if (val) {
        cm.on("changes", onChanges);
        cm.on("cursorActivity", onCursorActivity);
        cm.on("refresh", onRefresh);
        const linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
        let div = document.createElement('div');
        div.classList.add('cm-typewriter-scroll-zen-before');
        linesEl.appendChild(div);
        div = document.createElement('div');
        div.classList.add('cm-typewriter-scroll-zen-after');
        linesEl.appendChild(div);
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
    if (cm.getSelection().length !== 0) {
        return;
    }
    cm.execCommand("scrollSelectionToCenter");
    return;
}
function onRefresh(cm) {
    const halfWindowHeight = cm.getWrapperElement().offsetHeight / 2;
    const linesEl = cm.getScrollerElement().querySelector('.CodeMirror-lines');
    linesEl.style.paddingTop = `${halfWindowHeight}px`;
    if (cm.getSelection().length === 0) {
        cm.execCommand("scrollSelectionToCenter");
    }
}