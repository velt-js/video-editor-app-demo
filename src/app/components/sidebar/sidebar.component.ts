import { Component } from '@angular/core';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
	public iconOnly: boolean = false;

	constructor() {
		// Hides Icons if the screen size is small
		this.checkScreenSize();
		window.addEventListener('resize', () => this.checkScreenSize());
	}

	// Hides Icons if the screen size is small
	private checkScreenSize(): void {
		this.iconOnly = window.innerWidth < 1200;
	}
}
