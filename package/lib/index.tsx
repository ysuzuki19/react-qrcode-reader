import React from 'react';
import Webcam from 'react-webcam';
import jsQR, { QRCode } from 'jsqr';
import { WebcamProps } from 'react-webcam';

export type { QRCode };
export type { WebcamProps };

export interface QrCodeReaderProps {
  delay: number;
  width: number;
  height: number;
  onRead?: (code: QRCode) => void;
  action?: (str: string) => void;
  deviceId?: string;
  facingMode?: string;
}

function QrCodeReader({
  delay,
  width,
  height,
  onRead,
  action,
  deviceId,
  facingMode,
}: QrCodeReaderProps): JSX.Element {
  const webcamRef = React.useRef<Webcam & HTMLVideoElement>(null);

  const analyze = React.useCallback(() => {
    if (!webcamRef) return;
    if (!webcamRef.current) return;
    const imgSrc = webcamRef.current
      .getCanvas()
      ?.getContext('2d')
      ?.getImageData(0, 0, width, height);

    if (!imgSrc) return;
    if (!imgSrc.data) return;
    const code = jsQR(imgSrc.data, width, height);

    if (code) {
      if (onRead) onRead(code);
      if (action) action(code.data);
    }
  }, [webcamRef, width, height, onRead, action]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      analyze();
    }, delay);
    return () => clearInterval(interval);
  });

  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      width={width}
      height={height}
      videoConstraints={{ deviceId, facingMode }}
    />
  );
}

export default QrCodeReader;
