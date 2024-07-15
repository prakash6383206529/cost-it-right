import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { AuctionLiveId } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import ReactExport from "react-export-excel";
import Button from "../../layout/Button";
import AddAuction from "../AddAuction";
import { auctionListByStatus } from "../actions/RfqAuction";
import AuctionGrid from "./AuctionGrid";


const gridOptions = {};

const AuctionDetails = (props) => {
  const dispatch = useDispatch();

  const [state, setState] = useState({
    isLoader: false,
  });

  const [addAuction, setAddAuction] = useState(false);
  const [addRfqData, setAddRfqData] = useState({});

  useEffect(() => {
    dispatch(auctionListByStatus(AuctionLiveId, () => { }))
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





  const formToggle = () => {
    props.hide(false);
    setAddAuction(true);
    let data = {
      isAddFlag: true,
    };
  };

  const closeDrawer = (type) => {
    setAddAuction(false);
    if (type === 'submit') {

    }
    props.hide(true);
  };
  return (
    <>
      {!addAuction && (
        <div>
          {state.isLoader && <LoaderCustom />}
          <form noValidate>
            <Row className="pt-4">
              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>

                    <Button
                      id="rmDomesticListing_add"
                      className={"mr5 Tour_List_Add"}
                      onClick={formToggle}
                      title={"Add"}
                      icon={"plus"}
                    />
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
          <AuctionGrid auctionlistId={AuctionLiveId} />
        </div>
      )}
      {addAuction && (
        <AddAuction
          data={addRfqData}
          //hideForm={hideForm}
          closeDrawer={closeDrawer}
        />
      )}
    </>
  );
};

export default AuctionDetails;
