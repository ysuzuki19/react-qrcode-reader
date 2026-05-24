import React from 'react';

import QrCodeReader, { QRCode } from '../../../lib/index';

function readNumber(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const delay = readNumber(params, 'delay', 100);
  const width = readNumber(params, 'width', 600);
  const height = readNumber(params, 'height', 500);
  const deviceId = params.get('deviceId') ?? '';

  const [detected, setDetected] = React.useState('');
  const [onReadPayload, setOnReadPayload] = React.useState('');
  const [callCount, setCallCount] = React.useState(0);
  const [mounted, setMounted] = React.useState(true);

  const handleAction = React.useCallback((value: string) => {
    setDetected(value);
    setCallCount((n) => n + 1);
  }, []);

  const handleOnRead = React.useCallback((code: QRCode) => {
    setOnReadPayload(code.data);
  }, []);

  return (
    <div>
      <h1>react-qrcode-reader e2e fixture</h1>
      <dl>
        <dt>delay</dt>
        <dd data-testid="delay">{delay}</dd>
        <dt>width</dt>
        <dd data-testid="width">{width}</dd>
        <dt>height</dt>
        <dd data-testid="height">{height}</dd>
        <dt>deviceId</dt>
        <dd data-testid="deviceId">{deviceId || '(none)'}</dd>
      </dl>
      {mounted && (
        <QrCodeReader
          delay={delay}
          width={width}
          height={height}
          action={handleAction}
          onRead={handleOnRead}
          videoConstraints={deviceId ? { deviceId } : undefined}
        />
      )}
      <p>
        detected: <span data-testid="detected">{detected}</span>
      </p>
      <p>
        onread: <span data-testid="onread">{onReadPayload}</span>
      </p>
      <p>
        callcount: <span data-testid="callcount">{callCount}</span>
      </p>
      <p>
        mounted: <span data-testid="mounted">{String(mounted)}</span>
      </p>
      <button
        type="button"
        data-testid="unmount"
        onClick={() => setMounted(false)}
      >
        unmount
      </button>
    </div>
  );
}
