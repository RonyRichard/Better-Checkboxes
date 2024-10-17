import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	checkboxOptions: {
		[key: string]: boolean; // To hold the enabled/disabled state for each option
	};
	displayLabels: {
		[key: string]: string; // To hold the descriptive labels for display
	};
	displayOption: 'text' | 'emoji' | 'both'; // New setting for display options
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
	displayOption: 'emoji', // Default display option to just emojis
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// Register LALT click event on checkboxes
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			// Check if the left Alt key is pressed and the target is a checkbox
			if (evt.altKey && target.matches('input[type="checkbox"]')) {
				evt.preventDefault(); // Prevent the default action
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

	// Updated method to show the dropdown menu with visual representations
	showCheckboxOptionsMenu(x: number, y: number, checkbox: HTMLElement) {
		// Rearranged options for better user-friendliness in the dropdown menu
		const options = [
			
			{ text: '- [-]', display: '❌' }, // Red X
			{ text: '- [~]', display: '🌗' },  // Yellow Checkmark for Half Completion
			{ text: '- [/]', display: '🗒️' }, // Greyed Out Box
			{ text: '- [!]', display: '⚠️' }, // Exclaimation Mark
			{ text: '- [?]', display: '❓' }, // Question Mark
			{ text: '- [i]', display: '💡' }, // Information
			{ text: '- [p]', display: '👍' }, // Thumbs Up
			{ text: '- [c]', display: '👎' }, // Thumbs Down
			{ text: '- [f]', display: '🔥' }, // Fire
			{ text: '- [u]', display: '📈' }, // Upwards Trend Arrow
			{ text: '- [d]', display: '📉' }, // Downwards Trend Arrow
			{ text: '- [b]', display: '🔖' }, // Bookmark
			{ text: '- ["]', display: '💬' }, // Quotation Mark
			{ text: '- [k]', display: '🔑' }, // Key
			{ text: '- [l]', display: '📍' }, // Location Pin
			{ text: '- [n]', display: '📌' }, // Thumbtack
			{ text: '- [w]', display: '🎂' }, // Birthday Cake
			{ text: '- [<]', display: '📅' }, // Calendar
			{ text: '- [>]', display: '➡️' }, // Curved Arrow Pointing Right
			
			
		];

		const menu = document.createElement('div');
		menu.className = 'my-plugin-context-menu';
		menu.style.position = 'absolute';
		menu.style.left = `${x}px`;
		menu.style.top = `${y}px`;
		menu.style.zIndex = '1000';
		menu.style.maxHeight = '200px'; // Limit the height of the dropdown
		menu.style.overflowY = 'auto'; // Enable scrolling if content exceeds max height
		menu.style.display = 'grid';
		menu.style.gridTemplateColumns = `repeat(3, 1fr)`; // Default to 3 columns
		menu.style.gap = '5px'; // Space between items

		// Show all options except individual numbers if automatic numbers are enabled
		options.forEach(option => {
			// Check if the option is enabled
			if (this.settings.checkboxOptions[option.text.charAt(3)]) {
				const item = document.createElement('div');
				
				// Determine what to display based on the user's choice
				let displayText = '';
				if (this.settings.displayOption === 'text') {
					displayText = option.text; // Show only text
				} else if (this.settings.displayOption === 'emoji') {
					displayText = option.display; // Show only emoji
				} else {
					displayText = `${option.display} ${option.text}`; // Show both
				}

				item.textContent = displayText; // Set the display text
				item.style.padding = '10px';
				item.style.cursor = 'pointer';
				item.className = 'menu-item'; // Add a class for styling
				item.addEventListener('click', () => {
					const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
					if (editor) {
						const cursor = editor.getCursor(); // Get the current cursor position
						const lineNumber = cursor.line; // Get the current line number
						const lineText = editor.getLine(lineNumber); // Get the current line text

						if (lineText) {
							const updatedText = option.text; // The new text to replace the checkbox
							const updatedLineText = lineText.replace(/- \[.\]/, updatedText); // Replace the checkbox
								editor.setLine(lineNumber, updatedLineText); // Replace the line text
						}
					}
					menu.remove(); // Remove the menu after selection
				});
				menu.appendChild(item); // Append item directly to the menu
			}
		});

		document.body.appendChild(menu);

		// Remove the menu when clicking elsewhere
		const removeMenu = () => {
			menu.remove();
			document.removeEventListener('click', removeMenu);
		};
		document.addEventListener('click', removeMenu);
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

		// Add a section for enabled boxes
		const enabledBoxesContainer = containerEl.createDiv();
		const enabledBoxesHeader = enabledBoxesContainer.createEl('h2', { text: 'Enabled Boxes' });
		const enabledBoxesContent = enabledBoxesContainer.createDiv();
		enabledBoxesContent.style.display = 'none'; // Initially hidden

		enabledBoxesHeader.addEventListener('click', () => {
			// Toggle visibility of the content
			enabledBoxesContent.style.display = enabledBoxesContent.style.display === 'none' ? 'block' : 'none';
		});

		// Rearranged options for better user-friendliness
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
			{ key: '!', label: 'Exclaimation Mark' },
			{ key: '"', label: 'Quotation Mark' },
			{ key: '<', label: 'Calendar' },
			{ key: '>', label: 'Curved Arrow Pointing Right' },
			{ key: '?', label: 'Question Mark' },
			{ key: '/', label: 'Greyed Out Box' },
			{ key: '~', label: 'Yellow Checkmark for Half Completion' },
		];

		// Add checkbox options using the display labels
		options.forEach(option => {
			const setting = new Setting(enabledBoxesContent)
				.setName(`Enable - ${this.plugin.settings.displayLabels[option.key]}`) // Use descriptive label
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.checkboxOptions[option.key])
					.onChange(async (value) => {
						this.plugin.settings.checkboxOptions[option.key] = value;
						await this.plugin.saveSettings();
					}));
		});

		// Add Display Options setting
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
