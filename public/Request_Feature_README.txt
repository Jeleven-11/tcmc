Table: homepage_data

Column Name		Data Type				Description
id			INT (Primary Key, Auto Increment)	Unique identifier forthe homepage data.
welcome_message		TEXT					The welcome message displayed on the homepage.
learn_more_text		VARCHAR(255)				Text for the "Learn More" button.
report_issue_text	VARCHAR(255)				Text for the "Report an Issue" button.
homepage_image		VARCHAR(255)				Image path or URL for the homepage banner.


Table: faq_data
Column Name		Data Type				Description
id			INT (Primary Key, Auto Increment)	Unique identifier for each FAQ.
question		TEXT					The FAQ question.
answer			TEXT					The corresponding answer.


CREATE TABLE homepage_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    welcome_message TEXT NOT NULL,
    learn_more_text VARCHAR(255) NOT NULL,
    report_issue_text VARCHAR(255) NOT NULL,
    homepage_image VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE faq_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Dynamic fetching data homepage--------
"src/pages/api/homepage.ts"

import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const connection = await getConnection();

  try {
    if (req.method === 'GET') {
      const [rows] = await connection.execute('SELECT * FROM homepage LIMIT 1');
      return res.status(200).json(rows[0] || {});
    }

    if (req.method === 'PUT') {
      const { welcomeMessage, learnMoreText, reportIssueText, homepageImage } = req.body;

      await connection.execute(
        `UPDATE homepage SET 
         welcomeMessage = ?, learnMoreText = ?, 
         reportIssueText = ?, homepageImage = ? WHERE id = 1`,
        [welcomeMessage, learnMoreText, reportIssueText, homepageImage]
      );

      return res.status(200).json({ message: 'Homepage updated successfully' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.release();
  }
}

----home page end--------

----FAQ CRUD begin------
src/pages/api/faq.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const connection = await getConnection();

  try {
    if (req.method === 'GET') {
      const [rows] = await connection.execute('SELECT * FROM faq ORDER BY id ASC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { question, answer } = req.body;

      await connection.execute('INSERT INTO faq (question, answer) VALUES (?, ?)', [question, answer]);

      return res.status(201).json({ message: 'FAQ added successfully' });
    }

    if (req.method === 'PUT') {
      const { id, question, answer } = req.body;

      await connection.execute('UPDATE faq SET question = ?, answer = ? WHERE id = ?', [question, answer, id]);

      return res.status(200).json({ message: 'FAQ updated successfully' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      await connection.execute('DELETE FROM faq WHERE id = ?', [id]);

      return res.status(200).json({ message: 'FAQ deleted successfully' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    connection.release();
  }
}

------faq end ------

-------updated homebody.tsx to dynamically fetch data --------
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HomepageData {
  welcomeMessage: string;
  learnMoreText: string;
  reportIssueText: string;
  homepageImage: string;
}

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
            <li>Fill out the report form on our website. (Complete details mean faster verification)</li>
            <li>Submit the report and wait for confirmation.</li>
            <li>Follow up via the given report ID.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

const Homebody = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const res = await fetch('/api/homepage');
        const data = await res.json();
        setHomepageData(data);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      }
    };

    fetchHomepageData();
  }, []);

  if (!homepageData) {
    return <p className="text-center">Loading homepage content...</p>;
  }

  return (
    <section className="bg-gray-100 text-gray-800 py-12">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-blue-900">{homepageData.welcomeMessage}</h1>
          <p className="text-lg leading-relaxed mb-6">
            Our mission is to serve and protect the community, ensuring safety and justice for all.
            This platform is your gateway to staying up-to-date with road updates. Want to file a report
            regarding vehicle-related incidents? Click below.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-200"
            >
              {homepageData.learnMoreText}
            </button>
            <Link href="/file-report" className="px-6 py-2 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200">
              {homepageData.reportIssueText}
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-64 md:h-96">
          <Image
            src={homepageData.homepageImage || '/pnp.jpg'}
            alt="Homepage Image"
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


------dynamic homebody end ------

-----dynamic faq start-------

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQAccordion: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch('/api/faq');
        const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFAQs();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="accordion-collapse" className="w-full mx-auto mt-6 mb-4">
      {faqs.length === 0 ? (
        <p className="text-center text-gray-600">No FAQs available.</p>
      ) : (
        faqs.map((faq, index) => (
          <div key={faq.id} className="text-left mb-2">
            <h2 id={`accordion-collapse-heading-${index}`}>
              <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-gray-900 border border-b-0 border-gray-200 focus:ring-4 focus:ring-gray-200 dark:text-gray-900 hover:bg-gray-100 gap-3"
                onClick={() => toggleAccordion(index)}
                aria-expanded={openIndex === index}
                aria-controls={`accordion-collapse-body-${index}`}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
            </h2>
            <div
              id={`accordion-collapse-body-${index}`}
              className={`${openIndex === index ? 'block' : 'hidden'}`}
              aria-labelledby={`accordion-collapse-heading-${index}`}
            >
              <div className="p-5 border border-b-0 border-gray-200">
                <p className="mb-2 text-gray-900 dark:text-gray-900">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FAQAccordion;


------dynamic faq end --------


------new page start -------
admin/homepage-editor

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { Input, Button, Textarea } from "@mui/material";

interface HomepageData {
  welcomeMessage: string;
  learnMoreText: string;
  reportIssueText: string;
  homepageImage: string;
}

const HomepageEditor = () => {
  const [data, setData] = useState<HomepageData>({
    welcomeMessage: "",
    learnMoreText: "",
    reportIssueText: "",
    homepageImage: "",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/homepage");
        setData(response.data);
      } catch (error) {
        toast.error("Failed to fetch homepage data");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/homepage", data);
      toast.success("Homepage updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update homepage");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Homepage Editor</h1>

      <label className="block text-sm font-medium text-gray-700">Welcome Message</label>
      <Textarea name="welcomeMessage" value={data.welcomeMessage} onChange={handleChange} className="w-full mb-4" />

      <label className="block text-sm font-medium text-gray-700">Learn More Button Text</label>
      <Input name="learnMoreText" value={data.learnMoreText} onChange={handleChange} fullWidth className="mb-4" />

      <label className="block text-sm font-medium text-gray-700">Report Issue Button Text</label>
      <Input name="reportIssueText" value={data.reportIssueText} onChange={handleChange} fullWidth className="mb-4" />

      <label className="block text-sm font-medium text-gray-700">Homepage Image URL</label>
      <Input name="homepageImage" value={data.homepageImage} onChange={handleChange} fullWidth className="mb-4" />

      <Button variant="contained" color="primary" onClick={handleSave}>Save Changes</Button>
    </div>
  );
};

export default HomepageEditor;


-----end---------



