import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        #viewer {
          width: 100%;
          height: 100%;
        }
        #loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: black;
          font-size: 18px;
          text-align: center;
          display: none;
        }
      </style>
      <script src="https://photo-sphere-viewer.js.org/dist/photo-sphere-viewer.js"></script>
      <link rel="stylesheet" href="https://photo-sphere-viewer.js.org/dist/photo-sphere-viewer.css"/>
    </head>
    <body>
      <div id="viewer"></div>
      <div id="loading">360 image is loading...</div>
      <script>
        const loadingDiv = document.getElementById('loading');
        loadingDiv.style.display = 'block';
        
        const viewer = new PhotoSphereViewer.Viewer({
          container: document.getElementById('viewer'),
          panorama: 'https://jbjqxxfaorxtitvmpotp.supabase.co/storage/v1/object/public/images/360altar.jpg',
          defaultZoomLvl: 50,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: true,
        });

        viewer.addEventListener('load', () => {
          loadingDiv.style.display = 'none';
        });

        viewer.addEventListener('error', () => {
          loadingDiv.textContent = 'Failed to load 360 image';
        });
      </script>
    </body>
  </html>
`;

export default function VirtualTourScreen() {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});