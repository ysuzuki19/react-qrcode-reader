import React from 'react';
import QrCodeReader, { QRCode } from 'react-qrcode-reader';

export default function App() {
  const [detected, setDetected] = React.useState('');
  const [onReadPayload, setOnReadPayload] = React.useState('');

  const handleOnRead = React.useCallback((code: QRCode) => {
    setOnReadPayload(code.data);
  }, []);

  return (
    <div>
      <h1>react-qrcode-reader smoke (built artifact)</h1>
      <QrCodeReader
        delay={100}
        width={600}
        height={500}
        action={setDetected}
        onRead={handleOnRead}
      />
      <p>
        detected (action): <span data-testid="detected">{detected}</span>
      </p>
      <p>
        onRead payload: <span data-testid="onread">{onReadPayload}</span>
      </p>
    </div>
  );
}
