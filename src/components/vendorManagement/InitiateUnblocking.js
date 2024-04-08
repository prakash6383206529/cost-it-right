import React, { useState, useEffect } from 'react';

const InitiateUnblocking = () => {
    const [approvals, setApprovals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading data from an API
        const fetchData = async () => {
            try {
                // Simulate API request delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Example approval data
                const approvalData = [
                    { id: 1, name: 'Approval 1' },
                    { id: 2, name: 'Approval 2' },
                    { id: 3, name: 'Approval 3' },
                ];
                setApprovals(approvalData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Approval Listing</h2>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <ul>
                    {approvals.map(approval => (
                        <li key={approval.id}>{approval.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InitiateUnblocking;
