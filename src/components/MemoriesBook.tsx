import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Restaurant, Recommendation } from '../types';
import { generateRecommendations, getRandomMemory } from '../utils/recommendations';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Book,
  Star,
  MapPin,
  Heart,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Calendar,
  Camera,
} from 'lucide-react';

interface MemoriesBookProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function MemoriesBook({ onSelectRestaurant }: MemoriesBookProps) {
  const { restaurants } = useStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [randomMemory, setRandomMemory] = useState<Recommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'memories' | 'recommendations'>('memories');

  const visitedRestaurants = restaurants
    .filter((r) => r.visited)
    .sort((a, b) => {
      const dateA = a.visitedDate ? new Date(a.visitedDate).getTime() : 0;
      const dateB = b.visitedDate ? new Date(b.visitedDate).getTime() : 0;
      return dateB - dateA;
    });

  useEffect(() => {
    setRecommendations(generateRecommendations(restaurants));
    setRandomMemory(getRandomMemory(restaurants));
  }, [restaurants]);

  const refreshRecommendations = () => {
    setRecommendations(generateRecommendations(restaurants));
    setRandomMemory(getRandomMemory(restaurants));
  };

  const groupedByMonth = visitedRestaurants.reduce((acc, restaurant) => {
    if (restaurant.visitedDate) {
      const monthKey = format(new Date(restaurant.visitedDate), 'yyyy年M月', { locale: ja });
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(restaurant);
    }
    return acc;
  }, {} as Record<string, Restaurant[]>);

  return (
    <div className="memories-book">
      <div className="memories-header">
        <h2>
          <Book size={24} />
          思い出Book
        </h2>
        <button className="refresh-button" onClick={refreshRecommendations}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Random Memory Highlight */}
      {randomMemory && (
        <div
          className="memory-highlight"
          onClick={() => onSelectRestaurant(randomMemory.restaurant)}
        >
          <div className="highlight-icon">
            <Sparkles size={24} />
          </div>
          <div className="highlight-content">
            <p className="highlight-message">{randomMemory.message}</p>
            <span className="highlight-action">
              詳細を見る <ChevronRight size={16} />
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="memories-tabs">
        <button
          className={`tab ${activeTab === 'memories' ? 'active' : ''}`}
          onClick={() => setActiveTab('memories')}
        >
          <Calendar size={18} />
          思い出一覧
        </button>
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Sparkles size={18} />
          おすすめ
        </button>
      </div>

      {activeTab === 'memories' ? (
        <div className="memories-timeline">
          {Object.keys(groupedByMonth).length === 0 ? (
            <div className="empty-state">
              <MapPin size={48} />
              <h3>まだ訪問したお店がありません</h3>
              <p>地図上でお店を追加して、思い出を記録しましょう！</p>
            </div>
          ) : (
            Object.entries(groupedByMonth).map(([month, monthRestaurants]) => (
              <div key={month} className="timeline-month">
                <h3 className="month-title">{month}</h3>
                <div className="month-restaurants">
                  {monthRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="timeline-item"
                      onClick={() => onSelectRestaurant(restaurant)}
                    >
                      <div className="timeline-photo">
                        {restaurant.photos.length > 0 ? (
                          <img
                            src={restaurant.photos[0].url}
                            alt={restaurant.name}
                          />
                        ) : (
                          <Camera size={24} />
                        )}
                      </div>
                      <div className="timeline-info">
                        <h4>{restaurant.name}</h4>
                        <p className="timeline-category">{restaurant.category}</p>
                        {restaurant.visitedDate && (
                          <p className="timeline-date">
                            {format(new Date(restaurant.visitedDate), 'M月d日', { locale: ja })}
                          </p>
                        )}
                        <div className="timeline-rating">
                          <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                          {restaurant.rating.toFixed(1)}
                        </div>
                      </div>
                      {restaurant.memories.length > 0 && (
                        <div className="timeline-memory-preview">
                          "{restaurant.memories[0].content.slice(0, 30)}..."
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={48} />
              <h3>おすすめを生成中...</h3>
              <p>もっとお店を追加すると、パーソナライズされたおすすめが表示されます！</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={`${rec.restaurant.id}-${index}`}
                className={`recommendation-card ${rec.type}`}
                onClick={() => onSelectRestaurant(rec.restaurant)}
              >
                <div className="recommendation-icon">
                  {rec.type === 'memory' ? (
                    <Heart size={20} fill="#EC4899" stroke="#EC4899" />
                  ) : (
                    <Sparkles size={20} fill="#8B5CF6" stroke="#8B5CF6" />
                  )}
                </div>
                <div className="recommendation-content">
                  <p className="recommendation-message">{rec.message}</p>
                  <div className="recommendation-restaurant">
                    <span className="restaurant-name">{rec.restaurant.name}</span>
                    <span className="restaurant-category">{rec.restaurant.category}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="recommendation-arrow" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Stats */}
      <div className="memories-stats">
        <div className="stat-item">
          <span className="stat-value">{visitedRestaurants.length}</span>
          <span className="stat-label">訪問したお店</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {restaurants.filter((r) => r.wantToGo && !r.visited).length}
          </span>
          <span className="stat-label">行きたいお店</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {restaurants.reduce((sum, r) => sum + r.photos.length, 0)}
          </span>
          <span className="stat-label">写真</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {restaurants.reduce((sum, r) => sum + r.memories.length, 0)}
          </span>
          <span className="stat-label">思い出メモ</span>
        </div>
      </div>
    </div>
  );
}
