// TourWrapper.js
import React, { useEffect, useState } from "react";
import { Steps, Hints } from "intro.js-react";
import 'intro.js/introjs.css';
import { useSelector } from "react-redux";
import Button from "../../layout/Button";
import { GUIDE_BUTTON_SHOW } from "../../../config/constants";

const TourButton = ({ onClick, showTour, buttonSpecificProp }) => {
    const { id, className } = buttonSpecificProp;

    return (
        <Button
            id={id + "_Guide"}
            variant={"ml-2"}
            className={`guide-bulb${showTour ? "-on" : ""} ${GUIDE_BUTTON_SHOW ? "" : "d-none"} ${className}`}
            onClick={onClick}
            title='Guide'
        />
    );
};

const GuidedSteps = ({ showTour, onExit, steps, hints, initialHintEnable, onChange, onComplete, stepsSpecificProp }) => {
    const [hintEnable, setHintsEnabled] = useState(!showTour)
    useEffect(() => {
        setHintsEnabled(!showTour)
    }, [showTour])
    return (
        <>
            {showTour && <Steps
                enabled={stepsSpecificProp.start ?? showTour}
                steps={stepsSpecificProp.steps ? stepsSpecificProp.steps : []}
                onExit={onExit ?? (() => { })}
                initialStep={0}
                options={{ hideNext: false, hidePrev: true, doneLabel: 'Got it', skipLabel: 'Skip', }}
                onComplete={onComplete ?? (() => { })}
                onChange={onChange ?? (() => { })}
            />}
            {hintEnable && <Hints enabled={initialHintEnable} hints={hints ? hints : []} onClose={() => setHintsEnabled(false)} options={{ tooltipClass: 'hint-tooltip' }} />}
        </>
    );
};

const TourWrapper = ({ buttonSpecificProp, stepsSpecificProp }) => {
    const tourStartData = useSelector(state => state.comman.tourStartData);
    const [showTour, setShowTour] = useState(false);
    const [hintEnable, setHintEnable] = useState(false)

    const handleClick = () => {
        buttonSpecificProp.onClick && buttonSpecificProp.onClick();
        setShowTour(!showTour);
    };
    useEffect(() => {
        setShowTour(tourStartData.showTour);
    }, [tourStartData.showTour])
    const onExit = () => {
        if (stepsSpecificProp.onExit) {
            stepsSpecificProp.onExit()
        }
        setShowTour(false);
        setHintEnable(true)
    }

    return (
        <>
            <TourButton
                onClick={handleClick}
                showTour={showTour}
                buttonSpecificProp={buttonSpecificProp}
            />
            <GuidedSteps
                showTour={showTour}
                onExit={onExit}
                steps={stepsSpecificProp.steps}
                hints={stepsSpecificProp.hints}
                initialHintEnable={hintEnable}
                onChange={stepsSpecificProp.onChange}
                onComplete={stepsSpecificProp.onComplete}
                stepsSpecificProp={stepsSpecificProp}
            />
        </>
    );
};

export default TourWrapper;