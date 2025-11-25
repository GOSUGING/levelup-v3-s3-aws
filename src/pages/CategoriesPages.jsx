import React from "react";
import { Link } from "react-router-dom";

export default function CategoriesPages() {
  const categorias = [
    { id: "consolas", nombre: "Consolas" },
    { id: "juegos", nombre: "Juegos" },
    { id: "accesorios", nombre: "Accesorios" },
    { id: "ropa", nombre: "Ropa Gamer" },
  ];

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Categorías</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            to={`/productos#${cat.id}`} // redirige a productos con hash de categoría
            style={{
              display: "block",
              background: "#222",
              color: "white",
              padding: "1rem",
              borderRadius: "10px",
              textDecoration: "none",
              transition: "0.3s",
            }}
          >
            {cat.nombre}
          </Link>
        ))}
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <Link to="/productos" className="btn btn-outline-light">Ver todos los productos</Link>
      </div>
    </div>
  );
}
