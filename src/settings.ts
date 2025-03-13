import { App, PluginSettingTab, Setting } from "obsidian";
import WorkingHoursPlugin from "./main";

export interface Settings {
    name: string;
    folder: string;
}

export const DEFAULT_SETTINGS: Partial<Settings> = {
    folder: "hours",
    name: "Max Mustermensch",
};

export class WorkingTimeSettingTab extends PluginSettingTab {
    plugin: WorkingHoursPlugin;

    constructor(app: App, plugin: WorkingHoursPlugin) {
        super(app, plugin);

        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl).setName("Timesheet Name").setDesc(
            "Name used on Timesheets",
        ).addText((text) =>
            text.setPlaceholder("Max Mustermensch").setValue(
                this.plugin.settings.name,
            ).onChange(async (value) => {
                this.plugin.settings.name = value;
                await this.plugin.saveSettings();
            })
        );

        new Setting(containerEl).setName("Folder Name").setDesc(
            "Name of the folder hours are stored in",
        ).addText((text) =>
            text.setPlaceholder("hours").setValue(
                this.plugin.settings.folder,
            ).onChange(async (value) => {
                this.plugin.settings.folder = value;
                await this.plugin.saveSettings();
            })
        );
    }
}
