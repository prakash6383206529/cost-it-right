import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddOverhead from './AddOverhead';
import AddProfit from './AddProfit';
import OverheadListing from './OverheadListing';
import ProfitListing from './ProfitListing';
import { ADDITIONAL_MASTERS, OVERHEAD_AND_PROFIT } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';

class OverheadProfit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      isOverheadForm: false,
      isProfitForm: false,
      data: {},
      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
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
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find(el => el.PageName === OVERHEAD_AND_PROFIT)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        this.setState({
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
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

  displayOverheadForm = () => {
    this.setState({ isOverheadForm: true, isProfitForm: false, })
  }

  displayProfitForm = () => {
    this.setState({ isProfitForm: true, isOverheadForm: false, })
  }

  hideForm = () => {
    this.setState({ isOverheadForm: false, isProfitForm: false, data: {} })
  }

  getOverHeadDetails = (data) => {
    this.setState({ isOverheadForm: true, data: data })
  }

  getProfitDetails = (data) => {
    this.setState({ isProfitForm: true, data: data })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOverheadForm, isProfitForm, data } = this.state;

    if (isOverheadForm === true) {
      return <AddOverhead
        data={data}
        hideForm={this.hideForm}
      />
    }

    if (isProfitForm === true) {
      return <AddProfit
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
              <h1>{`Overhead & Profit Master`}</h1>
            </Col>
          </Row>

          <Row>
            <Col>
              <div>
                <Nav tabs className="subtabs mt-0">
                  <NavItem>
                    <NavLink
                      className={classnames({
                        active: this.state.activeTab === "1",
                      })}
                      onClick={() => {
                        this.toggle("1");
                      }}
                    >
                      Manage Overhead
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
                      Manage Profits
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={this.state.activeTab}>
                  {this.state.activeTab == 1 && (
                    <TabPane tabId="1">
                      <OverheadListing
                        formToggle={this.displayOverheadForm}
                        getDetails={this.getOverHeadDetails}
                        AddAccessibility={this.state.AddAccessibility}
                        EditAccessibility={this.state.EditAccessibility}
                        DeleteAccessibility={this.state.DeleteAccessibility}
                        DownloadAccessibility={this.state.DownloadAccessibility}
                      />
                    </TabPane>
                  )}

                  {this.state.activeTab == 2 && (
                    <TabPane tabId="2">
                      <ProfitListing
                        formToggle={this.displayProfitForm}
                        getDetails={this.getProfitDetails}
                        AddAccessibility={this.state.AddAccessibility}
                        EditAccessibility={this.state.EditAccessibility}
                        DeleteAccessibility={this.state.DeleteAccessibility}
                        DownloadAccessibility={this.state.DownloadAccessibility}
                      />
                    </TabPane>
                  )}
                </TabContent>
              </div>
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
function mapStateToProps({ overheadProfit, auth }) {
  const { loading } = overheadProfit;
  const { leftMenuData, topAndLeftMenuData } = auth;
  return { loading, leftMenuData, topAndLeftMenuData }
}


export default connect(mapStateToProps,
  {
  })(OverheadProfit);

