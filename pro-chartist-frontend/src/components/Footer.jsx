import { FiTwitter, FiGithub, FiLinkedin, FiYoutube } from 'react-icons/fi';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>Product</h3>
            <ul className="footer-links">
              <li><span className="footer-link">Features</span></li>
              <li><span className="footer-link">Pricing</span></li>
              <li><span className="footer-link">Documentation</span></li>
              <li><span className="footer-link">API Reference</span></li>
              <li><span className="footer-link">Updates</span></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li><span className="footer-link">Education</span></li>
              <li><span className="footer-link">Pricing</span></li>
              <li><span className="footer-link">Contact</span></li>
              <li><span className="footer-link">Events</span></li>
              <li><span className="footer-link">Community</span></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <ul className="footer-links">
              <li><span className="footer-link">Privacy Policy</span></li>
              <li><span className="footer-link">Terms of Service</span></li>
              <li><span className="footer-link">Refund Policy</span></li>
              <li><span className="footer-link">Cookie Policy</span></li>
              <li><span className="footer-link">Sitemap</span></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Markets</h3>
            <ul className="footer-links">
              <li><span className="footer-link">Stocks</span></li>
              <li><span className="footer-link">Forex</span></li>
              <li><span className="footer-link">Crypto</span></li>
              <li><span className="footer-link">Commodities</span></li>
              <li><span className="footer-link">Indices</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-logo">Pro Chartist</div>
          {/* <p className="footer-copyright">© {new Date().getFullYear()} Pro Chartist. All rights reserved.</p> */}
          <p className="footer-description">
            Pro Chartist is a leading platform for advanced trading analysis and automated trading solutions.
            We provide cutting-edge tools and educational resources for traders of all levels.
          </p>
          <div className="social-links">
            <span className="social-link"><FiTwitter /></span>
            <span className="social-link"><FiGithub /></span>
            <span className="social-link"><FiLinkedin /></span>
            <span className="social-link"><FiYoutube /></span>
          </div>
          <p className="footer-description">
            © <b>Designed and developed by Intellisys IT Solutions Pvt Ltd. </b>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;