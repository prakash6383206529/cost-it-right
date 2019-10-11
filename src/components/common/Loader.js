import React, { Component } from 'react';
import './Loader.scss';

/* Loader Image  */
export const loaderImage = '../../images/loading.gif';

/* loader component  */
export class Loader extends Component {
    render() {
        return (
            <div className="sf-cstm-loader d-flex align-content-center flex-direction-column">
                <div className="loader-position spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                {this.props.showMessage && 
                <div className="loader-wait-text">
                    <p>Please wait...</p>
                    <p>Do not press back button we are processing your payment.</p>
                </div>
                }
            </div>
        )
    }
}