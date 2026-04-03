import { useState } from "react";

const allProducts = [
  { id: 1,  emoji: "🦴", name: "Premium Dog Kibble",        cat: "Food",        price: 899, stars: "★★★★★", rating: 5.0 },
  { id: 2,  emoji: "🐟", name: "Tuna & Shrimp Cat Treats",  cat: "Food",        price: 349,  stars: "★★★★☆", rating: 4.2 },
  { id: 3,  emoji: "🌿", name: "Organic Hamster Mix",       cat: "Food",        price: 499,  stars: "★★★★★", rating: 4.8 },
  { id: 4,  emoji: "🐾", name: "Paw-Print Collar",          cat: "Accessories", price: 599, stars: "★★★★★", rating: 4.9 },
  { id: 5,  emoji: "🎾", name: "Interactive Fetch Ball",    cat: "Toys",        price: 399,  stars: "★★★★★", rating: 4.7 },
  { id: 6,  emoji: "🏡", name: "Orthopedic Pet Bed",        cat: "Accessories", price: 1599, stars: "★★★★☆", rating: 4.5 },
  { id: 7,  emoji: "💊", name: "Daily Multivitamin Chews",  cat: "Medicine",    price: 1099, stars: "★★★★☆", rating: 4.3 },
  { id: 8,  emoji: "🦮", name: "Retractable Dog Leash",     cat: "Accessories", price: 749, stars: "★★★★★", rating: 4.8 },
  { id: 9,  emoji: "🧸", name: "Catnip Plush Mouse",        cat: "Toys",        price: 299,  stars: "★★★★☆", rating: 4.1 },
  { id: 10, emoji: "💉", name: "Flea & Tick Drops",         cat: "Medicine",    price: 1399, stars: "★★★★★", rating: 4.9 },
  { id: 11, emoji: "🐠", name: "Tropical Fish Flakes",      cat: "Food",        price: 199,  stars: "★★★★☆", rating: 4.0 },
  { id: 12, emoji: "🛁", name: "Gentle Pet Shampoo",        cat: "Accessories", price: 549, stars: "★★★★★", rating: 4.7 },
];

const categories = ["All", "Food", "Toys", "Accessories", "Medicine"];

export default function Products() {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const visible = allProducts.filter((p) => {
    const matchCat = active === "All" || p.cat === active;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
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
