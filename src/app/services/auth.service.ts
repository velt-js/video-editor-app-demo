import { Injectable, signal } from '@angular/core';
import { GUEST_USERS } from '../utils/constant';

export interface User {
	userId: string;
	displayName: string;
	email: string;
	photoURL: string;
	textColor: string;
	organizationId: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private userSignal = signal<User | null>(null);

	constructor() {
		// Load user from localStorage on service initialization
		this.loadUserFromStorage();
	}

	private loadUserFromStorage(): void {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			this.userSignal.set(JSON.parse(storedUser));
		}
	}

	private generateRandomUser(): User {
		const randomIndex = Math.floor(Math.random() * GUEST_USERS.length);
		const randomUser = GUEST_USERS[randomIndex];
		return {
			userId: `user${randomIndex}`,
			displayName: randomUser.name,
			email: `${randomUser.name.toLowerCase().replace(' ', '.')}@velt.dev`,
			photoURL: randomUser.photoUrl,
			textColor: "#fff",
			organizationId: "velt-sample-app",
		};
	}

	login(): void {
		let user = this.userSignal();
		if (!user) {
			user = this.generateRandomUser();
			localStorage.setItem('user', JSON.stringify(user));
		}
		this.userSignal.set(user);
	}

	getUser() {
		return this.userSignal.asReadonly();
	}
}