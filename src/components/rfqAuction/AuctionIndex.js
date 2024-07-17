import React, { useState, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { reactLocalStorage } from "reactjs-localstorage";
import { useHistory } from "react-router-dom";
import AuctionDetails from "./components/AuctionDetails";
import AuctionApproved from "./components/AuctionScheduled";
import AuctionPending from "./components/AuctionClosed";
import { data } from "jquery";
import AuctionClosed from "./components/AuctionClosed";
import AuctionScheduled from "./components/AuctionScheduled";
import ComparsionAuction from "./ComparsionAuction";
import { getLiveAndScheduledCount } from "./actions/RfqAuction";

function AuctionIndex(props) {
  let history = useHistory();
  const [activeTab, setActiveTab] = useState("1");
  const [hideNavBar, setHideNavBar] = useState(true);
  const [status, setStatus] = useState({
    Live: 0,
    Scheduled: 0,
    Closed: 0
  })
  const { showHideBidWindow } = useSelector(state => state.Auction);
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getLiveAndScheduledCount(res => {
      if (res.data.Result) {
        setStatus(res.data.Data)
      }
    }))
  }, [activeTab])
  /**
   * @method toggle
   * @description toggling the tabs
   */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const formToggle = (data) => {
    setHideNavBar(data);
  };

  // const dispatch = useDispatch();
  // useEffect(() => {

  //   if (reactLocalStorage.get('location') === '/costing-summary') {
  //     toggle("2");
  //   }
  //   else if (reactLocalStorage.get('location') === '/approval-listing') {
  //     toggle("3");
  //   }
  //   else {
  //     toggle("1");
  //   }
  // }, [])

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div className="user-page container-fluid costing-main-container">
        {/* {this.props.loading && <Loader/>} */}
        <div>
          {/* Add New Auction Button Here */}
          {(hideNavBar && !showHideBidWindow.showBidWindow) && (
            <span className="position-relative costing-page-tabs auction-page-tabs d-block w-100 mt-1">
              <div className="right-actions d-flex">
                <div
                  className="card-border card-border-no-arrow mr-2 cursor-pointer"
                  onClick={() => {
                    toggle("1");
                    // history.push("/costing");
                  }}
                >
                  <div className="top d-flex justify-content-center align-items-center pt-1 pb-1 pl-3 pr-2">
                    <div className="left text-center">
                      <b>Active:</b>
                      {/* <span className="d-block">Level</span> */}
                    </div>
                    <div className="right text-center">
                      <span className="fw-bold">{status.Live}</span>
                    </div>
                  </div>
                  {/* top */}
                </div>
                <div
                  className="card-border card-border-no-arrow cursor-pointer"
                  onClick={() => {
                    toggle("2");
                    // history.push("/costing");
                  }}
                >
                  <div className="top d-flex justify-content-center align-items-center pt-1 pb-1 pl-3 pr-2">
                    <div className="left text-center">
                      <b>Scheduled:</b>
                      {/* <span className="d-block">Level</span> */}
                    </div>
                    <div className="right text-center">
                      <span className="fw-bold">{status.Scheduled}</span>
                    </div>
                  </div>
                  {/* top */}
                </div>
              </div>
            </span>
          )}
          {/* Add New Auction Button End Here */}
          {(hideNavBar && !showHideBidWindow.showBidWindow) && (
            <Nav tabs className="subtabs mt-0">
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => {
                    toggle("1");
                    // history.push("/costing");
                  }}
                >
                  Live
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => {
                    toggle("2");
                    // history.push("/costing-summary");
                  }}
                >
                  Scheduled
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "3" })}
                  onClick={() => {
                    toggle("3");
                    // history.push("/approval-listing");
                  }}
                >
                  Closed
                </NavLink>
              </NavItem>
            </Nav>
          )}
          {!showHideBidWindow.showBidWindow &&
            <TabContent activeTab={activeTab}>
              {activeTab === "1" && (
                <TabPane tabId="1">
                  <AuctionDetails toggle={toggle} hide={formToggle} />
                </TabPane>
              )}
              {activeTab === "2" && (
                <TabPane tabId="2">
                  <AuctionScheduled activeTab={activeTab} />
                </TabPane>
              )}
              {activeTab === "3" && (
                <TabPane tabId="3">
                  <AuctionClosed activeTab={activeTab} />
                </TabPane>
              )}
            </TabContent>}
        </div>
      </div>
      {showHideBidWindow.showBidWindow && <ComparsionAuction quotationAuctionId={showHideBidWindow.QuotationAuctionId} />}
    </>
  );
}

export default AuctionIndex;
