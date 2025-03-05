'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BadgeCheck } from 'lucide-react';

const ActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState<number[]>([]);

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
        <div className="p-4 bg-white rounded-lg shadow-md w-full">
            <h2 className="text-lg font-semibold mb-3">Active Now</h2>
            <ul>
                {activeUsers.length > 0 ? (
                    activeUsers.map((userID) => (
                        <li key={userID} className="flex items-center gap-2 mb-2">
                            <BadgeCheck className="text-green-500" size={16} />
                            <span>User {userID}</span>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500">No active users</p>
                )}
            </ul>
        </div>
    );
};

export default ActiveUsers;
