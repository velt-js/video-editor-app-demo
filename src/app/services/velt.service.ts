import { Injectable, EventEmitter } from '@angular/core';
import { initVelt } from '@veltdev/client';
import { AuthService } from './auth.service';
import { User } from '@veltdev/types'

/**
 * Service for managing Velt integration in an Angular application.
 * Handles initialization, user identification, and various Velt-related operations.
 */
@Injectable({
	providedIn: 'root'
})
export class VeltService {
	private client: any;
	public clientInitialized = new EventEmitter<void>();

	constructor(
		private authService: AuthService
	) { }

	/**
	 * Initializes the Velt client with the provided API key.
	 * @param apiKey The Velt API key
	 */
	async initializeVelt(apiKey: string): Promise<void> {
		this.client = await initVelt(apiKey);
		this.authService.login();
		this.clientInitialized.emit();
	}

	/**
	 * Identifies a user with the Velt client.
	 * @param user The user object to identify
	 */
	async identifyUser(user: User): Promise<void> {
		if (this.client) {
			await this.client.identify(user);
		}
	}

	/**
	 * Sets the current document for Velt collaboration.
	 * @param documentId The ID of the document
	 * @param metadata Optional metadata for the document
	 */
	async setDocument(documentId: string, metadata?: any): Promise<void> {
		if (this.client) {
			await this.client.setDocument(documentId, metadata);
		}
	}

	/**
	 * Sets the dark mode for the Velt client.
	 * @param isDarkMode Boolean indicating whether dark mode should be enabled
	 */
	setDarkMode(isDarkMode: boolean): void {
		if (this.client) {
			this.client.setDarkMode(isDarkMode);
		}
	}

	/**
	 * Gets the Velt client instance.
	 * @returns The Velt client instance
	 */
	getClient() {
		return this.client;
	}
}
