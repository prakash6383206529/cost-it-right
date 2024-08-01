import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AuctionClosedId } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import AuctionGrid from "./AuctionGrid";
import { auctionListByStatus } from "../actions/RfqAuction";


const AuctionClosed = (props) => {
  const { ViewRMAccessibility } = props;
  const dispatch = useDispatch();
  const [state, setState] = useState({
    isLoader: false
  })

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
        <AuctionGrid auctionlistId={AuctionClosedId} ViewRMAccessibility={ViewRMAccessibility} />
      </div>
    </>
  );
};

export default AuctionClosed;
