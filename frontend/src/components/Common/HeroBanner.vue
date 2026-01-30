<script setup>
</script>

<template>
  <div class="hero-banner">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="animate-fade-in-up">Lapar? Pesen Makan Yuk!</h1>
        <p class="animate-fade-in-up delay-1">
          Pesan makanan favoritmu dari restoran terbaik di sekitarmu.
          Cepat, mudah, dan banyak promo menarik setiap hari.
        </p>
        
        <div class="location-search animate-fade-in-up delay-2">
          <div class="input-group">
            <span class="icon">🕒</span>
            <select class="status-select">
              <option value="all">Semua Restoran</option>
              <option value="open">Hanya Yang Buka</option>
            </select>
            <button class="btn-explore">Cek Restoran</button>
          </div>
        </div>
      </div>
      
      <div class="hero-image animate-float">
        <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Delicious Food Illustration" style="border-radius: 20px;" />
      </div>
    </div>
    
    <div class="wave-shape">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="#ffffff" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #F53D2D 0%, #FF6633 100%);
  color: white;
  position: relative;
  overflow: hidden;
  padding: 100px 20px 60px; /* Top padding for header */
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  position: relative;
}

.hero-text {
  flex: 1;
  max-width: 600px;
}

h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
}

p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
}

.location-search {
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  max-width: 500px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group .icon {
  font-size: 1.5rem;
  margin-left: 10px;
}

.input-group select {
  border: none;
  flex: 1;
  padding: 12px;
  font-size: 1rem;
  outline: none;
  background: white;
  color: #333;
  cursor: pointer;
}

.btn-explore {
  background: #F53D2D;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-explore:hover {
  background: #d7321f;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 61, 45, 0.3);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.2));
}

.wave-shape {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  line-height: 0;
  z-index: 1;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-banner {
    padding: 80px 20px 40px;
    text-align: center;
  }

  .hero-content {
    flex-direction: column-reverse;
  }

  .hero-text {
    margin-top: 30px;
  }

  h1 {
    font-size: 2.5rem;
  }
  
  .location-search {
    margin: 0 auto;
  }
  
  .hero-image img {
    max-height: 250px;
  }
}
</style>
