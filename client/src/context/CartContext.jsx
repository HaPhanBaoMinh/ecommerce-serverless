import localCart from "helpers/localStorage";
import { createContext, useContext, useEffect, useState } from "react";
import cartService from "services/cart.service";
import { useUser } from "./UserContext";
import { set } from "date-fns";
import { useProduct } from "./ProductContext";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartData, setCartData] = useState();
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { isLoggedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { products } = useProduct();

  useEffect(() => {
    setIsLoading(true);
    if (isLoggedIn) {
      const saveLocalCart = async () => {
        const cartObj = localCart
          .getItems()
          .map(({ product_id, quantity }) => cartService.addToCart(product_id, quantity));
        await Promise.all(cartObj);
        localCart.clearCart();
        cartService.getCart().then((res) => {
          setCartData({ items: res?.data.items });
          setIsLoading(false);
        });
      };
      cartService.getCart().then((res) => {
        setCartData({ items: res?.data.items });
        setIsLoading(false);
      });
      saveLocalCart();
    } else {
      const items = localCart.getItems();
      if (items === null) {
        return;
      }
      setCartData({ items: [...items] });
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {

    if (!cartData || !products) {
      return;
    }

    const items = cartData?.items.map((item) => {
      const product = products?.find((product) => product.product_id === item.product_id);
      return { ...item, subtotal: product.price * item.quantity };
    });

    const quantity = items?.reduce((acc, cur) => {
      return acc + Number(cur.quantity);
    }, 0);
    const totalAmt = items?.reduce((acc, cur) => {
      return acc + Number(cur.subtotal);
    }, 0);

    setCartSubtotal(totalAmt);
    setCartTotal(quantity);
  }, [cartData]);

  const addItem = async (product, quantity) => {
    if (isLoggedIn) {
      try {
        const isExist = cartData.items.find((item) => item.product_id === product.product_id);
        let items = [];

        if (isExist) {
          items = cartData.items.map((item) => {
            if (item.product_id === product.product_id) {
              return { ...item, quantity: item.quantity + quantity };
            }
            return item;
          });
        } else {
          items = [...cartData.items, { product_id: product.product_id, quantity }];
        }
        setCartData({ items });
        const data = await cartService.addToCart({ items });
      } catch (error) {
        return error;
      }
    } else {
      localCart.addItem(product, 1);
      setCartData({ items: localCart.getItems() });
    }
  };

  const deleteItem = (product_id) => {
    if (isLoggedIn) {
      const items = cartData.items.filter((item) => item.product_id !== product_id);
      setCartData({ items });
      cartService.removeFromCart({ items });
    } else {
      localCart.removeItem(product_id);
      setCartData({ ...cartData, items: localCart.getItems() });
    }
  };

  const increment = async (product_id) => {
    if (isLoggedIn) {
      const items = cartData.items.map((item) => {
        if (item.product_id === product_id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      setCartData({ items });
      await cartService.increment({ items });
    } else {
      localCart.incrementQuantity(product_id);
      setCartData({ items: localCart.getItems() });
    }
  };

  const decrement = async (product_id) => {
    if (isLoggedIn) {
      const items = cartData.items.map((item) => {
        if (item.product_id === product_id) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      setCartData({ items });
      await cartService.decrement({ items });
    } else {
      localCart.decrementQuantity(product_id);
      setCartData({ items: localCart.getItems() });
    }
  };

  return (
    <CartContext.Provider
      value={{
        isLoading,
        cartData,
        setCartData,
        addItem,
        deleteItem,
        increment,
        decrement,
        cartTotal,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartProvider, useCart };
