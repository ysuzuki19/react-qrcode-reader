import React from 'react';

function useMediaDeviceInfos(): MediaDeviceInfo[] {
  const [videos, setVideos] = React.useState<MediaDeviceInfo[]>([]);
  React.useEffect(() => {
    (async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setVideos(mediaDevices);
    })();
  }, []);
  return videos;
}

export function useVideoDeviceInfos(): MediaDeviceInfo[] {
  return useMediaDeviceInfos()?.filter((info) => info.kind === 'videoinput');
}
