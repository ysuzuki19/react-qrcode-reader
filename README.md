# react-qrcode-reader

QRCode Reader for modern React

# install

```bash
$ npm install react-qrcode-reader
```

# how to use

## 1. with onRead

```tsx
import React from 'react';

import QrCodeReader, { QRCode } from 'react-qrcode-reader';

const App: React.FC = () => {
  const [val, setVal] = React.useState<string>('');

  const handleRead = (code: QRCode) => {
    setVal(code.data);
  };

  return (
    <>
      <QrCodeReader delay={100} width={500} height={500} onRead={handleRead} />
      <p>{val}</p>
    </>
  );
};

export default App;
```

## 2. with setter for hook

```tsx
import React from 'react';

import QrCodeReader, { QRCode } from 'react-qrcode-reader';

const App: React.FC = () => {
  const [val, setVal] = React.useState<string>('');

  return (
    <>
      <QrCodeReader delay={100} width={600} height={500} action={setVal} />
      <p>{val}</p>
    </>
  );
};

export default App;
```

# API

`<QrCodeReader>` has 3 required props and 2 optional props.

| prop     | type             | instruction             | default |
| -------- | ---------------- | ----------------------- | ------- |
| delay    | number           | delay of recapture      |         |
| width    | number           | width of image          |         |
| height   | number           | height of image         |         |
| onRead   | (QRCode) => void | callback on read qrcode | none    |
| action   | (string) => void | action on read qrcode   | none    |
| deviceId | string           | deviceId for video      | none    |

argument of `onRead` is `QRCode` data. `QRCode` is interface in `jsQR`.

argument of `action` is the string included in QRCode. You can simply get value of QRCode by this.
