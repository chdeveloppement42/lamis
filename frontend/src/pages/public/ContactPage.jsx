import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Mail, Phone, Send, Loader2, ChevronDown, ChevronUp, User, Building2 } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './ContactPage.css';

const FAQ_CONTENT = {
 acheteur: [
    { 
      q: "Dois-je créer un compte pour contacter un vendeur ?", 
      a: "Non, aucun compte n'est requis. Vous pouvez accéder directement au numéro de téléphone du vendeur ou lui envoyer un message via WhatsApp en un clic." 
    },
    { 
      q: "Comment prendre rendez-vous pour une visite ?", 
      a: "Il suffit de cliquer sur le bouton 'Appeler' ou l'icône WhatsApp sur l'annonce du bien pour discuter directement avec le propriétaire ou l'agent." 
    },
    { 
      q: "Est-ce que le service est gratuit pour moi ?", 
      a: "Oui, la consultation des annonces et la mise en relation directe avec les offreurs sont 100% gratuites et sans intermédiaire." 
    },
    { 
      q: "Comment savoir si le vendeur est fiable ?", 
      a: "Nous vérifions manuellement les coordonnées des annonceurs. Privilégiez les profils avec le badge 'Vérifié' pour une sécurité optimale." 
    }
  ],
  fournisseur: [
    { 
      q: "Comment les clients vont-ils me contacter ?", 
      a: "Les clients vous contactent directement sur votre numéro de téléphone ou votre WhatsApp. Vous recevez des prospects qualifiés sans intermédiaire." 
    },
    { 
      q: "Dois-je obligatoirement avoir WhatsApp ?", 
      a: "Ce n'est pas obligatoire mais fortement recommandé pour faciliter les échanges rapides et l'envoi de photos supplémentaires aux clients." 
    },
    { 
      q: "Comment publier mes annonces ?", 
      a: "Pour vous, la création d'un compte partenaire est nécessaire afin de gérer votre catalogue, modifier vos prix et suivre vos statistiques de vues." 
    },
    { 
      q: "Comment s'inscrire en tant que vendeur ?", 
      a: "Remplissez le formulaire d'inscription Partenaire. Après avoir choisi votre pack et effectué le paiement, un administrateur vous contactera pour valider votre identité et activer votre compte." 
    },
    { 
      q: "Quelles sont les étapes pour commencer à publier ?", 
      a: "1. Inscription en ligne. 2. Paiement de l'abonnement. 3. Appel de validation de l'administrateur sous 24h. 4. Mise en ligne de vos annonces." 
    },
    { 
      q: "Pourquoi l'accès vendeur est-il payant ?", 
      a: "Le paiement garantit le sérieux de nos partenaires. Cela nous permet de maintenir une plateforme haut de gamme, sans publicité intrusive et sans fausses annonces pour vos futurs clients." 
    }
    ]

};

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ submitted: false, error: null, loading: false });
  const [activeTab, setActiveTab] = useState('acheteur');
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ ...status, loading: true, error: null });
    try {
      await axiosInstance.post('/contact', formData);
      setStatus({ submitted: true, error: null, loading: false });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(s => ({ ...s, submitted: false })), 5000);
    } catch {
      setStatus({ submitted: false, error: "Erreur réseau. Réessayez.", loading: false });
    }
  };

  return (
    <div className="aymen-contact-wrapper">
      {/* --- HERO SECTION --- */}
      <section className="contact-hero-luxe">
        <div className="hero-overlay-dark" style={{ backgroundImage: `url('/local.png')` }} />
        <div className="container hero-content-luxe" data-aos="zoom-out">
          <span className="gold-badge">Support Immo Lamis</span>
          <h1 className="massive-title">BESOIN D'AIDE ? <span className="text-gold">CONTACTEZ-NOUS</span></h1>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-grid-luxe">
            
            {/* SIDEBAR INFOS */}
            <div className="contact-sidebar-luxe" data-aos="fade-right">
              <div className="info-stack-luxe">
                <a href="mailto:contact@immolamis.com" className="modern-card-luxe">
                  <div className="icon-circle-gold"><Mail size={22} /></div>
                  <div className="card-details">
                    <h3>Email</h3>
                    <p>contact@immolamis.com</p>
                  </div>
                </a>

                <a href="tel:+213555123456" className="modern-card-luxe">
                  <div className="icon-circle-gold"><Phone size={22} /></div>
                  <div className="card-details">
                    <h3>Téléphone</h3>
                    <p>+213 555 123 456</p>
                  </div>
                </a>
              </div>

              <div className="map-container-luxe">
                <iframe 
                  title="Map Immo Lamis" 
                  src="https://www.openstreetmap.org/export/embed.html?bbox=3.00,36.70,3.10,36.78&layer=mapnik"
                ></iframe>
              </div>
            </div>

            {/* FORMULAIRE D'EXPÉDITION */}
            <div className="form-container-luxe" data-aos="fade-left">
              <div className="form-header">
                <h2>Message Direct</h2>
                <div className="gold-divider"></div>
              </div>

              {status.submitted && <div className="success-msg">Message envoyé avec succès !</div>}
              {status.error && <div className="error-msg">{status.error}</div>}

              <form onSubmit={handleSubmit} className="aymen-form">
                <div className="input-row-responsive">
                  <div className="input-group-luxe">
                    <label>Nom Complet</label>
                    <input 
                      type="text" 
                      placeholder="Votre nom"
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="input-group-luxe">
                    <label>Email</label>
                    <input 
                      type="email" 
                      placeholder="votre@email.com"
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                <div className="input-group-luxe">
                  <label>Sujet</label>
                  <input 
                    type="text" 
                    placeholder="Objet de votre demande"
                    value={formData.subject} 
                    onChange={e => setFormData({ ...formData, subject: e.target.value })} 
                    required 
                  />
                </div>
                <div className="input-group-luxe">
                  <label>Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Comment pouvons-nous vous aider ?"
                    value={formData.message} 
                    onChange={e => setFormData({ ...formData, message: e.target.value })} 
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-gold-luxe" disabled={status.loading}>
                  {status.loading ? <Loader2 className="spinner" /> : <><Send size={18} /> ENVOYER LE MESSAGE</>}
                </button>
              </form>
            </div>
          </div>

          <div className="section-spacer"></div>

          {/* --- FAQ SECTION --- */}
          <div className="faq-section-header">
            <p className="cursive-accent centered" data-aos="fade-up">Questions Fréquentes</p>
          </div>

          <div className="faq-tabs-container" data-aos="fade-up">
            <div className="faq-tabs-nav">
              <button 
                className={`tab-btn ${activeTab === 'acheteur' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('acheteur'); setActiveIndex(null); }}
              >
                <User size={20} /> <span>Espace Acheteur</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'fournisseur' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('fournisseur'); setActiveIndex(null); }}
              >
                <Building2 size={20} /> <span>Espace Partenaire</span>
              </button>
            </div>

            <div className="faq-content-box">
              {FAQ_CONTENT[activeTab].map((item, index) => (
                <div 
                  key={index} 
                  className={`faq-accordion-item ${activeIndex === index ? 'open' : ''}`} 
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                >
                  <div className="faq-question-row">
                    <span>{item.q}</span>
                    {activeIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <div className="faq-answer-row">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}