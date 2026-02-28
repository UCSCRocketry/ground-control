import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3Y2U1MzA3ZS05MGZlLTRmZWEtYjQwZS01ZDdlOTdjZjZmMTAiLCJpZCI6Mzg1Mzg3LCJpYXQiOjE3NzE2Mjc1ODR9.AB3Hnzed_ui0TM24Y-wtQH9W61YVSW3W8Nh9iHzI48k'

const CesiumMap = () => {
  const cesiumContainerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    const initializeCesium = async () => {
      try {
        const terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

        // Create viewer
        const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
          terrainProvider: terrainProvider,
          scene3DOnly: true,
          sceneModePicker: false,
          navigationHelpButton: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          timeline: false,
          animation: false,
        });

        viewerRef.current = viewer;

        // Enable lighting
        viewer.scene.globe.enableLighting = true;

      } catch (error) {
        console.error("Error initializing Cesium:", error);
      }
    };

    initializeCesium();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={cesiumContainerRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
};

export default CesiumMap;