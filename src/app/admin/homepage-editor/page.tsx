"use client";

import React from "react";

const HomepageEditor: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-500 mb-4">Homepage Editor</h1>
        <p className="text-gray-700">
          Implementation is in the public - <strong>Request_Feature_README.txt</strong>
        </p>
      </div>
    </div>
  );
};

export default HomepageEditor;
