import React, { Component } from 'react';

export default class Back extends Component {

    goBack = () => {
        this.props.history.goBack();
    }

    render() {
        return (
            <span
                className="back-link "
                onClick={this.goBack}
            >
                <span className=" icon-back-icon" />
                Back
            </span>
        )
    }
}