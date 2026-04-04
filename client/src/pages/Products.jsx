import { useState } from "react";

const allProducts = [
  { id: 1, emoji: "🦴", name: "Premium Dog Kibble", cat: "Food", brand: "Pedigree", size: "Large", pet: "Dog", price: 899, stars: "★★★★★", rating: 5.0 },
  { id: 2, emoji: "🐟", name: "Tuna & Shrimp Cat Treats", cat: "Food", brand: "Whiskas", size: "Medium", pet: "Cat", price: 349, stars: "★★★★☆", rating: 4.2 },
  { id: 3, emoji: "🌿", name: "Organic Hamster Mix", cat: "Food", brand: "PetFresh", size: "Small", pet: "Others", price: 499, stars: "★★★★★", rating: 4.8 },
  { id: 4, emoji: "🐾", name: "Paw-Print Collar", cat: "Accessories", brand: "PawSafe", size: "Medium", pet: "Dog", price: 599, stars: "★★★★★", rating: 4.9 },
  { id: 5, emoji: "🎾", name: "Interactive Fetch Ball", cat: "Toys", brand: "PetZone", size: "Medium", pet: "Dog", price: 399, stars: "★★★★★", rating: 4.7 },
  { id: 6, emoji: "🏡", name: "Orthopedic Pet Bed", cat: "Accessories", brand: "PawSafe", size: "Large", pet: "Dog", price: 1599, stars: "★★★★☆", rating: 4.5 },
  { id: 7, emoji: "💊", name: "Daily Multivitamin Chews", cat: "Medicine", brand: "VetPlus", size: "Small", pet: "Others", price: 1099, stars: "★★★★☆", rating: 4.3 },
  { id: 8, emoji: "🦮", name: "Retractable Dog Leash", cat: "Accessories", brand: "PawSafe", size: "Large", pet: "Dog", price: 749, stars: "★★★★★", rating: 4.8 },
  { id: 9, emoji: "🧸", name: "Catnip Plush Mouse", cat: "Toys", brand: "PetZone", size: "Small", pet: "Cat", price: 299, stars: "★★★★☆", rating: 4.1 },
  { id: 10, emoji: "💉", name: "Flea & Tick Drops", cat: "Medicine", brand: "VetPlus", size: "Medium", pet: "Dog", price: 1399, stars: "★★★★★", rating: 4.9 },
  { id: 11, emoji: "🐠", name: "Tropical Fish Flakes", cat: "Food", brand: "PetFresh", size: "Small", pet: "Fish", price: 199, stars: "★★★★☆", rating: 4.0 },
  { id: 12, emoji: "🛁", name: "Gentle Pet Shampoo", cat: "Accessories", brand: "PetFresh", size: "Medium", pet: "Cat", price: 549, stars: "★★★★★", rating: 4.7 },
  { id: 13, emoji: "🐦", name: "Bird Seed Mix", cat: "Food", brand: "PetFresh", size: "Small", pet: "Bird", price: 249, stars: "★★★★☆", rating: 4.2 },
  { id: 14, emoji: "🪹", name: "Bird Perch & Swing Set", cat: "Accessories", brand: "PetZone", size: "Medium", pet: "Bird", price: 699, stars: "★★★★★", rating: 4.6 },
  { id: 15, emoji: "🐡", name: "Aquarium Gravel & Decor", cat: "Accessories", brand: "PawSafe", size: "Large", pet: "Fish", price: 449, stars: "★★★★☆", rating: 4.3 },
];

const categories = ["All", "Food", "Toys", "Accessories", "Medicine"];
const brands = ["All", "Pedigree", "Whiskas", "PetFresh", "PawSafe", "PetZone", "VetPlus"];
const sizes = ["All", "Small", "Medium", "Large"];

const petTypes = [
  { label: "All Pets", icon: "🐾" },
  { label: "Dog", icon: "🐕" },
  { label: "Cat", icon: "🐈" },
  { label: "Bird", icon: "🐦" },
  { label: "Fish", icon: "🐟" },
  { label: "Others", icon: "🐾" },
];

export default function Products() {
  const [active, setActive] = useState("All");
  const [activeBrand, setActiveBrand] = useState("All");
  const [activeSize, setActiveSize] = useState("All");
  const [activePet, setActivePet] = useState("All Pets");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const visible = allProducts
    .filter((p) => {
      const matchCat = active === "All" || p.cat === active;
      const matchBrand = activeBrand === "All" || p.brand === activeBrand;
      const matchSize = activeSize === "All" || p.size === activeSize;
      const matchPet = activePet === "All Pets" || p.pet === activePet;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchBrand && matchSize && matchPet && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "low-to-high") return a.price - b.price;
      if (sortBy === "high-to-low") return b.price - a.price;
      if (sortBy === "newest") return b.id - a.id;
      return 0;
    });

  const activeFilterCount = [active, activeBrand, activeSize].filter((value) => value !== "All").length;

  const clearFilters = () => {
    setActive("All");
    setActiveBrand("All");
    setActiveSize("All");
  };

  const saveOrder = (product) => {
    const storedOrders = localStorage.getItem("petapp_orders");
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    const storedUser = localStorage.getItem("petapp_user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const nextOrder = {
      id: `order-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      category: product.cat,
      brand: product.brand,
      size: product.size,
      price: product.price,
      emoji: product.emoji,
      customerName: user?.name || "Guest User",
      orderedAt: new Date().toISOString(),
      status: "Order placed",
    };

    localStorage.setItem("petapp_orders", JSON.stringify([nextOrder, ...orders]));
    window.alert(`${product.name} added to your orders.`);
  };

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>🛒 Pet Products</h1>
          <p>Premium supplies for every kind of pet - food, toys, accessories, and more.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
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
            <button className="filter-trigger" type="button" onClick={() => setFilterOpen(true)}>
              Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Sort</option>
              <option value="newest">Newest</option>
              <option value="low-to-high">Low to High</option>
              <option value="high-to-low">High to Low</option>
            </select>
            <input
              className="search-input"
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filterOpen && (
            <div className="filter-popup-backdrop" onClick={() => setFilterOpen(false)}>
              <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
                <div className="filter-popup-head">
                  <h3>Filter Products</h3>
                  <button type="button" className="filter-close" onClick={() => setFilterOpen(false)}>
                    X
                  </button>
                </div>

                <div className="filter-popup-group">
                  <p>Categories</p>
                  <div className="filter-chip-wrap">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`filter-tab${active === item ? " active" : ""}`}
                        onClick={() => setActive(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-popup-group">
                  <p>Brand</p>
                  <div className="filter-chip-wrap">
                    {brands.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`filter-tab${activeBrand === item ? " active" : ""}`}
                        onClick={() => setActiveBrand(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-popup-group">
                  <p>Size</p>
                  <div className="filter-chip-wrap">
                    {sizes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`filter-tab${activeSize === item ? " active" : ""}`}
                        onClick={() => setActiveSize(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-popup-actions">
                  <button type="button" className="btn" onClick={clearFilters}>
                    Clear All
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setFilterOpen(false)}>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    <p className="product-price">₹{p.price.toLocaleString("en-IN")}</p>
                    <div className="product-meta">
                      <span>{p.brand}</span>
                      <span>{p.size}</span>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => saveOrder(p)}
                      >
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
