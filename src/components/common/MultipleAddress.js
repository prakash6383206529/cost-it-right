
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'reactstrap';
import { displayValue, formatAddress } from '../../helper/util';

class MultipleAddress extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showMoreAddress: false,
            buttonRow: 'Show More'
        };
    }

    onClick = () => {
        if (this.state.showMoreAddress) {
            this.setState({
                showMoreAddress: !this.state.showMoreAddress,
                buttonRow: 'Show More'
            });
        } else {
            this.setState({
                showMoreAddress: !this.state.showMoreAddress,
                buttonRow: 'Hide'
            });
        }
    }


    renderAddress = () => {
        const { opportunityAuditionAddresses } = this.props;
        const addressCount = (opportunityAuditionAddresses && opportunityAuditionAddresses != 'undefined') ? opportunityAuditionAddresses.length : '';
        let showAddressCount = 1;
        if (addressCount >= 1) {
            if (this.state.showMoreAddress === false) {
                return (
                   <div className="exapnd-address"><span className="icon"><i className="icon-location"></i></span>
                  <span className="text">{displayValue(this.props.opportunityAuditionAddresses[0].auditionAddress)}</span> 
                   </div>
                );
            } else {
                return this.props.opportunityAuditionAddresses.map((val, index) => {
                    return (
                        <ul className="list-unstyled">
                            <li key={index}>
                            <span className="icon"><i className="icon-location"></i></span>
                                <span className="text">{displayValue(val.auditionAddress)}</span>
                            </li>

                        </ul>
                    );
                });
            }
        } else {
            let companyDetail = 'N/A';
            if (this.props.companyDetail !== '' && this.props.companyDetail !== undefined && this.props.companyDetail.address && this.props.companyDetail.city && this.props.companyDetail.state && this.props.companyDetail.country) {
                companyDetail = formatAddress(this.props.companyDetail.address, this.props.companyDetail.city, this.props.companyDetail.state, this.props.companyDetail.country, this.props.companyDetail.zipCode);
            }

            return (
               
                        <div>
                        <span className="icon"><i className="icon-location"></i></span>
                        <span className="text">{companyDetail}</span>
                        </div>
                  
            );
        }
    }

    render() {
        const { opportunityAuditionAddresses } = this.props;
        const addressCount = (opportunityAuditionAddresses && opportunityAuditionAddresses != 'undefined') ? opportunityAuditionAddresses.length : '';
        const remainingCount = addressCount - 1;
        return (
            <div >
                {this.renderAddress()}
                    {(this.state.showMoreAddress == false && addressCount > 1) && (
                        <div className="more-address-link font-weight-bold" onClick={this.onClick}>
                            {remainingCount} more address
                        </div>
                    )}
                    {this.state.showMoreAddress == true && (
                        <div className="more-address-link font-weight-bold" onClick={this.onClick}>
                            {this.state.buttonRow}
                        </div>
                    )}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ opportunity }) => {
    const { loading, opportunityData, opportunityFilter } = opportunity;
    return { opportunityData, loading, opportunityFilter };
};

export default connect(mapStateToProps, null)(MultipleAddress);
