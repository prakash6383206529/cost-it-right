import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { AuctionScheduledId } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import { auctionListByStatus } from "../actions/RfqAuction";
import AuctionGrid from "./AuctionGrid";

const gridOptions = {};

const AuctionScheduled = (props) => {
  const { AddAccessibility, ViewRMAccessibility, EditAccessibility, initialConfiguration } = props;
  const dispatch = useDispatch();

  const [state, setState] = useState({

  });

  useEffect(() => {
    dispatch(auctionListByStatus(AuctionScheduledId, () => { }))
  }, []);



  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    // state.gridApi.setQuickFilter(null);
    // state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  };

  return (
    <>
      <div className={`ag-grid-react`}>
        {false && <LoaderCustom />}
        <form noValidate>
          <Row className="pt-4">
            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  <button
                    type="button"
                    className="user-btn Tour_List_Reset "
                    title="Reset Grid"
                    onClick={() => resetState()}
                  >
                    <div className="refresh mr-0"></div>
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </form>
        <AuctionGrid
          auctionlistId={AuctionScheduledId}
          ViewRMAccessibility={ViewRMAccessibility} />
      </div>
    </>
  );
};

export default AuctionScheduled;
