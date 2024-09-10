import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, effect, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VeltService } from '../../services/velt.service';
import { NgIf } from '@angular/common';

/**
 * DocumentComponent handles the video player functionality and integrates Velt collaboration features.
 */
@Component({
	selector: 'app-document',
	standalone: true,
	imports: [RouterOutlet, NgIf],
	templateUrl: './document.component.html',
	styleUrl: './document.component.scss',

	// Schemas are required to add Velt html tags
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DocumentComponent {
	title = 'video';

	@ViewChild('vid') videoPlayer!: ElementRef<HTMLVideoElement>;
	@ViewChild('timePassedDiv') timePassedDiv!: ElementRef<HTMLVideoElement>;
	@ViewChild('commentPlayerTimeline') commentPlayerTimeline!: ElementRef<HTMLElement>;

	isPlaying: boolean = false;

	// Getting the Velt Client
	client = this.veltService.clientSignal();

	constructor(
		private veltService: VeltService
	) {
		// Set Document when the velt client is initialized
		effect(() => {

			this.client = this.veltService.clientSignal();
			if (this.client) {

				// Contain your comments in a document by setting a Document ID & Name
				this.client.setDocument('video', { documentName: 'video' });

				// Enable dark mode for Velt UI
				this.client.setDarkMode(true);

				// Restrict Commenting to Video Player
				this.client.getCommentElement().allowedElementIds(['vid']);

				/**
				 * When comment is toggled 
				 * we set the current timestamp as the location
				 * and pause the video
				 */
				this.client.getCommentElement().onCommentModeChange().subscribe((mode: boolean) => {
					if (mode) {
						this.setLocation();
						this.videoPlayer.nativeElement.pause();
					}
				});


				/**
				 * When comment is added Pause Video
				 */
				this.client.getCommentElement().onCommentAdd().subscribe(e => {
					this.videoPlayer.nativeElement.pause();
				})


				/**
				 * Set location when reaction tool is toggled
				 */
				const reactionToolTag = document.querySelector('velt-reaction-tool');
				reactionToolTag?.addEventListener('onReactionToolClick', (event: any) => {
					this.setLocation();
				});


				const sidebar = document.querySelector('velt-comments-sidebar')

				// Navigate to comments when someone clicks on a comment in sidebar
				sidebar?.addEventListener('onCommentClick', (e: any) => {

					// Update Video Timestamp
					this.videoPlayer.nativeElement.currentTime = e.detail.location.currentMediaPosition;

					// Update Location based on the comment data
					this.client?.setLocation(e.detail.location);
					this.client?.getCommentElement().toggleCommentSidebar();

					// Calculating and Setting Width to our customer seek
					const seekPercent = (e.detail.location.currentMediaPosition / this.videoPlayer.nativeElement.duration * 100) - 1.5;
					this.timePassedDiv.nativeElement.style.width = seekPercent + '%'

				})
			}
		});
	}

	/**
	 * Sets the current location in Velt based on video player's current timestamp.
	 */
	setLocation = () => {

		let location = {
			id: this.secondsToReadableTime(this.videoPlayer.nativeElement.currentTime),
			locationName: this.secondsToReadableTime(this.videoPlayer.nativeElement.currentTime),
			currentMediaPosition: this.videoPlayer.nativeElement.currentTime,
			videoPlayerId: "vid"
		}

		//set the Location using the client
		this.client?.setLocation(location)
	}

	/**
	 * Sets up event listeners for the video player and Velt components after view initialization.
	 */
	ngAfterViewInit() {

		/**
		 * Update the location using the clicked comment location
		 * and set the video to that timestamp
		 */

		this.commentPlayerTimeline?.nativeElement.addEventListener('onCommentClick', (event: any) => {
			const { location } = event.detail || {};
			if (location && this.videoPlayer) {
				this.videoPlayer.nativeElement.pause();

				if (this.videoPlayer.nativeElement.paused) {

					// Setting the player time
					this.videoPlayer.nativeElement.currentTime = location.currentMediaPosition;

					// Calculating and Setting Width to our customer seek
					const seekPercent = (location.currentMediaPosition / this.videoPlayer.nativeElement.duration * 100) - 1.5;
					this.timePassedDiv.nativeElement.style.width = seekPercent + '%'

					// Set Location in Velt client to show comments at that location (Timestamp)
					this.client?.setLocation(location)
				}
			}
		});

		// Pause video function for custom player 
		this.videoPlayer.nativeElement.addEventListener('pause', (e) => {
			this.isPlaying = false
		})

		// Play video function for custom player 
		this.videoPlayer.nativeElement.addEventListener('play', (e) => {
			this.isPlaying = true
		})

	}

	/**
	 * Toggles play/pause state of the video player.
	 */
	togglePlayPause() {

		if (this.videoPlayer && this.videoPlayer.nativeElement) {
			if (this.videoPlayer.nativeElement.paused) {
				this.videoPlayer.nativeElement.play();
				this.isPlaying = true;
			} else {
				this.videoPlayer.nativeElement.pause();
				this.isPlaying = false;
			}
		}
	}

	/**
	 * Handles custom seek functionality for the video player.
	 * @param event Mouse event from the seek bar
	 */
	customSeek(event: MouseEvent) {
		const seekPercent = (event.offsetX / Number(this.timePassedDiv.nativeElement.parentElement?.clientWidth) * 100);

		this.timePassedDiv.nativeElement.style.width = seekPercent + '%'
		this.videoPlayer.nativeElement.currentTime = this.videoPlayer.nativeElement.duration * seekPercent / 100;
		this.setLocation()
	}

	/**
	 * Converts seconds to a readable time format (MM:SS).
	 * @param seconds The number of seconds to convert.
	 * @returns A string in the format MM:SS.
	 */
	private secondsToReadableTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
		return `${minutes}:${paddedSeconds}`;
	}

	// Update Width of the custom timeline to match video timestamp
	updateCustomTimeline() {
		// Calculating and Setting Width to our customer seek
		const seekPercent = (this.videoPlayer.nativeElement.currentTime / this.videoPlayer.nativeElement.duration * 100) - 1.5;
		this.timePassedDiv.nativeElement.style.width = seekPercent + '%'
	}

	/**
	 * When 'SPACE' is clicked, toggle the video state
	 */
	@HostListener('document:keydown.space', ['$event'])
	onSpaceKey(event: KeyboardEvent) {
		event.preventDefault();
		this.togglePlayPause();
	}

}
