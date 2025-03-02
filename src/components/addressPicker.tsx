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
// interface addressCode {
//   regionCode: string;
//   provinceCode: string;
//   cityCode: string;
//   barangayCode: string;
// }

interface AddressPickerProps {
  formData: FormData;
  setFormData: (updatedFields: Partial<FormData>) => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ formData, setFormData }) => {
  const { region, province, city, barangay } = formData;
  const [cityName, setCityName] = useState<string>('')
  const [regionCode, setRegionCode] = useState<string>('');
  const [provinceCode, setProvinceCode] = useState<string>('');
  const [cityCode, setCityCode] = useState<string>('');
  const [barangayCode, setBarangayCode] = useState<string>('');


  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  // const [regionName, setRegionName] = useState<string>('');
  // const [provinceName, setProvinceName] = useState<string>('');
  // const [cityName, setCityName] = useState<string>('');
  // const [barangayName, setBarangayName] = useState<string>('');
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
      if (!regionCode) {
        setProvinces([]);
        return;
      }

      try {
        const res = await axios.get(`/api/addressPicker?type=provinces&code=${regionCode}`);
        setProvinces(res.data);
        const reg = regions.reduce((name, index) => index.region_code===regionCode?name=index.region_name:name,'')
        console.log("REGION NAME: ", reg)
        // setRegionName(reg)
        setFormData({region:reg, province: "", city: "", barangay: "" }); // Reset dependent fields
        setCities([]);
        setBarangays([]);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, [regionCode]);

  // Fetch Cities based on selected Province
  useEffect(() => {
    const fetchCities = async () => {
      if (!provinceCode) {
        setCities([]);
        return;
      }

      try {
        const res = await axios.get(`/api/addressPicker?type=cities&code=${provinceCode}`);
        setCities(res.data);
        const prov = provinces.reduce((name, index) => index.province_code===provinceCode?name=index.province_name:name,'')
        console.log("PROVINCE NAME: ", prov)
        // setProvinceName(prov)
        setFormData({province:prov, city: "", barangay: "" }); // Reset dependent fields
        setBarangays([]);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };
    fetchCities();
  }, [provinceCode]);

  // Fetch Barangays based on selected City
  useEffect(() => {
    const fetchBarangays = async () => {
      if (!cityCode) {
        setBarangays([]);
        return;
      }

      try {
        const res = await axios.get(`/api/addressPicker?type=barangays&code=${cityCode}`);
        setBarangays(res.data);
        const c = cities.reduce((name, index) => index.city_code===cityCode?name=index.city_name:name,'')
        console.log("CITY NAME: ", c)
        setCityName(c)
        setFormData({ city:c , barangay: "" }); // Reset dependent field
      } catch (error) {
        console.error("Failed to fetch barangays:", error);
      }
    };
    fetchBarangays();
  }, [cityCode]);

  useEffect(() => {
    const b = barangays.reduce((name, index) => index.brgy_code===barangayCode?name=index.brgy_name:name,'')
    // setBarangayName(b)
    
    setFormData({city:cityName, barangay:b })
    console.log("BARANGAY NAME:", b);
  }, [barangayCode]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region */}
      <div>
        <label className="block text-sm font-medium">Region</label>
        <select
          value={regionCode}
          onChange={(e) => setRegionCode( e.target.value )}
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
          value={provinceCode}
          defaultValue={'Select Region'}
          onChange={(e) => setProvinceCode( e.target.value )}
          className="w-full border p-2 rounded"
          disabled={(!region)&&!barangay}
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
          value={cityCode}
          onChange={(e) => setCityCode( e.target.value )}
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
          value={barangayCode}
          onChange={(e) => setBarangayCode( e.target.value )}
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
