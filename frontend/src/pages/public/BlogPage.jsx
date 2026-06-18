import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './BlogPage.css';
import { BLOG_POSTS } from '../../data/blogData';

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [filteredPosts, setFilteredPosts] = useState(BLOG_POSTS);

  // Extraire les catégories uniques dynamiquement
  const categories = useMemo(() => ['Tous', ...new Set(BLOG_POSTS.map(post => post.category))], []);

  useEffect(() => {
    const results = BLOG_POSTS.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredPosts(results);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="blog-page-wrapper">
      {/* --- HERO SECTION --- */}
      <section className="blog-hero">
        <div className="hero-overlay-blur" />
        <div className="container blog-hero-content" data-aos="fade-down">
          <span className="gold-badge">Actualités & Conseils</span>
          <h1 className="massive-title">LE BLOG <span className="text-gold">IMMOBILIER</span></h1>
          <p className="hero-subtitle">Retrouvez toutes les tendances et guides pour vos projets immobiliers en Algérie.</p>
          
          <div className="blog-search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher un article..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- BLOG GRID --- */}
      <section className="blog-main-content">
        <div className="container">
          {/* --- CATEGORY FILTER --- */}
          <div className="blog-category-filter" data-aos="fade-up">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="blog-card" data-aos="fade-up">
                <div className="blog-card__image">
                  <img 
                    src={`${post.image.split('?')[0]}?auto=format&fit=crop&q=70&w=600&fm=webp`} 
                    alt={post.title} 
                    loading="lazy"
                    width="600"
                    height="400"
                  />
                  <div className="blog-category-tag">{post.category}</div>
                </div>
                
                <div className="blog-card__content">
                  <div className="blog-meta">
                    <span><Calendar size={14} /> {post.date}</span>
                    <span><User size={14} /> {post.author}</span>
                    <span className="read-time">• {post.readTime}</span>
                  </div>
                  
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  
                  <Link to={`/blog/${post.id}`} className="read-more-btn">
                    Lire l'article <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* --- NEWSLETTER SECTION --- */}
          <div className="blog-newsletter" data-aos="zoom-in">
            
          </div>
        </div>
      </section>
    </div>
  );
}