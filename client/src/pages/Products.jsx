import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";


const API_BASE = import.meta.env.VITE_API_URL || "";
const WISHLIST_KEY = "petapp_wishlist";
const CART_KEY = "petapp_cart";

export default function Products({ isLoggedIn, authToken }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [active, setActive] = useState("All");
    const [activeBrand, setActiveBrand] = useState("All");
    const [activeSize, setActiveSize] = useState("All");
    const [activePet, setActivePet] = useState("All Pets");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [orderingId, setOrderingId] = useState(null);
    const [wishlistMap, setWishlistMap] = useState({});

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const nextMap = {};

      parsed.forEach((item) => {
        if (item?.id != null) {
          nextMap[String(item.id)] = true;
        }
      });

      setWishlistMap(nextMap);
    } catch (_err) {
      setWishlistMap({});
    }
  }, []);

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

  const visible = products
    .filter((p) => {
      const matchCat = active === "All" || p.category === active || p.cat === active;
      const matchBrand = activeBrand === "All" || p.brand === activeBrand;
      const matchSize = activeSize === "All" || p.size === activeSize;
      const matchPet = activePet === "All Pets" || p.pet === activePet;
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchBrand && matchSize && matchPet && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "low-to-high") return (a.price || 0) - (b.price || 0);
      if (sortBy === "high-to-low") return (b.price || 0) - (a.price || 0);
      if (sortBy === "newest") return (b._id || b.id || 0) - (a._id || a.id || 0);
      return 0;
    });

  const activeFilterCount = [active, activeBrand, activeSize].filter((value) => value !== "All").length;

  const clearFilters = () => {
    setActive("All");
    setActiveBrand("All");
    setActiveSize("All");
  };

  const saveOrder = async (product) => {
    if (!isLoggedIn || !authToken) {
      window.alert("Please log in before ordering a product.");
      navigate("/login");
      return;
    }

    const productId = String(product.id ?? product._id ?? product.name);
    setOrderingId(productId);

    try {
      const raw = localStorage.getItem(CART_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const existingIndex = current.findIndex((item) => String(item.id) === productId);

      let next = [];

      if (existingIndex >= 0) {
        next = current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Number(item.quantity || 1) + 1 }
            : item
        );
      } else {
        next = [
          ...current,
          {
            id: productId,
            name: product.name,
            category: product.category || product.cat,
            cat: product.cat,
            price: Number(product.price || 0),
            emoji: product.emoji,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem(CART_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("petapp:storage-updated"));
      window.alert(`${product.name} added to your cart.`);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setOrderingId(null);
    }
  };

  const toggleWishlist = (product) => {
    const productId = String(product.id ?? product._id ?? product.name);

    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const exists = current.some((item) => String(item.id) === productId);

      let next = [];

      if (exists) {
        next = current.filter((item) => String(item.id) !== productId);
      } else {
        next = [
          ...current,
          {
            id: productId,
            name: product.name,
            category: product.category || product.cat,
            cat: product.cat,
            price: product.price,
            emoji: product.emoji,
          },
        ];
      }

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      setWishlistMap((prev) => ({ ...prev, [productId]: !exists }));
    } catch (_err) {
      window.alert("Could not update wishlist. Please try again.");
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

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
              {visible.map((p, idx) => (
                <div key={p._id || p.id || idx} className="product-card">
                  <div className="product-img">{p.emoji}</div>
                  <div className="product-body">
                    <span className="product-cat">{p.cat}</span>
                    <p className="product-name">{p.name}</p>
                    <p className="product-star">
                      {p.stars} ({p.rating})
                    </p>
                    <p className="product-price">₹{Number(p.price ?? 0).toLocaleString("en-IN")}</p>
                    <div className="product-meta">
                      <span>{p.brand}</span>
                      <span>{p.size}</span>
                    </div>
                    <div className="product-actions">
                      {(() => {
                        const productId = String(p.id ?? p._id ?? p.name);
                        const isOrdering = orderingId === productId;
                        const isWishlisted = Boolean(wishlistMap[productId]);

                        return (
                          <>
                            <button
                              type="button"
                              className={`nav-icon-link product-icon-btn${isWishlisted ? " active" : ""}`}
                              onClick={() => toggleWishlist(p)}
                              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                              aria-label={isWishlisted ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                            >
                              <FaHeart />
                            </button>
                            <button
                              type="button"
                              className="nav-icon-link product-icon-btn"
                              disabled={isOrdering}
                              onClick={() => saveOrder(p)}
                              title={isOrdering ? "Adding to cart..." : "Add to Cart"}
                              aria-label={isOrdering ? `Adding ${p.name} to cart` : `Add ${p.name} to cart`}
                            >
                              <FaShoppingCart />
                            </button>
                          </>
                        );
                      })()}
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
