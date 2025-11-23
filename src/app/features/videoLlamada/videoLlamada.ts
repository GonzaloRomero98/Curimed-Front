import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { WebRtcService } from "../../core/webrtc/webrtc.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-video-llamada",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./videoLlamada.html",
  styleUrls: ["./videoLlamada.css"],
})
export class VideoLlamadaComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild("localVideo") localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild("remoteVideo") remoteVideoRef!: ElementRef<HTMLVideoElement>;

  private roomId!: string;

  constructor(
    private webRtc: WebRtcService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log("[VideoLlamada] ngOnInit");
    this.roomId = this.route.snapshot.paramMap.get("roomId") || "sin-room-id";
    console.log("roomId desde ruta:", this.roomId);
    this.webRtc.init(this.roomId);
  }

  async ngAfterViewInit(): Promise<void> {
    console.log("[VideoLlamada] ngAfterViewInit");

    const localStream = await this.webRtc.useLocalMedia({
      video: true,
      audio: true,
    });

    console.log("Asignando localStream al <video>");
    this.localVideoRef.nativeElement.srcObject = localStream;
    this.localVideoRef.nativeElement.muted = true;
    this.localVideoRef.nativeElement.play().catch(() => {});

    console.log("Asignando remoteStream al <video>");
    this.remoteVideoRef.nativeElement.srcObject =
      this.webRtc.getRemoteStream();
    this.remoteVideoRef.nativeElement.play().catch(() => {});

    console.log("Llamando joinRoom()");
    this.webRtc.joinRoom();
  }

  ngOnDestroy(): void {
    console.log("ngOnDestroy -> close()");
    this.webRtc.close();
  }
}