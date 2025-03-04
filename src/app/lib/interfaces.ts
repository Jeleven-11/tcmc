export interface User {
    // id?: string
    username: string;
    name: string;
    team: number;
    contact_num?: string;
    password: string;
    user_id?: string;
    email?: string;
    emailVerified?: number;
}

export interface Report {
    fullName: string,
    age: number,
    sex: string,
    address: string,
    region: string,
    province: string,
    city: string,
    barangay: string,
    contactNumber: string,
    isOwner: string,
    driversLicense: string,
    vehicleRegistration: string,
    orCr: string,
    reason: string,
    vehicleType: string,
    vehicleImage: string,
    platenumber: string,
    color: string,
    description: string,
    reportID: string,
    status: string,
    remarks: string,
    createdAt: string,
    updatedAt: string,
}

export interface Report_ {
    id: number;
    fullName: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    address: string;
    contactNumber: string;
    isOwner: 'Yes' | 'No';
    vehicleType: 'Motorcycle' | 'Car' | 'Van' | 'Truck' | 'Other';
    platenumber?: string | null;
    status: 'unread' | 'on investigation' | 'dropped' | 'solved';
    createdAt: string;
}

export interface loginInput {
    inp: string,
    password: string
  }

export interface _PushSubscription {
    keys: {
      p256dh: string
      auth: string
    };
  }
  
export interface Subscribers {
    auth: string | ""
    data: string | ""
}

export interface UpdateReportRequestBody {
    id?: string;
    vehicle_type: string;
    vehicle_color: string;
    plate_number: string;
    incurred_violations: string;
    image_upload: string;
    userId: number;
}