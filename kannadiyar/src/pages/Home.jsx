import React from "react";
import Topnavbar from "../components/Topnavbar";
import Topofferbar from "../components/Topofferbar";
import Carousels from "../components/Carousels";
// import BannerCards from "../components/BannerCards";
import CategoryCard from "../components/CategoryCard";
import ProductCards from "../components/ProductCards";
import TopPicksCards from "../components/TopPicksCards";
import ListComponents from "../components/ListComponents";
// import BlogCards from "../components/BlogCards";
import Footer from "../components/Footer";
import Halmark from "../components/Halmark";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Home() {
  const baseurl = import.meta.env.VITE_API_URL;
  const [productData, setProductData] = useState([]);
  const token = sessionStorage.getItem("token");
  const { custId } = useParams();
  sessionStorage.setItem("custId", custId);
  const navigate = useNavigate();
  const [tokenExist, setTokenExist] = useState(false);
  useEffect(() => {
    if (custId != 0) {
      if (token) {
        setTokenExist(true);
      } else {
        alert("Unauthorized access");
        navigate("/");
      }
    } else {
      setTokenExist(true);
    }
  }, []);
  useEffect(() => {
    const getProductsFromServer = async () => {
      const productsFromServer = await fetchProducts();
      setProductData(productsFromServer);
    };
    getProductsFromServer();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${baseurl}`);
    const data = await res.json();
    return data;
  };
  return (
    <>
      {tokenExist && (
        <>
          <Topofferbar />

          <Topnavbar />

          {/* row starts */}

          <div className="lg:w-10/12 lg:mt-5 ml-0 mt-2 lg:ml-32">
            <Carousels />
          </div>
          {/* row ends */}
          <h1 className="sm:mt-6 sm: font-content  sm: ml-3 lg:mt-5 lg:text-2xl sm:text-lg lg:font-semibold lg:ml-44 text-primecolor">
            Shop by Category
          </h1>

          <div className=" lg:block">
            <CategoryCard />
          </div>
          <div className="flex">
            {/* <div className="lg:hidden block">
              <ListComponents />
            </div> */}
          </div>

          <TopPicksCards product={productData} />
          <h1 className=" font-content  sm: ml-5 mb-3 lg:mt-6 mt-6 lg:text-2xl text-xl lg:font-semibold lg:ml-44 text-primecolor">
            Popular Products
          </h1>
          <ProductCards product={productData} />
          {/* <BlogCards /> */}
          <Halmark />
          <Footer />
        </>
      )}
    </>
  );
}

export default Home;
