import { createContext, useContext, useEffect, useState } from "react";
import productService from "services/product.service";

const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    productService.getProducts(page).then((response) => {
      setProducts(response.data);
      setIsLoading(false);
    });
  }, [page]);

  const getProductById = (id) => {
    if (!id) {
      throw new Error("Product ID is required");
    }

    if (!products) {
      return null;
    }

    const product = products.find((product) => product.product_id === id);
    return product;
  }

  return (
    <ProductContext.Provider
      value={{ products, setProducts, isLoading, setIsLoading, page, setPage, getProductById }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};

export { ProductContext, ProductProvider, useProduct };
