import './styles.scss'
import './typewriter-scrolling'
import { Plugin, MarkdownView } from 'obsidian';

export default class CMTypewriterScrollPlugin extends Plugin {

  settings: any;
  async onInit() {
    
  }

  async onload() {
    this.settings = await this.loadData() || { enabled: true } as any;
    if (this.settings.enabled) {
      (this.app.workspace as any).layoutReady ? this.enable() : this.app.workspace.on('layout-ready', this.enable);
    }

    // add the toggle on/off command
    this.addCommand({
      id: 'toggle-typewriter-sroll',
      name: 'Toggle On/Off',
      callback: () => {
        // disable or enable as necessary
        this.settings.enabled ? this.disable() : this.enable();
      }
    });
  }

  onunload() {
    this.disable();
  }
  
  disable = () => {
    document.body.classList.remove('plugin-cm-typewriter-scroll');

    this.app.off("codemirror", this.addTypewriterScroll);

    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        this.addTypewriterScroll(leaf.view.sourceMode.cmEditor, false);
      }
    })

    this.settings.enabled = false;
    this.saveData(this.settings);
  }

  enable = () => {
    document.body.classList.add('plugin-cm-typewriter-scroll');

    this.app.on("codemirror", this.addTypewriterScroll);

    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        this.addTypewriterScroll(leaf.view.sourceMode.cmEditor);
      }
    })

    this.settings.enabled = true;
    this.saveData(this.settings);
  }

  // @ts-ignore
  addTypewriterScroll = (cm: CodeMirror.Editor, enable: boolean = true) => {
    cm.setOption("typewriterScrolling", enable);
  }
}