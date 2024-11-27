import API from "api/axios.config";
import { add } from "date-fns";

class OrderService {
  createOrder(items, address, paymentMethod, user_id, order_id) {
    console.log(items, address, paymentMethod, user_id);
    return API.post("/order", {
      items,
      address,
      paymentMethod,
      user_id,
      order_id,
    });
  }
  getAllOrders(page) {
    return API.get(`/order`);
  }
  getOrder(id) {
    return API.get(`/order/${id}`);
  }
  checkStatus(id) {
    return API.get(`/order/${id}`);
  }
}

export default new OrderService();
