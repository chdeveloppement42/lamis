import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Home, Briefcase, Trees, Store, Warehouse,
  ShieldCheck, MapPin, Headphones, ChevronLeft, ChevronRight,
  Award, Users, Clock, Sparkles
} from 'lucide-react'; 
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import { getCategories } from '../../api/categories.api';
import { getLatestListings } from '../../api/listings.api';
import ListingCard from '../../components/ListingCard';
import './LandingPage.css';

const CATEGORY_ICONS = {
  appartement: <Building2 size={40} />,
  villa: <Home size={40} />,
  bureau: <Briefcase size={40} />,
  terrain: <Trees size={40} />,
  'local-commercial': <Store size={40} />,
  entrepot: <Warehouse size={40} />,
};

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [latestListings, setLatestListings] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const catRef = useRef(null);
  const annoncesRef = useRef(null);

  const slides = [
    { url: '/appartement.png' },
    { url: '/villa.png' },
    { url: '/entrop.png' },
    { url: '/bureau.png' },
    { url: '/local.png' }
  ];

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { clientWidth } = ref.current;
      const move = direction === 'left' ? -clientWidth : clientWidth;
      ref.current.scrollBy({ left: move, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1200, once: true, offset: 100 });
    const fetchData = async () => {
      try {
        const [cats, listings] = await Promise.all([getCategories(), getLatestListings()]);
        setCategories(cats);
        setLatestListings(listings);
        setTimeout(() => { AOS.refresh(); }, 800);
      } catch (err) { console.error(err); }
    };
    fetchData();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="aymen-style-wrapper">
      
      {/* --- HERO SECTION --- */}
      {/* --- HERO SECTION PRESTIGE --- */}
{/* --- HERO SECTION PRESTIGE IMMO LAMIS --- */}

<section className="hero-full">
  {/* Fond avec Slider et Overlay Sombre */}
  <div className="hero-slider">
    {slides.map((slide, index) => (
      <div 
        key={index} 
        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
        style={{ backgroundImage: ` url(${slide.url})` }}
      />
    ))}
  </div>

  <div className="hero-content-centered">
    {/* Petit badge élégant */}
    <span className="hero-badge" data-aos="fade-down" data-aos-delay="200">
      L'IMMOBILIER DE PRESTIGE DEPUIS 2010
    </span>

    {/* Logo before title */}
    <img src="/logolamis.svg" alt="Immo Lamis" className="hero-logo" data-aos="zoom-out" data-aos-duration="1200" />

    {/* Titre Principal en Or #D9B48F */}
    <h1 className="hero-main-title" data-aos="zoom-out" data-aos-duration="1500">
      IMMO<span className="gold-text-brand">LAMIS</span>
    </h1>

    {/* Sous-titre avec lignes de séparation fines */}
    <div className="hero-subtitle-wrapper" data-aos="fade-up" data-aos-delay="400">
      <div className="line-prestige"></div>
      <h2 className="hero-subtitle-italique">Votre Vitrine de Prestige en Algérie</h2>
      <div className="line-prestige"></div>
    </div>

    {/* Description Narrative centrée */}
   
    <p className="hero-long-desc" data-aos="fade-up" data-aos-delay="600">
      Que vous soyez un <span className="gold-highlight">propriétaire exigeant</span> souhaitant valoriser son bien ou un <span className="gold-highlight">acquéreur</span> en quête d'exception, ImmoLamis simplifie votre projet. 
      Villas, appartements ou terrains : accédez à une mise en relation <span className="text-white-bold">directe, transparente et sécurisée</span>.
    </p>
    {/* Bouton d'Action Haute Performance */}
    <div className="hero-actions" data-aos="fade-up" data-aos-delay="800">
      <Link to="/services" className="btn-discover-gold">
        <span className="btn-label">Explorer le catalogue</span>
        <span className="btn-arrow-icon">→</span>
      </Link>
    </div>
  </div>
  
  {/* Indicateur visuel pour scroller */}
  <div className="scroll-hint" data-aos="fade-up" data-aos-delay="1000">
    <div className="mouse-icon">
      <div className="mouse-wheel"></div>
    </div>
  </div>
