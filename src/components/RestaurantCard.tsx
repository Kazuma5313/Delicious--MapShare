import type { Restaurant } from '../types';
import { MapPin, Heart, Star, Camera, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PRICE_RANGES } from '../utils/categories';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const priceLabel = PRICE_RANGES.find((p) => p.value === restaurant.priceRange)?.label || '';

  return (
    <div className="restaurant-card" onClick={onClick}>
      <div className="restaurant-card-image">
        {restaurant.photos.length > 0 ? (
          <img src={restaurant.photos[0].url} alt={restaurant.name} />
        ) : (
          <div className="restaurant-card-no-image">
            <Camera size={32} />
            <span>写真なし</span>
          </div>
        )}
        <div className="restaurant-card-status">
          {restaurant.visited ? (
            <span className="status-badge visited">
              <MapPin size={12} /> 訪問済み
            </span>
          ) : (
            <span className="status-badge want">
              <Heart size={12} /> 行きたい
            </span>
          )}
        </div>
      </div>

      <div className="restaurant-card-content">
        <h3 className="restaurant-card-name">{restaurant.name}</h3>

        <div className="restaurant-card-meta">
          <span className="category">{restaurant.category}</span>
          <span className="price">{priceLabel}</span>
          <span className="rating">
            <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
            {restaurant.rating.toFixed(1)}
          </span>
        </div>

        <p className="restaurant-card-address">{restaurant.address}</p>

        {restaurant.visitedDate && (
          <p className="restaurant-card-date">
            訪問日: {format(new Date(restaurant.visitedDate), 'yyyy年M月d日', { locale: ja })}
          </p>
        )}

        <div className="restaurant-card-stats">
          <span>
            <Camera size={14} /> {restaurant.photos.length}
          </span>
          <span>
            <MessageCircle size={14} /> {restaurant.memories.length}
          </span>
        </div>

        {restaurant.tags.length > 0 && (
          <div className="restaurant-card-tags">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
            {restaurant.tags.length > 3 && (
              <span className="tag-more">+{restaurant.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
