import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Restaurant } from '../types';
import { PRICE_RANGES } from '../utils/categories';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  X,
  Star,
  MapPin,
  Heart,
  Camera,
  MessageCircle,
  Plus,
  Trash2,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export function RestaurantDetail({ restaurant, onClose }: RestaurantDetailProps) {
  const {
    updateRestaurant,
    addPhoto,
    deletePhoto,
    addMemory,
    deleteMemory,
    deleteRestaurant,
  } = useStore();

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [newMemory, setNewMemory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priceLabel = PRICE_RANGES.find((p) => p.value === restaurant.priceRange)?.label || '';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            addPhoto(restaurant.id, { url: event.target.result as string });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddMemory = () => {
    if (newMemory.trim()) {
      addMemory(restaurant.id, newMemory.trim());
      setNewMemory('');
    }
  };

  const handleToggleVisited = () => {
    updateRestaurant(restaurant.id, {
      visited: !restaurant.visited,
      visitedDate: !restaurant.visited ? new Date() : undefined,
      wantToGo: restaurant.visited ? true : false,
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: restaurant.name,
      text: `${restaurant.name} - ${restaurant.category} | ${priceLabel}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(
        `${restaurant.name}\n${restaurant.address}\n${restaurant.category} | ${priceLabel}\n評価: ${'★'.repeat(Math.floor(restaurant.rating))}${restaurant.rating.toFixed(1)}`
      );
      alert('お店の情報をクリップボードにコピーしました！');
    }
  };

  const handleDelete = () => {
    deleteRestaurant(restaurant.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content restaurant-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-button floating" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Photo Gallery */}
        <div className="photo-gallery">
          {restaurant.photos.length > 0 ? (
            <>
              <img
                src={restaurant.photos[currentPhotoIndex].url}
                alt={`${restaurant.name} photo ${currentPhotoIndex + 1}`}
                className="gallery-image"
              />
              {restaurant.photos.length > 1 && (
                <>
                  <button
                    className="gallery-nav prev"
                    onClick={() =>
                      setCurrentPhotoIndex(
                        (prev) => (prev - 1 + restaurant.photos.length) % restaurant.photos.length
                      )
                    }
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="gallery-nav next"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) => (prev + 1) % restaurant.photos.length)
                    }
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="gallery-dots">
                    {restaurant.photos.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentPhotoIndex ? 'active' : ''}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
              <button
                className="gallery-delete"
                onClick={() => {
                  deletePhoto(restaurant.id, restaurant.photos[currentPhotoIndex].id);
                  setCurrentPhotoIndex((prev) => Math.max(0, prev - 1));
                }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <div className="gallery-empty">
              <Camera size={48} />
              <p>写真がありません</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            multiple
            hidden
          />
          <button
            className="gallery-add"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Restaurant Info */}
        <div className="detail-content">
          <div className="detail-header">
            <h2>{restaurant.name}</h2>
            <div className="detail-actions">
              <button className="action-button" onClick={handleShare}>
                <Share2 size={20} />
              </button>
              <button
                className="action-button danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="detail-meta">
            <span className="category">{restaurant.category}</span>
            <span className="price">{priceLabel}</span>
            <span className="rating">
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              {restaurant.rating.toFixed(1)}
            </span>
          </div>

          <p className="detail-address">
            <MapPin size={16} />
            {restaurant.address || '住所未登録'}
          </p>

          <div className="detail-status">
            <button
              className={`status-toggle ${restaurant.visited ? 'visited' : ''}`}
              onClick={handleToggleVisited}
            >
              {restaurant.visited ? (
                <>
                  <MapPin size={18} /> 訪問済み
                </>
              ) : (
                <>
                  <Heart size={18} /> 行きたい
                </>
              )}
            </button>
            {restaurant.visitedDate && (
              <span className="visited-date">
                訪問日: {format(new Date(restaurant.visitedDate), 'yyyy年M月d日', { locale: ja })}
              </span>
            )}
          </div>

          {restaurant.tags.length > 0 && (
            <div className="detail-tags">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Memories Section */}
          <div className="memories-section">
            <h3>
              <MessageCircle size={20} />
              思い出メモ
            </h3>

            <div className="memory-input">
              <textarea
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="思い出やメモを残しましょう..."
                rows={3}
              />
              <button
                className="add-memory-button"
                onClick={handleAddMemory}
                disabled={!newMemory.trim()}
              >
                <Plus size={18} />
                追加
              </button>
            </div>

            <div className="memories-list">
              {restaurant.memories.length === 0 ? (
                <p className="no-memories">まだ思い出メモがありません</p>
              ) : (
                restaurant.memories.map((memory) => (
                  <div key={memory.id} className="memory-item">
                    <div className="memory-header">
                      <span className="memory-author">{memory.author}</span>
                      <span className="memory-date">
                        {format(new Date(memory.createdAt), 'yyyy/M/d HH:mm', { locale: ja })}
                      </span>
                      <button
                        className="memory-delete"
                        onClick={() => deleteMemory(restaurant.id, memory.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="memory-content">{memory.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="confirm-dialog">
            <div className="confirm-content">
              <h3>このお店を削除しますか？</h3>
              <p>この操作は取り消せません。</p>
              <div className="confirm-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </button>
                <button className="delete-button" onClick={handleDelete}>
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
