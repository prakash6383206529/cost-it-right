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
import { useHistory } from 'react-router-dom';


const gridOptions = {};

const AuctionDetails = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [state, setState] = useState({
    isLoader: false,
  });

  const [addAuction, setAddAuction] = useState(false);

  useEffect(() => {
    setState(prevState => ({ ...prevState, isLoader: true }))
    dispatch(auctionListByStatus(AuctionLiveId, () => {
      setTimeout(() => {
        setState(prevState => ({ ...prevState, isLoader: false }))
      }, 300);
    }))
  }, []);

  const formToggle = () => {

    history.push({
      pathname: '/add-auction',
      state: { source: 'auction' }
    })
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
          <AuctionGrid auctionlistId={AuctionLiveId} formToggle={formToggle} />
        </div>
      )}
      {addAuction && (
        <AddAuction
          closeDrawer={closeDrawer}
        />
      )}
    </>
  );
};

export default AuctionDetails;
