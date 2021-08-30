import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddBOPDomestic from './AddBOPDomestic';
import AddBOPImport from './AddBOPImport';
import BOPDomesticListing from './BOPDomesticListing';
import BOPImportListing from './BOPImportListing';
import InsightsBop from './InsightsBop';
import { BOP, MASTERS } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import SOBListing from './SOBListing';

class BOPMaster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      isBOPDomesticForm: false,
      isBOPImportForm: false,
      data: {},

      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      BulkUploadAccessibility: false,
      DownloadAccessibility: false,
    }
  }

  componentDidMount() {
    this.applyPermission(this.props.topAndLeftMenuData)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
      this.applyPermission(nextProps.topAndLeftMenuData)
    }
  }

  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === MASTERS);
      const accessData = Data && Data.Pages.find(el => el.PageName === BOP)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        this.setState({
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
          DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
        })
      }
    }
  }

  /**
  * @method toggle
  * @description toggling the tabs
  */
  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  /**
  * @method displayDomesticForm
  * @description DISPLAY BOP DOMESTIC FORM
  */
  displayDomesticForm = () => {
    this.setState({ isBOPDomesticForm: true, isBOPImportForm: false, data: {} })
  }

  /**
  * @method displayImportForm
  * @description DISPLAY BOP IMPORT FORM
  */
  displayImportForm = () => {
    this.setState({ isBOPDomesticForm: false, isBOPImportForm: true, data: {} })
  }

  /**
  * @method hideForm
  * @description HIDE DOMESTIC AND IMPORT FORMS
  */
  hideForm = () => {
    this.setState({ isBOPDomesticForm: false, isBOPImportForm: false, data: {} })
  }

  /**
  * @method getDetails
  * @description GET DETAILS FOR DEOMESTIC FORM
  */
  getDetails = (data) => {
    this.setState({ isBOPDomesticForm: true, data: data })
  }

  /**
  * @method getImportDetails
  * @description GET DETAILS FOR IMPORT FORM
  */
  getImportDetails = (data) => {
    this.setState({ isBOPImportForm: true, data: data })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isBOPDomesticForm, isBOPImportForm, data, } = this.state;

    if (isBOPDomesticForm === true) {
      return <AddBOPDomestic
        data={data}
        hideForm={this.hideForm}
      />
    }

    if (isBOPImportForm === true) {
      return <AddBOPImport
        data={data}
        hideForm={this.hideForm}
      />
    }

    return (
      <>
        <div className="container-fluid">
          {/* {this.props.loading && <Loader/>} */}
          <Row>
            <Col sm="4">
              <h1>{`BOP Master`}</h1>
            </Col>
          </Row>

          <Row>
            <Col>
              <Nav tabs className="subtabs mt-0">
                {/* <NavItem>
                  <NavLink className={classnames({ active: this.state.activeTab === "1", })} onClick={() => { this.toggle("1");}}>Insights</NavLink>
                </NavItem> */}
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === "1",
                    })}
                    onClick={() => {
                      this.toggle("1");
                    }}
                  >
                    Manage BOP (Domestic)
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === "2",
                    })}
                    onClick={() => {
                      this.toggle("2");
                    }}
                  >
                    Manage BOP (Import)
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                    Manage SOB
                  </NavLink>
                </NavItem>

              </Nav>

              <TabContent activeTab={this.state.activeTab}>
                {/* {this.state.activeTab == 1 && (
                  <TabPane tabId="1">
                    <InsightsBop />
                  </TabPane>
                )} */}

                {this.state.activeTab == 1 && (
                  <TabPane tabId="1">
                    <BOPDomesticListing
                      displayForm={this.displayDomesticForm}
                      getDetails={this.getDetails}
                      AddAccessibility={this.state.AddAccessibility}
                      EditAccessibility={this.state.EditAccessibility}
                      DeleteAccessibility={this.state.DeleteAccessibility}
                      BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                      DownloadAccessibility={this.state.DownloadAccessibility}
                    />
                  </TabPane>
                )}

                {this.state.activeTab == 2 && (
                  <TabPane tabId="2">
                    <BOPImportListing
                      displayForm={this.displayImportForm}
                      getDetails={this.getImportDetails}
                      AddAccessibility={this.state.AddAccessibility}
                      EditAccessibility={this.state.EditAccessibility}
                      DeleteAccessibility={this.state.DeleteAccessibility}
                      BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                      DownloadAccessibility={this.state.DownloadAccessibility}
                    />
                  </TabPane>
                )}

                {this.state.activeTab == 3 &&
                  <TabPane tabId="3">
                    <SOBListing
                      displayForm={this.displayImportForm}
                      getDetails={this.getImportDetails}
                      AddAccessibility={this.state.AddAccessibility}
                      EditAccessibility={this.state.EditAccessibility}
                      DeleteAccessibility={this.state.DeleteAccessibility}
                      BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                      DownloadAccessibility={this.state.DownloadAccessibility}
                    />
                  </TabPane>}

              </TabContent>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ boughtOutparts, auth }) {
  const { BOPListing, loading } = boughtOutparts;
  const { leftMenuData, topAndLeftMenuData } = auth;
  return { BOPListing, leftMenuData, topAndLeftMenuData, loading }
}


export default connect(mapStateToProps,
  {
    getLeftMenu,
  }
)(BOPMaster);

