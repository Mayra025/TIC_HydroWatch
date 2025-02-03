import React from "react";

export const MainStyles: React.CSSProperties = {
  // font-family: {"ABeeZee", "sans-serif"},

  fontFamily: "ABeeZee",
  backgroundImage: "url('/images/w.jpg')", // Agrega la imagen de fondo
  backgroundSize: "cover", // Asegura que la imagen cubra todo el contenedor
  backgroundPosition: "center", // Centra la imagen
  backgroundRepeat: "no-repeat", // Evita que la imagen se repita
  minHeight: "100vh", // Se asegura que el fondo cubra toda la pantalla
};


export const ContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",  // Cambia a columna en pantallas pequeñas
//   '@media(min-width: 768px)': {
//     flexDirection: "row",  // Vuelve a fila en pantallas más grandes
//   },
};

export const MenucontainerStyles: React.CSSProperties = {
  width: "100%",  // En pantallas pequeñas, el menú ocupa todo el ancho
  padding: "10px 20px",
  borderBottom: "1px solid #E6EFF5",  // Se ajusta el borde para pantallas pequeñas
//   '@media(min-width: 768px)': {
//     width: "250px",  // En pantallas grandes, el menú vuelve a ser lateral
//     borderBottom: "none",  // Se quita el borde en pantallas grandes
//     borderRight: "2px solid #E6EFF5",
//   },
};

export const ContentcontainerStyles: React.CSSProperties = {
  padding: "10px 20px",
  width: "100%",  // Asegura que el contenido ocupe todo el ancho disponible
  flexGrow: 1,  // El contenido crecerá en pantallas grandes
};
