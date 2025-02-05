import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ContactModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-2xl p-6 w-96 shadow-xl border border-green-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-700">Contact & Report Info</h2>
          <button onClick={onClose} className="text-green-700 hover:text-green-900">
            <X size={24} />
          </button>
        </div>
        <div className="text-gray-700">
          <p><strong>Address:</strong> J.Luna St, Tangub City, Misamis Occidental, 7214</p>
          <p><strong>Email:</strong> cgo.tangubcity@gmail.com</p>
          <p><strong>Phone:</strong> (+639) 10-785-9787</p>
          <hr className="my-3 border-green-300" />
          <h3 className="text-green-600 font-medium">Steps to File a Report:</h3>
          <ul className="list-disc list-inside text-sm">
            <li>Gather all necessary details and evidence.</li>
            <li>Fill out the report form on our website.(complete details means faster verification)</li>
            <li>Submit the report and wait for confirmation.</li>
            <li>Follow up via given report ID.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

const Homebody = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-gray-100 text-gray-800 py-12">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-blue-900">Welcome!</h1>
          <p className="text-lg leading-relaxed mb-6">
            Our mission is to serve and protect the community, ensuring safety and justice for all. 
            This platform is your gateway in staying up-to-date with road updates. Want to file a report
            regarding vehicle-related incidents? Click below
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-200"
            >
              Learn More
            </button>
            <Link href="/file-report" className="px-6 py-2 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200">
              Report an Issue
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-64 md:h-96">
          <Image
            src="/pnp.jpg"
            alt="logo"
            layout="fill"
            className="rounded-lg shadow-md logo-image"
          />
        </div>
      </div>
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Homebody;
