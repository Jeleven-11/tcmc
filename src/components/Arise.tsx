'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BadgeCheck } from 'lucide-react';
import { FaRegAddressBook } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

const ActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const { data } = await axios.get('/api/active-users');
                setActiveUsers(data);
            } catch (error) {
                console.error('Error fetching active users', error);
            }
        };

        fetchActiveUsers();
        const interval = setInterval(fetchActiveUsers, 5000); // Refresh every 5 sec

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Button to Open Modal */}
            <button onClick={() => setIsModalOpen(true)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100">
                <FaRegAddressBook size={22} />
            </button>

            {/* Modal Popup */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)} // Close modal when clicking outside
                    >
                        {/* Modal Content */}
                        <motion.div 
                            className="bg-white rounded-lg shadow-lg p-6 w-80"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        >
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                            >
                                ✕
                            </button>

                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Active Users</h2>
                            <ul>
                                {activeUsers.length > 0 ? (
                                    activeUsers.map((userID) => (
                                        <li key={userID} className="flex items-center gap-2 text-gray-700 mb-2">
                                            <BadgeCheck className="text-green-500" size={16} />
                                            <span>User {userID}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No active users</p>
                                )}
                            </ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ActiveUsers;
