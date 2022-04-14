import { Extension } from '@codemirror/state';
import './styles.scss'
import './typewriter-scrolling'
import { Plugin, MarkdownView, PluginSettingTab, App, Setting } from 'obsidian'
import { resetTypewriterSrcoll, typewriterScroll } from './extension'

class CMTypewriterScrollSettings {
  enabled: boolean;
  typewriterOffset: number;
  zenEnabled: boolean;
  zenOpacity: number;
}

const DEFAULT_SETTINGS: CMTypewriterScrollSettings = {
  enabled: true,
  typewriterOffset: 0.5,
  zenEnabled: false,
  zenOpacity: 0.25
}

export default class CMTypewriterScrollPlugin extends Plugin {
  settings: CMTypewriterScrollSettings;
  private css: HTMLElement;
  private ext: Extension;
  private extArray: Extension[] = [];

  async onload() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    
    // enable the plugin (based on settings)
    if (this.settings.enabled) this.enableTypewriterScroll();
    if (this.settings.zenEnabled) this.enableZen();

    this.css = document.createElement('style');
    this.css.id = 'plugin-typewriter-scroll';
    this.css.setAttr('type', 'text/css');
    document.getElementsByTagName("head")[0].appendChild(this.css);
    this.css.innerText = `body{--zen-opacity: ${this.settings.zenOpacity};}`;

    // add the settings tab
    this.addSettingTab(new CMTypewriterScrollSettingTab(this.app, this));

    // add the commands / keyboard shortcuts
    this.addCommands();
  }

  onunload() {
    // disable the plugin
    this.disableTypewriterScroll();
    this.disableZen();
  }

  addCommands() { 
    // add the toggle on/off command
    this.addCommand({
      id: 'toggle-typewriter-sroll',
      name: 'Toggle On/Off',
      callback: () => { this.toggleTypewriterScroll(); }
    });

    // toggle zen mode
    this.addCommand({
      id: 'toggle-typewriter-sroll-zen',
      name: 'Toggle Zen Mode On/Off',
      callback: () => { this.toggleZen(); }
    });
  }

  toggleTypewriterScroll = (newValue: boolean = null) => {
    // if no value is passed in, toggle the existing value
    if (newValue === null) newValue = !this.settings.enabled;
    // assign the new value and call the correct enable / disable function
    (this.settings.enabled = newValue)
      ? this.enableTypewriterScroll() : this.disableTypewriterScroll();
    // save the new settings
    this.saveData(this.settings);
  }

  changeTypewriterOffset = (newValue: number) => {
    this.settings.typewriterOffset = newValue;
    if (this.settings.enabled) {
      this.disableTypewriterScroll();
      // delete the extension, so it gets recreated with the new value
      delete this.ext;
      this.enableTypewriterScroll();
    }
    this.saveData(this.settings);
  }

  toggleZen = (newValue: boolean = null) => {
    // if no value is passed in, toggle the existing value
    if (newValue === null) newValue = !this.settings.zenEnabled;
    // assign the new value and call the correct enable / disable function
    (this.settings.zenEnabled = newValue)
      ? this.enableZen() : this.disableZen();
    // save the new settings
    this.saveData(this.settings);
  }

  changeZenOpacity = (newValue: number = 0.25) => {
    this.settings.zenOpacity = newValue;
    this.css.innerText = `body{--zen-opacity: ${newValue};}`;
    // save the new settings
    this.saveData(this.settings);
  }

  enableTypewriterScroll = () => {
    // add the class
    document.body.classList.add('plugin-cm-typewriter-scroll');

    // register the codemirror add on setting
    this.registerCodeMirror(cm => {
      // @ts-ignore
      cm.setOption("typewriterScrolling", true);
    });

    if (!this.ext) {
      this.ext = typewriterScroll({ typewriterOffset: this.settings.typewriterOffset });
      this.extArray = [this.ext];
      this.registerEditorExtension(this.extArray);
    }
    else {
      this.extArray.splice(0, this.extArray.length);
      this.extArray.push(this.ext);
      this.app.workspace.updateOptions();
    }
  }
  
  disableTypewriterScroll = () => {
    // remove the class
    document.body.classList.remove('plugin-cm-typewriter-scroll');

    // remove the codemirror add on setting
    this.app.workspace.iterateCodeMirrors(cm => {
      // @ts-ignore
      cm.setOption("typewriterScrolling", false);
    });

    // clear out the registered extension
    this.extArray.splice(0, this.extArray.length);
    this.extArray.push(resetTypewriterSrcoll())
    this.app.workspace.updateOptions();
  }

  enableZen = () => {
    // add the class
    document.body.classList.add('plugin-cm-typewriter-scroll-zen');
  }

  disableZen = () => {
    // remove the class
    document.body.classList.remove('plugin-cm-typewriter-scroll-zen');
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
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.enabled)
          .onChange((newValue) => { this.plugin.toggleTypewriterScroll(newValue) })
      );
    
    new Setting(containerEl)
      .setName("Center offset")
      .setDesc("Positions the typewriter text at the specified percentage of the screen")
      .addSlider(slider =>
        slider.setLimits(0, 100, 5)
          .setValue(this.plugin.settings.typewriterOffset * 100)
          .onChange((newValue) => { this.plugin.changeTypewriterOffset(newValue/100)})
      );

    new Setting(containerEl)
      .setName("Zen Mode")
      .setDesc("Darkens non-active lines in the editor so you can focus on what you're typing")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.zenEnabled)
          .onChange((newValue) => { this.plugin.toggleZen(newValue) })
      );

    new Setting(containerEl)
      .setName("Zen Opacity")
      .setDesc("The opacity of unfocused lines in zen mode")
      .addSlider(slider =>
        slider.setLimits(0, 100, 5)
          .setValue(this.plugin.settings.zenOpacity * 100)
          .onChange((newValue) => { this.plugin.changeZenOpacity(newValue / 100) })
      );
  }
}
