import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VeltService } from '../../services/velt.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

/**
 * DocumentComponent handles the video player functionality and integrates Velt collaboration features.
 */
@Component({
	selector: 'app-document',
	standalone: true,
	imports: [RouterOutlet, NgIf],
	templateUrl: './document.component.html',
	styleUrl: './document.component.scss',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class DocumentComponent implements OnInit, OnDestroy {
	title = 'video';

	@ViewChild('vid') videoPlayer!: ElementRef<HTMLVideoElement>;
	@ViewChild('timePassedDiv') timePassedDiv!: ElementRef<HTMLVideoElement>;
	@ViewChild('commentPlayerTimeline') commentPlayerTimeline!: ElementRef<HTMLElement>;

	private clientInitSubscription: Subscription | undefined;
	isPlaying: boolean = false;

	constructor(
		private veltService: VeltService
	) { }

	/**
	 * Initializes the component and sets up Velt client subscription.
	 */
	ngOnInit(): void {
		this.clientInitSubscription = this.veltService.clientInitialized.subscribe(() => {
			this.initializeDocument();
		});

		// If the client is already initialized, call initializeDocument immediately
		if (this.veltService.getClient()) {
			this.initializeDocument();
		}
	}

	/**
	 * Cleans up subscriptions when the component is destroyed.
	 */
	ngOnDestroy(): void {
		if (this.clientInitSubscription) {
			this.clientInitSubscription.unsubscribe();
		}
	}

	/**
	 * Initializes the Velt document and sets up comment mode change listener.
	 */
	private initializeDocument(): void {
		this.veltService.setDocument('video', { documentName: 'video' });

		// Video Logic 
		if (this.veltService.getClient()) {
			this.veltService.getClient().getCommentElement().onCommentModeChange().subscribe((mode: boolean) => {
				if (mode) {
					this.setLocation();
					this.videoPlayer.nativeElement.pause();
				}
			});
		}
	}

	/**
	 * Sets the current location for Velt based on video player's current time.
	 */
	setLocation = () => {
		// set currentMediaPosition property on a Location object to represent the current frame
		let location = {
			currentMediaPosition: this.videoPlayer.nativeElement.currentTime,
			videoPlayerId: "vid"
		}

		//set the Location using the client
		this.veltService.getClient().setLocation(location)
	}

	/**
	 * Sets up event listeners for the video player and Velt components after view initialization.
	 */
	ngAfterViewInit() {

		this.commentPlayerTimeline?.nativeElement.addEventListener('onCommentClick', (event: any) => {
			console.log('onCommentClick', event.detail);
			const { location } = event.detail || {};
			if (location) {
				const videoTag = document.getElementById(location.videoPlayerId) as HTMLVideoElement;
				if (videoTag) {
					videoTag.currentTime = location.currentMediaPosition;
					videoTag.pause();
					this.veltService.getClient().setLocation(location);
				}
			}
		});

		this.videoPlayer.nativeElement.addEventListener('timeupdate', (event: Event) => {
			this.timePassedDiv.nativeElement.style.width = this.videoPlayer.nativeElement.currentTime / this.videoPlayer.nativeElement.duration * 100 + '%'
			this.veltService.getClient().setLocation({
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
	resetLocation() {
		this.veltService.getClient().resetLocation();
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
