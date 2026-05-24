import React from 'react';

import QrCodeReader from '../../../lib/index';

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
  const [callCount, setCallCount] = React.useState(0);

  const handleAction = React.useCallback((value: string) => {
    setDetected(value);
    setCallCount((n) => n + 1);
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
      <QrCodeReader
        delay={delay}
        width={width}
        height={height}
        action={handleAction}
        videoConstraints={deviceId ? { deviceId } : undefined}
      />
      <p>
        detected: <span data-testid="detected">{detected}</span>
      </p>
      <p>
        callcount: <span data-testid="callcount">{callCount}</span>
      </p>
    </div>
  );
}
