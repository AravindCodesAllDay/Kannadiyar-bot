import Footer from "../components/Footer";
import Myaddress from "../components/Myaddress";
import Topnavbar from "../components/Topnavbar";
import Topofferbar from "../components/Topofferbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Addressmodel from "../components/Addressmodel";
import Counter from "../components/Counter";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function OrderBooking() {
  const custId = sessionStorage.getItem("custId");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subTotal, setSubTotal] = useState();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountPrice, setDiscountPrice] = useState(0);
  const [subWeight, setSubWeight] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(60);
  const [order, setOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // Default to "Pay Now"
  const baseurl = import.meta.env.VITE_API_URL;

  const [userAddress, setUserAddress] = useState([]);
  const [addModal, setAddModal] = useState(false);

  const [getAddress, setGetAddress] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [addressId, setAddressId] = useState("");
  const [paymentmethod, setPaymentmethod] = useState("");

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
  };
  const token = sessionStorage.getItem("token");
  const [currentDate, setCurrentDate] = useState();

  const navigate = useNavigate();
  useEffect(() => {
    let totalMRP = 0;
    let totalWeight = 0;
    cartItems.forEach((item) => {
      totalMRP += parseFloat(item.mrp) * item.quantity; // Assuming 'mrp' is a string representing price
      let weightArray = item.weight.split(" ");
      totalWeight += parseInt(weightArray[0]) * item.quantity;
    });
    totalMRP = totalMRP.toFixed(2);
    setSubTotal(totalMRP);
    setSubWeight(totalWeight);
  }, [cartItems]);

  useEffect(() => {
    const getCartItems = async () => {
      const cartItemsFromServer = await fetchCartItems();
      setCartItems(cartItemsFromServer);
      setOrder(false);
    };
    getCartItems();
  }, [order]);

  const fetchCartItems = async () => {
    const res = await fetch(`${baseurl}api/cart/${custId}`);
    const data = await res.json();
    return data;
  };

  const increaseQuantity = async (itemId) => {
    try {
      const updatedCart = cartItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, quantity: item.quantity + 1 };
          updateCartItemQuantity(updatedItem);
          return updatedItem;
        }
        return item;
      });

      setCartItems(updatedCart);
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const decreaseQuantity = async (itemId) => {
    try {
      const updatedCart = cartItems.map((item) => {
        if (item.id === itemId && item.quantity > 1) {
          const updatedItem = { ...item, quantity: item.quantity - 1 };
          updateCartItemQuantity(updatedItem);
          return updatedItem;
        }
        return item;
      });

      setCartItems(updatedCart);
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    }
  };

  const updateCartItemQuantity = async (updatedItem) => {
    try {
      await fetch(
        `${baseurl}updateQuantity/?prodId=${updatedItem.id}&custId=${custId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: updatedItem.quantity }),
        }
      );
    } catch (error) {
      console.error("Error updating quantity in the backend:", error);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select address", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    if (paymentMethod === "payNow") {
      try {
        const response = await fetch(`${baseurl}/pay?amount=${subTotal}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();

        console.log(data.paymentUrl);
      } catch (error) {
        console.error("Error during checkout:", error);
        toast.error("Error during checkout", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } else if (paymentMethod === "cod") {
      try {
        console.log(selectedAddressId);
        const response = await fetch(`http://localhost:4000/codOrder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            custId,
            addressId: selectedAddressId, // Pass the selected address details
            cartItems,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          toast.success("Order placed successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setOrder(true);
          // Redirect or update the UI as necessary
        } else {
          toast.error(data.message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } catch (error) {
        console.error("Error during checkout:", error);
        toast.error("Error during checkout", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };

  useEffect(() => {
    if (custId === "0" || custId === null) {
      setIsGuestMode(true);
    }
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter coupon", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    if (subTotal == 0) {
      toast.info("Can't apply coupon", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    try {
      const response = await fetch(`${baseurl}coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode,
          purchaseValue: subTotal,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        let temp = subTotal * (data.discount / 100);
        setDiscountPrice(temp);
        setSubTotal(subTotal - temp);
        console.log(discountPrice);
      } else {
        toast.error(`${data.message}`, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error during apply coupon:", error);
    }
  };

  if (isGuestMode) {
    return (
      <>
        <Topofferbar />
        <Topnavbar />
        <p className="mt-11 ml-4 text-2xl font-content">
          You are in guest mode...!!
        </p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Topofferbar />
      <Topnavbar />
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <div className="w-full flex">
          <div className=" w-4/6 m-3 flex flex-col gap-8">
            <div className="bg-[#638759] rounded-lg shadow-lg p-4 w-full flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-white">
                1. Select a Delivery Address
              </h3>
              {!getAddress && (
                <>
                  <div className="bg-white rounded-lg p-4">
                    <div className="space-y-4">
                      {userAddress.map((data) => (
                        <div className="flex items-center" key={data._id}>
                          <input
                            type="radio"
                            id={data._id}
                            name="address"
                            value={data._id}
                            className="mr-2"
                            onChange={(e) => setAddressId(e.target.value)}
                          />
                          <label htmlFor={data._id}>
                            {data.address}, {data.district}, {data.state}-
                            {data.pincode}-{data.addressContact}
                          </label>
                        </div>
                      ))}

                      <button
                        className="border px-1 rounded"
                        onClick={() => setAddModal(true)}
                      >
                        +Add Address
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      className="bg-white text-green-800 py-2 px-4 rounded hover:scale-110"
                      onClick={() => {
                        if (addressId !== "") {
                          setGetAddress(true);
                        }
                      }}
                    >
                      Use this address
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col bg-[#638759] rounded-lg shadow-lg p-4 w-full gap-3">
              <h3 className="text-lg font-semibold text-white">
                2. Select a payment method
              </h3>
              {getAddress && !showPaymentMethod && (
                <>
                  <div className="bg-white rounded-lg p-4 flex flex-col gap-3">
                    <div>
                      <div>
                        <input
                          type="radio"
                          value="cash"
                          onChange={(e) => setPaymentmethod(e.target.value)}
                          name="payment-method"
                        />
                        <span>Cash On Delivery</span>
                      </div>
                      <div>
                        <input
                          type="radio"
                          value="upi"
                          onChange={(e) => setPaymentmethod(e.target.value)}
                          name="payment-method"
                        />
                        <span>UPI</span>
                      </div>
                      <div>
                        <input
                          type="radio"
                          value="emi"
                          onChange={(e) => setPaymentmethod(e.target.value)}
                          name="payment-method"
                        />
                        <span>EMI</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      className="bg-white text-green-800 py-2 px-4 rounded hover:scale-110"
                      onClick={() => {
                        if (paymentmethod !== "") setShowPaymentMethod(true);
                      }}
                    >
                      Use this payment method
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="bg-[#638759] rounded-lg shadow-lg p-4 w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">
                3. Items and Delivery
              </h3>
              {getAddress && showPaymentMethod && (
                <>
                  <div className="bg-white rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-2 m-1 text-center"
                          >
                            <td className="flex justify-center">
                              <img
                                src={`${import.meta.env.VITE_API}uploads/${
                                  item.photo
                                }`}
                                alt=""
                                className="w-24 h-24 object-contain"
                              />
                            </td>
                            <td>{item.name}</td>
                            <td>
                              <div className="flex justify-center">
                                <span>{item.quantity}</span>
                              </div>
                            </td>

                            <td>Rs.{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      className="bg-white text-green-800 py-2 px-4 rounded hover:scale-110"
                      onClick={handlePlaceOrder}
                    >
                      Place your order
                    </button>
                    <p className="text-lg font-semibold text-white">
                      Order Total :
                      {/* {totalPrice + totalPrice * 0.05 - totalItems * 5} */}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-2/6 h-96 p-4 grid grid-rows-5 items-center bg-[#638759] m-3 rounded text-white font-semibold">
            <h3 className="font-blod text-2xl justify-center flex font-bold">
              Order Summary
            </h3>
            {/* <p>items:{totalPrice}</p>
            <p>Delivery:{totalPrice * 0.1}</p>
            <p>Promotion Applied:{totalItems * 5}</p> */}
            <p className="border-y py-2 border-white text-xl">
              {/* Order Total :{totalPrice + totalPrice * 0.05 - totalItems * 5} */}
            </p>
          </div>
        </div>
      </div>
      {/* 
      <h2 className="sm: mt-3 sm: font-content sm: ml-1 sm: font-semibold lg:mt-4 lg:ml-20 lg:text-xl lg:font-semibold">
        Choose Delivery Address
      </h2>
      <div className="lg:flex lg:flex-row">
        <div className="lg:flex lg:flex-col">
          <div className="sm: ml-1 sm: mr-1 md:mr-3 lg:ml-20 lg:mt-5">
            <Myaddress onAddressSelect={handleAddressSelect} />
            <div className="sm: mt-3 sm: ml-[120px] sm: w-2/3 lg:mt-5 lg:ml-80">
            </div>
          </div>
        </div>
        <div className="sm: flex sm: flex-col sm: ml-1 sm: mr-1 sm: mt-3 lg:flex lg:flex-col">
          <div className="lg:ml-14 border-1 p-4 rounded-md">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="">Shopping Cart</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {cartItems.map((item) => (
                <div className="lg:flex lg:flex-row lg:mt-5" key={item.id}>
                  <img
                    className="lg:h-20 lg:w-20 lg:rounded-full lg:mt-2"
                    src={`http://localhost:4000/uploads/${item.image}`}
                    alt=""
                  />
                  <div className="lg:flex lg:flex-col lg:ml-4">
                    <h1 className="lg:text-xl">{item.product_name}</h1>
                    <div className="lg:flex lg:flex-row lg:ml-4">
                      <h1 className="lg:text-lg">₹{item.mrp}</h1>
                      &nbsp; &nbsp;
                      <p className="lg:text-lg"> X </p>
                      &nbsp; &nbsp;
                      <h1 className="lg:text-lg">{item.quantity}</h1>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-row mt-7">
                <h2 className=" text-xl font-bold">Subtotal</h2>
                <h2 className="ml-6 text-xl font-semibold">₹{subTotal}</h2>
              </div>
              <div className="flex flex-row mt-7">
                <h2 className=" text-xl font-bold">Delivery Charge</h2>
                <h2 className="ml-6 text-xl font-semibold">
                  ₹{deliveryCharge}
                </h2>
              </div>
              <div>
                <input
                  className="border b-1 lg:mt-3 lg:mr-3"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <input
                  type="submit"
                  value="Apply Coupon"
                  disabled={discountPrice !== 0}
                  onClick={handleApplyCoupon}
                />
              </div>
              <div>
                {paymentMethod === "payNow" ? (
                  // Content to render when paymentMethod is "payNow"
                  <>
                    <p className="  text-primecolor mt-2 font-semibold font-content">
                      After Your payment success <br />
                      product dispatched within 1-2 days
                    </p>
                  </>
                ) : paymentMethod === "cod" ? (
                  // Content to render when paymentMethod is "cod"
                  <p className="  text-primecolor mt-2 font-semibold font-content">
                    We will confirm your order by calling
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col mt-4">
                <h2 className="text-xl font-bold mb-2">Payment Method</h2>
                <div className="flex flex-row items-center mb-2">
                  <input
                    type="radio"
                    id="payNow"
                    name="paymentMethod"
                    value="payNow"
                    checked={paymentMethod === "payNow"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="payNow" className="ml-2">
                    Pay Now
                  </label>
                </div>
                <div className="flex flex-row items-center mb-4">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="cod" className="ml-2">
                    Cash on Delivery
                  </label>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-primecolor hover:opacity-50 items-center text-orange-100 px-4 py-2 rounded cursor-pointer"
                >
                  Checkout
                </button>
              </div>
            </Offcanvas.Body>
          </div>
        </div>
      </div> */}
      <Footer />
    </>
  );
}

export default OrderBooking;