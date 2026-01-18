import { useState, useContext, createContext, useEffect } from "react";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    let existingCartItem = localStorage.getItem("cart");
    if (existingCartItem) setCart(JSON.parse(existingCartItem));
  }, []);
  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };

//************************* */
// import { useState, useContext, createContext, useMemo } from "react";

// const CartContext = createContext([[], () => {}]); // Default value

// const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState([]);

//   // Memoize the context value
//   const value = useMemo(() => [cart, setCart], [cart]);

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// };

// // Custom hook
// const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }
//   return context;
// };

// export { useCart, CartProvider };
