import React, { useState, useEffect, useRef, useCallback } from "react";
import CategoryBar from "../components/CategoryBar";
import ProductsGrid from "../components/ProductsGrid";

const furnitureImages = {
  chairs: process.env.REACT_APP_PLACEHOLDER_IMAGE,
  tables: process.env.REACT_APP_PLACEHOLDER_IMAGE,
  sofas: process.env.REACT_APP_PLACEHOLDER_IMAGE,
  beds: process.env.REACT_APP_PLACEHOLDER_IMAGE,
  wardrobe: process.env.REACT_APP_PLACEHOLDER_IMAGE,
};

function FurniturePage({ addToCart, searchTerm }) {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const limit = 24;

  const categories = [
    { id: "chairs", name: "Chairs", img: furnitureImages.chairs },
    { id: "tables", name: "Tables", img: furnitureImages.tables },
    { id: "sofas", name: "Sofas", img: furnitureImages.sofas },
    { id: "beds", name: "Beds", img: furnitureImages.beds },
    { id: "wardrobe", name: "Wardrobe", img: furnitureImages.wardrobe },
  ];

  /** 🔹 Fetch paginated furniture products */
  const fetchFurniture = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE}/api/products?category=Furniture&page=${page}&limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      const newProducts = result.data?.rows || result.data || [];

      setAllProducts((prev) =>
        page === 1 ? newProducts : [...prev, ...newProducts]
      );
      if (newProducts.length < limit) setHasMore(false);
    } catch (err) {
      console.error("Error fetching furniture:", err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, API_BASE]);

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  /** 🔹 Improved Client-side filtering (handles plural/singular variations) */
  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedCategory) {
      const keyword = selectedCategory.toLowerCase();

      // Also check for singular form (e.g. chairs → chair)
      const singular = keyword.endsWith("s") ? keyword.slice(0, -1) : keyword;

      filtered = filtered.filter((p) => {
        const name = p.name?.toLowerCase() || "";
        return (
          name.includes(keyword) || name.includes(singular)
        );
      });
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, allProducts]);

  /** 🔹 Infinite scroll logic */
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /** 🔹 Handle category click */
  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) =>
      prev === category.id ? null : category.id
    );
  };

  return (
    <div>
      <CategoryBar
        categories={categories}
        onCategoryClick={handleCategoryClick}
        selectedCategory={selectedCategory}
      />

      {filteredProducts.length === 0 && !loading ? (
        <p style={{ textAlign: "center" }}>No furniture found.</p>
      ) : (
        <ProductsGrid
          products={filteredProducts}
          addToCart={addToCart}
          lastProductRef={lastProductRef}
        />
      )}

      {loading && (
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Loading more furniture...
        </p>
      )}
    </div>
  );
}

export default FurniturePage;
