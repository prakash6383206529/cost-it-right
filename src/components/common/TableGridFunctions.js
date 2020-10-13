import React from 'react';

export const GridTotalFormate = ({ start, to, total }) => {
    return (
        <p style={{ color: 'blue' }}>
            Showing {start}-{to} of {total}
        </p>
    )
}