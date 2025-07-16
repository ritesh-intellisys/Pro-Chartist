import { motion } from 'framer-motion';
import './Learning.css';
import thmb1Webp from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS ).webp';
import thmb1Jpg from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS ).jpg';
import thmb2Webp from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS).webp';
import thmb2Jpg from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS).jpg';
import thmb3Webp from '../assets/ADVERTISEMENT FLYER (( VAKRATUND GRAPHICS)).webp';
import thmb3Jpg from '../assets/ADVERTISEMENT FLYER (( VAKRATUND GRAPHICS)).jpg';
import thmb4Webp from '../assets/bg3.webp';
import thmb4Jpg from '../assets/bg3.jpg';

function Learning() {
  const courses = [
    {
      id: 1,
      title: "Price Line Bot Strategy",
      imageWebp: thmb1Webp,
      imageJpg: thmb1Jpg,
      validity: "1 year validity",
      discount: "80% off",
      currentPrice: "₹1000",
      originalPrice: "₹5000"
    },
    {
      id: 2,
      title: "Smart Money Concept ",
      imageWebp: thmb2Webp,
      imageJpg: thmb2Jpg,
      validity: "6 months validity",
      discount: "80% off",
      currentPrice: "₹1000",
      originalPrice: "₹5000"
    },
    {
      id: 3,
      title: "Stock Swing Bot Strategy",
      imageWebp: thmb3Webp,
      imageJpg: thmb3Jpg,
      validity: "Scalping Techniques",
      discount: "75% off",
      currentPrice: "₹500",
      originalPrice: "₹2000"
    },
    {
      id: 4,
      title: "9-20 Strategy",
      imageWebp: thmb4Webp,
      imageJpg: thmb4Jpg,
      validity: "Trading insights",
      discount: "75% off",
      currentPrice: "₹750",
      originalPrice: "₹3000"
    }
  ];

  return (
    <main className="learning-page">
      <h1 className="page-title">Courses</h1>
      <section className="courses-grid">
        {courses.map((course) => (
          <article key={course.id} className="course-card">
            <div className="course-image">
              <picture>
                <source srcSet={course.imageWebp} type="image/webp" />
                <img 
                  src={course.imageJpg} 
                  alt={`Course: ${course.title} - ${course.validity}`} 
                  loading="lazy" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </picture>
              <span className="discount-badge">{course.discount}</span>
            </div>
            <div className="course-content">
              <h2>{course.title}</h2>
              <p className="validity">{course.validity}</p>
              <div className="price-container">
                <span className="current-price">{course.currentPrice}</span>
                <span className="original-price">{course.originalPrice}</span>
              </div>
              <button className="view-details-btn" tabIndex={0}>View Details</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Learning;