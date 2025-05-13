import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import './home.css';
import '../../../App.css';
import AllRestaurants from '../AllRestaurants/AllRestaurants';
import About from '../../../components/About/About';
import Features from '../../../components/Features/Features';

export default function Home() {
  const typedRef = useRef(null);
  const allResRef = useRef(null);  // Ref للقسم الذي تريد التمرير إليه
  const aboutRef = useRef(null);  // Ref للقسم الذي تريد التمرير إليه

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ["Discover", "Reserve", "Order"],
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
    if (allResRef.current) {
      allResRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start', 
      });
    }
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({
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
          <h1 className="fs-4r">Welcome to your gateway to effortless dining</h1>
          <span ref={typedRef} className="fs-3 shadow-sm fw-light"></span>
          <br />
          {/* استخدام دالة scrollToSection عند النقر على الزر */}
          <button className="home-btn mt-4" onClick={scrollToSection}> Start now</button>
        </div>
      </section>

      {/* التأكد من وجود Ref للقسم الذي تريد التمرير إليه */}
      <div className="container">
        <div >
      <About></About>

        </div>
        <div>
          <Features></Features>
        </div>
      <div ref={allResRef} id="allRes">
        <AllRestaurants />
      </div>
      </div>
    </>
  );
}
