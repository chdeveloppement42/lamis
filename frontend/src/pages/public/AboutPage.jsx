import './AboutPage.css';
import { useEffect, useState } from 'react';
import { getCategories } from '../../api/categories.api';
import { getPublishedListings } from '../../api/listings.api';
import { Target, ShieldCheck, BarChart3, Heart, Zap, Lock } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AboutPage() {
  const [stats, setStats] = useState({ listings: 0, categories: 0 });

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    getCategories().then((cats) => setStats((s) => ({ ...s, categories: cats.length })));
    getPublishedListings({ limit: 1 }).then((res) => {
      if (Array.isArray(res)) setStats((s) => ({ ...s, listings: res.length }));
      else if (res && res.meta) setStats((s) => ({ ...s, listings: res.meta.total || 0 }));
    });
  }, []);

  return (
    <div className="aymen-about-wrapper">
      {/* 1. HERO SECTION LUXE */}
      <section className="about-hero-luxe">
        <div className="hero-overlay-dark" style={{ backgroundImage: `url('/bureau.png')` }} />
        <div className="container hero-content-luxe" data-aos="zoom-out">
          <p className="cursive-accent">Notre Histoire</p>
          <h1 className="massive-title">À PROPOS D'IMMO LAMIS</h1>
          <p className="hero-subtitle-luxe">
            L'excellence immobilière au service de votre sécurité en Algérie.
          </p>
        </div>
      </section>

      {/* 2. PRÉSENTATION ÉLÉGANTE */}
      <section className="section container">
        <div className="presentation-layout">
          <div className="presentation-text-luxe" data-aos="fade-right">
            <p className="cursive-accent">Notre Engagement</p>
            <div className="gold-divider"></div>
            <p className="p-luxe">
              Immo Lamis est née d'une vision simple : rendre l'immobilier 
              <span className="text-gold"> accessible, honnête et sécurisé</span> pour tous en Algérie. 
              Nous ne nous contentons pas de lister des biens, nous bâtissons un réseau de confiance.
            </p>
            <p className="p-luxe">
              Grâce à notre processus de vérification rigoureux, nous garantissons que chaque 
              annonce répond à nos critères de qualité les plus stricts.
            </p>
          </div>
          <div className="presentation-image-luxe" data-aos="fade-left">
            <div className="image-border-accent">
              <img src="/about.png" alt="Engagement Immo Lamis" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSIONS (CARDS SOMBRES) */}
      <section className="section bg-darker">
        <div className="container">
          <p className="cursive-accent centered" data-aos="fade-up">Nos Missions</p>
          <div className="mission-grid-luxe">
            <div className="mission-card-luxe" data-aos="fade-up" data-aos-delay="100">
              <div className="icon-circle"><Target size={32} /></div>
              <h3>Vision Claire</h3>
              <p>Devenir la référence numéro 1 en Algérie pour la fiabilité des annonces immobilières.</p>
            </div>
            <div className="mission-card-luxe" data-aos="fade-up" data-aos-delay="200">
              <div className="icon-circle"><ShieldCheck size={32} /></div>
              <h3>Sécurité Totale</h3>
              <p>Chaque fournisseur est rigoureusement contrôlé avant de pouvoir publier.</p>
            </div>
            <div className="mission-card-luxe" data-aos="fade-up" data-aos-delay="300">
              <div className="icon-circle"><BarChart3 size={32} /></div>
              <h3>Innovation</h3>
              <p>Utiliser la technologie pour simplifier radicalement votre recherche.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VALEURS */}
      <section className="section container">
        <p className="cursive-accent centered">Pourquoi nous ?</p>
        <div className="values-grid-luxe">
          {[
            { icon: <Heart />, title: "La Proximité", text: "À l'écoute de chaque utilisateur pour s'améliorer." },
            { icon: <Lock />, title: "Transparence", text: "Pas de frais cachés, pas d'annonces fantômes." },
            { icon: <Zap />, title: "Rapidité", text: "Un système fluide pour agir en un clic." }
          ].map((item, index) => (
            <div className="value-item-luxe" key={index} data-aos="fade-up">
              <div className="value-icon-luxe">{item.icon}</div>
              <div className="value-content-luxe">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STATS FINALES */}
      <section className="stats-section-luxe">
        <div className="container">
          <div className="stats-row-luxe">
            <div className="stat-box-luxe" data-aos="zoom-in">
              <span className="stat-num">+{stats.listings}</span>
              <span className="stat-lab">ANNONCES VÉRIFIÉES</span>
            </div>
            <div className="stat-box-luxe" data-aos="zoom-in" data-aos-delay="200">
              <span className="stat-num">+{stats.categories}</span>
              <span className="stat-lab">TYPES DE BIENS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}