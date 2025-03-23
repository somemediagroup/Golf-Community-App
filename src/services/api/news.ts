import supabase from '@/lib/supabase';

/**
 * News interfaces for Golf Community App
 */
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  source?: string;
  source_url?: string;
  published_date: string;
  author: string;
  featured_image?: string;
  category: string;
  is_featured: boolean;
  imported_at: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
}

// Helper for image optimization
const optimizeImageUrl = (imageUrl?: string, options?: { width?: number, quality?: number }) => {
  if (!imageUrl) return undefined;
  
  try {
    // Don't reprocess already optimized images
    if (imageUrl.includes('auto=format')) return imageUrl;
    
    const width = options?.width || 800;
    const quality = options?.quality || 70;
    
    // Handle Supabase Storage URLs - check for Supabase URL pattern instead of using protected property
    if (imageUrl.includes('supabase.co') && imageUrl.includes('storage/v1')) {
      // Add width and quality parameters
      const url = new URL(imageUrl);
      url.searchParams.set('width', width.toString());
      url.searchParams.set('quality', quality.toString());
      return url.toString();
    }
    
    // Handle URLs with existing query params
    if (imageUrl.includes('?')) {
      return `${imageUrl}&auto=format&fit=crop&w=${width}&q=${quality}`;
    }
    
    // No existing params
    return `${imageUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  } catch (error) {
    console.warn('Error optimizing image URL:', error);
    return imageUrl;
  }
};

// Apply image optimization to article objects
const optimizeArticleImages = (articles: NewsArticle[], options?: { width?: number, quality?: number }) => {
  return articles.map(article => ({
    ...article,
    featured_image: optimizeImageUrl(article.featured_image, options)
  }));
};

/**
 * News service for the Golf Community App
 */
export const newsService = {
  /**
   * Get all news articles with pagination
   */
  async getNewsArticles({ limit = 10, offset = 0, category = null, optimizeImages = true } = {}) {
    let query = supabase
      .from('news_articles')
      .select('*', { count: 'exact' });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error, count } = await query
      .order('published_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Optimize images if requested
    const articles = optimizeImages && data 
      ? optimizeArticleImages(data as NewsArticle[], { width: 800, quality: 75 })
      : (data as NewsArticle[]);
      
    return { articles, count, error };
  },
  
  /**
   * Get a single news article by ID
   */
  async getNewsArticleById(id: string, optimizeImages = true) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();
    
    // Optimize image if requested
    const article = optimizeImages && data 
      ? {...data, featured_image: optimizeImageUrl(data.featured_image, { width: 1200, quality: 85 })}
      : data;
      
    return { article, error };
  },
  
  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit = 5, optimizeImages = true) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('is_featured', true)
      .order('published_date', { ascending: false })
      .limit(limit);
    
    // Optimize images if requested
    const articles = optimizeImages && data 
      ? optimizeArticleImages(data as NewsArticle[], { width: 800, quality: 80 })
      : (data as NewsArticle[]);
      
    return { articles, error };
  },
  
  /**
   * Get news categories
   */
  async getNewsCategories() {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('name');
    
    return { categories: data as NewsCategory[], error };
  },
  
  /**
   * Bookmark an article
   */
  async bookmarkArticle(userId: string, articleId: string, notes?: string) {
    const bookmark = {
      user_id: userId,
      entity_type: 'news',
      entity_id: articleId,
      created_at: new Date().toISOString(),
      notes,
    };
    
    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert(bookmark)
      .select()
      .single();
    
    return { bookmark: data, error };
  },
  
  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, articleId: string) {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .delete()
      .match({
        user_id: userId,
        entity_type: 'news',
        entity_id: articleId,
      })
      .select()
      .single();
    
    return { bookmark: data, error };
  },
  
  /**
   * Get user's bookmarked articles
   */
  async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(`
        *,
        article:news_articles!entity_id(*)
      `)
      .eq('user_id', userId)
      .eq('entity_type', 'news')
      .order('created_at', { ascending: false });
    
    return { bookmarks: data, error };
  },
  
  /**
   * Search news articles
   */
  async searchNewsArticles(query: string) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('published_date', { ascending: false });
    
    return { articles: data as NewsArticle[], error };
  },
};

export default newsService; 