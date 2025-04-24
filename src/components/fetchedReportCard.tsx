import React from 'react';
import { Card, Image } from 'antd';
import { Report } from '@/app/lib/interfaces';

interface Props {
  report: Report;
}

const ReportCard: React.FC<Props> = ({ report }) => {
  return (
    <Card title={`Report ID: ${report.reportID}`} className="shadow-md rounded-lg">
      
<p><strong>Status:</strong> {report.status}</p>
<p><strong>Reported On:</strong> {report.createdAt}</p>
<p><strong>Vehicle Type:</strong> {report.vehicleType}</p>
<p><strong>Plate Number:</strong> {report.platenumber}</p>
<p><strong>Color:</strong> {report.color}</p>
<p><strong>Reason:</strong> {report.reason}</p>

      {/* Image Preview */}
      {report.reportedVehicleImage && (
        <Image
          width={200}
          alt="Reported Vehicle"
          src={report.reportedVehicleImage}
          placeholder={
            <Image
              preview={false}
              alt="Reported Vehicle"
              src={report.reportedVehicleImage}
              width={200}
            />
          }
        />
      )}
    </Card>
  );
};

export default ReportCard;
