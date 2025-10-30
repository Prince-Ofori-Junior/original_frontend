import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../ProductsGrid.css";

const ProductsGrid = React.memo(({ products = [], lastProductRef }) => {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // ---------------- Toast ----------------
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // ---------------- Memoized product list ----------------
  const renderedProducts = useMemo(
    () =>
      products.map((product, i) => {
        const isLast = i === products.length - 1;

        return (
          <div
            key={product.id}
            className="card premium-card"
            ref={isLast ? lastProductRef : null}
            onClick={() => navigate(`/product/${product.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (["Enter", " "].includes(e.key))
                navigate(`/product/${product.id}`);
            }}
          >
            <div className="card-image">
              <img
                src={product.image_url || "/placeholder.png"}
                alt={product.name || "Product image"}
                loading="lazy"
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
            </div>

            <div className="card-body">
              <h3 className="product-name">{product.name}</h3>

              <p className="product-description">
                {product.description
                  ? product.description.length > 100
                    ? product.description.slice(0, 100) + "..."
                    : product.description
                  : "No description available."}
              </p>

              <div className="price-section">
                {product.discountPrice ? (
                  <>
                    <span className="discount-price">
                      GHC {Number(product.discountPrice).toFixed(2)}
                    </span>
                    <span className="original-price">
                      GHC {Number(product.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="price1">
                    GHC {Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }),
    [products, lastProductRef, navigate]
  );

  // ---------------- Skeleton Loading ----------------
  const isLoading = products.length === 0;

  return (
    <section className="section bg-light">
      {/* Toast outside container */}
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        <h2 className="section-title">Our Products</h2>

        {isLoading ? (
          <div className="grid skeleton-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : (
          <div className="grid">{renderedProducts}</div>
        )}

        {products.length === 0 && !isLoading && (
          <p className="empty-text">No products available.</p>
        )}
      </div>
    </section>
  );
});

export default ProductsGrid;
