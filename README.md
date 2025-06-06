# react-qrcode-reader

[![npm version](https://badge.fury.io/js/react-qrcode-reader.svg)](https://badge.fury.io/js/react-qrcode-reader)

QRCode Reader for modern React

# install

```bash
$ npm i react-qrcode-reader
```

# package and React version compatibility

| react-qrcode-reader version | React version |
| --------------------------- | ------------- |
| 3.x.x                       | 19.x          |
| 2.x.x                       | 18.x, 17.x    |

Please ensure your React version matches the supported version of the package.

# how to use

## 1. with onRead

```tsx
import React from 'react';

import QrCodeReader, { QRCode } from 'react-qrcode-reader';

export function App() {
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
}
```

## 2. with setter for hook

```tsx
import React from 'react';

import QrCodeReader, { QRCode } from 'react-qrcode-reader';

export function App() {
  const [val, setVal] = React.useState<string>('');

  return (
    <>
      <QrCodeReader delay={100} width={600} height={500} action={setVal} />
      <p>{val}</p>
    </>
  );
}
```

# API

`<QrCodeReader>` has 3 required props and 3 optional props.

| prop             | type             | instruction                             | default |
| ---------------- | ---------------- | --------------------------------------- | ------- |
| delay            | number           | delay of recapture                      |         |
| width            | number           | width of image                          |         |
| height           | number           | height of image                         |         |
| onRead           | (QRCode) => void | callback on read qrcode                 | none    |
| action           | (string) => void | action on read qrcode                   | none    |
| videoConstraints | object           | MediaStreamConstraints(s) for the video | none    |

argument of `onRead` is `QRCode` data. `QRCode` is interface in `jsQR`.

argument of `action` is the string included in QRCode. You can simply get value of QRCode by this.

argument of `videoConstraints` is the object included in Webcam. We can build a constraints object by passing it to the videoConstraints prop. Please take a look at the MDN docs to get an understanding how this works:
https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

# Version Up

Read [doc](./MIGRATION.md) for update `1` to `2`.
