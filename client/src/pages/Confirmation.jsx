import { Button } from "@windmill/react-ui";
import { useUser } from "context/UserContext";
import Layout from "layout/Layout";
import { useEffect } from "react";
import { CheckCircle, Loader, Frown } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";
import orderService from "services/order.service";
import { useState } from "react";
import { useCart } from "context/CartContext";

const Confirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userData } = useUser();
  const [status, setStatus] = useState('pending');
  const [order, setOrder] = useState();
  const [message, setMessage] = useState();
  const { setCartData } = useCart();

  useEffect(() => {
    if (!state?.fromPaymentPage) {
      return navigate("/");
    }
  }, [state]);

  useEffect(() => {
    async function fetchData() {
      try {
        const orderId = state?.order_id;
        const result = await orderService.checkStatus(orderId);
        setStatus(result.data.status);
        if (!order) {
          setOrder(result.data);
          setMessage(result.data?.message);
        }
      } catch (error) {
        console.log(error);
      }
    }

    const id = setInterval(() => {
      fetchData();
    }, 1000 * 10);

    if (status !== 'pending') {
      clearInterval(id);
    }

    if (status === 'succeeded') {
      setCartData({ items: [] });
    }

    return () => clearInterval(id);
  }, [state]);

  return (
    <Layout>

      {
        status === 'pending' && (
          <section className="grid place-items-center border p-10 shadow mt-16">
            <div className="text-center">
              <div className="grid place-items-center animate-spin">
                <Loader color="grey" size={100} />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl">Order In Progress</h1>
                <p className="">Thank you for your purchase, {`${userData?.username}`}!</p>
                <p className="flex flex-col md:flex-row space-y-2.5 md:space-y-0 md:space-x-2 mt-2">
                  <Button tag={Link} to="/" layout="outline">
                    Continue shopping
                  </Button>
                  <Button tag={Link} to="/orders" layout="primary">
                    Manage Order
                  </Button>
                </p>
              </div>
            </div>
          </section>
        )
      }

      {
        status === 'succeeded' && (
          <section className="grid place-items-center border p-10 shadow mt-16">
            <div className="text-center">
              <div className="grid place-items-center">
                <CheckCircle color="green" size={100} />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl">Order Confirmed</h1>
                <p className="">Thank you for your purchase, {`${userData?.fullname}`}!</p>
                <p className="flex flex-col md:flex-row space-y-2.5 md:space-y-0 md:space-x-2 mt-2">
                  <Button tag={Link} to="/" layout="outline">
                    Continue shopping
                  </Button>
                  <Button tag={Link} to="/orders" layout="primary">
                    Manage Order
                  </Button>
                </p>
              </div>
            </div>
          </section>)
      }

      {
        status === 'failed' && (
          <section className="grid place-items-center border p-10 shadow mt-16">
            <div className="text-center">
              <div className="grid place-items-center">
                <Frown color="red" size={100} />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl">Order Failed</h1>
                <p className="">
                  {message || "An error occured while processing your order. Please try again later."}
                </p>
                <p className="flex flex-col md:flex-row space-y-2.5 md:space-y-0 md:space-x-2 mt-2 justify-center">
                  <Button tag={Link} to="/" layout="outline">
                    Continue shopping
                  </Button>
                  <Button tag={Link} to="/orders" layout="primary">
                    Manage Order
                  </Button>
                </p>
              </div>
            </div>
          </section>
        )
      }
    </Layout>
  );
};

export default Confirmation;
