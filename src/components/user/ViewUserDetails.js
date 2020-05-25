import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { getAllLevelAPI, deleteUserLevelAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../common/HeaderTitle';

class ViewUserDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
        }
    }

    componentDidMount() {

    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.props.closeUserDetails()
    };


    /**
    * @method render
    * @description Renders the component
    */
    render() {

        return (
            <>
                {this.props.loading && <Loader />}
                <Drawer anchor={'right'} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <Row>
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{`User Details`}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6">
                                    <HeaderTitle
                                        title={'Personal Details:'}
                                        customClass={'Personal-Details'} />
                                </Col>
                                <Col md="6">
                                    <button
                                        className={'user-btn'}
                                        type="button"><div className={'edit-icon'}></div>EDIT DETAILS</button>
                                </Col>
                            </Row>
                        </div>
                    </Container>
                </Drawer>
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { loading } = auth;

    return { loading };
}


export default connect(mapStateToProps,
    {

    })(ViewUserDetails);

