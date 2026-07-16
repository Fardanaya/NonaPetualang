import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { FaQuestionCircle } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";

function ClickHandler({ onClick }: { onClick: (e: any) => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

interface MapProps {
  init?: [number, number];
  onAddressChange?: ({
    address,
    lat,
    lng,
  }: {
    address: string;
    lat: string;
    lng: string;
  }) => void;
}

const Map = ({ init, onAddressChange }: MapProps) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
    if (init) {
      setPosition(init);
    }
  }, []);

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    if (onAddressChange) {
      onAddressChange({
        address: "",
        lat,
        lng,
      });
    }
  };

  if (!mapReady) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-primary">Pin Point</p>
      {/* rounded atasnya */}
      <div className="relative h-[360px] overflow-hidden rounded-t-lg">
        <MapContainer
          center={
            init && init[0] === 0 && init[1] === 0
              ? [-7.343651253620061, 112.71162764095831]
              : init
          }
          zoom={14}
          style={{ height: "360px", zIndex: 0 }}
        >
          <ClickHandler onClick={handleMapClick} />
          {/* <TileLayer
            url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.vector?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}`}
          /> */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {position && (
            <Marker position={position}>
              <Popup>Selected Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-3 rounded-b-lg bg-default-200">
        <div className="flex items-center gap-2 text-xs">
          <FaQuestionCircle size={12} className="text-primary" />
          <p>Click on the map to select a location</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <FaCircleInfo size={12} className="text-primary" />
          <p>Sometime&apos;s the address is not accurate</p>
        </div>
      </div>
    </div>
  );
};

export default Map;
