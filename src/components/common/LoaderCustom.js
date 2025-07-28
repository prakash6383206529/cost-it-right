import React from 'react';
// import './Loadercustom.scss';

/* Loader Image  */
export const gearLoader = '../../images/loader.gif';

const LoaderCustom = (props) => {
    return (
        <>
            {/* loader without image   (we can use loader-01 - loader-20 just chnge class below) */}
            {/* <div className="loader_container">
                <div className="loaderinner">
                    <div className="loader-01"></div>
                </div>
            </div> */}


            {/* loader with image */}
            <div className={`loader_container ${props?.customClass || ''}`}>
                <div className="loaderinner">
                    <img className="img_loader" src={gearLoader} alt="CIR" />
                </div>
                {props?.message && <div className='message'>{props?.message}</div>}
            </div>
        </>
    )
}

export default LoaderCustom;
