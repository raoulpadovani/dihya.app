export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__section">
          <h3 className="footer__title">À propos</h3>
          <ul className="footer__links">
            <li><a href="#about">Qui sommes-nous</a></li>
            <li><a href="#team">Notre équipe</a></li>
            <li><a href="#blog">Blog</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3 className="footer__title">Services</h3>
          <ul className="footer__links">
            <li><a href="#reservations">Réservations</a></li>
            <li><a href="#catering">Traiteur</a></li>
            <li><a href="#menu">Menu</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3 className="footer__title">Contact</h3>
          <ul className="footer__links">
            <li><a href="mailto:contact@dihya.com">contact@dihya.com</a></li>
            <li><a href="tel:+212600000000">+212 6 00 00 00 00</a></li>
            <li><a href="#address">Adresse</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3 className="footer__title">Légal</h3>
          <ul className="footer__links">
            <li><a href="#terms">Conditions d'utilisation</a></li>
            <li><a href="#privacy">Politique de confidentialité</a></li>
            <li><a href="#cookies">Gestion des cookies</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {currentYear} DIHYA. Tous les droits réservés.</p>
      </div>
    </footer>
  );
}
