import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
	checkboxOptions: {
		[key: string]: boolean;
	};
	displayLabels: {
		[key: string]: string;
	};
	displayOption: 'text' | 'emoji' | 'both';
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	checkboxOptions: {
		b: true,
		c: true,
		d: true,
		f: true,
		i: true,
		k: true,
		l: true,
		n: true,
		p: true,
		u: true,
		w: true,
		x: true,
		'!': true,
		'-': true,
		'\"': true,
		'<': true,
		'>': true,
		'?': true,
		'/': true,
		'~': true,
	},
	displayLabels: {
		b: 'Bookmark',
		c: 'Thumbs Down',
		d: 'Downwards Trend Arrow',
		f: 'Fire',
		i: 'Information',
		k: 'Key',
		l: 'Location Pin',
		n: 'Thumbtack',
		p: 'Thumbs Up',
		u: 'Upwards Trend Arrow',
		w: 'Birthday Cake',
		x: 'Exclamation Mark',
		'!': 'Good',
		'-': 'Red X',
		'\"': 'Quotation Mark',
		'<': 'Calendar',
		'>': 'Curved Arrow Pointing Right',
		'?': 'Question Mark',
		'/': 'Greyed Out Box',
		'~': 'Yellow Checkmark for Half Completion',
	},
	displayOption: 'emoji',
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			new Notice('This is a notice!');
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						new SampleModal(this.app).open();
					}
					return true;
				}
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (evt.altKey && target.matches('input[type="checkbox"]')) {
				evt.preventDefault();
				this.showCheckboxOptionsMenu(evt.clientX, evt.clientY, target);
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	showCheckboxOptionsMenu(x: number, y: number, checkbox: HTMLElement) {
		const options = [
			{ text: '- [-]', display: '❌' },
			{ text: '- [~]', display: '🌗' },
			{ text: '- [/]', display: '🗒️' },
			{ text: '- [!]', display: '⚠️' },
			{ text: '- [?]', display: '❓' },
			{ text: '- [i]', display: '💡' },
			{ text: '- [p]', display: '👍' },
			{ text: '- [c]', display: '👎' },
			{ text: '- [f]', display: '🔥' },
			{ text: '- [u]', display: '📈' },
			{ text: '- [d]', display: '📉' },
			{ text: '- [b]', display: '🔖' },
			{ text: '- ["]', display: '💬' },
			{ text: '- [k]', display: '🔑' },
			{ text: '- [l]', display: '📍' },
			{ text: '- [n]', display: '📌' },
			{ text: '- [w]', display: '🎂' },
			{ text: '- [<]', display: '📅' },
			{ text: '- [>]', display: '➡️' },
		];

		const menu = document.createElement('div');
		menu.className = 'my-plugin-context-menu';
		menu.style.position = 'absolute';
		menu.style.left = `${x}px`;
		menu.style.top = `${y}px`;
		menu.style.zIndex = '1000';
		menu.style.maxHeight = '200px';
		menu.style.overflowY = 'auto';
		menu.style.display = 'grid';
		menu.style.gridTemplateColumns = `repeat(3, 1fr)`;
		menu.style.gap = '5px';

		options.forEach(option => {
			if (this.settings.checkboxOptions[option.text.charAt(3)]) {
				const item = document.createElement('div');
				let displayText = '';
				if (this.settings.displayOption === 'text') {
					displayText = option.text;
				} else if (this.settings.displayOption === 'emoji') {
					displayText = option.display;
				} else {
					displayText = `${option.display} ${option.text}`;
				}

				item.textContent = displayText;
				item.style.padding = '10px';
				item.style.cursor = 'pointer';
				item.className = 'menu-item';
				item.addEventListener('click', () => {
					const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
					if (editor) {
						const cursor = editor.getCursor();
						const lineNumber = cursor.line;
						const lineText = editor.getLine(lineNumber);

						if (lineText) {
							const updatedText = option.text;
							const updatedLineText = lineText.replace(/- \[.\]/, updatedText);
							editor.setLine(lineNumber, updatedLineText);
						}
					}
					menu.remove();
				});
				menu.appendChild(item);
			}
		});

		document.body.appendChild(menu);

		const removeMenu = () => {
			menu.remove();
			document.removeEventListener('click', removeMenu);
		};
		document.addEventListener('click', removeMenu);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const enabledBoxesContainer = containerEl.createDiv();
		const enabledBoxesHeader = enabledBoxesContainer.createEl('h2', { text: 'Enabled Boxes' });
		const enabledBoxesContent = enabledBoxesContainer.createDiv();
		enabledBoxesContent.style.display = 'none';

		enabledBoxesHeader.addEventListener('click', () => {
			enabledBoxesContent.style.display = enabledBoxesContent.style.display === 'none' ? 'block' : 'none';
		});

		const options = [
			{ key: '-', label: 'Red X' },
			{ key: 'x', label: 'Cross Out' },
			{ key: 'p', label: 'Thumbs Up' },
			{ key: 'c', label: 'Thumbs Down' },
			{ key: 'u', label: 'Upwards Trend Arrow' },
			{ key: 'd', label: 'Downwards Trend Arrow' },
			{ key: 'b', label: 'Bookmark' },
			{ key: 'i', label: 'Information' },
			{ key: 'k', label: 'Key' },
			{ key: 'f', label: 'Fire' },
			{ key: 'l', label: 'Location Pin' },
			{ key: 'n', label: 'Thumbtack' },
			{ key: 'w', label: 'Birthday Cake' },
			{ key: '!', label: 'Exclamation Mark' },
			{ key: '"', label: 'Quotation Mark' },
			{ key: '<', label: 'Calendar' },
			{ key: '>', label: 'Curved Arrow Pointing Right' },
			{ key: '?', label: 'Question Mark' },
			{ key: '/', label: 'Greyed Out Box' },
			{ key: '~', label: 'Yellow Checkmark for Half Completion' },
		];

		options.forEach(option => {
			new Setting(enabledBoxesContent)
				.setName(`Enable - ${this.plugin.settings.displayLabels[option.key]}`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.checkboxOptions[option.key])
					.onChange(async (value) => {
						this.plugin.settings.checkboxOptions[option.key] = value;
						await this.plugin.saveSettings();
					}));
		});

		new Setting(containerEl)
			.setName('Display Options')
			.setDesc('Choose how to display the options in the dropdown menu.')
			.addDropdown(dropdown =>
				dropdown
					.addOption('text', 'Text')
					.addOption('emoji', 'Emoji')
					.addOption('both', 'Both')
					.setValue(this.plugin.settings.displayOption)
					.onChange(async (value) => {
						this.plugin.settings.displayOption = value as 'text' | 'emoji' | 'both';
						await this.plugin.saveSettings();
					}));
	}
}
