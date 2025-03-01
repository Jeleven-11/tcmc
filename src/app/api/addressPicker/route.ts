import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define types for JSON data
interface Region {
  region_code: string;
  region_name: string;
}

interface Province {
  province_code: string;
  province_name: string;
  region_code: string;
}

interface City {
  city_code: string;
  city_name: string;
  province_code: string;
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
}

// Helper function to read JSON files
const readJsonFile = (fileName: string) => {
  const filePath = path.join(process.cwd(), "data", "ph-address", fileName);
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

// API handler function
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  try {
    let data = [];

    switch (type) {
      case "regions":
        data = readJsonFile("region.json") as Region[];
        break;
      case "provinces":
        data = readJsonFile("province.json") as Province[];
        if (code) {
          data = data.filter((item) => item.region_code === code);
        }
        break;
      case "cities":
        data = readJsonFile("city.json") as City[];
        if (code) {
          data = data.filter((item) => item.province_code === code);
        }
        break;
      case "barangays":
        data = readJsonFile("barangay.json") as Barangay[];
        if (code) {
          data = data.filter((item) => item.city_code === code);
        }
        break;
      default:
        return NextResponse.json({ message: "Invalid type parameter" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch data" }, { status: 500 });
  }
}

