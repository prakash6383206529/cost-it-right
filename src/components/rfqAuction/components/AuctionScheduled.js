import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { AuctionScheduledId } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import { auctionListByStatus } from "../actions/RfqAuction";
import AuctionGrid from "./AuctionGrid";


const AuctionScheduled = (props) => {
  const { AddAccessibility, ViewRMAccessibility } = props;
  const dispatch = useDispatch();
  const [state, setState] = useState({
    isLoader: false
  })
  useEffect(() => {
    setState(prevState => ({ ...prevState, isLoader: true }))
    dispatch(auctionListByStatus(AuctionScheduledId, () => {
      setTimeout(() => {
        setState(prevState => ({ ...prevState, isLoader: false }))
      }, 300);
    }))
  }, []);

  return (
    <>
      <div className={`ag-grid-react`}>
        {state.isLoader && <LoaderCustom />}
        <AuctionGrid auctionlistId={AuctionScheduledId} ViewRMAccessibility={ViewRMAccessibility} />
      </div>
    </>
  );
};

export default AuctionScheduled;
