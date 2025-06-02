import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (produto) => {
  setCartItems(prevItems => {
    const itemExistente = prevItems.find(item => item.id === produto.id);

    if (itemExistente) {
      return prevItems.map(item =>
        item.id === produto.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
        );
      } else {
        return [...prevItems, { ...produto, quantity: 1 }];
      }
    });
  };
  

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const removeOneFromCart = (productId) => {
  setCartItems((prevItems) =>
    prevItems.map(item =>
      item.id === productId
        ? { ...item, quantity: item.quantity - 1 }
        : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]); 
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, removeOneFromCart, clearCart, }}>
      {children}
    </CartContext.Provider>
  );
};


