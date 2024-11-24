import { APIWithouToken } from "api/axios.config";

class ProductService {

  getProducts(page) {
    return APIWithouToken.get(`/products/?page=${page}`);
  }
  getProduct(id) {
    return APIWithouToken.get(`/products/${id}`);
  }
  getProductByName(name) {
    return APIWithouToken.get(`/products/${name}`);
  }
}

export default new ProductService();
