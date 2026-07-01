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
          <p className="cursive-accent">L'Héritage de la Confiance</p>
          <h1 className="massive-title">L'UNIVERS IMMO <span className="gold-text-brand">LAMIS</span></h1>
          <p className="hero-subtitle-luxe">
            Bâtir des ponts entre propriétaires d'exception et acquéreurs exigeants.
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
              Immo Lamis redéfinit l'expérience immobilière en Algérie. Plus qu'une plateforme, nous sommes un <span className="text-gold">label de qualité</span> qui garantit la rencontre entre l'offre et la demande dans un cadre sécurisé.
            </p>
            <p className="p-luxe">
              Chaque agent immobilié est un partenaire privilégié, et chaque visiteur est un client précieux. Notre mission est de supprimer les barrières de l'incertitude pour laisser place à la <span className="text-gold">concrétisation de vos rêves</span>.
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
          <p className="cursive-accent centered" data-aos="fade-up">Notre Vision</p>
          <div className="mission-grid-luxe">
            <div className="mission-card-luxe" data-aos="fade-up" data-aos-delay="100">
              <div className="icon-circle"><Target size={32} /></div>
              <h3>Rigueur</h3>
              <p>Une modération stricte pour éliminer les annonces fantômes et valoriser les biens réels.</p>
            </div>
            <div className="mission-card-luxe" data-aos="fade-up" data-aos-delay="200">
              <div className="icon-circle"><ShieldCheck size={32} /></div>
              <h3>Sécurité</h3>
              <p>Un environnement où agents immobiliers et clients interagissent en toute transparence et sérénité.</p>
            </div>
            <div className="mission-card-luxe" data-aos="fade-up" data-aos-delay="300">
              <div className="icon-circle"><BarChart3 size={32} /></div>
              <h3>Prestige</h3>
              <p>Mettre en lumière le patrimoine architectural et commercial de la capitale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VALEURS */}
      <section className="section container">
        <p className="cursive-accent centered">Pourquoi nous choisir ?</p>
        <div className="values-grid-luxe">
          {[
            { icon: <Heart />, title: "Écoute Client", text: "Un accompagnement sur mesure pour chaque projet de vie." },
            { icon: <Lock />, title: "Transparence", text: "Aucun frais caché. Un contact direct et honnête." },
            { icon: <Zap />, title: "Efficacité", text: "Un outil fluide conçu pour une prise de contact instantanée." }
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
              <span className="stat-lab">OPPORTUNITÉS VÉRIFIÉES</span>
            </div>
            <div className="stat-box-luxe" data-aos="zoom-in" data-aos-delay="200">
              <span className="stat-num">+{stats.categories}</span>
              <span className="stat-lab">TYPES D'INVESTISSEMENTS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}