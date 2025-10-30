import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Navbar.css";
import promoImage from "../assets/online-sale-shopping-vector-banner-design-online-shopping-text-with-phone-cart-and-paper-bag-elements-in-smartphone-app-store-for-mobile-business-2D7GAPB.jpg";
import API from "../api"; // <- use centralized axios

import {
  MdLaptopMac,
  MdCheckroom,
  MdFastfood,
  MdWeekend,
  MdSmartphone,
  MdFavorite,
  MdHome,
  MdPower,
  MdDesktopMac,
  MdSportsBasketball,
  MdChildCare,
  MdSportsEsports,
  MdCategory,
} from "react-icons/md";

const iconMap = {
  Electronics: <MdLaptopMac size={28} color="#0a8e03" />,
  Fashion: <MdCheckroom size={28} color="#0a8e03" />,
  "Food & Beverages": <MdFastfood size={28} color="#0a8e03" />,
  Furniture: <MdWeekend size={28} color="#0a8e03" />,
  "Phones & Tablets": <MdSmartphone size={28} color="#0a8e03" />,
  "Health & Beauty": <MdFavorite size={28} color="#0a8e03" />,
  "Home & Office": <MdHome size={28} color="#0a8e03" />,
  Appliances: <MdPower size={28} color="#0a8e03" />,
  Computing: <MdDesktopMac size={28} color="#0a8e03" />,
  "Sporting Goods": <MdSportsBasketball size={28} color="#0a8e03" />,
  "Baby Products": <MdChildCare size={28} color="#0a8e03" />,
  Gaming: <MdSportsEsports size={28} color="#0a8e03" />,
  "Other categories": <MdCategory size={28} color="#0a8e03" />,
};

function CategoriesWithPromo() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/products/categories/list"); // centralized axios
        if (res.data.success) {
          setCategories(res.data.data);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section className="categories-promo-section">
      <div className="categories-promo-wrapper">
        <div className="categories-left">
          <div className="categories-card">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="category-item">
                <span className="cat-icon">{iconMap[cat.name] || <MdCategory size={28} color="#0a8e03" />}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link to="/promo" className="promo-right">
          <div className="promo-card">
            <div
              className="promo-image-bg"
              style={{ backgroundImage: `url(${promoImage})` }}
            >
              <div className="promo-text-overlay">
               
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default CategoriesWithPromo;
