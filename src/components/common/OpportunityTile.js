import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import { toastr } from 'react-redux-toastr'
import { Media, Row, Col } from 'reactstrap';
import { OPPORTUNITY_LOGO_MEDIA_URL } from '../../config/constants';
import { displayValue, displayPublishOnDate, convertISOToUtcDate } from '../../helper/util';
import MultipleAddress from '../common/MultipleAddress';
import OpportunityImageModel from '../common/OpportunityImageModel';
import { MESSAGES } from '../../config/message';
import { FREE_PLAN_CODE } from '../../config/constants';
//import "../Opportunities/Opportunities.scss";
//import "../Opportunities/OpportunitiesListing.scss";

class OpportunityTile extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modelData: '',
            isVisible: false,
            isRedirect: false,
        };
    }
    /**
    * @method modelHandler
    * @description called when headshot or profile image is clicked
    */
    modelHandler = (item) => {
        if (item && item !== undefined) {
            this.setState({
                isVisible: true,
                modelData: item
            })
        } else {
            this.setState({
                isVisible: false,
            })
        }
    }
    /**
     * @method onCancel
     * @description called
     */
    onCancel = () => {
        this.setState({
            isVisible: false
        });
    };

    redirectHandler = () => {
        this.setState({
            isRedirect: true
        })
    }
    /**
    * @method saveList
    * @description called for viewer list of user
    */
    saveList = () => {
        if (this.props.userData.planCode === FREE_PLAN_CODE) {
            const toastrConfirmOptions = {
                onOk: () => {
                    this.confirmUpgradeToPlan();
                },
                onCancel: () => console.log('CANCEL: clicked')
            };
            return toastr.confirm(MESSAGES.PURCHASE_PAID_PLAN, toastrConfirmOptions);
        } else {
            this.saveOpportunity(this.props.ListViewData_id)
        }
    }

    /**
    * @method confirmUpgradeToPlan
    * @description  used to navigate setting section plan history  screen
    */
    confirmUpgradeToPlan = () => {
        window.location.assign('/user-subscription-plan');
    }

    /**
    * @method saveOpportunity
    * @description used to save opportunity
    */
    saveOpportunity = (opportuniyId) => {
        this.props.onSavedOpportunity(opportuniyId);
    }
    /**
    * @method renderTagIcon
    * @description used to render tag icon
    */
    renderTagIcon = (bookmarkFlag) => {
        if (bookmarkFlag === true) {
            return (
                <span className="icon-tag-fil"></span>
            );
        } else {
            return (
                <span className="icon-tag"></span>
            );
        }
    };

    isFlagVisible = () => {
        if (this.props.fromDashboard) {
            return (
                <span className="book-flag" >
                    {this.renderTagIcon(this.props.ListViewData.bookMarkFlag)}
                </span>
            )
        } else {
            return (
                <div></div>
            )
        }
    }

    /**
    * @method renderAuditionAddress
    * @description used to render audition address
    */
    renderAuditionAddress = () => {
        if (this.props.opportunityAuditionAddresses && this.props.opportunityAuditionAddresses.length > 0) {
            return this.props.opportunityAuditionAddresses.map((val) => {
                return (
                    <div>
                        <div>{displayValue(val.auditionAddress)}</div>
                    </div>
                );
            });
        } else {
            return <div>N/A</div>;
        }
    }

    /**
    * @method render
    * @description used to render component
    */
    render() {
        const { _id, name, publishedOn,
            typeOfOpportunity, countOfRoles, bookMarkFlag,
            bookMarkDate, companyDetail, opportunitySubType } = this.props.ListViewData;

        const { productionName, opportunityAuditionAddresses, opportunityImage, isShowBookMark, fromDashboard } = this.props;
        const { isVisible } = this.state;
        const profileModelHandeler = {
            uniqueFilename: opportunityImage ? `${OPPORTUNITY_LOGO_MEDIA_URL}${opportunityImage}` : require('../../assests/images/no-image-grays.png'),
        }

        if (this.state.isRedirect) {
            return (
                <Redirect push
                    to={{
                        pathname: `/opportunity-detail/${_id}`,
                        state: {
                            pageName: "opportunities"
                        }
                    }} />
            )
        }
        return (
            <div>
                <Media className="w100 media-main">
                    {this.props.opportunityList.categoryType == 4 ?
                        <Link to={`/applied-opportunity-detail/${_id}`} >
                            <Media left top className="media-img" >
                                <Media object src={opportunityImage ? `${OPPORTUNITY_LOGO_MEDIA_URL}${opportunityImage}` : require('../../assests/images/no-image-grays.png')} className="opportunityImg" />
                                <span className="d-block font-weight-bold text-center mt-3 publish-date-text">{displayPublishOnDate(publishedOn)}</span>
                            </Media>
                        </Link> :
                        <Link to={`/opportunity-detail/${_id}`} >
                            <Media left top className="media-img">
                                <Media object src={opportunityImage ? `${OPPORTUNITY_LOGO_MEDIA_URL}${opportunityImage}` : require('../../assests/images/no-image-grays.png')} className="opportunityImg" />
                                <span className="d-block font-weight-bold text-center mt-3 publish-date-text">{displayPublishOnDate(publishedOn)}</span>
                            </Media>
                        </Link>
                    }
                    <Media body className="ml-4 media-body">
                        <Media heading>
                            <Row>
                                <Col xs="10" md="10" className="title-wrap">
                                    {/* <h3 className="title-main">
                                        <div onClick={() => this.appliedRedirect(_id)}>{name}</div>
                                    </h3> */}
                                    {this.props.opportunityList.categoryType == 4 && (
                                        <h3 className="title-main">
                                            <Link to={`/applied-opportunity-detail/${_id}`} >
                                                {name}
                                            </Link>
                                        </h3>
                                    )}
                                    {this.props.opportunityList.categoryType != 4 && (
                                        <h3 className="title-main">
                                            <Link to={`/opportunity-detail/${_id}`} >
                                                {name}
                                            </Link>
                                            {/* <a href="" onClick={this.redirectHandler}>{name}</a> */}
                                        </h3>
                                    )}
                                </Col>
                                <Col xs="2" md="2" className="text-right action-wrap">
                                    {(this.props.opportunityList.categoryType != 4 && isShowBookMark) ? (
                                        <span className="book-flag" onClick={() => this.saveList(_id)}>
                                            {this.renderTagIcon(bookMarkFlag)}
                                        </span>
                                    ) : (
                                            // <span className="book-flag" >
                                            //     {this.renderTagIcon(bookMarkFlag)}
                                            // </span>
                                            <div>
                                                {this.isFlagVisible()}
                                            </div>
                                        )
                                    }
                                </Col>
                            </Row>
                        </Media>
                        <Row>
                            <Col md="12">
                                <ul className="icon-list-main ">
                                    <li className="multyAddrees">
                                        {/* <span className="icon"><i className="icon-location"></i></span>  */}
                                        <MultipleAddress
                                            opportunityAuditionAddresses={opportunityAuditionAddresses}
                                            companyDetail={companyDetail}
                                        />
                                    </li>
                                    <li className="list-itemtwo">
                                        <span className="icon"><i className="icon-Metromaniacs"></i></span>
                                        <span className="text">{displayValue(typeOfOpportunity)}</span>
                                    </li>
                                    <li>
                                        <span className="icon"><i className="icon-Metromaniacs"></i></span>
                                        <span className="text">{displayValue(opportunitySubType)}</span>
                                    </li>
                                    <li>
                                        <Row className="justify-content-between align-items-center">
                                            <Col>
                                                <span className="icon"><i className="icon-Theatre"></i></span>
                                                <span className="text">
                                                    <span>{displayValue(productionName)}</span>
                                                </span>
                                            </Col>
                                            <Col className="col-3 text-right role-count">
                                                <span ><i className="icon-user-profile"></i>
                                                    {(countOfRoles)}</span>
                                            </Col>
                                        </Row>
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                    </Media>
                </Media>
                {(this.props.opportunityList.categoryType == 3) && (
                    <Row className="post-wrap">
                        <Col md="12" className="posted-section">
                            <Row>
                                <Col md="12" className="value-text">
                                    <span>Bookmarked on:</span> {bookMarkDate ? convertISOToUtcDate(bookMarkDate) : 'N/A'}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                )}
                {isVisible && <OpportunityImageModel
                    onCancel={this.onCancel}
                    modalVisible={isVisible}
                    modelData={this.state.modelData}
                />}
            </div>
        )
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ opportunity, opportunityList, auth }) => {
    const { userData } = auth
    const { loading, opportunityData, opportunityFilter } = opportunity;
    return { opportunityData, loading, opportunityFilter, opportunityList, userData, auth };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, null)(OpportunityTile)
