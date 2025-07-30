import React, { useState } from 'react';

function CustomJumpPagination({ totalPages, onPageChange }) {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        onPageChange?.(page);
    };

    const renderPageButtons = () => {
        const delta = 2; // Number of page buttons to show on either side of the current page
        const pageButtons = [];

        if (totalPages <= 7) {
            // Show all buttons if total pages are less than or equal to 7
            for (let i = 1; i <= totalPages; i++) {
                pageButtons.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={currentPage === i ? 'active' : ''}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            let startingButton, endingButton;

            if (currentPage <= delta + 1) {
                // Left bound
                startingButton = 1;
                endingButton = 2 * delta + 1;
            } else if (currentPage >= totalPages - delta) {
                // Right bound
                startingButton = totalPages - 2 * delta;
                endingButton = totalPages;
            } else {
                // Middle
                startingButton = currentPage - delta;
                endingButton = currentPage + delta;
            }

            // Render page buttons with ellipsis
            pageButtons.push(
                <button key={1} onClick={() => handlePageChange(1)}>
                    1
                </button>
            );

            if (startingButton > 2) {
                pageButtons.push(
                    <span key="el1">...</span>
                );
            }

            for (let i = startingButton; i <= endingButton; i++) {
                pageButtons.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={currentPage === i ? 'active' : ''}
                    >
                        {i}
                    </button>
                );
            }

            if (endingButton < totalPages) {
                pageButtons.push(
                    <span key="el2">...</span>
                );
            }

            if (endingButton < totalPages - 1) {
                pageButtons.push(
                    <button key={totalPages} onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </button>
                );
            }
        }

        return pageButtons;
    };

    return (
        <div className="pagination">
            {renderPageButtons()}
        </div>
    );
};
export default CustomJumpPagination
