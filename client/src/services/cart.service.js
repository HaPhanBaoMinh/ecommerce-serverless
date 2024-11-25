import API from "../api/axios.config";

class CartService {
  getCart() {
    return API.get("/cart");
  }

  async addToCart(data) {

    if (!data?.items) {
      return;
    }

    const body = {
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }
    await API.post("/cart", body);
    return body.items;
  }

  async removeFromCart(data) {
    const body = {
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }
    return await API.post("/cart", body);
  }

  async increment(data) {
    const body = {
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }
    return API.post("/cart", body);
  }

  async decrement(data) {
    const body = {
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }
    return API.post("/cart", body);
  }
}

export default new CartService();
