import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VeltService } from './services/velt.service';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ToolbarComponent } from "./components/toolbar/toolbar.component";
import { DocumentComponent } from './components/document/document.component'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, SidebarComponent, ToolbarComponent, DocumentComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit {
	title = 'sheets';

	constructor(
		private veltService: VeltService,
		private authService: AuthService,
	) { }


	async ngOnInit(): Promise<void> {
		// Follow the Setup Guide for more info: https://docs.velt.dev/get-started/setup/install

		await this.veltService.initializeVelt('AN5s6iaYIuLLXul0X4zf');

		const user = this.authService.getUser()();
		if (user) {
			await this.veltService.identifyUser(user);
		}

		await this.veltService.setDocument('video', { documentName: 'video' });
		this.veltService.setDarkMode(true);
	}
}
