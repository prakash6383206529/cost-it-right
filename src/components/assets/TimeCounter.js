import React, { Component } from 'react';
import Moment from 'moment';

class RemainingTimeCounter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remainingTimeInMinutes: ''
        };
    }

    getRemainingTime() {
        const currentTimeObject = Moment();
        const offTimeObject = Moment(this.props.offTime);
        return offTimeObject.diff(currentTimeObject, 'minutes');
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.setState({
            remainingTimeInMinutes: this.getRemainingTime()
        }, () => {
            this.interval = setInterval(() => {
                this.timeInterval();
            }, 30000)
        })
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    /**
    * @method timeInterval
    * @description used to trigger a state change and therefore a refresh
    */
    timeInterval = () => {
        const newRemainingTimeInMinutes = this.getRemainingTime();
        if (newRemainingTimeInMinutes !== this.state.remainingTimeInMinutes) {
            this.setState({
                remainingTimeInMinutes: newRemainingTimeInMinutes,
            })
        }
    }

    /**
    * @method showTimeInHoursAndMinute
    * @description used to convert the min time in hour time (hh:mm)
    */
    showTimeInHoursAndMinute = (remainingTimeInMinutes) => {
        return Moment().startOf('day').add(remainingTimeInMinutes, 'minutes').format('hh:mm');
    }

    /**
    * @method remainingTimeCounter
    * @description used to display the remaining time of light off in list of devices by hours and mins
    */
    remainingTimeCounter = () => {
        const remainingTimeInMinutes = this.getRemainingTime();
        if (remainingTimeInMinutes >= 60) {
            return <span>{this.showTimeInHoursAndMinute(remainingTimeInMinutes)} Hour(s) Remaining</span>;
        } else if (remainingTimeInMinutes < 60 && remainingTimeInMinutes > 0) {
            return <span>{`${remainingTimeInMinutes} Min(s) Remaining`}</span>;
        } else if (remainingTimeInMinutes === 0) {
            return <span>Few Seconds Remaining</span>;
        } else {
            return null;
        }
    }

    /**
     * @method render
     * @description render the remaining time in device listing
     */
    render() {
        return (
            this.remainingTimeCounter()
        );
    }
}

export default RemainingTimeCounter;
