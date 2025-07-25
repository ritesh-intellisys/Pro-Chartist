const API_URL = import.meta.env.VITE_API_URL;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import './Home.css';
import TickerTape from '../charts/TickerTape';
import TradingViewWidget from '../charts/TradingViewWidget';
import TradingViewWidget2 from '../charts/TradingViewWidget2';
import TradingViewWidget3 from '../charts/TradingViewWidget3';
import TradingViewWidget4 from '../charts/TradingViewWidget4';

import vbg1 from '../assets/vbg1.png';
import vbg2 from '../assets/vbg2.png';
import vbg3 from '../assets/vbg3.png';
import vbg4 from '../assets/vbg4.png';

import r1 from '../assets/r1.jpg';
import r2 from '../assets/r2.jpg';
import r3 from '../assets/r3.jpg';
import r4 from '../assets/r4.jpg';
import r5 from '../assets/r5.jpg';
import r6 from '../assets/r6.jpg';

import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';

import ss1 from '../assets/Screenshot11.png';
import ss2 from '../assets/Screenshot12.png';
import ss3 from '../assets/Screenshot14.png';

// Helper to get the full backend URL
const getBackendUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5002${url}`;
};

function Home() {
  const [selectedBot, setSelectedBot] = useState('price-line');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null); // Track hovered video
  const [videoTimeout, setVideoTimeout] = useState(null); // Track timeout for video stop
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Smart Money Concept Strategy',
      description: 'How to trade bot Bitcoin, Bank Nifty trade using Price line bot',
      thumbnail: vbg1,
      videoUrl: ''
    },
    {
      id: 2,
      title: "Stock's Swing Bot Strategy",
      description: 'Stock swing bot: Use this bot to trade swing & stocks',
      thumbnail: vbg2,
      videoUrl: ''
    },
    {
      id: 3,
      title: 'Price Line Bot Strategy',
      description: 'This bot presents and makes all kinds of levels of SMC',
      thumbnail: vbg3,
      videoUrl: ''
    },
    {
      id: 4,
      title: 'Liquidity Bot Strategy',
      description: 'Learn how to identify and trade liquidity zones with this bot',
      thumbnail: vbg4,
      videoUrl: ''
    }
  ]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [showOverlayDialog, setShowOverlayDialog] = useState(false);
  const [pendingBotUrl, setPendingBotUrl] = useState(null);

  // Bot URLs for redirection
  const botUrls = {
    'price-line': 'https://www.tradingview.com/script/d5EIJrAY-Sniper-Entry-Setup/',
    'stock-swing': 'https://www.tradingview.com/script/i3YZzMnQ-Smart-Money-Concepts/',
    'smc': 'https://www.tradingview.com/script/i3YZzMnQ-Smart-Money-Concepts/',
    'liquidity': 'https://www.tradingview.com/script/i3YZzMnQ-Smart-Money-Concepts/'
  };

  useEffect(() => {
    // Load saved videos from backend API
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/videos`);
        const data = await res.json();
  
        if (data && data.length > 0) {
          setVideos(data);
        }
        // If no videos from backend, keep the default videos with thumbnails
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        // Keep default videos if API fails
      }
    };
  
    fetchVideos();
  }, []);
  


  const bots = [
    { 
      id: 'price-line', 
      name: 'Price Line Bot',
      image: ss1
    },
    { 
      id: 'stock-swing', 
      name: 'Stock Swing Bot',
      image: ss2
    },
    { 
      id: 'smc', 
      name: 'SMC Bot',
      image: ss3
    },
    { 
      id: 'liquidity', 
      name: 'Liquidity Bot',
      image: ss3
    }
  ];

  const tickers = [
    { symbol: 'BTC', price: '45,123.45', change: '+2.5%' },
    { symbol: 'ETH', price: '2,890.12', change: '+1.8%' },
    { symbol: 'SPY', price: '456.78', change: '-0.5%' }
  ];

  const reviews = [
    {
      id: 1,
      name: "Aniket",
      role: "Option Trader",
      rating: 5,
      comment: "Price line bot is best for quick trade it gives best buy sell signal for momentum trading",
      avatar: r1,
      image: image1
    },
    {
      id: 2,
      name: "Siddharth",
      role: "Swing Trader",
      rating: 5,
      comment: "I use stock swing bot for swing trading and it gives me best results.Also it helps me to make intraday view",
      avatar: r2,
      image: image2
    },
    {
      id: 3,
      name: "Mansi",
      role: "Crypto Trader",
      rating: 4,
      comment: "I used to trade bitcoin and price line bot works best for momentum trading. My all friends use this bot for trading in all crypto",
      avatar: r4,
      image: image3
    },
    {
      id: 4,
      name: "Akash",
      role: "Intraday Trader",
      rating: 5,
      comment: "I am a full time trader I use to trade stock, option, bitcoin and forex. This stock swing bot help me to do intraday analysis and price line bot for quick scalping",
      avatar: r3,
      image: image4
    }
  ];

  const faqs = [
    {
      id: 1,
      question: " What is Pro Chartist and how does it work?",
      answer: "Pro Chartist is an advanced trading analysis platform that combines AI-powered tools with traditional technical analysis. It works by analyzing market data in real-time and providing actionable insights through our specialized trading bots."
    },
    {
      id: 2,
      question: "How accurate are the trading signals?",
      answer: "Our trading signals have a proven accuracy rate of over 70%. However, we always recommend using them in conjunction with your own analysis and risk management strategy."
    },
    {
      id: 3,
      question: "What markets can I trade with Pro Chartist?",
      answer: "Pro Chartist supports multiple markets including stocks, forex, cryptocurrencies, commodities, and indices. Each bot is optimized for specific market conditions and trading styles."
    },
    {
      id: 4,
      question: "Do I need trading experience to use Pro Chartist?",
      answer: "While trading experience is beneficial, Pro Chartist is designed for both beginners and experienced traders. We provide comprehensive educational resources and step-by-step guides to help you get started."
    },
    {
      id: 5,
      question: "What are the subscription plans and pricing?",
      answer: "We offer flexible subscription plans starting from basic to premium packages. Each plan is tailored to different trading needs and volumes. Contact our sales team for detailed pricing information."
    },
    {
      id: 6,
      question: "Can I use Pro Chartist on mobile devices?",
      answer: "Yes, Pro Chartist is fully responsive and works on all devices including smartphones and tablets. We also offer dedicated mobile apps for iOS and Android platforms."
    },
    {
      id: 7,
      question: "How do I get started with Pro Chartist?",
      answer: "Getting started is easy! Simply sign up for an account, choose your preferred subscription plan, and complete the onboarding process. Our support team is available 24/7 to help you with the setup."
    },
    {
      id: 8,
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 customer support through live chat, email, and phone. Additionally, we offer weekly webinars, trading tutorials, and a comprehensive knowledge base."
    },
    {
      id: 9,
      question: "Is my trading data secure?",
      answer: "Yes, we take security seriously. All data is encrypted using industry-standard protocols, and we never share your personal or trading information with third parties."
    },
    {
      id: 10,
      question: "Can I integrate Pro Chartist with my existing trading platform?",
      answer: "Yes, Pro Chartist offers API integration with major trading platforms and brokers. Our technical team can assist you with custom integration requirements."
    }
  ];

  const selectedBotImage = bots.find(bot => bot.id === selectedBot)?.image;

  const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleMouseEnter = (videoUrl) => {
    // Set the hovered video
    setHoveredVideo(videoUrl);

    // Clear any existing timeout
    if (videoTimeout) {
      clearTimeout(videoTimeout);
    }

    // Set a timeout to stop the video after 5 seconds
    const timeout = setTimeout(() => {
      setHoveredVideo(null);
    }, 5000); // 5 seconds

    setVideoTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if the user hovers out before 5 seconds
    if (videoTimeout) {
      clearTimeout(videoTimeout);
    }

    // Reset the hovered video
    setHoveredVideo(null);
  };

  return (
    <div className="home">
      {/* Bot Selection */}
      <section className="bot-selection">
        {bots.map(bot => (
          <button
            key={bot.id}
            className={`bot-btn ${selectedBot === bot.id ? 'active' : ''}`}
            onClick={() => setSelectedBot(bot.id)}
          >
            {bot.name}
          </button>
        ))}
      </section>

      {/* Bot Image Container */}
      <div className="bot-image-container" style={{ position: 'relative' }}>
        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
          {/* Overlay Division */}
          <div
            className="bot-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.05)',
              zIndex: 2,
              cursor: 'pointer',
            }}
            onClick={() => {
              setPendingBotUrl(botUrls[selectedBot]);
              setShowOverlayDialog(true);
            }}
          ></div>
          {/* Chart Widget */}
          <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            {selectedBot === 'price-line' && <TradingViewWidget />}
            {selectedBot === 'stock-swing' && <TradingViewWidget2 />}
            {selectedBot === 'smc' && <TradingViewWidget3 />}
            {selectedBot === 'liquidity' && <TradingViewWidget4 />}
          </div>
        </div>
        {/* Popup Dialog */}
        {showOverlayDialog && (
          <div
            className="bot-popup-dialog"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            onClick={() => setShowOverlayDialog(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                minWidth: '300px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                textAlign: 'center',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1.5rem' }}>Open Bot chart</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.open(pendingBotUrl, '_blank');
                    setShowOverlayDialog(false);
                  }}
                >
                  Agree
                </button>
                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#e5e7eb',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowOverlayDialog(false)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Ticker */}
      <TickerTape/>

      {/* Videos Section */}
      <section className="videos-section">
      <div className="tutorial-videos-header">
       
       <h2>📹Tutorial Videos</h2>
      </div>
        <div className="video-grid">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              className="video-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="video-wrapper">
                {playingVideoId === video.id ? (
                  <video
                    src={getBackendUrl(video.videoUrl)}
                    controls
                    autoPlay
                    className="video-player"
                    onEnded={() => setPlayingVideoId(null)}
                  />
                ) : (
                  <div
                    className="thumbnail-wrapper"
                    style={{ cursor: video.videoUrl ? 'pointer' : 'default' }}
                    onClick={() => video.videoUrl && setPlayingVideoId(video.id)}
                  >
                    <img
                      src={getBackendUrl(video.thumbnail)}
                      alt={video.title}
                      className="video-thumbnail"
                    />
                    {video.videoUrl && (
                      <div className="play-icon">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <circle cx="14" cy="14" r="14" fill="currentColor" opacity="0.15"/>
                          <polygon points="11,9 20,14 11,19" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="video-content">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h3>#No.1</h3>
          <p>AI Charting Platform</p>
        </div>
        <div className="stat-card">
          <h3>4K</h3>
          <p>Active Traders</p>
        </div>
        <div className="stat-card">
          <h3>20+</h3>
          <p>Markets Covered</p>
        </div>
        <div className="stat-card">
          <h3>15K</h3>
          <p>Downloads</p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Community Analysis</h2>
        <div className="reviews-container">
          <div className="reviews-track">
            {duplicatedReviews.map((review, index) => (
              <motion.div 
                key={`${review.id}-${index}`}
                className="review-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={review.image} 
                  alt={`${review.name}'s Trading Setup`}
                  className="review-image"
                />
                <div className="review-content">
                  <div className="review-header">
                    <img src={review.avatar} alt={review.name} className="reviewer-avatar" />
                    <div className="reviewer-info">
                      <h3>{review.name}</h3>
                      <p>{review.role}</p>
                    </div>
                  </div>
                  <div className="rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="star">★</span>
                    ))}
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: faq.id * 0.1 }}
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(faq.id)}
              >
                {faq.question}
                <FiChevronDown className={`faq-icon ${openFaqId === faq.id ? 'open' : ''}`} />
              </button>
              <div className={`faq-answer ${openFaqId === faq.id ? 'open' : ''}`}>
                {faq.answer}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;