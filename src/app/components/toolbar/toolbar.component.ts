import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VeltService } from '../../services/velt.service';

@Component({
	selector: 'app-toolbar',
	standalone: true,
	imports: [CommonModule],
	styleUrl: './toolbar.component.scss',
	templateUrl: './toolbar.component.html',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ToolbarComponent implements OnInit {
	isDarkMode = false;

	constructor(private veltService: VeltService) {}

	ngOnInit() {
		this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		this.updateColorScheme();
	}

	toggleDarkMode() {
		this.isDarkMode = !this.isDarkMode;
		this.updateColorScheme();
	}

	private updateColorScheme() {
		document.body.style.colorScheme = this.isDarkMode ? 'dark' : 'light';
		this.veltService.setDarkMode(this.isDarkMode);
	}
}
