/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, type FormEvent } from "react";
import { IoMdClose } from "react-icons/io";
import type { ShippingDetails } from "../../types/checkout";
import type { ShippingAddress } from "../../types/user";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  addShippingAddress,
  updateShippingAddress,
} from "../../redux/slices/authSlice";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { API_URL, getAuthHeader } from "../../constants/api";

// autocomplete suggestion returned by Places API with placeId = google's place id and text = display string for the suggestion
type Suggestion = { placeId: string; text: string };
type FormStep = 1 | 2 | 3; // 1 for contact details, 2 for location (this pinpoints longitude/latitude for shipping cost calc), 3 for address details for the courier

interface ShippingDetailsModalProps {
  onClose: () => void;
  onSubmit: (details: ShippingDetails) => Promise<void>;
  userEmail?: string;
  isCalculating: boolean;
  initialMode?: "selection" | "form"; // to control initial view
}

const authFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeader(),
    },
  });
};

const ShippingDetailsModal = ({
  onClose,
  onSubmit,
  isCalculating,
  initialMode = "form",
}: ShippingDetailsModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { shippingDetails: reduxShippingDetails } = useAppSelector(
    (state) => state.shipping,
  );

  const [mode, setMode] = useState<"selection" | "form">("form"); // selection = choose from saved addresses, form = enter new/edit address
  const [formStep, setFormStep] = useState<FormStep>(1);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [selectedAddressInView, setSelectedAddressInView] =
    useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  // AUTOCOMPLETE STATES
  const [addressQuery, setAddressQuery] = useState(""); // autocomplete input state (by user)
  const [sessionToken] = useState(() => crypto.randomUUID()); // token for autocomplete API
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // suggestions list from autocomplete API
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null); // place Id of selected suggestion

  const [pinPostalCode, setPinPostalCode] = useState<string>(""); // postal code extracted from pinned location

  const mapDivRef = useRef<HTMLDivElement | null>(null); // div where the map is rendered
  const mapRef = useRef<google.maps.Map | null>(null); // google.maps.Map instance
  const markerRef = useRef<google.maps.Marker | null>(null); // draggable pin marker

  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null,
  ); // current pin coords

  const [pinLabel, setPinLabel] = useState(""); // readable reverse-geocoded address
  const [addressError, setAddressError] = useState<string>("");
  const [pinConfirmed, setPinConfirmed] = useState(false);

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: "",
    address: "",
    addressDetails: "",
    city: "",
    postalCode: "",
    phone: "",
    latitude: 0,
    longitude: 0,
  });

  // tab navigation
  const goToStep = (next: FormStep) => {
    // Only allow going back by clicking previous tabs
    if (next < formStep) {
      setAddressError("");
      setFormStep(next);
    }
  };

  // validation
  const validateStep1 = () => {
    setAddressError("");
    setPhoneError("");

    if (!shippingDetails.name.trim()) {
      setAddressError("Please enter your name.");
      return false;
    }

    if (!shippingDetails.phone.trim()) {
      setAddressError("Please enter your phone number.");
      return false;
    }

    if (!isValidIDPhone(shippingDetails.phone)) {
      setPhoneError("Enter a valid phone number (08xx or +62xx).");
      setAddressError("Please fix the phone number before continuing.");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setAddressError("");
    const hasCoords =
      shippingDetails.latitude !== 0 && shippingDetails.longitude !== 0;
    const hasAddressText = !!shippingDetails.address?.trim();

    const locationChosen = !!selectedPlaceId || hasAddressText;
    const locationConfirmed = pinConfirmed || hasCoords;

    if (!locationChosen) {
      setAddressError("Please select an address from the suggestions.");
      return false;
    }

    if (!locationConfirmed) {
      setAddressError("Please confirm the pin location on the map.");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    setAddressError("");

    if (!shippingDetails.addressDetails?.trim()) {
      setAddressError("Please fill in your full address details.");
      return false;
    }

    if (!shippingDetails.city.trim()) {
      setAddressError("Please enter your city.");
      return false;
    }

    if (!/^\d{5}$/.test(shippingDetails.postalCode)) {
      setAddressError("Please enter a 5-digit postal code.");
      return false;
    }

    // Still cross-check with pinned postal code (as requested)
    if (pinPostalCode && shippingDetails.postalCode !== pinPostalCode) {
      setAddressError(
        "Postal code doesn’t match pinned location. Please correct it or re-confirm the pin.",
      );
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      if (validateStep1()) setFormStep(2);
      return;
    }
    if (formStep === 2) {
      if (validateStep2()) setFormStep(3);
      return;
    }
  };

  // Set initial mode based on prop and user addresses
  useEffect(() => {
    if (user?.shippingAddresses && user.shippingAddresses.length > 0) {
      setMode(initialMode);

      let matchingAddress = null;
      if (reduxShippingDetails) {
        matchingAddress = user.shippingAddresses.find(
          (addr) => addr.postalCode === reduxShippingDetails.postalCode,
        );
      }

      const addressToUse = matchingAddress || user.shippingAddresses[0]; // first address as fallback
      setSelectedAddressInView(addressToUse._id);

      if (initialMode === "form") {
        setShippingDetails({
          name: addressToUse.name,
          address: addressToUse.address,
          addressDetails: addressToUse.addressDetails || "",
          city: addressToUse.city,
          postalCode: addressToUse.postalCode,
          phone: addressToUse.phone,
          latitude: addressToUse.latitude,
          longitude: addressToUse.longitude,
        });
        // hydrate UI
        setSelectedPlaceId(null);
        setAddressQuery(addressToUse.address || "");
        setSuggestions([]);

        if (addressToUse.latitude && addressToUse.longitude) {
          setLatLng({
            lat: addressToUse.latitude,
            lng: addressToUse.longitude,
          });
          setPinConfirmed(true);
        } else {
          setLatLng(null);
          setPinConfirmed(false);
        }
      }
    } else {
      setMode("form");
      setIsNewAddress(true);
    }
  }, [user, initialMode, reduxShippingDetails]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = addressQuery.trim();
      if (selectedPlaceId) {
        setSuggestions([]);
        return;
      }
      if (q.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const r = await authFetch(
          `${API_URL}/api/maps/autocomplete?input=${encodeURIComponent(q)}&sessionToken=${encodeURIComponent(sessionToken)}`,
        );
        const data = await r.json();

        const list: Suggestion[] =
          (data?.suggestions || [])
            .map((s: any) => s?.placePrediction)
            .filter(Boolean)
            .map((p: any) => ({
              placeId: p.placeId,
              text: p.text?.text ?? "",
            })) ?? [];

        setSuggestions(list);
      } catch {
        // Don't hard fail UI on autocomplete
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [addressQuery, selectedPlaceId, sessionToken]);
  const mapsBootstrappedRef = useRef(false);

  const syncCoordsToDetails = (p: { lat: number; lng: number }) => {
    setShippingDetails((prev) => ({
      ...prev,
      latitude: p.lat,
      longitude: p.lng,
    }));
  };
  useEffect(() => {
    if (formStep !== 2) return; // <-- only run when step 2 is visible
    if (!mapDivRef.current) return;

    let cancelled = false;

    (async () => {
      if (!mapsBootstrappedRef.current) {
        setOptions({
          key: import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY,
          v: "weekly",
        });
        mapsBootstrappedRef.current = true;
      }

      const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;
      await importLibrary("marker");

      if (cancelled) return;

      // Create map only once
      if (!mapRef.current) {
        const map = new Map(mapDivRef.current!, {
          center: { lat: -6.2, lng: 106.816666 },
          zoom: 15,
        });
        mapRef.current = map;

        const marker = new google.maps.Marker({
          map,
          position: map.getCenter()!,
          draggable: true,
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          if (!p) return;
          const next = { lat: p.lat(), lng: p.lng() };
          setLatLng(next);
          syncCoordsToDetails(next);
          setPinConfirmed(false);
        });
      }

      // IMPORTANT: when the div was previously hidden, Maps often needs a resize
      setTimeout(() => {
        if (!mapRef.current) return;
        google.maps.event.trigger(mapRef.current, "resize");

        // If we already have coordinates, center the map to them
        const hasCoords =
          shippingDetails.latitude !== 0 && shippingDetails.longitude !== 0;

        const target = hasCoords
          ? { lat: shippingDetails.latitude, lng: shippingDetails.longitude }
          : latLng;

        if (target && markerRef.current) {
          mapRef.current.setCenter(target);
          markerRef.current.setPosition(target);
        }
      }, 0);
    })().catch((err) => {
      console.error(err);
      setAddressError("Failed to load Google Map. Check your API key/billing.");
    });

    return () => {
      cancelled = true;
    };
  }, [formStep, latLng, shippingDetails.latitude, shippingDetails.longitude]);

  const handlePickSuggestion = async (s: Suggestion) => {
    setSuggestions([]);
    setSelectedPlaceId(s.placeId);
    setAddressQuery(s.text);
    setAddressError("");
    setPinLabel("");
    setPinConfirmed(false);

    try {
      const r = await authFetch(
        `${API_URL}/api/maps/details?placeId=${encodeURIComponent(s.placeId)}`,
      );
      const place = await r.json();

      const formatted = place?.formattedAddress ?? s.text;

      // Update your form address field
      setShippingDetails((prev) => ({
        ...prev,
        address: formatted,
      }));

      // OPTIONAL: you can parse city/postal from addressComponents if you want
      // (skip for now if you want minimal changes)

      const loc = place?.location; // { latitude, longitude }
      if (loc?.latitude && loc?.longitude) {
        const next = { lat: loc.latitude, lng: loc.longitude };
        setLatLng(next);
        syncCoordsToDetails(next);
      }
    } catch {
      setAddressError("Failed to load address details. Try again.");
    }
  };

  // helper to extract postal code from geocode response
  const extractPostalCode = (rgData: any): string => {
    // Google Geocoding response shape:
    // results[0].address_components = [{ long_name, short_name, types: [...] }, ...]
    const comps = rgData?.results?.[0]?.address_components;
    if (!Array.isArray(comps)) return "";

    const postal = comps.find(
      (c: any) => Array.isArray(c?.types) && c.types.includes("postal_code"),
    );
    const code = postal?.long_name ?? postal?.short_name ?? "";

    // Your form expects Indonesian 5-digit codes
    return /^\d{5}$/.test(code) ? code : "";
  };

  const confirmPinAndValidate = async () => {
    if (!latLng) {
      setAddressError("Please place the pin on the map.");
      return;
    }

    setAddressError("");

    try {
      // Reverse geocode label
      const rg = await authFetch(
        `${API_URL}/api/maps/geocode-reverse?lat=${latLng.lat}&lng=${latLng.lng}`,
      );
      if (!rg.ok) {
        const t = await rg.text().catch(() => "");
        console.error("reverse geocode failed", rg.status, t);
        setPinConfirmed(false);
        return;
      }
      const rgData = await rg.json();
      const label = rgData?.results?.[0]?.formatted_address ?? "";
      setPinLabel(label);

      const pinnedPostal = extractPostalCode(rgData);
      setPinPostalCode(pinnedPostal);

      // If we can detect postal code from the pin, use it as source of truth
      if (pinnedPostal && !shippingDetails.postalCode) {
        setShippingDetails((prev) => ({ ...prev, postalCode: pinnedPostal }));
      }

      syncCoordsToDetails(latLng);
      setPinConfirmed(true);
    } catch (err) {
      console.error("reverse geocode exception", err);
      setPinConfirmed(false);
      setAddressError("Failed to validate pin location. Please try again.");
    }
  };

  const handleSelectAddress = async (address: ShippingAddress) => {
    try {
      await onSubmit({
        name: address.name,
        address: address.address,
        addressDetails: address.addressDetails,
        city: address.city,
        postalCode: address.postalCode,
        phone: address.phone,
        latitude: address.latitude,
        longitude: address.longitude,
      });
    } catch (error) {
      // If shipping calculation fails - there's issue with address
      // switch to form view to show the address
      console.error("Error selecting address:", error);
      setShippingDetails({
        name: address.name,
        address: address.address,
        addressDetails: address.addressDetails,
        city: address.city,
        postalCode: address.postalCode,
        phone: address.phone,
        latitude: address.latitude,
        longitude: address.longitude,
      });
      setMode("form");
    }
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddressId(address._id);
    setIsNewAddress(false);
    // Clear "new selection" state because we are using saved data
    setSelectedPlaceId(null);
    setSuggestions([]);
    setAddressError("");

    // Hydrate input text so Step 2 field is "selected"
    setAddressQuery(address.address || "");
    // Hydrate pin state so Step 2 can pass
    if (address.latitude && address.longitude) {
      const next = { lat: address.latitude, lng: address.longitude };
      setLatLng(next);
      setPinConfirmed(true); // treat saved coords as confirmed
    } else {
      setLatLng(null);
      setPinConfirmed(false);
    }
    setShippingDetails({
      name: address.name,
      address: address.address,
      addressDetails: address.addressDetails,
      city: address.city,
      postalCode: address.postalCode,
      phone: address.phone,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setMode("form");
    setFormStep(3);
  };

  const handleAddNewAddress = () => {
    setEditingAddressId(null);
    setIsNewAddress(true);
    setSaveAddress(true);
    setFormStep(1);
    setShippingDetails({
      name: "",
      address: "",
      addressDetails: "",
      city: "",
      postalCode: "",
      phone: "",
      latitude: 0,
      longitude: 0,
    });
    setMode("form");
  };

  const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, "").trim();

  const isValidIDPhone = (raw: string) => {
    const p = normalizePhone(raw);

    // +62xxxxxxxxxx or 62xxxxxxxxxx or 08xxxxxxxxxx
    if (p.startsWith("+62")) {
      const rest = p.slice(3);
      return /^\d{8,12}$/.test(rest);
    }
    if (p.startsWith("62")) {
      const rest = p.slice(2);
      return /^\d{8,12}$/.test(rest);
    }
    if (p.startsWith("0")) {
      const rest = p.slice(1);
      return /^\d{8,12}$/.test(rest);
    }

    return false;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formStep === 1) {
      if (validateStep1()) setFormStep(2);
      return;
    }

    if (formStep === 2) {
      if (validateStep2()) setFormStep(3);
      return;
    }
    if (!validateStep3()) return;

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    const hasCoords =
      shippingDetails.latitude !== 0 && shippingDetails.longitude !== 0;

    const hasAddressText = !!shippingDetails.address?.trim();

    if (!selectedPlaceId && !hasAddressText) {
      setAddressError("Please select an address from the suggestions.");
      return;
    }

    if (!pinConfirmed && !hasCoords) {
      setAddressError("Please confirm the pin location on the map.");
      return;
    }
    if (pinPostalCode && shippingDetails.postalCode !== pinPostalCode) {
      setAddressError(
        "Postal code doesn’t match pinned location. Please correct it or re-confirm the pin.",
      );
      return;
    }

    // Validate phone before attempting submission
    setPhoneError("");
    if (!isValidIDPhone(shippingDetails.phone)) {
      setPhoneError("Enter a valid phone number (08xx or +62xx).");
      return; // stops submission
    }

    try {
      await onSubmit(shippingDetails);

      // Only save valid addresses (ie shipping calculation passed)
      if (user) {
        if (isNewAddress && saveAddress) {
          const resultAction = await dispatch(
            addShippingAddress(shippingDetails),
          );

          if (addShippingAddress.fulfilled.match(resultAction)) {
            const updatedUser = resultAction.payload;

            if (
              updatedUser.shippingAddresses &&
              updatedUser.shippingAddresses.length > 0
            ) {
              const newAddress =
                updatedUser.shippingAddresses[
                  updatedUser.shippingAddresses.length - 1
                ];
              setSelectedAddressInView(newAddress._id);
            }
          }
        } else if (!isNewAddress && editingAddressId) {
          // Always update existing address when editing
          const resultAction = await dispatch(
            updateShippingAddress({
              addressId: editingAddressId,
              updates: shippingDetails,
            }),
          );
          if (updateShippingAddress.fulfilled.match(resultAction)) {
            setSelectedAddressInView(editingAddressId);
          }
        }
      }
    } catch (error) {
      console.error("Error on submitting shipping details:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={[
          "relative w-full max-w-2xl rounded-xl bg-white shadow-lg border max-h-[85vh] overflow-hidden flex flex-col",
          formStep === 2 ? "min-h-[60vh]" : "",
        ].join(" ")}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 z-10"
        >
          <IoMdClose className="h-6 w-6 hover:text-gray-600 cursor-pointer" />
        </button>
        <div className="flex-1 flex flex-col min-h-0">
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
              {mode === "selection" ? (
                // Address Selection View - shows list of user's saved addresses
                <div>
                  <h2 className="text-2xl uppercase mb-6">My Addresses</h2>

                  <div className="space-y-4 mb-6">
                    {user?.shippingAddresses?.map((address) => (
                      <div
                        key={address._id}
                        className="border rounded-lg p-5 hover:border-gray-400 transition cursor-pointer"
                        onClick={() => {
                          setSelectedAddressInView(address._id);
                          handleSelectAddress(address);
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                                selectedAddressInView === address._id
                                  ? "border-acloblue"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddressInView === address._id && (
                                <div className="w-3 h-3 rounded-full bg-acloblue" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-base">
                                  {address.name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {address.phone}
                                </p>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">
                                {address.addressDetails}
                              </p>

                              <p className="text-gray-600 text-sm">
                                {address.city}, {address.postalCode}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="text-acloblue text-sm font-medium shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddNewAddress}
                    className="w-full bg-black text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                // form content (stepper + step fields)...
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl uppercase text-acloblue">
                      {isNewAddress ? "Add New Address" : "Edit Address"}
                    </h2>
                  </div>

                  {/* Stepper header (tabs) */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {(
                        [
                          { step: 1, label: "Contact Details" },
                          { step: 2, label: "Location & map" },
                          { step: 3, label: "Address details" },
                        ] as const
                      ).map((s) => {
                        const isActive = formStep === s.step;
                        const isDone = formStep > s.step;

                        return (
                          <div key={s.step} className="flex-1">
                            <button
                              type="button"
                              onClick={() => goToStep(s.step)}
                              className="w-full flex flex-col items-center gap-2"
                            >
                              <div
                                className={[
                                  "h-7 w-7 rounded-full flex items-center justify-center text-sm font-semibold",
                                  isDone
                                    ? "bg-green-600 text-white cursor-pointer"
                                    : isActive
                                      ? "border-2 border-acloblue text-acloblue bg-white"
                                      : "border-2 border-gray-300 text-gray-400 bg-white",
                                ].join(" ")}
                              >
                                {isDone ? "✓" : s.step}
                              </div>

                              <div
                                className={[
                                  "text-xs font-medium",
                                  isActive || isDone
                                    ? "text-gray-800"
                                    : "text-gray-400",
                                ].join(" ")}
                              >
                                {s.label}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 1: Name & phone */}
                  {formStep === 1 && (
                    <div>
                      <div className="mb-4">
                        <label className="block text-gray-700">Name *</label>
                        <input
                          type="text"
                          value={shippingDetails.name}
                          onChange={(e) => {
                            setAddressError("");
                            setShippingDetails({
                              ...shippingDetails,
                              name: e.target.value,
                            });
                          }}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                          required
                        />
                      </div>

                      <div className="mb-2">
                        <label className="block text-gray-700">
                          Whatsapp Phone Number *
                        </label>

                        <p className="mt-1 text-sm text-gray-500">
                          We may contact you via WhatsApp for order updates
                          (delivery updates, reminders, support) and promotions.
                        </p>

                        <input
                          type="tel"
                          value={shippingDetails.phone}
                          onChange={(e) => {
                            const next = e.target.value.replace(/[^\d+]/g, "");
                            setPhoneError("");
                            setAddressError("");
                            setShippingDetails({
                              ...shippingDetails,
                              phone: next,
                            });
                          }}
                          pattern="^(?:\+62|62|0)\d{8,12}$"
                          placeholder="e.g. 081234567890 or 6281234567890"
                          className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                          required
                        />
                        {phoneError && (
                          <p className="mt-1 text-sm text-red-600">
                            {phoneError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Location & map */}
                  {formStep === 2 && (
                    <div>
                      <div className="mb-4 relative">
                        <label className="block text-gray-700">
                          Delivery location *
                        </label>

                        <input
                          type="text"
                          value={addressQuery || shippingDetails.address}
                          onChange={(e) => {
                            const next = e.target.value;
                            setShippingDetails({
                              ...shippingDetails,
                              address: next,
                            });
                            setAddressQuery(next);

                            setSelectedPlaceId(null);
                            setPinConfirmed(false);
                            setAddressError("");
                          }}
                          className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                          required
                          placeholder="Type street / building / neighborhood name..."
                        />

                        {suggestions.length > 0 && (
                          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded border bg-white shadow">
                            {suggestions.map((s) => (
                              <button
                                type="button"
                                key={s.placeId}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                onClick={() => handlePickSuggestion(s)}
                              >
                                {s.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="block text-gray-700 mb-2">
                          Pinpoint delivery location
                        </label>

                        <div
                          ref={mapDivRef}
                          className="w-full h-72 rounded-lg overflow-hidden border"
                        />

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="button"
                            onClick={confirmPinAndValidate}
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                          >
                            Confirm location
                          </button>

                          {pinConfirmed ? (
                            <span className="text-sm text-green-700">
                              Location confirmed ✓
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">
                              Drag the pin, then confirm.
                            </span>
                          )}
                        </div>

                        {pinLabel && (
                          <p className="mt-2 text-sm text-gray-600">
                            Pinned near: {pinLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Address details */}
                  {formStep === 3 && (
                    <div>
                      <div className="mb-4">
                        <label className="block text-gray-700">
                          Full Address *
                        </label>

                        <textarea
                          rows={3}
                          value={shippingDetails.addressDetails || ""}
                          onChange={(e) => {
                            setAddressError("");
                            setShippingDetails({
                              ...shippingDetails,
                              addressDetails: e.target.value,
                            });
                          }}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                          required
                        />

                        <p className="mt-1 text-xs text-gray-500">
                          Example: apartment/unit number, floor, building name,
                          landmark, gate code, etc.
                        </p>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700">City *</label>
                          <input
                            type="text"
                            value={shippingDetails.city}
                            onChange={(e) => {
                              setAddressError("");
                              setShippingDetails({
                                ...shippingDetails,
                                city: e.target.value,
                              });
                            }}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="^\d{5}$"
                            value={shippingDetails.postalCode}
                            onChange={(e) => {
                              const next = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 5);
                              setAddressError("");
                              setShippingDetails({
                                ...shippingDetails,
                                postalCode: next,
                              });
                            }}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                            required
                            minLength={5}
                            maxLength={5}
                          />
                        </div>
                      </div>

                      {/* Save Address Checkbox (ONLY here, default true) */}
                      {isNewAddress && (
                        <div className="mb-2">
                          <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm">
                              Save this address to my account
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* FOOTER (always pinned to bottom) */}
            {mode !== "selection" && (
              <div className="border-t border-gray-400 bg-white px-6 py-4">
                {addressError && (
                  <p className="mb-3 text-sm text-red-600">{addressError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>

                  {formStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isCalculating}
                      className="flex-1 bg-black text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isCalculating || !pinConfirmed}
                      className="flex-1 bg-acloblue text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-80 transition"
                    >
                      {isCalculating ? "Loading..." : "Submit"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetailsModal;
