import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTag, FaHeadset, FaTools, FaCalendarCheck, FaSearch, FaCar, FaStar, FaFacebook, FaTwitter, FaInstagram, FaChevronRight } from 'react-icons/fa';
import heroBg from '../assets/luxury_cars_bg.png';
import { AuthContext } from '../context/AuthContext';

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleFindRideClick = () => {
    if (user) {
      navigate(user.role === 'Admin' ? '/admin' : '/customer');
    } else {
      navigate('/login');
    }
  };

  const featuredCars = [
    {
      id: 1,
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2023,
      price: 2500,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'
    },
    {
      id: 2,
      make: 'Porsche',
      model: '911 Carrera',
      year: 2022,
      price: 3000,
      image: 'https://images.unsplash.com/photo-1695328478607-bcd371587e7b?w=800&q=80'
    },
    {
      id: 3,
      make: 'Range Rover',
      model: 'Autobiography',
      year: 2024,
      price: 2000,
      image: 'https://images.unsplash.com/photo-1660278782070-d51c7599b8dd?q=80&w=800'
    }
  ];

  return (
  return (
    <div className="landing-wrapper" style={{ overflowX: 'hidden' }}>

      {/* 1. Hero Section */}
      <motion.section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBg})` }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1 variants={fadeIn} className="hero-title">
            Rent Your Dream Car Anytime, Anywhere
          </motion.h1>
          <motion.p variants={fadeIn} style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', padding: '0 1rem' }}>
            Experience the ultimate convenience and affordability with our premium fleet of vehicles. Perfect for weekend getaways or business trips.
          </motion.p>
          <motion.div variants={fadeIn} className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindRideClick}
              className="btn btn-primary"
              style={{ padding: '0.8rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem' }}
            >
              <FaCar /> Find Your Ride
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. Featured Cars */}
      <div className="container">
        <motion.section
          className="section-spacing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeIn} className="section-title"><span>Featured</span> Vehicles</motion.h2>
          <div className="grid-3">
            {featuredCars.map(car => (
              <motion.div
                key={car.id}
                variants={scaleUp}
                whileHover={{ y: -10 }}
                className="glass-panel"
                style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <div
                  style={{ height: '200px', width: '100%', backgroundImage: `url(${car.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                ></div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>{car.make} {car.model}</h3>
                  <p className="text-muted" style={{ marginBottom: '1rem', flex: 1 }}>Year: {car.year}</p>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '1.2rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{car.price} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>/day</span></span>
                    <FaChevronRight color="var(--primary)" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 3. Why Choose Us */}
        <motion.section
          className="section-spacing"
          style={{ background: 'rgba(255,255,255,0.02)', margin: '2rem -1rem', padding: '4rem 1rem', borderRadius: 'var(--radius-lg)' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeIn} className="section-title">Why <span>Choose Us</span>?</motion.h2>
          <div className="grid-4">
            {[
              { icon: <FaCalendarCheck />, title: 'Easy Booking', desc: 'Seamless online experience, fast and secure.', color: 'rgba(79, 70, 229, 0.2)', iconColor: 'var(--primary)' },
              { icon: <FaTag />, title: 'Affordable Pricing', desc: 'No hidden fees. Best market rates available.', color: 'rgba(20, 184, 166, 0.2)', iconColor: 'var(--secondary)' },
              { icon: <FaHeadset />, title: '24/7 Support', desc: 'Our team is ready to assist you anytime.', color: 'rgba(239, 68, 68, 0.2)', iconColor: 'var(--danger)' },
              { icon: <FaTools />, title: 'Well-Maintained', desc: 'Strict quality assurance before every rental.', color: 'rgba(245, 158, 11, 0.2)', iconColor: 'var(--warning)' }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="glass-panel text-center"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div className="icon-box" style={{ background: item.color, color: item.iconColor }}>
                  {item.icon}
                </div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{item.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. How It Works */}
        <motion.section
          className="section-spacing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeIn} className="section-title">How It <span>Works</span></motion.h2>
          <div className="flex" style={{ flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
            {[
              { num: 1, title: 'Search', desc: 'Find your perfect car' },
              { num: 2, title: 'Select', desc: 'Choose your dates' },
              { num: 3, title: 'Book', desc: 'Secure your checkout' },
              { num: 4, title: 'Drive', desc: 'Enjoy the ride!' }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={scaleUp}
                className="glass-panel step-card"
                style={{ flex: '1 1 240px', minWidth: '240px' }}
              >
                <div className="step-number">{step.num}</div>
                <h4 style={{ fontSize: '1.2rem' }}>{step.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 6. Footer */}
        <footer className="footer-section">
          <div className="grid-3" style={{ marginBottom: '3rem' }}>
            <div>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.4rem' }}>PrimeRentals</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Redefining what it means to drive in style, anywhere, anytime.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Contact Info</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>📍 Salt Lake City, Kolkata</li>
                <li style={{ marginBottom: '0.5rem' }}>✉️ primerentals00@gmail.com</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Follow Us</h4>
              <div className="flex gap-4">
                <motion.a href="#" style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}><FaFacebook /></motion.a>
                <motion.a href="#" style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}><FaTwitter /></motion.a>
                <motion.a href="#" style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}><FaInstagram /></motion.a>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} PrimeRentals. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
