interface RTCPeerConnection {
    addTransceiver(trackOrKind: string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver;
    createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    close(): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    generateCertificate?(keygenAlgorithm: AlgorithmIdentifier): Promise<RTCCertificate>;
}

declare global {
    interface Window {
        RTCPeerConnection: {
            new(configuration?: RTCConfiguration): RTCPeerConnection;
            generateCertificate(keygenAlgorithm: AlgorithmIdentifier): Promise<RTCCertificate>;
        };
    }
    var RTCPeerConnection: {
        new(configuration?: RTCConfiguration): RTCPeerConnection;
        generateCertificate(keygenAlgorithm: AlgorithmIdentifier): Promise<RTCCertificate>;
    };
}

export {}; 