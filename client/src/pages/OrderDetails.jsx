import { Badge, Card, CardBody } from "@windmill/react-ui";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "helpers/formatCurrency";
import Layout from "layout/Layout";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import orderService from "services/order.service";
import ReviewCard from "components/ReviewCard";
import { useProduct } from "context/ProductContext";
import Spinner from "components/Spinner";

const OrderDetails = () => {
  const { id } = useParams();
  const [items, setItems] = useState(null);
  const { getProductById } = useProduct();
  const [itemListDetail, setItemDetail] = useState(null);

  useEffect(() => {
    if (!items) return;
    const itemDetails = items.items.map((item) => {
      const product = getProductById(item.product_id);
      if (!product) return;
      product.quantity = item.quantity;
      return product;
    });
    console.log(itemDetails);
    setItemDetail(itemDetails);
  }, [items]);

  useEffect(() => {
    orderService.getOrder(id).then((res) => {
      setItems(res.data);
      console.log(res.data);
    });
  }, [id]);

  if (!items) {
    return <Layout>
      <Spinner size={100} loading />
    </Layout>
  }

  return (
    <Layout>
      <div className="my-4">
        <h1 className="font-bold text-2xl">Order Details</h1>
        <p>Order no: #{items?.order_id}</p>
        <p>{`${items.amount || "Not available"} items`}</p>
        <p>
          Status: {
            items.status === "pending" ? (
              <Badge type="warning">Pending</Badge>
            ) : items.status === "succeeded" ? (
              <Badge type="success">Succeeded</Badge>
            ) : (
              <Badge type="danger">Failed</Badge>
            )
          }
        </p>
        <p>Total: {formatCurrency(items.total_price)}</p>
        <p>Placed on: {format(parseISO(items.order_date), "d MMM, yyyy")}</p>
        <div className="border-t-2">
          <h1 className="font-bold text-xl">Items in your order</h1>
          {
            itemListDetail === null ? (
              <div>Loading...</div>
            ) : (
              itemListDetail.map((item) => (
                <Card key={item.product_id} className="flex my-4 p-2 md:flex-row flex-col justify-between">
                  <img
                    className="sm:w-full md:w-1/2 lg:w-1/6 object-contain md:object-cover w-1/5"
                    loading="lazy"
                    decoding="async"
                    src={item.image_url}
                    alt={item.name}
                  />
                  <CardBody>
                    <h1 className="font-semibold text-gray-600">{item.name}</h1>
                    <p className="mb-2">{formatCurrency(item.price)}</p>
                    <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                    <p className="mt-2">Quantity: {item.quantity}</p>
                  </CardBody>
                </Card>
              ))
            )
          }

        </div>
        {/* <ReviewCard /> */}
      </div>
    </Layout>
  );
};

export default OrderDetails;
