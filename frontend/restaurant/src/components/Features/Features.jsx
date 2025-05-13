import React from 'react';

export default function Features() {
  return (
    <section
      className="features-section py-5"
      style={{
        background: 'linear-gradient(135deg, rgba(109, 100, 255, 0.1), rgba(143, 140, 254, 0.1))',
        borderRadius: '20px',
      }}
    >
      <div className="container">
        <h2
          className="section-title text-center mb-5"
          style={{ color: '#6c63ff', fontWeight: '700', fontSize: '2.5rem' }}
        >
          What You Can Do
        </h2>
        <div className="row text-center">
          {/* Discover Restaurants */}
          <div className="col-12 col-md-4 mb-4 d-flex">
            <div className="feature-card p-4 border shadow-lg rounded-3 bg-white w-100 d-flex flex-column"
            data-aos="fade-right">
              <img
                src="/images/reading-recipe.jpg"
                alt="Discover"
                className="mb-3 w-100 rounded"
              />
              <h3 className="mb-3" style={{ color: '#6c63ff' }}>
                🔍 Discover Restaurants & Menus
              </h3>
              <p style={{ color: '#2c2c54', flexGrow: 1 }}>
                Browse through a wide variety of restaurants, explore their menu items, and check out prices all in one place!
              </p>
            </div>
          </div>

          {/* Reserve a Table */}
          <div className="col-12 col-md-4 mb-4 d-flex">
            <div className="feature-card p-4 border shadow-lg rounded-3 bg-white w-100 d-flex flex-column"
            data-aos="fade-down">
              <img
                src="/images/happy-waiter-serving-food-group-cheerful-friends-pub.jpg"
                alt="Reserve"
                className="mb-3 w-100 rounded"
              />
              <h3 className="mb-3" style={{ color: '#6c63ff' }}>
                📅 Reserve a Table
              </h3>
              <p style={{ color: '#2c2c54', flexGrow: 1 }}>
                Easily book a table at your favorite restaurant for a hassle-free dining experience!
              </p>
            </div>
          </div>

          {/* Order and Pay Online */}
          <div className="col-12 col-md-4 mb-4 d-flex">
            <div className="feature-card p-4 border shadow-lg rounded-3 bg-white w-100 d-flex flex-column"
            data-aos="fade-left">
              <img
                src="/images/close-up-hands-holding-smartphone.jpg"
                alt="Order"
                className="mb-3 w-100 rounded"
              />
              <h3 className="mb-3" style={{ color: '#6c63ff' }}>
                🍽️ Order & Pay Online
              </h3>
              <p style={{ color: '#2c2c54', flexGrow: 1 }}>
                Place your order from the menu, pay securely online, and enjoy your meal without any delays!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
