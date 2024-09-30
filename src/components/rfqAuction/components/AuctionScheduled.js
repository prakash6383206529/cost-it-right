import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { AuctionScheduledId } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import { auctionListByStatus } from "../actions/RfqAuction";
import AuctionGrid from "./AuctionGrid";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";


const AuctionScheduled = (props) => {
  const { EditAccessibility, ViewRMAccessibility } = props;
  const dispatch = useDispatch();
  const history = useHistory();
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
  const formToggle = (id) => {
    console.log(id)
    history.push({
      pathname: '/add-auction',
      state: { source: 'auction', quotationId: id, isEdit: true }
    })
  }

  return (
    <>
      {<div className={`ag-grid-react`}>
        {state.isLoader && <LoaderCustom />}
        <AuctionGrid auctionlistId={AuctionScheduledId} formToggle={formToggle} ViewRMAccessibility={ViewRMAccessibility} EditAccessibility={EditAccessibility} />
      </div>}
    </>
  );
};

export default AuctionScheduled;
