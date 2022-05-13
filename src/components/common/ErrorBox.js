import React from 'react'

export function Errorbox(props) {
    const { customClass, errorText, goToTopID } = props;
    return (
        <>
            <div id={goToTopID} className={`error_box ${customClass}`}>{errorText}</div>
        </>
    )
}
