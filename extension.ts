import { Extension, SelectionRange, EditorState, EditorSelection, Transaction, Prec } from "@codemirror/state"
import { ViewPlugin, ViewUpdate, EditorView } from "@codemirror/view"
declare type ScrollStrategy = "nearest" | "start" | "end" | "center";

const allowedUserEvents = /^(select|input|delete|undo|redo)(\..+)?$/
const disallowedUserEvents = /^(select.pointer)$/

const typewriterScrollPlugin = ViewPlugin.fromClass(class {
  private myUpdate = false;
  private padding:string = null;
  
  constructor(private view: EditorView) { }

  update(update: ViewUpdate) {
    if (this.myUpdate) this.myUpdate = false;
    else {
      this.padding = ((this.view.dom.clientHeight / 2) - (this.view.defaultLineHeight)) + "px"
      if (this.padding != this.view.contentDOM.style.paddingTop) {
        this.view.contentDOM.style.paddingTop = this.view.contentDOM.style.paddingBottom = this.padding
      }

      const userEvents = update.transactions.map(tr => tr.annotation(Transaction.userEvent))
      const isAllowed = userEvents.reduce<boolean>(
        (result, event) => result && allowedUserEvents.test(event) && !disallowedUserEvents.test(event),
        userEvents.length > 0
      );
      if (isAllowed) {
        this.myUpdate = true;
        this.centerOnHead(update)
      }
    }
  }

  async centerOnHead(update: ViewUpdate) {
    // can't update inside an update, so request the next animation frame
    window.requestAnimationFrame(() => {
      // current selection range
      if (update.state.selection.ranges.length == 1) {
        // only act on the one range
        const head = update.state.selection.main.head;
        const prevHead = update.startState.selection.main.head;
        // TODO: work out line number and use that instead? Is that even possible?
        // don't bother with this next part if the range (line??) hasn't changed
        if (prevHead != head) {
          // this is the effect that does the centering
          const effect = EditorView.scrollIntoView(head, { y: "center" })
          const transaction = this.view.state.update({ effects: effect });
          this.view.dispatch(transaction)
        }
      }
    })
  }
})

export function typewriterScroll(options: any = {}): Extension {
  return [
    typewriterScrollPlugin
  ]
}