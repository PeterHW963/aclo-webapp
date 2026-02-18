import { AiFillTikTok } from "react-icons/ai";
import { FaSquareFacebook } from "react-icons/fa6";
import { FiPhoneCall } from "react-icons/fi";
import { IoLogoInstagram } from "react-icons/io";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { assets, cloudinaryImageUrl } from "../../constants/cloudinary";
import { useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addSubscriber } from "../../redux/slices/subscriberSlice";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.subscribers);

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    try {
      await dispatch(addSubscriber({ email })).unwrap();
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="bg-mutedbrown py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 justify-center px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex md:justify-start">
          <img
            src={cloudinaryImageUrl(assets.logos.vertical.publicId)}
            alt={assets.logos.vertical.alt}
            className="w-[60px] h-full md:h-[120px] md:w-[100px] object-cover"
          />
        </div>
        {/* Shop links */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4"></h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/" className="text-acloblue transition-colors">
                HOME
              </Link>
            </li>
            <li>
              <Link to="/story" className="text-acloblue transition-colors">
                STORY
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-acloblue transition-colors">
                SHOP
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-acloblue transition-colors">
                CONTACT US
              </Link>
            </li>
          </ul>
        </div>
        {/* Support links */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4"></h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link
                to="/learn-more"
                className="text-acloblue transition-colors"
              >
                LEARN MORE
              </Link>
            </li>
            <li>
              <Link to="#" className="text-acloblue transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="#" className="text-acloblue transition-colors">
                TERMS & POLICIES
              </Link>
            </li>
            <li>
              <Link to="#" className="text-acloblue transition-colors">
                DELIVERY & EXCHANGE
              </Link>
            </li>
          </ul>
        </div>
        {/* Stay in Touch section */}
        <div>
          <h3 className="text-lg text-acloblue mb-4">Stay in Touch</h3>
          <p className="text-gray-500 mb-4">
            Be the first to hear about new offers and exclusive events
          </p>
          {/* <p className="font-medium text-sm text-gray-600 mb-6">
            Sign up and get 10% off your first order.
          </p> */}
          {/* Newsletter form */}
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              placeholder="Leave us your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-t border-l border-b border-acloblue rounded-l-md focus:outline-none transition-all p-4 text-base md:p-3 md:text-sm"
              required
              disabled={loading}
            />
            <button
              type="submit"
              aria-label="Subscribe"
              disabled={loading}
              className="
                group
                bg-acloblue text-white
                border border-acloblue
                px-3 py-3 rounded-r-md

                hover:bg-mutedbrown hover:text-acloblue
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <ArrowRightIcon className="h-8 w-8 md:h-5 md:w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="container mx-auto mt-12 border-t border-gray-200 pt-8 px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-col md:flex-row items-start md:items-start md:justify-between gap-8">
          {/* Follow Us */}
          <div className="text-left">
            <h3 className="text-base font-semibold text-acloblue mb-3">
              Follow Us
            </h3>
            <div className="flex items-center gap-4 justify-start text-gray-700">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-500"
                aria-label="Instagram"
              >
                <IoLogoInstagram className="w-11 h-11 md:w-6 md:h-6" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-500"
                aria-label="Facebook"
              >
                <FaSquareFacebook className="w-10 h-10 md:w-6 md:h-6" />
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-500"
                aria-label="TikTok"
              >
                <AiFillTikTok className="w-11 h-11 md:w-6 md:h-6" />
              </a>
            </div>
          </div>

          <div className="text-left md:text-center md:flex-none md:w-[520px]">
            <h3 className="text-base font-semibold text-acloblue mb-3">
              Find ACLO near you
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 text-sm">
              {/* Col 1 */}
              <div className="text-left md:text-center">
                <p className="font-medium">Baby Wise</p>
                <div className="mt-1 flex flex-col gap-1">
                  <a
                    href="https://www.google.com/maps/place/Baby+Wise+BSD+Flagship+Store/@-6.2858581,106.6367034,17z/..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-acloblue hover:underline"
                  >
                    BSD Flagship Store
                  </a>
                  <a
                    href="https://www.google.com/maps/place/Baby+Wise+Shop/@-6.2996563,106.6666592,17z/..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-acloblue hover:underline"
                  >
                    BSD Boulevard
                  </a>
                </div>
              </div>

              {/* Col 2 */}
              <div className="text-left md:text-center">
                <p className="font-medium">SONObébé</p>
                <div className="mt-1">
                  <a
                    href="https://www.google.com/maps/place/Sonobebe+Babies+Superstore/@-6.275428,106.6115233,17z/..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-acloblue hover:underline"
                  >
                    Symphonia Summarecon
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="text-left md:text-right">
            <h3 className="text-base font-semibold text-acloblue mb-3">
              WhatsApp Us
            </h3>
            <a
              href="https://api.whatsapp.com/send?phone=6282128528968&text=Halo%20ACLO!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-start md:justify-end gap-2 text-gray-700 hover:text-gray-500"
            >
              <FiPhoneCall className="h-5 w-5" />
              <span>+62 821-2852-8968</span>
            </a>
          </div>
        </div>

        <p className="text-gray-500 text-sm tracking-tight text-left md:text-center mt-8">
          © 2025, Aclo. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
