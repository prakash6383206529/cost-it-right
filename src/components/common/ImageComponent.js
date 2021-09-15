import React, { Component } from 'react';

/**
 * Advisable not to put this spinner inside native base content or some scrolling item
 */
export default class ImageComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: true,
        };
    }

    onEnd = () => {
        this.setState({ loader: false }, () => {
        });
    };

    render() {
        return (
            <div>
                {this.state.loader &&
                    <div animating={true} size='large' color='#FFC30D' />
                }
                <img src={(this.props.source) ? this.props.source : require('../../assests/images/no-image-gray.png')}
                    onLoad={this.onEnd}
                />
            </div>
        );
    }
}
