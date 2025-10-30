import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ProductsGrid from "../components/ProductsGrid";
import Hero from "../components/Hero";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";

function ProductPage({ addToCart, searchTerm, selectedType }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cartUpdated, setCartUpdated] = useState(0);

  const observer = useRef();

  // ✅ Clean API_BASE (remove any trailing slashes)
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") ||
    "http://localhost:8000";

  // ------------------ WebSocket Setup ------------------
  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket"] }); // stable connection

    socket.on("productCreated", (newProduct) => {
      if (
        (!selectedType || newProduct.category_id === selectedType) &&
        (!searchTerm ||
          newProduct.name.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        setProducts((prev) => [newProduct, ...prev]);
        setTotal((prev) => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [API_BASE, selectedType, searchTerm]);

  // ------------------ Debounced Search ------------------
  const debouncedSearch = useMemo(() => debounce(() => setPage(1), 500), []);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // ------------------ Listen for LocalStorage Cart Updates ------------------
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "cartItems") setCartUpdated((prev) => prev + 1);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ------------------ Fetch Products ------------------
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let url = `${API_BASE}/api/products?page=${page}&limit=${limit}`;
      if (selectedType)
        url += `&category=${encodeURIComponent(selectedType)}`;
      if (searchTerm)
        url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();

      if (result.success && result.data) {
        const rows = Array.isArray(result.data.rows)
          ? result.data.rows
          : result.data;
        const totalCount = result.data.total || rows.length;

        setProducts((prev) => (page === 1 ? rows : [...prev, ...rows]));
        setTotal(totalCount);
        setHasMore(page < Math.ceil(totalCount / limit));
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, page, limit, searchTerm, selectedType]);

  // ------------------ Reset when filters change ------------------
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [searchTerm, selectedType]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, cartUpdated, page]);

  // ------------------ Infinite Scroll ------------------
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 1 }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // ------------------ Skeleton Loader ------------------
  const skeletons = useMemo(() => Array.from({ length: limit }), [limit]);

  return (
    <div>
      <Hero />

      {products.length > 0 ? (
        <ProductsGrid
          products={products}
          addToCart={addToCart}
          lastProductRef={lastProductRef}
        />
      ) : loading ? (
        <div className="products-skeleton">
          {skeletons.map((_, i) => (
            <div key={i} className="product-card-skeleton"></div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>No products available.</p>
      )}

      {loading && products.length > 0 && (
        <p style={{ textAlign: "center" }}>Loading more products...</p>
      )}
    </div>
  );
}

export default ProductPage;
