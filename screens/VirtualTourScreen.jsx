import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const html = `
  <html>
    <head>
      <style>body,html{margin:0;padding:0;overflow:hidden;height:100%;}</style>
      <script src="https://photo-sphere-viewer.js.org/dist/photo-sphere-viewer.js"></script>
      <link rel="stylesheet" href="https://photo-sphere-viewer.js.org/dist/photo-sphere-viewer.css"/>
    </head>
    <body>
      <div id="viewer" style="width:100vw;height:100vh;"></div>
      <script>
        new PhotoSphereViewer.Viewer({
          container: document.getElementById('viewer'),
          panorama: 'https://jbjqxxfaorxtitvmpotp.supabase.co/storage/v1/object/public/images/360altar.jpg',
        });
      </script>
    </body>
  </html>
`;

export default function VirtualTourScreen() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}
