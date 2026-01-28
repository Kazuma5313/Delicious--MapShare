import { useStore } from '../store/useStore';
import {
  Map,
  List,
  Book,
  Share2,
  MapPin,
  Heart,
  Utensils,
} from 'lucide-react';

interface HeaderProps {
  onOpenShare: () => void;
}

export function Header({ onOpenShare }: HeaderProps) {
  const { viewMode, setViewMode, filter, setFilter, restaurants } = useStore();

  const visitedCount = restaurants.filter((r) => r.visited).length;
  const wantToGoCount = restaurants.filter((r) => r.wantToGo && !r.visited).length;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="logo">
          <Utensils size={28} />
          <h1>Delicious MapShare</h1>
        </div>
        <button className="share-button" onClick={onOpenShare}>
          <Share2 size={20} />
          <span>共有</span>
        </button>
      </div>

      <div className="header-controls">
        <div className="view-toggle">
          <button
            className={`view-button ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <Map size={18} />
            <span>マップ</span>
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
            <span>リスト</span>
          </button>
          <button
            className={`view-button ${viewMode === 'memories' ? 'active' : ''}`}
            onClick={() => setViewMode('memories')}
          >
            <Book size={18} />
            <span>思い出</span>
          </button>
        </div>

        {viewMode !== 'memories' && (
          <div className="filter-toggle">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              すべて
              <span className="count">{restaurants.length}</span>
            </button>
            <button
              className={`filter-button ${filter === 'visited' ? 'active' : ''}`}
              onClick={() => setFilter('visited')}
            >
              <MapPin size={14} />
              訪問済み
              <span className="count">{visitedCount}</span>
            </button>
            <button
              className={`filter-button ${filter === 'wantToGo' ? 'active' : ''}`}
              onClick={() => setFilter('wantToGo')}
            >
              <Heart size={14} />
              行きたい
              <span className="count">{wantToGoCount}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
