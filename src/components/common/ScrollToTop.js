
import React, { useEffect, useState } from 'react'

import { Link } from 'react-scroll';

function ScrollToTop(props) {
    const { pointProp } = props
    const [opacity, setOpacity] = useState('none')
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.onscroll = () => {
                let currentScrollPos = window.pageYOffset;
                let maxScroll = document?.body?.scrollHeight - window?.innerHeight;
                if (currentScrollPos > 0 && currentScrollPos <= maxScroll) {
                    setOpacity("block");
                }
                else {
                    setOpacity("none")
                }
            }
        }
    }, [])
    return (
        <>
            <Link to={pointProp} spy={true} offset={-250}><button type="button" style={{ display: `${opacity}` }} className={'goToTop mr5 mt-1'}><div className={'go-to-top mr-0'}></div></button></Link>
        </>
    )
}

export default ScrollToTop;
