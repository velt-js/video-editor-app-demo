import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VeltService } from '../../services/velt.service';
import { NgIf } from '@angular/common';

@Component({
	selector: 'app-document',
	standalone: true,
	imports: [RouterOutlet, NgIf],
	templateUrl: './document.component.html',
	styleUrl: './document.component.scss',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DocumentComponent {
	title = 'video';
	@ViewChild('vid') videoPlayer!: ElementRef<HTMLVideoElement>;
	@ViewChild('timePassedDiv') timePassedDiv!: ElementRef<HTMLVideoElement>;
	@ViewChild('commentPlayerTimeline') commentPlayerTimeline!: ElementRef<HTMLElement>;

	constructor(
		private veltService: VeltService
	) { }

	async ngOnInit(): Promise<void> {
		await this.veltService.initializeVelt('AN5s6iaYIuLLXul0X4zf');
		await this.veltService.setDocument('video', { documentName: 'video' });
		this.veltService.setDarkMode(true);

		// Video Logic 

		if (this.veltService.getClient()) {
			this.veltService.getClient().getCommentElement().onCommentModeChange().subscribe((mode: boolean) => {
				if (mode) {
					this.setLocation()
					this.videoPlayer.nativeElement.pause()
				}
			});
		}


	}
	setLocation = () => {

		// set currentMediaPosition property on a Location object to represent the current frame
		let location = {
			currentMediaPosition: this.videoPlayer.nativeElement.currentTime,
			videoPlayerId: "vid"
		}

		//set the Location using the client
		this.veltService.getClient().setLocation(location)
	}


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


	isPlaying: boolean = false;
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

	customSeek(event: MouseEvent) {
		const seekPercent = (event.offsetX / Number(this.timePassedDiv.nativeElement.parentElement?.clientWidth) * 100);

		this.timePassedDiv.nativeElement.style.width = seekPercent + '%'
		this.videoPlayer.nativeElement.currentTime = this.videoPlayer.nativeElement.duration * seekPercent / 100;
		this.setLocation()
	}



}
