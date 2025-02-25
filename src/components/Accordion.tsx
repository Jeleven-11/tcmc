'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs = [{ question: 'What is the most important field in the form to be filled?', 
    answer: 'Next.js is a React framework that enables server-side rendering and static site generation for React applications.' }] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="accordion-collapse" className="w-full mx-auto mt-6 mb-4">
      {faqs.map((faq, index) => (
        <div key={index} className="text-left mb-2">
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
      ))}
    </div>
  );
};

export default FAQAccordion;
