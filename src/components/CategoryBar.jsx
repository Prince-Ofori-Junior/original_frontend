import React from "react";

function CategoryBar({ categories, onCategoryClick }) {
  return (
    <section className="category-bar">
      {categories.map((cat) => (
        <div key={cat.id} className="category" onClick={() => onCategoryClick(cat.id)}>
          <img src={cat.img} alt={cat.name} />
          <span>{cat.name}</span>
        </div>
      ))}
    </section>
  );
}

export default CategoryBar;
