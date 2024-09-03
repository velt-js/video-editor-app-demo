import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, effect } from '@angular/core';
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

	client = this.veltService.clientSignal();

	constructor(
		private veltService: VeltService
	) {
		effect(() => {

			this.client = this.veltService.clientSignal();
			if (this.client) {

				// Contain your comments in a document by setting a Document ID & Name
				this.veltService.setDocument('video', { documentName: 'video' });

				// Enable dark mode for Velt UI
				this.veltService.setDarkMode(true);

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

			}
		});
	}

	/**
	 * Sets the current location in Velt based on video player's current timestamp.
	 */
	setLocation = () => {

		let location = {
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
			if (location) {
				const videoTag = document.getElementById(location.videoPlayerId) as HTMLVideoElement;
				if (videoTag) {
					videoTag.currentTime = location.currentMediaPosition;
					videoTag.pause();

					this.client?.setLocation(location)
				}
			}
		});

		// When we dynamically update the video timestamp this is triggered and we ensure the right location is set in Velt Client
		// Ideally triggered when you click on the comment bubble in the video timeline
		this.videoPlayer.nativeElement.addEventListener('timeupdate', (event: Event) => {
			this.timePassedDiv.nativeElement.style.width = this.videoPlayer.nativeElement.currentTime / this.videoPlayer.nativeElement.duration * 100 + '%'
			this.client?.setLocation({
				currentMediaPosition: this.videoPlayer.nativeElement.currentTime,
				videoPlayerId: "vid"
			})
		})

		this.videoPlayer.nativeElement.addEventListener('pause', (e) => {
			this.isPlaying = false
		})
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

}
