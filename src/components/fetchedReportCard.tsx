import React, { useState } from 'react';
import { Card, Button } from 'antd';
import Image from 'next/image';

const { Meta } = Card;

interface Report {
  reportID: string;
  createdAt: string;
  status: string;
  vehicleType: string;
  color: string;
  reason: string;
  driversLicense?: string;
}

interface ReportCardProps {
  report: Report;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const [imageVisible, setImageVisible] = useState(false);

  const toggleImage = () => {
    setImageVisible(!imageVisible);
  };

  return (
    <Card
      hoverable
      style={{ width: 350 }}
      className="shadow-md"
    >
      <Meta
        title={`Report ID: ${report.reportID}`}
        description={`Submitted On: ${new Date(report.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} ${new Date(report.createdAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`}
      />
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Vehicle Type:</strong> {report.vehicleType}</p>
      <p><strong>Color:</strong> {report.color}</p>
      <p><strong>Reason:</strong> {report.reason}</p>

      {/* Image Toggle */}
      {report.driversLicense && (
        <div className="mt-4">
          <Button onClick={toggleImage} type="primary">
            {imageVisible ? 'Hide Image' : 'Load Image'}
          </Button>

          {imageVisible && (
            <div className="mt-2">
              <Image
                src={report.driversLicense}
                alt="Report Image"
                width={300}
                height={200}
                className="rounded-lg"
                priority={false}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ReportCard;
