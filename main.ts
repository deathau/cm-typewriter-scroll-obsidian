import './styles.scss'
import './typewriter-scrolling'
import { Plugin, MarkdownView, PluginSettingTab, App, Setting } from 'obsidian';

export default class CMTypewriterScrollPlugin extends Plugin {
  settings: CMTypewriterScrollSettings;
  async onInit() {
    
  }

  async onload() {
    const data = await this.loadData();
    if (data) this.settings = new CMTypewriterScrollSettings(data);
    else this.settings =  new CMTypewriterScrollSettings();
    if (this.settings.enabled) {
      (this.app.workspace as any).layoutReady ? this.enable() : this.app.workspace.on('layout-ready', this.enable);
    }

    // add the settings tab
    this.addSettingTab(new CMTypewriterScrollSettingTab(this.app, this));

    // add the toggle on/off command
    this.addCommand({
      id: 'toggle-typewriter-sroll',
      name: 'Toggle On/Off',
      callback: () => {
        // disable or enable as necessary
        this.settings.enabled ? this.disable() : this.enable();
        this.settings.enabled = !this.settings.enabled;
        this.saveData(this.settings);
      }
    });

    // toggle zen mode
    this.addCommand({
      id: 'toggle-typewriter-sroll-zen',
      name: 'Toggle Zen Mode On/Off',
      callback: () => {
        // disable or enable as necessary
        this.settings.zenEnabled ? this.disableZen() : this.enableZen();
        this.settings.zenEnabled = !this.settings.zenEnabled;
        this.saveData(this.settings);
      }
    });
  }

  onunload() {
    this.disable(true);
  }
  
  disable = (unloading = false) => {
    document.body.classList.remove('plugin-cm-typewriter-scroll');

    this.app.off("codemirror", this.addTypewriterScroll);

    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        this.addTypewriterScroll(leaf.view.sourceMode.cmEditor, false);
      }
    })

    if (unloading) this.disableZen();
  }

  enable = () => {
    document.body.classList.add('plugin-cm-typewriter-scroll');

    this.app.on("codemirror", this.addTypewriterScroll);

    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        this.addTypewriterScroll(leaf.view.sourceMode.cmEditor);
      }
    })

    if (this.settings.zenEnabled) this.enableZen();
  }

  enableZen = () => {
    document.body.classList.add('plugin-cm-typewriter-scroll-zen');
  }

  disableZen = () => {
    document.body.classList.remove('plugin-cm-typewriter-scroll-zen');
  }

  // @ts-ignore
  addTypewriterScroll = (cm: CodeMirror.Editor, enable: boolean = true) => {
    console.log('here');
    cm.setOption("typewriterScrolling", enable);
  }
}

class CMTypewriterScrollSettings {
  enabled: boolean;
  zenEnabled: boolean;

  constructor(settings: any = {
    // default settings:
    enabled: true,
    zenEnabled: false
  }) {
    this.enabled = !!settings.enabled;
    this.zenEnabled = !!settings.zenEnabled;
  }
}

class CMTypewriterScrollSettingTab extends PluginSettingTab {

  plugin: CMTypewriterScrollPlugin;
  constructor(app: App, plugin: CMTypewriterScrollPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Toggle Typewriter Scrolling")
      .setDesc("Turns typewriter scrolling on or off globally")
      .addToggle(toggle => toggle.setValue(this.plugin.settings.enabled)
        .onChange((value) => {
          this.plugin.settings.enabled = value;
          this.plugin.saveData(this.plugin.settings);
          if (this.plugin.settings.enabled) {
            this.plugin.enable();
          }
          else {
            this.plugin.disable();
          }
        }));

    new Setting(containerEl)
      .setName("Zen Mode")
      .setDesc("Darkens non-active lines in the editor so you can focus on what you're typing")
      .addToggle(toggle => toggle.setValue(this.plugin.settings.zenEnabled)
        .onChange((value) => {
          this.plugin.settings.zenEnabled = value;
          this.plugin.saveData(this.plugin.settings);
          if (this.plugin.settings.zenEnabled) {
            this.plugin.enableZen();
          }
          else {
            this.plugin.disableZen();
          }
        }));

  }
}
