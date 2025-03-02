import { useState, useEffect } from "react";
import axios from "axios";

interface Region {
  region_code: string;
  region_name: string;
}

interface Province {
  province_code: string;
  province_name: string;
}

interface City {
  city_code: string;
  city_name: string;
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
}

interface FormData {
  fullName: string;
  age: string;
  sex: string;
  address: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  contactNumber: string;
  isOwner: string;
  driversLicense: string;
  vehicleRegistration: string;
  orCr: string;
  reason: string;
  vehicleType: string;
  vehicleImage: string;
  platenumber: string;
  color: string;
  description: string;
}

interface AddressPickerProps {
  formData: FormData;
  setFormData: (updatedFields: Partial<FormData>) => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ formData, setFormData }) => {
  const { region, province, city, barangay } = formData;

  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  // Fetch Regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get("/api/addressPicker?type=regions");
        setRegions(res.data);
      } catch (error) {
        console.error("Failed to fetch regions:", error);
      }
    };
    fetchRegions();
  }, []);

  // Fetch Provinces based on selected Region
  useEffect(() => {
    const fetchProvinces = async () => {
      if (!region) {
        setProvinces([]);
        return;
      }

      try {
        const res = await axios.get(`/api/addressPicker?type=provinces&code=${region}`);
        setProvinces(res.data);
        setFormData({ province: "", city: "", barangay: "" }); // Reset dependent fields
        setCities([]);
        setBarangays([]);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, [region]);

  // Fetch Cities based on selected Province
  useEffect(() => {
    const fetchCities = async () => {
      if (!province) {
        setCities([]);
        return;
      }

      try {
        const res = await axios.get(`/api/addressPicker?type=cities&code=${province}`);
        setCities(res.data);
        setFormData({ city: "", barangay: "" }); // Reset dependent fields
        setBarangays([]);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, [province]);

  // Fetch Barangays based on selected City
  useEffect(() => {
    const fetchBarangays = async () => {
      if (!city) {
        setBarangays([]);
        return;
      }

      try {
        const res = await axios.get(`/api/addressPicker?type=barangays&code=${city}`);
        setBarangays(res.data);
        setFormData({ barangay: "" }); // Reset dependent field
      } catch (error) {
        console.error("Failed to fetch barangays:", error);
      }
    };
    fetchBarangays();
  }, [city]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region */}
      <div>
        <label className="block text-sm font-medium">Region</label>
        <select
          value={region}
          onChange={(e) => setFormData({ region: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.region_code} value={region.region_code}>
              {region.region_name}
            </option>
          ))}
        </select>
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium">Province</label>
        <select
          value={province}
          onChange={(e) => setFormData({ province: e.target.value })}
          className="w-full border p-2 rounded"
          disabled={!region}
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province.province_code} value={province.province_code}>
              {province.province_name}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium">City</label>
        <select
          value={city}
          onChange={(e) => setFormData({ city: e.target.value })}
          className="w-full border p-2 rounded"
          disabled={!province}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.city_code} value={city.city_code}>
              {city.city_name}
            </option>
          ))}
        </select>
      </div>

      {/* Barangay */}
      <div>
        <label className="block text-sm font-medium">Barangay</label>
        <select
          value={barangay}
          onChange={(e) => setFormData({ barangay: e.target.value })}
          className="w-full border p-2 rounded"
          disabled={!city}
        >
          <option value="">Select Barangay</option>
          {barangays.map((barangay) => (
            <option key={barangay.brgy_code} value={barangay.brgy_code}>
              {barangay.brgy_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressPicker;
