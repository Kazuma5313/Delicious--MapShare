import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import {
  Header,
  Map,
  RestaurantList,
  RestaurantForm,
  RestaurantDetail,
  MemoriesBook,
  ShareModal,
} from './components';
import type { Restaurant } from './types';
import './App.css';

function App() {
  const { viewMode, selectedRestaurant, setSelectedRestaurant, importShareData } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [formLocation, setFormLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showShare, setShowShare] = useState(false);

  // Check for shared data in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
      const success = importShareData(shareData);
      if (success) {
        // Clear the URL parameter
        window.history.replaceState({}, '', window.location.pathname);
        alert('共有されたお店を追加しました！');
      }
    }
  }, [importShareData]);

  const handleAddRestaurant = (lat: number, lng: number) => {
    setFormLocation({ lat, lng });
    setShowForm(true);
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <div className="app">
      <Header onOpenShare={() => setShowShare(true)} />

      <main className="app-main">
        {viewMode === 'map' && (
          <div className="map-container">
            <Map onAddRestaurant={handleAddRestaurant} />
            <div className="map-hint">
              地図をタップしてお店を追加
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="list-container">
            <RestaurantList onSelectRestaurant={handleSelectRestaurant} />
          </div>
        )}

        {viewMode === 'memories' && (
          <div className="memories-container">
            <MemoriesBook onSelectRestaurant={handleSelectRestaurant} />
          </div>
        )}
      </main>

      {/* Restaurant Form Modal */}
      {showForm && formLocation && (
        <RestaurantForm
          lat={formLocation.lat}
          lng={formLocation.lng}
          onClose={() => {
            setShowForm(false);
            setFormLocation(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setFormLocation(null);
          }}
        />
      )}

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantDetail
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {/* Share Modal */}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
}

export default App;