</section>
      {/* --- POURQUOI NOUS CHOISIR --- */}
      <section className="unified-section">
        <div className="container">
          <div className="section-header-large" data-aos="fade-up">
            <p className="cursive-accent">L'Engagement</p>
            <h2 className="massive-title">L'EXCELLENCE IMMO <span className="beige-text">LAMIS</span></h2>
            <p className="header-description">
             Nous redéfinissons les standards de la mise en relation immobilière à travers une plateforme où chaque annonce est rigoureusement validée.
            </p>
            <div className="title-underline-centered"></div>
          </div>
          <div className="why-grid-aymen">
            {[
              { icon: <ShieldCheck size={35}/>, title: "ANNONCES VÉRIFIÉES", desc: "Chaque bien est audité par nos modérateurs avant publication pour garantir une sérénité totale."},
              { icon: <MapPin size={35}/>, title: "VISIBILITÉ PREMIUM", 
          desc: "Une vitrine de haut standing pour sublimer vos villas, terrains et locaux commerciaux."},
              { icon: <Headphones size={35}/>, title: "CONTACT DIRECT", 
          desc: "Pas d'intermédiaires inutiles. Contactez le fournisseur directement sur son numéro vérifié." }
            ].map((item, idx) => (
              <div className="why-card-aymen" key={idx} data-aos="fade-up" data-aos-delay={idx * 200}>
                <div className="why-card-top">
                  <div className="why-icon-luxe">{item.icon}</div>
                  <h3>{item.title}</h3>
                </div>
                <p className="white-p">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NOS CATÉGORIES --- */}
      <section className="unified-section pt-0">
        <div className="container">
          <div className="section-header-large" data-aos="fade-up">
            <p className="cursive-accent">Explorez</p>
            <h2 className="massive-title">NOS CATÉGORIES</h2>
            <p className="header-description">
              Que vous cherchiez un écrin pour votre famille ou un espace de travail inspirant, découvrez notre sélection classée par univers.
            </p>
            <div className="title-underline-centered"></div>
          </div>
          <div className="slider-nav-container">
            <button className="btn-slide-nav" onClick={() => scroll(catRef, 'left')}><ChevronLeft size={20}/></button>
            <button className="btn-slide-nav" onClick={() => scroll(catRef, 'right')}><ChevronRight size={20}/></button>
          </div>
          <div className="categories-grid-aymen mobile-slider-touch" ref={catRef}>
            {categories.map((cat, index) => (
              <div key={cat.id} data-aos="fade-up" data-aos-delay={index * 150}>
                <Link to={`/services?categoryId=${cat.id}`} className="cat-card-aymen">
                  <div className="cat-icon-aymen">{CATEGORY_ICONS[cat.slug] || <Home size={40}/>}</div>
                  <h3>{cat.name.toUpperCase()}</h3>
                  <div className="cat-hover-glow"></div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DERNIÈRES ANNONCES --- */}
      <section className="unified-section pt-0" id="annonces-section">
        <div className="container">
          <div className="section-header-large" data-aos="fade-up">
            <p className="cursive-accent">Sélection</p>
            <h2 className="massive-title">DERNIÈRES <span className="beige-text">PÉPITES</span></h2>
            <p className="header-description">
              Découvrez nos dernières offres exceptionnelles, sélectionnées pour leur qualité et leur valeur ajoutée.
            </p>
            <div className="title-underline-centered"></div>
          </div>
          <div className="slider-nav-container">
            <button className="btn-slide-nav" onClick={() => scroll(annoncesRef, 'left')}><ChevronLeft size={20}/></button>
            <button className="btn-slide-nav" onClick={() => scroll(annoncesRef, 'right')}><ChevronRight size={20}/></button>
          </div>
          <div className="grid-home-3x3 mobile-slider-touch" ref={annoncesRef}>
            {latestListings.slice(0, 9).map((listing, index) => (
              <div className="listing-anim-wrapper" key={listing.id} data-aos="fade-up" data-aos-delay={(index % 3) * 150}>
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="unified-section stats-prestige-bg">
        <div className="container">
          <div className="stats-grid-aymen">
            {[
              { icon: <Award size={32} />, n: "15+", l: "Expertise" },
              { icon: <Home size={32} />, n: "500+", l: "Biens" }, 
              { icon: <Users size={32} />, n: "98%", l: "Clients" },
              { icon: <Clock size={32} />, n: "24/7", l: "Support" }
            ].map((s, i) => (
              <div className="stat-item" key={i} data-aos="zoom-in" data-aos-delay={i * 100}>
                <div className="stat-icon">{s.icon}</div>
                <span className="stat-number">{s.n}</span>
                <span className="stat-label">{s.l}</span>
                <div className="stat-line"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* --- SECTION TÉMOIGNAGES --- */}
<section className="unified-section testimonials-prestige">
  <div className="container">
    <div className="section-header-large" data-aos="fade-up">
      <p className="cursive-accent">Confiance</p>
      <h2 className="massive-title">ILS NOUS ONT <span className="gold-text-brand">CHOISIS</span></h2>
      <div className="title-underline-centered"></div>
    </div>

    <div className="testimonials-grid" data-aos="fade-up">
      {[
        { 
          icon: <Sparkles size={28} />, name: "Karim Benali", role: "Acquéreur", 
          text: "J'ai trouvé ma villa à Akid Lotfi en quelques clics. Le contact direct avec le propriétaire a facilité toute la transaction.",
          initials: "KB"
        },
        { 
          icon: <Sparkles size={28} />, name: "Sonia Hamidi", role: "Propriétaire", 
          text: "En publiant sur ImmoLamis, j'ai reçu uniquement des appels qualifiés. Mon appartement a été loué en une semaine.",
          initials: "SH"
        },
        { 
          icon: <Sparkles size={28} />, name: "Amine Touati", role: "Promoteur Pro", 
          text: "La plateforme idéale pour valoriser mes locaux commerciaux et bureaux. Le rendu visuel est simplement impeccable.",
          initials: "AT"
        }
      ].map((t, i) => (
        <div className="testimonial-card-luxe" key={i}>
          <div className="testimonial-card-top">
            <div className="testimonial-icon">{t.icon}</div>
            <div className="testimonial-author">
              <div className="author-avatar">{t.initials}</div>
              <div className="author-info">
                <h4>{t.name}</h4>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
          <p className="testimonial-text">« {t.text} »</p>
        </div>
      ))}
    </div>
  </div>
</section>
     <section className="unified-section luxe-form-section">
  <div className="container">
    <div className="section-header-large" data-aos="fade-up">
      <p className="cursive-accent">Privé</p>
      <h2 className="massive-title">CONCRÉTISEZ VOTRE <span className="gold-text-brand">PROJET</span></h2>
      <div className="title-underline-centered"></div>
    </div>

    <div className="cta-wrapper-prestige" data-aos="fade-up">
      <div className="cta-content-luxe">
        <div className="form-intro">
          <h3>Demande de Consultation</h3>
          <p>Laissez vos coordonnées, nos experts vous recontacteront sous 24h.</p>
        </div>

        <div className="contact-cta-text">
          <p>
            Pour toute demande, utilisez notre formulaire de contact dédié. Notre équipe vous répondra rapidement.
          </p>
          <Link to="/contact" className="btn-discover-gold">
            <span className="btn-label">Aller à la page Contact</span>
            <span className="btn-arrow-icon">→</span>
          </Link>
        </div>
      </div>

      <div className="cta-visual-side">
        <div className="visual-overlay">
          <div className="contact-info-badge">
            <p>Disponible 7j/7</p>
            <span className="gold-line"></span>
            <p>Oran, DZ</p>
          </div>
        </div>
        <img src="/villa.png" alt="Immobilier Luxe" className="visual-img" />
      </div>
    </div>
  </div>
</section>
      
    </div>
  );
}