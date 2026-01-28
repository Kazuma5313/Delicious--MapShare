import { useStore } from '../store/useStore';
import { RestaurantCard } from './RestaurantCard';
import type { Restaurant } from '../types';
import { MapPin, Heart, Plus } from 'lucide-react';

interface RestaurantListProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function RestaurantList({ onSelectRestaurant }: RestaurantListProps) {
  const { restaurants, filter } = useStore();

  const filteredRestaurants = restaurants
    .filter((r) => {
      if (filter === 'visited') return r.visited;
      if (filter === 'wantToGo') return r.wantToGo && !r.visited;
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (filteredRestaurants.length === 0) {
    return (
      <div className="empty-list">
        <div className="empty-icon">
          {filter === 'visited' ? (
            <MapPin size={48} />
          ) : filter === 'wantToGo' ? (
            <Heart size={48} />
          ) : (
            <Plus size={48} />
          )}
        </div>
        <h3>
          {filter === 'visited'
            ? '訪問済みのお店がありません'
            : filter === 'wantToGo'
            ? '行きたいお店がありません'
            : 'お店が登録されていません'}
        </h3>
        <p>
          {filter === 'all'
            ? 'マップをタップして、お店を追加しましょう！'
            : 'マップビューでお店を追加できます'}
        </p>
      </div>
    );
  }

  return (
    <div className="restaurant-list">
      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onClick={() => onSelectRestaurant(restaurant)}
        />
      ))}
    </div>
  );
}
