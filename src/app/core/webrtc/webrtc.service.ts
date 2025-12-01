import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class WebRtcService {
  private socket!: Socket;
  private pc!: RTCPeerConnection;

  private roomId!: string;
  private remotePeerId: string | null = null;

  localStream!: MediaStream;
  remoteStream = new MediaStream();

  private isInitialized = false;

  private pendingCandidates: RTCIceCandidateInit[] = [];

  init(roomId: string) {
    if (this.isInitialized) return;

    this.roomId = roomId;

    const token = sessionStorage.getItem("tokenusuario") || "";

    this.socket = io(environment.signalingUrl, {
      transports: ["websocket"],
      auth: { token },
      path: "/socket.io",
    });

    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:44.219.174.212:3478",
          username: "curuser",
          credential: "superpassword123"
        }
      ]
    });

    // === Eventos WebRTC ===

    this.pc.ontrack = (event) => {
      console.log("[WebRTC] ontrack, stream remoto recibido");
      const [stream] = event.streams;
      stream.getTracks().forEach((t) => this.remoteStream.addTrack(t));
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.remotePeerId) {
        console.log("[WebRTC] Enviando ICE candidate a", this.remotePeerId);
        this.socket.emit("signal", {
          to: this.remotePeerId,
          type: "candidate",
          payload: event.candidate,
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log("[WebRTC] connectionState:", this.pc.connectionState);
    };

    // === Señalización via Socket.IO ===

    // Offer/Answer + candidates recibidos
    this.socket.on("signal", async (msg: any) => {
  console.log("[WebRTC] signal recibido:", msg.type, "from", msg.from);

  if (msg.type === "description") {
    const description = msg.payload as RTCSessionDescriptionInit;

    if (!this.remotePeerId) {
      this.remotePeerId = msg.from;
    }

    try {
      if (description.type === "offer") {
        // Recibo offer -> setRemote + answer
        console.log("[WebRTC] Recibí OFFER, aplicando como remoteDescription");
        await this.pc.setRemoteDescription(description);

        // Ahora que tengo remoteDescription, aplico candidates pendientes
        await this.flushPendingCandidates();

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        this.socket.emit("signal", {
          to: msg.from,
          type: "description",
          payload: this.pc.localDescription,
        });
      } else if (description.type === "answer") {
        // Answer solo tiene sentido si YO envié un offer antes
        if (this.pc.signalingState !== "have-local-offer" &&
            this.pc.signalingState !== "have-remote-offer") {
          console.warn(
            "[WebRTC] Answer inesperada en estado",
            this.pc.signalingState,
            "- la ignoro."
          );
          return;
        }

        console.log("[WebRTC] Recibí ANSWER, aplicando como remoteDescription");
        await this.pc.setRemoteDescription(description);

        // Aplico candidates que hayan llegado antes
        await this.flushPendingCandidates();
      } else {
        console.warn("[WebRTC] Description desconocida:", description.type);
      }
    } catch (err) {
      console.error("[WebRTC] Error manejando description:", err);
    }
  } else if (msg.type === "candidate") {
    try {
      if (!this.pc.remoteDescription) {
        console.warn(
          "[WebRTC] remoteDescription aún no está lista, guardo candidate en cola."
        );
        this.pendingCandidates.push(msg.payload);
        return;
      }

      await this.pc.addIceCandidate(msg.payload);
    } catch (err) {
      console.error("Error agregando ICE candidate remoto:", err);
    }
  }
});

    // Cuando YO ya estoy en la sala y entra alguien nuevo
    this.socket.on("usuario-conectado", async (data: any) => {
      console.log("[WebRTC] usuario-conectado:", data);
      if (!this.remotePeerId) {
        this.remotePeerId = data.id;
        await this.createAndSendOffer();
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("Error de conexión socket:", err);
    });

    this.isInitialized = true;
  }

  // === Media local ===
  async useLocalMedia(
    constraint: MediaStreamConstraints = { video: true, audio: true }
  ) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error(
        "getUserMedia no está disponible. Necesitas usar HTTPS o localhost."
      );
      throw new Error("getUserMedia no disponible en este contexto");
    }
    
    this.localStream = await navigator.mediaDevices.getUserMedia(constraint);
    const track = this.localStream.getVideoTracks()[0];

    console.log("===== CÁMARA TOMADA =====");
    console.log("track label:", track.label);
    console.log("track id:", track.getSettings().deviceId);
    console.log("track settings:", track.getSettings());

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });

    return this.localStream;
  }

  // === Unirse a la sala ===
  joinRoom() {
    if (!this.socket) {
      console.error("[WebRTC] joinRoom llamado sin init()");
      return;
    }

    this.socket.emit(
      "join",
      { roomId: this.roomId },
      async (res: { peers: string[] }) => {
        console.log("[WebRTC] join respuesta, peers:", res.peers);

        // Si al entrar YA hay alguien en la sala, le mando offer
        if (res.peers.length > 0) {
          this.remotePeerId = res.peers[0];
          await this.createAndSendOffer();
        }
      }
    );
  }

  // Crear y enviar offer hacia remotePeerId
  private async createAndSendOffer() {
    if (!this.remotePeerId) {
      console.warn("[WebRTC] No remotePeerId para enviar offer");
      return;
    }

    try {
      console.log("[WebRTC] Creando offer para", this.remotePeerId);
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      this.socket.emit("signal", {
        to: this.remotePeerId,
        type: "description",
        payload: this.pc.localDescription,
      });
    } catch (err) {
      console.error("[WebRTC] Error creando/enviando offer:", err);
    }
  }

  private async flushPendingCandidates() {
    if (!this.pc.remoteDescription) return;
    if (this.pendingCandidates.length === 0) return;

    console.log(
      `[WebRTC] Aplicando ${this.pendingCandidates.length} ICE candidates pendientes`
    );

    for (const c of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(c);
      } catch (err) {
        console.error("Error aplicando candidate pendiente:", err);
      }
    }

    this.pendingCandidates = [];
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  // Cierre limpio
  close() {
    try {
      this.pc?.getSenders().forEach((s) => s.track?.stop());
      this.pc?.close();
    } catch {}

    try {
      this.socket?.disconnect();
    } catch {}

    this.isInitialized = false;
    this.remotePeerId = null;
    this.remoteStream = new MediaStream();
    this.pendingCandidates = [];
  }
}