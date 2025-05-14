import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../../App.css';
import './About.css'
export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="container my-5 py-5" data-aos="fade-up">
      <div className="about row align-items-center rounded-4 shadow-lg p-4 g-5 " >
        <div className="col-md-4 mb-4 mb-md-0 " data-aos="zoom-in">
          <img
            src="/images/high-angle-hand-holding-smartphone.jpg"
            className="w-100 rounded-4 shadow-sm"
            alt="Restaurant"
          />
        </div>
        <div className="col-md-6 text-md-start text-center  px-5 " data-aos="fade-left">
          <h2 className="mb-4 text-gradient section-title">About us</h2>
 <p>
                        At <strong>Cravy </strong>, we understand the joy of discovering the perfect dining experience. Our platform brings you closer to the best restaurants in town, allowing you to effortlessly explore their menu, check prices, and make your next meal unforgettable. Whether you're craving a hearty dish or a quick snack, our system ensures you have access to the freshest options available.
                    </p>
                    <p>We’ve streamlined the process for you. With just a few taps, you can browse restaurant menus, place orders directly, and even pay seamlessly using Visa. Want to dine in? We’ve got you covered—reserve a table anytime, and enjoy your meal without the wait.</p>
                    <p>From discovering new tastes to securing a spot at your favorite restaurant, we make dining easy and enjoyable. No matter the time or place, a delicious experience is always just a few clicks away.</p>
        </div>
      </div>
    </div>
  );
}
