import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseurl = import.meta.env.VITE_API_URL;

const WishlistItem = ({
  id,
  product_name,
  mrp,
  image,
  weight,
  onSelect,
  onRemove,
}) => (
  <tr className="sm: border-b-2 lg:border-b-2">
    <td className="lgp-4">
      <input
        type="checkbox"
        onChange={() => onSelect(id)}
        className="form-checkbox h-5 w-5 text-gray-600"
      />
    </td>
    <td className="lg:p-4">
      <img
        src={`${baseurl}uploads/${image}`}
        alt={product_name}
        className="sm: rounded-full sm: object-cover lg:rounded-full lg:w-16 lg:h-16 lg:object-cover"
      />
    </td>
    <td className=" lg:p-4">
      <h3 className="sm: text-sm sm: font-content sm: ml-1 lg:text-lg lg:font-semibold">
        {product_name}
      </h3>
      <p>{weight}</p>
    </td>
    <td className="lg:p-4">
      <p className="text-gray-600">&#8377;{mrp}</p>
    </td>

    <td className="lg:p-4">
      <button onClick={() => onRemove(id)} className="text-red-600 lg:text-3xl">
        <ion-icon name="close-circle-outline"></ion-icon>
      </button>
    </td>
  </tr>
);

const WishlistItems = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [wishlistItems, setWishListItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const custId = sessionStorage.getItem("custId");

  useEffect(() => {
    if (custId === "0" || custId === null) {
      setIsGuestMode(true);
      setIsLoading(false);
      return;
    }

    const fetchWishList = async () => {
      try {
        const res = await fetch(`${baseurl}api/wishlist/${custId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setWishListItems(data);
        } else {
          setWishListItems([]);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishList();
  }, [custId]);

  const handleSelect = (itemId) => {
    const isSelected = selectedItems.includes(itemId);
    if (isSelected) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(`${baseurl}wishlist/?action=delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custId,
          productId,
        }),
      });

      if (res.ok) {
        setWishListItems(wishlistItems.filter((item) => item.id !== productId));
        toast.success("Item removed from wishlist.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        const data = await res.json();
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  };

  const addToCart = async (productId) => {
    if (custId === "0" || custId === null) {
      toast.error("You are in guest mode", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    try {
      const response = await fetch(`${baseurl}addToCart/?action=add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custId,
          prodId: productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast.success("Successfully added to cart!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.warning("Already in cart!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isGuestMode) {
    return <h1>You are in guest mode</h1>;
  }

  return (
    <>
      <ToastContainer />
      <div className="sm: mt-3 lg:max-w-6xl lg:mx-auto lg:mt-8">
        {wishlistItems.length === 0 ? (
          <p className="text-gray-500">Your wishlist is empty.</p>
        ) : (
          <>
            <table className="sm: lg:w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="sm: text-sm sm: font-content lg:text-lg lg:font-content lg:p-4">
                    Select
                  </th>
                  <th className="sm: text-sm sm: font-content lg:text-lg lg:font-content lg:p-4">
                    Image
                  </th>
                  <th className="sm: text-sm sm: font-content lg:text-lg lg:font-content lg:p-4">
                    Details
                  </th>
                  <th className="sm: text-sm sm: font-content lg:text-lg lg:font-content lg:p-4">
                    Price
                  </th>
                  <th className="sm: text-sm sm: font-content lg:text-lg lg:font-content lg:p-4">
                    Remove
                  </th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    onSelect={handleSelect}
                    onRemove={handleRemove}
                    {...item}
                  />
                ))}
              </tbody>
            </table>
            <div className="sm: -ml-4 flex flex-row-reverse">
              <button
                className="sm: bg-primecolor sm: text-orange-100 sm: rounded-full sm: p-2 sm:  sm: font-content sm: mt-5  hover:opacity-60 lg:bg-primecolor lg:text-orange-100 lg:rounded-lg lg:p-2 lg:font-content lg:mt-5 "
                onClick={() => {
                  selectedItems.forEach((itemId) => addToCart(itemId));
                }}
              >
                Add selected to cart
              </button>
              <button
                className="sm: bg-primecolor sm: text-orange-100 sm: rounded-full sm: font-content sm: mt-5 hover:opacity-60  lg:bg-primecolor lg:text-orange-100 lg:rounded-lg p-2 lg:font-content lg:mt-5 lg:mr-8 "
                onClick={() => {
                  wishlistItems.forEach((item) => addToCart(item.id));
                }}
              >
                Add all to cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WishlistItems;
