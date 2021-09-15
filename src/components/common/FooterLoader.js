import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

/* loader component  */
export class FooterLoader extends Component {
    render() {
        return (
            <div className="w-100">
                <div className="text-center m-auto w-25 mt-2">
                    <Spinner style={{color:'#f6c30f'}}  />
                </div>
            </div>
        )
    }
}