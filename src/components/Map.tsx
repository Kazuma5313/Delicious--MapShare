import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useStore } from '../store/useStore';
import type { Restaurant } from '../types';
import { MapPin, Heart, Star } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 35.6812,
  lng: 139.7671,
};

interface MapProps {
  onAddRestaurant?: (lat: number, lng: number) => void;
}

export function Map({ onAddRestaurant }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const { restaurants, filter, setSelectedRestaurant } = useStore();
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowRestaurant, setInfoWindowRestaurant] = useState<Restaurant | null>(null);

  const filteredRestaurants = restaurants.filter((r) => {
    if (filter === 'visited') return r.visited;
    if (filter === 'wantToGo') return r.wantToGo && !r.visited;
    return true;
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onAddRestaurant) {
        onAddRestaurant(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onAddRestaurant]
  );

  const getMarkerIcon = (restaurant: Restaurant) => {
    if (restaurant.visited) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#059669',
        strokeWeight: 2,
        scale: 10,
      };
    }
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#F59E0B',
      fillOpacity: 1,
      strokeColor: '#D97706',
      strokeWeight: 2,
      scale: 10,
    };
  };

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>地図を読み込み中...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {filteredRestaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={{ lat: restaurant.lat, lng: restaurant.lng }}
          icon={getMarkerIcon(restaurant)}
          onClick={() => setInfoWindowRestaurant(restaurant)}
        />
      ))}

      {infoWindowRestaurant && (
        <InfoWindow
          position={{ lat: infoWindowRestaurant.lat, lng: infoWindowRestaurant.lng }}
          onCloseClick={() => setInfoWindowRestaurant(null)}
        >
          <div className="info-window">
            <h3 className="info-window-title">{infoWindowRestaurant.name}</h3>
            <p className="info-window-category">{infoWindowRestaurant.category}</p>
            <div className="info-window-rating">
              <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
              <span>{infoWindowRestaurant.rating.toFixed(1)}</span>
            </div>
            {infoWindowRestaurant.photos.length > 0 && (
              <img
                src={infoWindowRestaurant.photos[0].url}
                alt={infoWindowRestaurant.name}
                className="info-window-photo"
              />
            )}
            <div className="info-window-status">
              {infoWindowRestaurant.visited ? (
                <span className="status-visited">
                  <MapPin size={12} /> 訪問済み
                </span>
              ) : (
                <span className="status-want">
                  <Heart size={12} /> 行きたい
                </span>
              )}
            </div>
            <button
              className="info-window-button"
              onClick={() => {
                setSelectedRestaurant(infoWindowRestaurant);
                setInfoWindowRestaurant(null);
              }}
            >
              詳細を見る
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
