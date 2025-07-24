import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Learning.css';
import thmb1Webp from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS ).webp';
import thmb1Jpg from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS ).jpg';
import thmb2Webp from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS).webp';
import thmb2Jpg from '../assets/ADVERTISEMENT FLYER ( VAKRATUND GRAPHICS).jpg';
import thmb3Webp from '../assets/ADVERTISEMENT FLYER (( VAKRATUND GRAPHICS)).webp';
import thmb3Jpg from '../assets/ADVERTISEMENT FLYER (( VAKRATUND GRAPHICS)).jpg';
import thmb4Webp from '../assets/bg3.webp';
import thmb4Jpg from '../assets/bg3.jpg';

const fallbackImages = [
  { webp: thmb1Webp, jpg: thmb1Jpg },
  { webp: thmb2Webp, jpg: thmb2Jpg },
  { webp: thmb3Webp, jpg: thmb3Jpg },
  { webp: thmb4Webp, jpg: thmb4Jpg },
];

const staticCourseRoutes = {
  'Price Line Bot Strategy': '/course/price-line-bot',
  'Smart Money Concept': '/course/smc',
  'Smart Money Concept ': '/course/smc', // with trailing space
  'Stock Swing Bot Strategy': '/course/stock-swing',
  '9-20 Strategy': '/course/9-20',
};

function Learning() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/courses`)
      .then(res => res.json())
      .then(setCourses)
      .catch(err => {
        console.error('Failed to fetch courses:', err);
      });
  }, []);
  

  return (
    <main className="learning-page">
      <h1 className="page-title">Courses</h1>
      <section className="courses-grid">
        {courses.map((course, idx) => {
          // Fallback to static images if no backend imageUrl
          const fallback = fallbackImages[idx % fallbackImages.length];
          return (
            <article key={course._id || course.id} className="course-card">
              <div className="course-image">
                {course.imageUrl ? (
                  <img
                    src={
                      course.imageUrl.startsWith('http')
                        ? course.imageUrl
                        : `${import.meta.env.VITE_API_URL}${course.imageUrl}`
                    }
                    alt={course.title}
                    className="course-image"
                  />
                ) : (
                  <picture>
                    <source srcSet={fallback.webp} type="image/webp" />
                    <img
                      src={fallback.jpg}
                      alt={`Course: ${course.title} - ${course.validity}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </picture>
                )}
                <span className="discount-badge">{course.discount}%</span>
              </div>
              <div className="course-content">
                <h2>{course.title}</h2>
                <p className="validity">{course.validity}</p>
                <div className="price-container">
                  <span className="current-price">₹{course.currentPrice}</span>
                  <span className="original-price">₹{course.originalPrice}</span>
                </div>
                <Link
                  to={
                    idx === 0 ? "/course/price-line-bot"
                    : idx === 1 ? "/course/smc"
                    : idx === 2 ? "/course/stock-swing"
                    : idx === 3 ? "/course/9-20"
                    : `/course/${course._id || course.id}`
                  }
                  className="view-details-btn"
                  tabIndex={0}
                >
                  View Details
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Learning;