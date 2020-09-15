import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getMenuByUser, getLeftMenu, } from "../../actions";
import { checkForNull, loggedInUserId } from '../../helper';
import { reactLocalStorage } from "reactjs-localstorage";

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    UNSAFE_componentWillMount() {
        this.props.getMenuByUser(loggedInUserId(), () => {
            const { menusData } = this.props;
            if (menusData !== undefined) {
                reactLocalStorage.set('ModuleId', menusData[0].ModuleId);
                this.props.getLeftMenu(menusData[0].ModuleId, loggedInUserId(), (res) => { })
            }
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div className="dashboard-top">
                {/* {(this.props.loading || this.state.showLoader) && <Loader />} */}
                {/* <Row>
                    <Col> */}
                <div>
                    <div className="row">
                        <div className="col-md-12">
                            <h2 className="text-success bdr-bottom">Dashboard</h2>
                        </div>
                    </div>
                    <div className="row process">
                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-blue order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <p className="f-left">
                                        <span
                                            className="f-32 d-b">{checkForNull(15)}</span><span
                                                className="f-18 d-b">Submitted</span>
                                    </p>
                                    <p className="f-right text-right">
                                        {/* <img
                                            src=""
                                            alt="Submitted" /> */}
                                        <span className="f-18 d-b m-t-15"><i
                                            className="fa fa-inr"></i> {checkForNull(14)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-green order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <p className="f-left">
                                        <span
                                            className="f-32 d-b">{checkForNull(2)}</span><span
                                                className="f-18 d-b">Finance Approved</span>
                                    </p>
                                    <p className="f-right text-right">
                                        {/* <img
                                            src=""
                                            alt="Submitted" /> */}
                                        <span className="f-18 d-b m-t-15"><i
                                            className="fa fa-inr"></i>{checkForNull(33)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-pink order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <p className="f-left">
                                        <span
                                            className="f-32 d-b">{checkForNull(43)}</span><span
                                                className="f-18 d-b">Rejected</span>
                                    </p>
                                    <p className="f-right text-right">
                                        {/* <img
                                            src=""
                                            alt="Submitted" /> */}
                                        <span className="f-18 d-b m-t-15"><i
                                            className="fa fa-inr"></i>{checkForNull(32)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-yellow order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <div className="row">
                                        <div className="col-md-6 col-xl-6">
                                            <p className="f-left">
                                                <span
                                                    className="f-32 d-b">{checkForNull(55)}</span><span
                                                        className="f-18 d-b">Pending With<br />First Level</span>
                                            </p>
                                        </div>
                                        <div className="col-md-6 col-xl-6">
                                            <p className="f-right text-right">
                                                {/* <img
                                                    src=""
                                                    alt="Submitted" /> */}
                                                <span className="f-18 d-b m-t-15"><i
                                                    className="fa fa-inr"></i>{checkForNull(27)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-yellow order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <div className="row">
                                        <div className="col-md-6 col-xl-6">
                                            <p className="f-left">
                                                <span
                                                    className="f-32 d-b">{checkForNull(32)}</span><span
                                                        className="f-18 d-b">Pending<br />With Finance</span>
                                            </p>
                                        </div>
                                        <div className="col-md-6 col-xl-6">
                                            <p className="f-right text-right">
                                                {/* <img
                                                    src=""
                                                    alt="Submitted" /> */}
                                                <span className="f-18 d-b m-t-15"><i
                                                    className="fa fa-inr"></i>{checkForNull(12)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-lite-green order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <div className="row">
                                        <div className="col-md-6 col-xl-6">
                                            <p className="f-left">
                                                <span
                                                    className="f-32 d-b">{checkForNull(32)}</span><span
                                                        className="f-18 d-b">Resubmission From<br />First Level</span></p>
                                        </div>
                                        <div className="col-md-6 col-xl-6">
                                            <p className="f-right text-right">
                                                {/* <img
                                                    src=""
                                                    alt="Submitted" /> */}
                                                <span className="f-18 d-b m-t-15"><i
                                                    className="fa fa-inr"></i>{checkForNull(23)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-blue order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <p className="f-left">
                                        <span
                                            className="f-32 d-b">{checkForNull(11)}</span><span
                                                className="f-18 d-b">Seek Info From<br /> First Level</span>
                                    </p>
                                    <p className="f-right text-right">
                                        {/* <img
                                            src=""
                                            alt="Submitted" /> */}
                                        <span className="f-18 d-b m-t-15"><i
                                            className="fa fa-inr"></i> {checkForNull(12)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-xl-4">
                            <div className="card bg-c-blue order-card">
                                <div className="card-block p-t-20 p-b-5">
                                    <p className="f-left">
                                        <span
                                            className="f-32 d-b">{checkForNull(22)}</span><span
                                                className="f-18 d-b">Seek Info<br />From Finance</span>
                                    </p>
                                    <p className="f-right text-right">
                                        {/* <img
                                            src=""
                                            alt="Submitted" /> */}
                                        <span className="f-18 d-b m-t-15"><i
                                            className="fa fa-inr"></i> {checkForNull(32)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* </Col>
                </Row> */}
            </div >
        );
    }
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
    const { menusData, leftMenuData } = auth
    return { menusData, leftMenuData }
}

export default connect(mapStateToProps,
    {
        getMenuByUser,
        getLeftMenu,
    }
)(Dashboard);

