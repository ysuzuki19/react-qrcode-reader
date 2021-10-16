import React from 'react';

// import QrCodeReader, { QRCode } from './QrCodeReader';
import QrCodeReader, { QRCode } from 'react-qrcode-reader';

const App: React.FC = () => {
  const [val, setVal] = React.useState<string>('');

  const handleRead = (code: QRCode) => {
    setVal(code.data);
  };

  return (
    <>
      {/* <QrCodeReader delay={100} width={500} height={500} onRead={handleRead} /> */}
      <QrCodeReader delay={100} width={600} height={500} action={setVal} />
      {/* <QrCodeReader delay={100} width={600} height={500} /> */}
      <p>{val}</p>
    </>
  );
};

export default App;
