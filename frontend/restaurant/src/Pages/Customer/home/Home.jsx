import React, { useEffect, useRef, useState } from 'react';

import Typed from 'typed.js';
import './home.css';
import '../../../App.css';
import AllRestaurants from '../AllRestaurants/AllRestaurants';
import About from '../../../components/About/About';
import Features from '../../../components/Features/Features';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const typedRef = useRef(null);
  const allResRef = useRef(null);  // Ref للقسم الذي تريد التمرير إليه
  const aboutRef = useRef(null);  // Ref للقسم الذي تريد التمرير إليه
  const goPage = useRef(null);  // Ref للقسم الذي تريد التمرير إليه
  const [showRestaurants, setShowRestaurants] = useState(false);
  const navigate = useNavigate();

  const goToRestaurantsPage = () => {
    navigate('/customer/allRestaurants');
  };


  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        `<span class="typed-output">Discover</span>`,
        `<span class="typed-output">Reserve</span>`,
        `<span class="typed-output">Order</span>`,
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1000,
      loop: true,
    });

    return () => {
      typed.destroy(); // تنظيف بعد انتهاء المكون
    };
  }, []);

  const scrollToSection = () => {
    if (goPage.current) {
      goPage.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <>
      <section className="bg position-relative d-flex justify-content-center align-items-center text-center text-light">
        <div className="layer position-absolute h-100 start-0 end-0"></div>
        <div className="welcome z-1" data-aos="fade-down">
          <h1 className="fs-4r"><span>Welcome</span> to your gateway to effortless dining</h1>
          <span ref={typedRef} className="typed-output fs-3 shadow-sm "></span>
          <br />
          {/* استخدام دالة scrollToSection عند النقر على الزر */}
          <button className="home-btn mt-4" onClick={scrollToSection}> Start now</button>
        </div>
      </section>

      {/* التأكد من وجود Ref للقسم الذي تريد التمرير إليه */}
      <div className="container">
        <div  id='about'>
          <About></About>

        </div>
        <di id='features'>
          <Features></Features>
        </di>
        <div  className="text-center mt-5" ref={goPage} id="goPage" >
          <button className="home-btn" onClick={goToRestaurantsPage}>
            Explore Restaurants
          </button>
        </div>

      </div>
    </>
  );
}
