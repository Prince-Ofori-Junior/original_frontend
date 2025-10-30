import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // ✅ fixed modules path
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../ProductDetailsPage.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const PREMIUM_THRESHOLD = 1000;

const ProductDetailsPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Fetch product & related products
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const text = await res.text();
        if (text.startsWith("<!DOCTYPE")) throw new Error("Invalid JSON response");
        const data = JSON.parse(text);

        if (!data.success || !data.data) {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        setProduct(data.data);

        // Related products
        let related = (data.data.related || []).filter((p) => String(p.id) !== String(id));

        if (!related.length && data.data.category_id) {
          const relatedRes = await fetch(
            `${API_BASE}/api/products?category=${data.data.category_id}&exclude=${id}`
          );
          const relatedData = await relatedRes.json();
          related = relatedData.data || [];
        }

        setRelatedProducts(related);

        // Wishlist
        const token = localStorage.getItem("token");
        if (token) {
          const wlRes = await fetch(`${API_BASE}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const wlData = await wlRes.json();
          setWishlist(
            wlData?.wishlist?.some((item) => String(item.product_id) === String(data.data.id))
          );
        }

        localStorage.setItem(`product_${id}`, JSON.stringify(data.data));
        localStorage.setItem(`related_${id}`, JSON.stringify(related));
      } catch (err) {
        console.error("Product fetch error:", err);
        const cachedProduct = localStorage.getItem(`product_${id}`);
        const cachedRelated = localStorage.getItem(`related_${id}`);
        if (cachedProduct) setProduct(JSON.parse(cachedProduct));
        if (cachedRelated) setRelatedProducts(JSON.parse(cachedRelated));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

 const handleAddToCart = () => {
  if (!product) return;
  if (addToCart && typeof addToCart === "function") {
    addToCart(product);
  } else {
    // ✅ fallback: persist to localStorage if no addToCart prop is provided
    const currentCart = JSON.parse(localStorage.getItem("savedCart")) || [];
    const existingIndex = currentCart.findIndex((item) => item.id === product.id);
    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity =
        (currentCart[existingIndex].quantity || 1) + 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("savedCart", JSON.stringify(currentCart));
  }
  showToast(`${product.name} added to cart 🛍️`);
};


  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (wishlist) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });
        setWishlist(false);
        showToast("Removed from wishlist 💔");
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });
        setWishlist(true);
        showToast("Added to wishlist ❤️");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      showToast("Failed to update wishlist ❌");
    }
  };

  if (loading) return <p className="loading-text">Loading premium product...</p>;
  if (!product) return <p className="error-text">Product not found.</p>;

  const colors = ["#000000", "#C0392B", "#2980B9", "#27AE60"];
  const sizes = ["S", "M", "L", "XL"];
  const isPremium = product.price >= PREMIUM_THRESHOLD;

  return (
    <>
      {toast && <div className="toast premium-toast">{toast}</div>}

      <motion.div
        className="premium-product-page container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* PRODUCT GRID */}
        <div className="premium-product-grid">
          <motion.div className="premium-product-image" whileHover={{ scale: 1.02 }}>
            <img
              src={product.image_url || "/placeholder.png"}
              srcSet={`${product.image_url} 1x, ${product.image_url_2x || product.image_url} 2x`}
              alt={product.name}
              loading="lazy"
              onError={(e) => (e.target.src = "/placeholder.png")}
            />
            {isPremium && <span className="badge-premium">✨ Premium</span>}
            <button className={`wishlist-btn ${wishlist ? "active" : ""}`} onClick={toggleWishlist}>
              {wishlist ? "♥" : "♡"}
            </button>
          </motion.div>

          <div className="premium-product-info">
            <h1 className="product-title">{product.name}</h1>
            {product.category_name && <p className="product-category">{product.category_name}</p>}

            <div className="price-section">
              {product.discountPrice ? (
                <>
                  <span className="discount-price">GHS {Number(product.discountPrice).toFixed(2)}</span>
                  <span className="original-price">GHS {Number(product.price).toFixed(2)}</span>
                </>
              ) : (
                <span className="price">GHS {Number(product.price).toFixed(2)}</span>
              )}
            </div>

            <p className="product-short-description">{product.description || "No description."}</p>

            <div className="selector color-selector">
              <p>Colors:</p>
              <div className="dots">
                {colors.map((c) => (
                  <span
                    key={c}
                    className={`color-dot ${selectedColor === c ? "selected" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="selector size-selector">
              <p>Sizes:</p>
              <div className="sizes">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? "selected" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="premium-tabs">
          <div className="tab-buttons">
            <button className={activeTab === "details" ? "active" : ""} onClick={() => setActiveTab("details")}>
              Details
            </button>
            <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>
              Reviews
            </button>
          </div>

          {activeTab === "details" ? (
            <div className="tab-content">{product.long_description || "More details coming soon."}</div>
          ) : (
            <div className="tab-content reviews-section">
              <p>⭐ 4.9/5 based on 152 reviews</p>
              <div className="review-card">
                <h4>Jane Doe</h4>
                <p>“Premium quality! Fits perfectly.”</p>
              </div>
              <div className="review-card">
                <h4>Mark Smith</h4>
                <p>“Worth every penny. Exceptional fabric.”</p>
              </div>
            </div>
          )}
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section premium-golden">
            <h2>✨ You Might Also Like</h2>

            {relatedProducts.length === 1 ? (
              <div className="single-related-product">
                <RelatedProductCard item={relatedProducts[0]} />
              </div>
            ) : (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop={true}
                breakpoints={{
                  480: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
              >
                {relatedProducts.map((item) => (
                  <SwiperSlide key={item.id}>
                    <RelatedProductCard item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
};

// Related Product Card
const RelatedProductCard = ({ item }) => {
  const isPremium = item.price >= PREMIUM_THRESHOLD;

  return (
    <motion.div
      className="related-product-slide"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <Link to={`/product/${item.id}`} className="related-product-card">
        <div className="image-wrapper">
          <img
            src={item.image_url || "/placeholder.png"}
            srcSet={`${item.image_url} 1x, ${item.image_url_2x || item.image_url} 2x`}
            alt={item.name}
            loading="lazy"
            onError={(e) => (e.target.src = "/placeholder.png")}
          />
          {item.discountPrice && (
            <span className="badge-discount">
              -{Math.round(((item.price - item.discountPrice) / item.price) * 100)}%
            </span>
          )}
          {isPremium && <span className="badge-premium">✨ Premium</span>}
        </div>
        <div className="related-info">
          <h3>{item.name}</h3>
          <p className="price">
            {item.discountPrice ? (
              <>
                <span className="discount-price">GHS {Number(item.discountPrice).toFixed(2)}</span>
                <span className="original-price">GHS {Number(item.price).toFixed(2)}</span>
              </>
            ) : (
              `GHS ${Number(item.price).toFixed(2)}`
            )}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductDetailsPage;
