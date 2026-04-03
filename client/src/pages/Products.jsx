import { useState } from "react";

const allProducts = [
  { id: 1,  emoji: "🦴", name: "Premium Dog Kibble",        cat: "Food",        pet: "Dog",    price: 899,  stars: "★★★★★", rating: 5.0 },
  { id: 2,  emoji: "🐟", name: "Tuna & Shrimp Cat Treats",  cat: "Food",        pet: "Cat",    price: 349,  stars: "★★★★☆", rating: 4.2 },
  { id: 3,  emoji: "🌿", name: "Organic Hamster Mix",       cat: "Food",        pet: "Others", price: 499,  stars: "★★★★★", rating: 4.8 },
  { id: 4,  emoji: "🐾", name: "Paw-Print Collar",          cat: "Accessories", pet: "Dog",    price: 599,  stars: "★★★★★", rating: 4.9 },
  { id: 5,  emoji: "🎾", name: "Interactive Fetch Ball",    cat: "Toys",        pet: "Dog",    price: 399,  stars: "★★★★★", rating: 4.7 },
  { id: 6,  emoji: "🏡", name: "Orthopedic Pet Bed",        cat: "Accessories", pet: "Dog",    price: 1599, stars: "★★★★☆", rating: 4.5 },
  { id: 7,  emoji: "💊", name: "Daily Multivitamin Chews",  cat: "Medicine",    pet: "Others", price: 1099, stars: "★★★★☆", rating: 4.3 },
  { id: 8,  emoji: "🦮", name: "Retractable Dog Leash",     cat: "Accessories", pet: "Dog",    price: 749,  stars: "★★★★★", rating: 4.8 },
  { id: 9,  emoji: "🧸", name: "Catnip Plush Mouse",        cat: "Toys",        pet: "Cat",    price: 299,  stars: "★★★★☆", rating: 4.1 },
  { id: 10, emoji: "💉", name: "Flea & Tick Drops",         cat: "Medicine",    pet: "Dog",    price: 1399, stars: "★★★★★", rating: 4.9 },
  { id: 11, emoji: "🐠", name: "Tropical Fish Flakes",      cat: "Food",        pet: "Fish",   price: 199,  stars: "★★★★☆", rating: 4.0 },
  { id: 12, emoji: "🛁", name: "Gentle Pet Shampoo",        cat: "Accessories", pet: "Cat",    price: 549,  stars: "★★★★★", rating: 4.7 },
  { id: 13, emoji: "🐦", name: "Bird Seed Mix",             cat: "Food",        pet: "Bird",   price: 249,  stars: "★★★★☆", rating: 4.2 },
  { id: 14, emoji: "🪹", name: "Bird Perch & Swing Set",   cat: "Accessories", pet: "Bird",   price: 699,  stars: "★★★★★", rating: 4.6 },
  { id: 15, emoji: "🐡", name: "Aquarium Gravel & Decor",  cat: "Accessories", pet: "Fish",   price: 449,  stars: "★★★★☆", rating: 4.3 },
];

const categories = ["All", "Food", "Toys", "Accessories", "Medicine"];

const petTypes = [
  { label: "All Pets", icon: "🐾" },
  { label: "Dog",      icon: "🐕" },
  { label: "Cat",      icon: "🐈" },
  { label: "Bird",     icon: "🐦" },
  { label: "Fish",     icon: "🐟" },
  { label: "Others",   icon: "🐾" },
];

export default function Products() {
  const [active, setActive] = useState("All");
  const [activePet, setActivePet] = useState("All Pets");
  const [search, setSearch] = useState("");

  const visible = allProducts.filter((p) => {
    const matchCat = active === "All" || p.cat === active;
    const matchPet = activePet === "All Pets" || p.pet === activePet;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchPet && matchSearch;
  });

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>🛒 Pet Products</h1>
          <p>Premium supplies for every kind of pet — food, toys, accessories, and more.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Pet Type Filter */}
          <div className="pet-type-bar">
            {petTypes.map((pt) => (
              <button
                key={pt.label}
                className={`pet-type-btn${activePet === pt.label ? " active" : ""}`}
                onClick={() => setActivePet(pt.label)}
              >
                <span className="pet-type-icon">{pt.icon}</span>
                <span>{pt.label}</span>
              </button>
            ))}
          </div>

          <div className="filters">
            <span className="filter-label">Category:</span>
            <div className="filter-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`filter-tab${active === c ? " active" : ""}`}
                  onClick={() => setActive(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              className="search-input"
              type="search"
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {visible.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0", fontSize: "1.1rem" }}>
              No products found for "{search}".
            </p>
          ) : (
            <div className="products-grid">
              {visible.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-img">{p.emoji}</div>
                  <div className="product-body">
                    <span className="product-cat">{p.cat}</span>
                    <p className="product-name">{p.name}</p>
                    <p className="product-star">
                      {p.stars} ({p.rating})
                    </p>
                    <p className="product-price">₹{p.price.toLocaleString('en-IN')}</p>
                    <div className="product-actions">
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
