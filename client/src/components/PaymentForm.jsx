import { CardElement, Elements, ElementsConsumer } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button, HelperText } from "@windmill/react-ui";
import { useCart } from "context/CartContext";
import { formatCurrency } from "helpers/formatCurrency";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import OrderService from "services/order.service";
import OrderSummary from "./OrderSummary";
import PaystackBtn from "./PaystackBtn";
import { useUser } from "context/UserContext";

const PaymentForm = ({ previousStep, addressData, nextStep }) => {
  const { cartSubtotal, cartTotal, cartData, setCartData } = useCart();
  const { userData } = useUser();
  const [error, setError] = useState();
  const [isProcessing, setIsProcessing] = useState(false);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY);
  const navigate = useNavigate();

  const handleSubmit = async (e, elements, stripe) => {
    e.preventDefault();
    setError();
    const { address, city, state, country } = addressData;

    const addressDetails = {
      city,
      line1: address,
      state,
      country,
    }

    if (!stripe || !elements) {
      return;
    }

    try {
      setIsProcessing(true);
      const card = elements.getElement(CardElement);
      const result = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: {
          name: userData.username,
          email: userData.email,
          address: {
            ...addressDetails,
            country: "US"
          }
        },
      });

      const orderId = result.paymentMethod.id
      await OrderService.createOrder(cartData.items, addressDetails, "STRIPE", userData.sub, orderId)

      console.log(orderId);

      if (result.error) {
        setError(result.error);
      }

      // Delay to allow order to be created
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2));


      // Call api get get client_secret
      let count = 0;
      let idInterval = setInterval(async () => {
        const response = await OrderService.checkStatus(orderId);
        if (count > 5) {
          clearInterval(idInterval);
          return;
        }
        if (response?.data.client_secret) {
          const { data } = response;
          if (!data?.client_secret) return;
          await stripe.confirmCardPayment(data.client_secret, {
            payment_method: orderId,
          }).catch((error) => {
            console.log(error);
            count++;
            throw error;
          });
          clearInterval(idInterval);
        }
      }, 1000 * 5);

      setCartData({ items: [] });
      setIsProcessing(false);
      navigate("/cart/success", {
        state: {
          fromPaymentPage: true,
          order_id: orderId,
        },
      });

    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      // throw error
    }
  };

  return (
    <div className="w-full md:w-1/2">
      <h1 className="text-3xl font-semibold text-center mb-2">Checkout</h1>
      <OrderSummary />
      <h1 className="font-medium text-2xl">Pay with Stripe</h1>
      <Elements stripe={stripePromise}>
        <ElementsConsumer>
          {({ stripe, elements }) => (
            <form onSubmit={(e) => handleSubmit(e, elements, stripe)}>
              <CardElement className="border py-2" />
              {error && <HelperText valid={false}>{error.message}</HelperText>}
              <div className="flex justify-between py-4">
                <Button onClick={previousStep} layout="outline" size="small">
                  Back
                </Button>
                <Button disabled={!stripe || isProcessing} type="submit" size="small">
                  {isProcessing || !stripe ? (
                    <PulseLoader size={10} color={"#0a138b"} />
                  ) : (
                    `Pay ${formatCurrency(cartSubtotal)}`
                  )}
                </Button>
              </div>
            </form>
          )}
        </ElementsConsumer>
      </Elements>
      <PaystackBtn isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
    </div>
  );
};

export default PaymentForm;
