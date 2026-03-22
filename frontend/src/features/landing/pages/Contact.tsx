import React from "react";
import Navbar from "../../../shared/components/common/Navbar";
import { assets } from "../../../shared/constants/cloudinary";
import CloudinaryImage from "../../../shared/components/common/CloudinaryImage";

const Contact: React.FC = () => {
  return (
    <main>
      <Navbar />

      <section className="mx-auto w-full max-w-7xl 2xl:max-w-[1400px] px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
          <div className="w-full">
            <CloudinaryImage
              publicId={assets.contact.publicId}
              alt={assets.contact.alt}
              size="medium"
              className="w-full h-[320px] sm:h-[380px] md:h-[420px]"
              usePlaceholder={true}
              lazy={true}
            />
          </div>

          <div className="w-full">
            <h1 className="text-acloblue text-4xl sm:text-5xl font-semibold tracking-tight">
              We're Here For You
            </h1>

            <div className="mt-10">
              <h2 className="text-acloblue text-xl sm:text-2xl font-semibold">
                Customer Support & Order Enquiries
              </h2>

              <p className="mt-4 text-ink/70 leading-7 text-[15px] sm:text-base max-w-xl">
                For any questions about our products or your purchase, reach us
                directly on WhatsApp via{" "}
                <a
                  href="https://api.whatsapp.com/send?phone=6282128528968&text=Halo%20ACLO!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-acloblue font-semibold hover:opacity-80"
                >
                  +62 821-2852-8968
                </a>
              </p>
            </div>

            <div className="mt-10">
              <h2 className="text-acloblue text-xl sm:text-2xl font-semibold">
                Partnerships & Collaborations
              </h2>

              <p className="mt-4 text-ink/70 leading-7 text-[15px] sm:text-base max-w-xl">
                If you're a retailer, creator, or brand looking to work with us,
                contact us on WhatsApp at{" "}
                <a
                  href="https://api.whatsapp.com/send?phone=628118635635&text=Halo%20ACLO!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-acloblue font-semibold hover:opacity-80"
                >
                  +62 811 8635 635
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
