import React from 'react';

import QrCodeReader from 'react-qrcode-reader';
import { useVideoDeviceInfos } from './use-video-infos';

const App: React.FC = () => {
  const videoDeviceInfos = useVideoDeviceInfos();
  const [val, setVal] = React.useState('');
  const [selected, setSelected] = React.useState('default');
  const [deviceId, setDeviceId] = React.useState('');

  return (
    <>
      <select
        name="devices"
        value={deviceId}
        onChange={(event) => {
          setDeviceId(event.target.value);
          const deviceLabel =
            videoDeviceInfos.find(
              (info) => info.deviceId === event.target.value
            )?.label || 'not selected';
          setSelected(deviceLabel);
        }}
      >
        {videoDeviceInfos.map((info) => (
          <option
            value={info.deviceId}
            label={info.label}
            onClick={() => setDeviceId(info.deviceId)}
          >
            {info.label}
          </option>
        ))}
      </select>
      <p>{selected}</p>
      <QrCodeReader
        delay={100}
        width={600}
        height={500}
        action={setVal}
        videoConstraints={{ deviceId }}
      />
      <p>{val}</p>
    </>
  );
};

export default App;
