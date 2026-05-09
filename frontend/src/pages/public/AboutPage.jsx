import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page__hero">
        <div className="container">
          <h1>À propos d'Immo Lamis</h1>
          <p>Une plateforme bâtie sur la confiance et la transparence</p>
        </div>
      </div>

      <section className="section">
        <div className="container about-content">
          <div className="about-card">
            <div className="about-card__icon">
              <img src="/branding/icon-house.svg" alt="Mission" style={{ width: '40px', height: '40px' }} />
            </div>
            <h3>Notre Mission</h3>
            <p>
              Offrir un espace immobilier fiable où chaque annonce est vérifiée par notre équipe.
              Nous éliminons les fausses annonces pour garantir la meilleure expérience à nos utilisateurs.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card__icon">
              <img src="/branding/verified-badge.svg" alt="Validation" style={{ width: '40px', height: '40px' }} />
            </div>
            <h3>Validation Rigoureuse</h3>
            <p>
              Chaque fournisseur doit soumettre ses documents professionnels. Nos administrateurs
              vérifient manuellement chaque profil avant de l'activer sur la plateforme.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card__icon">
              <img src="/branding/icon-key.svg" alt="Sécurité" style={{ width: '40px', height: '40px' }} />
            </div>
            <h3>Sécurité Maximale</h3>
            <p>
              Photos protégées par filigrane, comptes sécurisés par authentification JWT,
              et système de permissions granulaire pour notre équipe interne.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card__icon">
              <img src="/branding/icon-check.svg" alt="Croissance" style={{ width: '40px', height: '40px' }} />
            </div>
            <h3>Croissance Continue</h3>
            <p>
              Notre réseau de fournisseurs vérifiés grandit chaque jour, offrant toujours
              plus de choix et de qualité à nos visiteurs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
