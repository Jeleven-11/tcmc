import { useState, useEffect } from "react";
import axios from "axios";

interface AddressPickerProps {
  formData: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  };
  setFormData: (formData: any) => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ formData, setFormData }) => {
  const { region, province, city, barangay } = formData;

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  useEffect(() => {
    axios.get("/api/addressPicker?type=regions").then((res) => setRegions(res.data));
  }, []);

  useEffect(() => {
    if (region) {
      axios.get(`/api/addressPicker?type=provinces&code=${region}`).then((res) => setProvinces(res.data));
      setFormData((prev: any) => ({ ...prev, province: "", city: "", barangay: "" }));
      setCities([]);
      setBarangays([]);
    }
  }, [region]);

  useEffect(() => {
    if (province) {
      axios.get(`/api/addressPicker?type=cities&code=${province}`).then((res) => setCities(res.data));
      setFormData((prev: any) => ({ ...prev, city: "", barangay: "" }));
      setBarangays([]);
    }
  }, [province]);

  useEffect(() => {
    if (city) {
      axios.get(`/api/addressPicker?type=barangays&code=${city}`).then((res) => setBarangays(res.data));
      setFormData((prev: any) => ({ ...prev, barangay: "" }));
    }
  }, [city]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region */}
      <div>
        <label className="block text-sm font-medium">Region</label>
        <select
          value={region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Region</option>
          {regions.map((region: any) => (
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
          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
          className="w-full border p-2 rounded"
          disabled={!region}
        >
          <option value="">Select Province</option>
          {provinces.map((province: any) => (
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
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="w-full border p-2 rounded"
          disabled={!province}
        >
          <option value="">Select City</option>
          {cities.map((city: any) => (
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
          onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
          className="w-full border p-2 rounded"
          disabled={!city}
        >
          <option value="">Select Barangay</option>
          {barangays.map((barangay: any) => (
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
