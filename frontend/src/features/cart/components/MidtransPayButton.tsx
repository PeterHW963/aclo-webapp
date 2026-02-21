// import axios from "axios";
// import { useEffect } from "react";
// import { API_URL, getAuthHeader } from "../../constants/api";

// declare global {
//   interface Window {
//     snap?: {
//       pay: (token: string, opts?: Record<string, any>) => void;
//     };
//   }
// }

// const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string;
// const MIDTRANS_SNAP_URL = import.meta.env.VITE_MIDTRANS_SNAP_URL as string;

// type MidtransPayButtonProps = {
//   checkoutId: string;
//   amount: number;
//   onSuccess: () => void; // change this to redirect probably
//   onError?: (err: unknown) => void;
// };

// function loadSnapScript() {
//   return new Promise<void>((resolve, reject) => {
//     if (window.snap) return resolve();
//     if (!MIDTRANS_CLIENT_KEY)
//       return reject(new Error("Missing VITE_MIDTRANS_CLIENT_KEY"));

//     const script = document.createElement("script");
//     script.src = MIDTRANS_SNAP_URL;
//     script.async = true;
//     script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);

//     script.onload = () => resolve();
//     script.onerror = () =>
//       reject(new Error("Failed to load Midtrans Snap script"));
//     document.body.appendChild(script);
//   });
// }

// const MidtransPayButton = ({
//   checkoutId,
//   amount,
//   onSuccess,
//   onError,
// }: MidtransPayButtonProps) => {
//   useEffect(() => {
//     loadSnapScript().catch((e) => {
//       console.error(e);
//       onError?.(e);
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handlePay = async () => {
//     try {
//       // ask backend to create transaction & return snap token
//       const { data } = await axios.post(
//         `${API_URL}/api/payments/midtrans/token`,
//         { checkoutId },
//         { headers: getAuthHeader() }
//       );

//       const token = data?.token as string | undefined;
//       if (!token) throw new Error("No Midtrans snap token returned");

//       window.snap?.pay(token, {
//         onSuccess: function () {
//           onSuccess();
//         },
//         onPending: function () {
//           alert("Payment created. Please complete the payment in the popup.");
//         },
//         onError: function (err: unknown) {
//           onError?.(err);
//         },
//         onClose: function () {
//           // do nothing on user close popup
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       onError?.(err);
//     }
//   };

//   return (
//     <button
//       type="button"
//       onClick={handlePay}
//       className="w-full bg-black text-white py-3 rounded"
//     >
//       Pay with Midtrans (IDR {amount.toLocaleString()})
//     </button>
//   );
// };

// export default MidtransPayButton;
