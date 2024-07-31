import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { AuctionClosedId } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import ReactExport from "react-export-excel";
import AuctionGrid from "./AuctionGrid";
import { auctionListByStatus } from "../actions/RfqAuction";


const AuctionClosed = (props) => {
  const [state, setState] = useState({
    isLoader: false
  })
  const dispatch = useDispatch();
  useEffect(() => {
    setState(prevState => ({ ...prevState, isLoader: true }))
    dispatch(auctionListByStatus(AuctionClosedId, (res) => {
      setTimeout(() => {
        setState(prevState => ({ ...prevState, isLoader: false }))
      }, 300);
    }))
  }, []);

  return (
    <>
      <div className={`ag-grid-react`}>
        {state.isLoader && <LoaderCustom />}
        <AuctionGrid auctionlistId={AuctionClosedId} />
      </div>
    </>
  );
};

export default AuctionClosed;
