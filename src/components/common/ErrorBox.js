import React from 'react'

export function Errorbox(props) {
    const {customClass,errorText} = props;    
    return (
        <>
            <div className={`error_box ${customClass}`}>{errorText}</div>
        </>
    )
}
