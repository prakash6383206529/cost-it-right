import React, { useState } from "react"
import { Steps, Hints } from "intro.js-react";
import 'intro.js/introjs.css';
import { useSelector } from "react-redux";
import { useEffect } from "react";

function TourWrapper(props) {
    const [stepsEnabled, setStepsEnabled] = useState(false);      // HERE WE DO HANDLE THE STATE CLICK ON THE TOUR BUTTON 

    const [hintsEnabled, setHintsEnabled] = useState(props.initialHintEnable);
    const tourStartData = useSelector(state => state.comman.tourStartData);
    const onExit = (data) => {
        if (props.onExit) {
            props.onExit()
        }
        setStepsEnabled(false)
        setHintsEnabled(true)
    }

    const onChange = (e) => {
    }
    return <>
        <Steps
            enabled={props.start}
            steps={props.steps ? props.steps : []}
            onExit={onExit}
            initialStep={0}
            options={{ hideNext: false, hidePrev: true, doneLabel: 'Got it', skipLabel: 'Skip', }}
            onComplete={props.onComplete ?? null}
            onChange={props.onChange ?? onChange}
        />
        <Hints enabled={hintsEnabled} hints={props.hints ? props.hints : []} onClose={() => setHintsEnabled(false)} options={{ tooltipClass: 'hint-tooltip' }} />
    </>
}

export default TourWrapper;