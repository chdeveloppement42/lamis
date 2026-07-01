import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './BlogDetailPage.css';
import { BLOG_DETAILS, BLOG_POSTS } from '../../data/blogData';

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
    
    // Simuler un appel API
    setLoading(true);
    setTimeout(() => {
      const fetchedPost = BLOG_DETAILS[id];
      if (fetchedPost) {
        setPost(fetchedPost);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 500); // Délai pour simuler le chargement
  }, [id]);

  // Calcul des articles similaires (même catégorie, excluant l'article actuel)
  const relatedPosts = post 
    ? BLOG_POSTS
        .filter(p => p.id !== post.id)
        .sort((a, b) => (a.category === post.category ? -1 : 1))
        .slice(0, 3)
    : [];

  if (loading) {
    return (
      <div className="blog-detail-wrapper loading-center">
        <div className="spinner-gold" />
        <p>Chargement de l'article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-wrapper error-center">
        <h1 className="massive-title">ARTICLE INTROUVABLE</h1>
        <p>Désolé, l'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link to="/blog" className="btn-gold-luxe"><ArrowLeft size={18} /> Retour au Blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-wrapper">
      {post && (
        <Helmet>
          <title>{post.metaTitle}</title>
          <meta name="description" content={post.metaDescription} />
        </Helmet>
      )}

      {/* --- HERO SECTION --- */}
      <section className="blog-detail-hero" style={{ backgroundImage: `url(${post.image})` }}>
        <div className="hero-overlay-dark" />
        <div className="container blog-detail-hero-content" data-aos="fade-down">
          <span className="gold-badge">{post.category}</span>
          <h1 className="massive-title">{post.title}</h1>
          <div className="blog-meta-hero">
            <span><Calendar size={16} /> {post.date}</span>
            <span><User size={16} /> {post.author}</span>
            <span><Clock size={16} /> {post.readTime}</span>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <section className="blog-detail-main-content">
        <div className="container blog-content-grid">
          <article className="blog-article-body" data-aos="fade-up">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {post.tags && post.tags.length > 0 && (
              <div className="blog-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-item">{tag}</span>
                ))}
              </div>
            )}

            <Link to="/blog" className="btn-back-to-blog"><ArrowLeft size={18} /> Retour à tous les articles</Link>

            {/* --- RELATED ARTICLES SECTION --- */}
            <div className="related-articles-section" data-aos="fade-up">
              <h3 className="related-main-title">Articles <span className="text-gold">similaires</span></h3>
              <div className="related-grid">
                {relatedPosts.map(rp => (
                  <Link to={`/blog/${rp.id}`} key={rp.id} className="related-item-card">
                    <div className="related-img-box">
                      <img 
                        src={`${rp.image.split('?')[0]}?auto=format&fit=crop&q=70&w=400&fm=webp`} 
                        alt={rp.title} 
                        loading="lazy"
                      />
                    </div>
                    <div className="related-content-box">
                      <span className="related-category-tag">{rp.category}</span>
                      <h4>{rp.title}</h4>
                      <span className="related-link-text">Lire l'article <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </article>

          {/* --- SIDEBAR (Exemple: Articles Récents, Catégories) --- */}
          <aside className="blog-sidebar" data-aos="fade-left">
            <div className="sidebar-box">
              <h3>Articles Récents</h3>
              <ul>
                <li><Link to="/blog/1">Tendances du marché immobilier : Ce qui change en 2024</Link></li>
                <li><Link to="/blog/2">Pourquoi choisir une villa plutôt qu'un appartement ?</Link></li>
              </ul>
            </div>
            <div className="sidebar-box">
              <h3>Catégories</h3>
              <ul>
                <li><Link to="/blog?category=Conseils">Conseils</Link></li>
                <li><Link to="/blog?category=Marché">Marché</Link></li>
                <li><Link to="/blog?category=Juridique">Juridique</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}