import type { Restaurant, Recommendation } from '../types';
import { differenceInDays, differenceInMonths, format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function generateRecommendations(restaurants: Restaurant[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();

  const visitedRestaurants = restaurants.filter((r) => r.visited && r.visitedDate);
  const wantToGoRestaurants = restaurants.filter((r) => r.wantToGo && !r.visited);

  // 思い出の振り返り（3ヶ月以上前に訪れたお店）
  visitedRestaurants.forEach((restaurant) => {
    if (restaurant.visitedDate) {
      const monthsAgo = differenceInMonths(now, new Date(restaurant.visitedDate));
      if (monthsAgo >= 3) {
        const dateStr = format(new Date(restaurant.visitedDate), 'yyyy年M月d日', { locale: ja });
        recommendations.push({
          type: 'memory',
          restaurant,
          message: `${dateStr}に「${restaurant.name}」に行きましたね！${monthsAgo}ヶ月前の思い出です。また行ってみませんか？`,
        });
      }
    }
  });

  // 記念日付近のお店（前後7日以内に訪れた場所）
  visitedRestaurants.forEach((restaurant) => {
    if (restaurant.visitedDate) {
      const visitDate = new Date(restaurant.visitedDate);
      const thisYearAnniversary = new Date(
        now.getFullYear(),
        visitDate.getMonth(),
        visitDate.getDate()
      );
      const daysToAnniversary = differenceInDays(thisYearAnniversary, now);

      if (daysToAnniversary >= -7 && daysToAnniversary <= 7 && daysToAnniversary !== 0) {
        const yearsAgo = now.getFullYear() - visitDate.getFullYear();
        if (yearsAgo > 0) {
          recommendations.push({
            type: 'memory',
            restaurant,
            message: `もうすぐ「${restaurant.name}」に行った${yearsAgo}周年記念日ですね！思い出を振り返ってみませんか？`,
          });
        }
      }
    }
  });

  // 行きたいお店の提案
  if (wantToGoRestaurants.length > 0) {
    // 高評価順
    const topRated = [...wantToGoRestaurants].sort((a, b) => b.rating - a.rating).slice(0, 3);
    topRated.forEach((restaurant) => {
      recommendations.push({
        type: 'suggestion',
        restaurant,
        message: `「${restaurant.name}」はまだ行けていないですね。評価が高いのでおすすめです！`,
      });
    });
  }

  // カテゴリー別のおすすめ（最近行っていないカテゴリー）
  const categoryLastVisit = new Map<string, Date>();
  visitedRestaurants.forEach((r) => {
    if (r.visitedDate) {
      const current = categoryLastVisit.get(r.category);
      const visitDate = new Date(r.visitedDate);
      if (!current || visitDate > current) {
        categoryLastVisit.set(r.category, visitDate);
      }
    }
  });

  categoryLastVisit.forEach((lastVisit, category) => {
    const daysAgo = differenceInDays(now, lastVisit);
    if (daysAgo >= 30) {
      const restaurantsInCategory = wantToGoRestaurants.filter((r) => r.category === category);
      if (restaurantsInCategory.length > 0) {
        const randomIndex = Math.floor(Math.random() * restaurantsInCategory.length);
        const restaurant = restaurantsInCategory[randomIndex];
        recommendations.push({
          type: 'suggestion',
          restaurant,
          message: `${category}のお店に${daysAgo}日間行っていないですね。「${restaurant.name}」はいかがですか？`,
        });
      }
    }
  });

  // 季節に合ったお店の提案
  const month = now.getMonth() + 1;
  let seasonTags: string[] = [];
  if (month >= 3 && month <= 5) {
    seasonTags = ['春', '桜', 'テラス', '花見'];
  } else if (month >= 6 && month <= 8) {
    seasonTags = ['夏', '冷たい', 'ビアガーデン', '海鮮'];
  } else if (month >= 9 && month <= 11) {
    seasonTags = ['秋', '紅葉', 'きのこ', '栗'];
  } else {
    seasonTags = ['冬', '鍋', 'あったか', '忘年会', '新年会'];
  }

  wantToGoRestaurants.forEach((restaurant) => {
    const hasSeasonTag = restaurant.tags.some((tag) =>
      seasonTags.some((st) => tag.includes(st))
    );
    if (hasSeasonTag) {
      recommendations.push({
        type: 'suggestion',
        restaurant,
        message: `今の季節にぴったりの「${restaurant.name}」に行ってみませんか？`,
      });
    }
  });

  // 重複を除去してシャッフル
  const uniqueRecommendations = recommendations.filter(
    (r, index, self) => index === self.findIndex((t) => t.restaurant.id === r.restaurant.id)
  );

  return uniqueRecommendations.sort(() => Math.random() - 0.5).slice(0, 5);
}

export function getRandomMemory(restaurants: Restaurant[]): Recommendation | null {
  const visitedWithMemories = restaurants.filter(
    (r) => r.visited && r.memories.length > 0
  );

  if (visitedWithMemories.length === 0) return null;

  const randomRestaurant =
    visitedWithMemories[Math.floor(Math.random() * visitedWithMemories.length)];
  const randomMemory =
    randomRestaurant.memories[Math.floor(Math.random() * randomRestaurant.memories.length)];

  return {
    type: 'memory',
    restaurant: randomRestaurant,
    message: `「${randomRestaurant.name}」での思い出: "${randomMemory.content}"`,
  };
}
