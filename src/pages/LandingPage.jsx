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
    <div style={{ padding: '0 1rem', overflowX: 'hidden' }}>

      {/* 1. Hero Section */}
      <motion.section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBg})` }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content" style={{ zIndex: 2, position: 'relative' }}>
          <motion.h1 variants={fadeIn} className="hero-title">
            Rent Your Dream Car Anytime, Anywhere
          </motion.h1>
          <motion.p variants={fadeIn} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Experience the ultimate convenience and affordability with our premium fleet of vehicles. Whether for a weekend getaway or a business trip, we have the perfect ride for you.
          </motion.p>
          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(79, 70, 229, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindRideClick}
              className="btn btn-primary"
              style={{ padding: '1rem 3.5rem', fontSize: '1.2rem', borderRadius: '50px' }}
            >
              <FaCar style={{ marginRight: '8px' }} /> Find Your Ride
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. Featured Cars */}
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
              whileHover={{ y: -10, boxShadow: "0px 20px 40px rgba(0,0,0,0.5)" }}
              className="glass-panel image-zoom-container"
              style={{ padding: 0, display: 'flex', flexDirection: 'column' }}
            >
              <div
                className="image-zoom"
                style={{ height: '220px', width: '100%', backgroundImage: `url(${car.image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}
              ></div>
              <div style={{ padding: '1.8rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.4rem' }}>{car.make} {car.model}</h3>
                <p className="text-muted" style={{ marginBottom: '1.2rem', flex: 1 }}>Year: {car.year}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.4rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{car.price} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/day</span></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Why Choose Us */}
      <motion.section
        className="section-spacing"
        style={{ background: 'rgba(255,255,255,0.02)', margin: '0 -2rem', padding: '5rem 2rem', borderRadius: 'var(--radius-lg)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeIn} className="section-title">Why <span>Choose Us</span>?</motion.h2>
        <div className="grid-4" style={{ textAlign: 'center' }}>
          {[
            { icon: <FaCalendarCheck />, title: 'Easy Booking', desc: 'Seamless online booking experience, fast and secure.', color: 'rgba(79, 70, 229, 0.2)', iconColor: 'var(--primary)' },
            { icon: <FaTag />, title: 'Affordable Pricing', desc: 'No hidden fees. Best market rates for premium vehicles.', color: 'rgba(20, 184, 166, 0.2)', iconColor: 'var(--secondary)' },
            { icon: <FaHeadset />, title: '24/7 Support', desc: 'Our dedicated team is ready to assist you anytime, anywhere.', color: 'rgba(239, 68, 68, 0.2)', iconColor: 'var(--danger)' },
            { icon: <FaTools />, title: 'Well-Maintained', desc: 'Every car undergoes strict quality assurance before rental.', color: 'rgba(245, 158, 11, 0.2)', iconColor: 'var(--warning)' }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={slideLeft}
              whileHover={{ scale: 1.05 }}
              className="glass-panel"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderColor: item.color }}
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="icon-box"
                style={{ background: item.color, color: item.iconColor }}
              >
                {item.icon}
              </motion.div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>{item.title}</h4>
              <p className="text-muted" style={{ fontSize: '0.95rem' }}>{item.desc}</p>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {[
            { num: 1, title: 'Search', desc: 'Find your perfect car' },
            { num: 2, title: 'Select', desc: 'Choose your dates & routing' },
            { num: 3, title: 'Book', desc: 'Secure your checkout' },
            { num: 4, title: 'Drive', desc: 'Enjoy the pristine ride!' }
          ].map((step, index) => (
            <motion.div
              key={index}
              variants={scaleUp}
              whileHover={{ y: -5 }}
              className="glass-panel step-card"
              style={{ flex: '1 1 200px' }}
            >
              <div className="step-number">{step.num}</div>
              <h4 style={{ fontSize: '1.2rem' }}>{step.title}</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 5. Testimonials */}
      <motion.section
        className="section-spacing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeIn} className="section-title">Customer <span>Reviews</span></motion.h2>
        <div className="grid-3">
          {[
            { name: 'Sarah Jenkins', role: 'Business Traveler', txt: 'The service is absolutely premium. The car was spotless and the checkout was instantaneous.', rating: 5 },
            { name: 'Michael Chen', role: 'Road Tripper', txt: 'Rented an SUV for a week. Customer service answered my call at 2 AM. Top notch operation!', rating: 5 },
            { name: 'David Reynolds', role: 'Daily Commuter', txt: 'Very transparent pricing and excellent condition of the vehicles. Definitely my go-to rental agency now.', rating: 4 }
          ].map((r, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ scale: 1.03 }}
              className="glass-panel"
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ color: 'var(--warning)', marginBottom: '1.2rem', fontSize: '1.2rem' }}>
                {[...Array(r.rating)].map((_, idx) => <FaStar key={idx} />)}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.8', flex: 1 }}>"{r.txt}"</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{r.name}</strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{r.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 6. Footer */}
      <footer className="footer-section">
        <div className="grid-4" style={{ marginBottom: '3rem' }}>
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>PrimeRentals</h3>
            <p className="text-muted" style={{ fontSize: '0.95rem' }}>Redefining exactly what it means to drive in style, anywhere, anytime.</p>
          </div>
          {/* <div>
            <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/" className="text-muted" style={{ transition: 'color 0.3s' }}>Home</Link></li>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/register" className="text-muted" style={{ transition: 'color 0.3s' }}>Register</Link></li>
              <li style={{ marginBottom: '0.5rem' }}><Link to="/login" className="text-muted" style={{ transition: 'color 0.3s' }}>Login</Link></li>
            </ul>
          </div> */}
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Contact Info</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <li style={{ marginBottom: '0.8rem' }}>📍 Sector V, Salt Lake City, Kolkata</li>
              <li style={{ marginBottom: '0.8rem' }}>📞 +1 (800) 123-4567</li>
              <li style={{ marginBottom: '0.8rem' }}>✉️ primerentals00@gmail.com</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }}><FaFacebook /></motion.a>
              <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }}><FaTwitter /></motion.a>
              <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }}><FaInstagram /></motion.a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} PrimeRentals. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
