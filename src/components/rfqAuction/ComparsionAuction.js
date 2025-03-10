import React, { useState, useEffect, useRef, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Tooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";


import "react-dropzone-uploader/dist/styles.css";
import LoaderCustom from "../common/LoaderCustom";
import _ from "lodash";

import { Steps } from "./TourMessages";
import { useTranslation } from "react-i18next";
import TourWrapper from "../common/Tour/TourWrapper";
import Button from "../layout/Button";
import CountdownTimer from "./components/CountdownTimer";
import InputTimer from "./components/InputTimer";
import { auctionBidDetails, auctionHeaderDetails, closeAuction, sendCounterOffer, ShowBidWindow, updateAuctionDuration, updateShowVendorRank } from './actions/RfqAuction';
import DayTime from "../common/DayTimeWrapper";
import PopupMsgWrapper from "../common/PopupMsgWrapper";
import { TextFieldHookForm } from "../layout/HookFormInputs";
import { addTime, calculateEndDateTime, calculateTime, checkForDecimalAndNull, checkForNull, loggedInUserId } from "../../helper";
import Toaster from "../common/Toaster";
import { AuctionLiveId } from "../../config/constants";
import TooltipCustom from "../common/Tooltip";
import { useLabels } from "../../helper/core";
import { ASSEMBLY, BOP, COMPONENT, RM } from "./AddAuction";


function ComparsionAuction(props) {
  const dispatch = useDispatch();

  const { t } = useTranslation("Rfq");

  const dropzone = useRef(null);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { technologyLabel,vendorLabel } = useLabels();
  const [isViewFlag, setIsViewFlag] = useState(false);
  const [loader, setLoader] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const { bidDetails } = useSelector(state => state.Auction);
  const [state, setState] = useState({
    bidData: {},
    PartType: '',
    headerDetails: {},
    showCounterPopup: false,
    counterOfferId: '',
    isTimerRunning: false,
    showClosedAuction: false,
    isLoader: false,
    awarded: false,
    vendorIdList: [],
    vendorNameList: [],
    live: props.AuctionStatusId === AuctionLiveId ? true : false
  })
  const [checkBoxState, setCheckBoxState] = useState({})
  const { NoOfDecimalForPrice } = useSelector((state) => state.auth?.initialConfiguration) || {}
  const handleSubmitClick = (data, e, isPartDetailSent) => {
    //handleSubmit(() => onSubmit(data, e, isSent))()
    onSubmit(data, e, isPartDetailSent);
  };

  useEffect(() => {
    setState(prevState => ({ ...prevState, bidData: bidDetails ?? {} }))

  }, [bidDetails])
  useEffect(() => {
    setState(prevState => ({ ...prevState, isLoader: true }))
    dispatch(auctionHeaderDetails(props.quotationAuctionId, (res) => {
      if (!state.live) {
        dispatch(auctionBidDetails(props.quotationAuctionId, () => { }))
      }
      if (res && res.data && res.data.Result) {
        let data = res.data.Data;
        setState(prevState => ({ ...prevState, PartType: data?.PartType, headerDetails: data }))
        setTimeout(() => {
          setState(prevState => ({ ...prevState, isLoader: false }))
        }, 500);
      } else {
        setState(prevState => ({ ...prevState, isLoader: false }))
      }
    }))
  }, [])
  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = () => {
    dispatch(ShowBidWindow({ showBidWindow: false, QuotationAuctionId: '' }))
  };
  const extendTime = () => {
    const getTime = calculateTime(headerDetails.ExtensionTime)
    const totalExtendedDuration = addTime(getTime, headerDetails.TotalAuctionExtensionDuration)
    let obj = {
      QuotationAuctionId: props.quotationAuctionId,
      LoggedInUserId: loggedInUserId(),
      DurationExtension: totalExtendedDuration,
      AuctionEndDateTime: calculateEndDateTime(headerDetails.AuctionEndDateTime, getTime)
    }
    dispatch(updateAuctionDuration(obj, (res) => {
      Toaster.success('Time has been extended successfully')
      dispatch(auctionHeaderDetails(props.quotationAuctionId, (res) => {
        if (res && res.data.Result) {
          let data = res.data.Data;
          setState(prevState => ({ ...prevState, headerDetails: data }))
        }
      }))
      dispatch(auctionBidDetails(props.quotationAuctionId, () => { }))
    }))
  }
  const onSubmit = () => {

  };



  const handleCounterPopup = (counterOfferId) => {
    setState(prevState => ({ ...prevState, showCounterPopup: true, counterOfferId: counterOfferId }))
  };
  const closePopUp = () => {
    setState(prevState => ({ ...prevState, showCounterPopup: false, showClosedAuction: false }))
  }
  const onPopupConfirm = (data) => {
    let obj = {
      QuotationAuctionVendorBidPriceDetailsId: state.counterOfferId,
      LoggedInUserId: loggedInUserId(),
      CounterOffer: checkForNull(getValues('CounterOfferPrice'))
    }
    dispatch(sendCounterOffer(obj, (res) => {
      if (res.data.Result) {
        Toaster.success('Couter offer sent')
      }
      setState(prevState => ({ ...prevState, showCounterPopup: false }))
    }))
  }

  const toggle = (index) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const checkTimerShop = (value) => {
    setState(prevState => ({ ...prevState, isTimerRunning: value }))
  }

  const showVendorRank = (data, check) => {
    let obj = {
      QuotationAuctionVendorId: data.QuotationAuctionVendorId,
      LoggedInUserId: loggedInUserId(),
      IsDisplayRankToVendor: !check
    }
    dispatch(updateShowVendorRank(obj, res => {
      if (res.data.Result) {
        dispatch(auctionBidDetails(props.quotationAuctionId, () => { }))
        Toaster.success(`Now, ${data.VendorName} can ${check ? 'not' : ''} see the rank.`)
      }
    }))
  }
  const closeAuctionHanlde = () => {
    setState(prevState => ({ ...prevState, showClosedAuction: true }))
  }
  const onPopupConfirmForCloseAuction = () => {
    let obj = {
      QuotationAuctionId: props.quotationAuctionId,
      LoggedInUserId: loggedInUserId(),
      AwardedVendorIdList: state.vendorIdList
    }
    dispatch(closeAuction(obj, (res) => {
      if (res.data.Result) {
        Toaster.success('Auction closed successfully')
        dispatch(ShowBidWindow({ showBidWindow: false, QuotationAuctionId: '' }))
      }
    }))
  }
  const awardedCosting = (index, item) => {
    let vendorIdList = state.vendorIdList
    let vendorNameList = state.vendorNameList
    if (checkBoxState[index]) {
      const filterIdList = vendorIdList.filter(el => el !== item.VendorId)
      const filterNameList = vendorNameList.filter(el => el !== item.VendorName)
      setCheckBoxState(prevState => ({ ...prevState, [index]: false }))
      setState(prevState => ({ ...prevState, vendorIdList: filterIdList, vendorNameList: filterNameList }))
    } else {
      if (!vendorIdList.includes(item.VendorId)) {
        vendorIdList.push(item.VendorId)
        vendorNameList.push(item.VendorName)
      }
      setCheckBoxState(prevState => ({ ...prevState, [index]: true }))
      setState(prevState => ({ ...prevState, vendorIdList: vendorIdList, vendorNameList: vendorNameList }))
    }

  }
  const { headerDetails } = state
  const vendorName = state.vendorNameList.join(',')
  const popupMessage = state.vendorIdList.length === 0 ? `You have not awarded any ${vendorLabel}. Do you still want to close the auction?` : `You have awarded ${vendorName}. Do you want to close the auction?`
  const isExtendedTime = (headerDetails?.TotalAuctionExtensionDuration && headerDetails?.TotalAuctionExtensionDuration !== "00:00") ? true : false
  return (
    <div className="container-fluid">
      {state.isLoader && <LoaderCustom />}
      <div className="row comparation-auction">
        <div className="col-md-6">
          <h1>
            Comparison Auction / Bids
          </h1>
        </div>
        {state.live &&
          <div className="col-md-6 d-flex justify-content-end">
            <div className="mr-3">
              <p>Remaining Time</p>
              <CountdownTimer endTime={state.bidData.AuctionEndDateTime} checkTimerRunning={checkTimerShop} />
            </div>
            <div className="d-flex flex-wrap refresh-div">
              <label className="mb-0 pr-4">Refresh In:</label>
              <InputTimer quotationAuctionId={props.quotationAuctionId} isTimerRunning={state.isTimerRunning} />
            </div>
          </div>}
        <div>
          <table className="table cr-brdr-main mt-3">
            <thead>
              <tr>
                <th>Auction Name</th>
                <th>RFQ Number</th>
                <th>Part Type</th>
                {(state.PartType === COMPONENT || state.PartType === ASSEMBLY) && <th>Part Number</th>}
                {state.PartType !== BOP && <th>{technologyLabel}</th>}
                {state.PartType === RM && <>
                  <th>RM Name Grade Specification</th>
                  <th>RM Code</th>
                </>}
                {(state.PartType === BOP) && <>
                  <th>Bought Out Part</th>
                  <th>BOP Category</th>
                </>}
                <th>Start Date Time</th>
                <th><div className="w-fit">Duration{isExtendedTime && <>+Extened Time <TooltipCustom width="280px" id="extensionTime" customClass="mt-1 ml-2" tooltipText="The actual auction time and the extended time are both displayed separately here. Ref: (Actual Time(HH:MM) + Extended Time(HH:MM)) " /></>}</div></th>
                <th>End Date Time </th>
                <th>Base Price </th>
                <th>Min Reduction Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{headerDetails?.AuctionName ?? '-'}</td>
                <td>{headerDetails?.RfqNumber ?? '-'}</td>
                <td>{headerDetails?.PartType ?? '-'}</td>
                {(state.PartType === COMPONENT || state.PartType === ASSEMBLY) && <td>{headerDetails?.PartNumber ?? '-'}</td>}
                {state.PartType !== BOP && <td>{headerDetails?.Technology ?? '-'}</td>}
                {state.PartType === RM && <>
                  <td>{headerDetails?.RawMaterial ?? '-'}</td>
                  <td>{headerDetails?.RawMaterialCode ?? '-'}</td>
                </>}
                {(state.PartType === BOP) && <>
                  <td>{headerDetails?.BoughtOutPart ?? '-'}</td>
                  <td>{headerDetails?.Category ?? '-'}</td>
                </>}
                <td>{headerDetails?.AuctionStartDateTime ? DayTime(headerDetails?.AuctionStartDateTime).format('DD/MM/YYYY HH:MM') : '-'}</td>
                <td>{headerDetails?.AuctionDuration ?? '-'}{isExtendedTime ? '+' + headerDetails?.TotalAuctionExtensionDuration : ''}</td>
                <td>{headerDetails?.AuctionEndDateTime ? DayTime(headerDetails?.AuctionEndDateTime).format('DD/MM/YYYY hh:mm') : '-'}</td>
                <td>{checkForDecimalAndNull(headerDetails?.BasePrice, NoOfDecimalForPrice) ?? '-'}</td>
                <td>{checkForDecimalAndNull(headerDetails?.ReductionPrice, NoOfDecimalForPrice) ?? '-'}</td>
              </tr>
            </tbody>
          </table>

          <div className="rfq-part-list mt-4">
            {/* {showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={viewTooltip} toggle={tooltipToggle} target={"quantity-tooltip"} >{"To edit the quantity please double click on the field."}</Tooltip>} */}
            {!loader ? (
              <div className="comparision-table">
                <Row>
                  <Col>
                    <table className="table table-bordered table-responsive costing-summary-table">
                      <thead>
                        <tr className="main-row">
                          {state.bidData.QuotationAuctionVendorBidPriceDetail && state.bidData.QuotationAuctionVendorBidPriceDetail.map((item, index) => (
                            <th
                              key={index}
                              scope="col"
                              className="header-name-left header-name"
                            >
                              <div className="header-name-button-container">
                                <div className="element d-inline-flex align-items-center">
                                  <div>
                                    {item.Rank && <span className={`rank mr-2 ${item.PriceColourZone}`}>#{item.Rank}</span>}
                                    {state.live ? <label className="custom-checkbox w-auto"
                                      onChange={() => awardedCosting(index, item)}>
                                      {item.VendorName}
                                      <input
                                        type="checkbox"
                                        value={"All"}
                                        id={`checkbox-diplay${index + 1}`}
                                        checked={checkBoxState[index]}
                                      />
                                      <span className="before-box p-0"
                                        onChange={() => awardedCosting(index, item)}

                                      ></span>
                                    </label> : item.VendorName}
                                  </div>
                                </div>
                                <div className="action text-right">
                                  {item.IsAwarded && <div
                                    className="Award mb-0 align-middle"
                                    title="Awarded"
                                  ></div>}
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {state.bidData.QuotationAuctionVendorBidPriceDetail && state.bidData.QuotationAuctionVendorBidPriceDetail.map((item, index) => (
                            <td key={index}>
                              <div className="bid-details-wrapper">
                                {item.QuotationAuctionVendorBidPriceHistory.map((bid, idx) => {
                                  if (idx <= 4) {
                                    return <>
                                      {(bid.QuotationAuctionVendorBidPriceCounterOfferHistoryResponse && bid.QuotationAuctionVendorBidPriceCounterOfferHistoryResponse.length !== 0) ? <>
                                        <p>Counter History</p>
                                        {bid.QuotationAuctionVendorBidPriceCounterOfferHistoryResponse.map(counterOffer => {
                                          return <span
                                            key={idx}
                                            className={`d-flex justify-content-between align-items-center pie-chart-container`}
                                          >
                                            <span className="pie-chart-wrapper pie-chart-wrapper-1">
                                              {counterOffer.Price}
                                            </span>
                                            <span className={`counter-offer ${counterOffer.Status}`}>{counterOffer.Status}</span>
                                          </span>
                                        })}
                                        <hr />
                                        <p>Bid History</p>
                                      </> : ''}
                                      <span
                                        key={idx}
                                        className={`d-flex justify-content-between align-items-center pie-chart-container ${idx === 0 ? '' : 'opacity-down'}`}
                                      >
                                        <span className="pie-chart-wrapper pie-chart-wrapper-1">
                                          {bid.Price}
                                        </span>
                                        <span>{bid.Remark}</span>
                                      </span>
                                    </>
                                  }
                                })}
                              </div>
                              <div
                                className="d-flex p-0 bids-dropdown"
                                key={index}
                              >
                                <Dropdown
                                  isOpen={openDropdowns[index]}
                                  toggle={() => toggle(index)}
                                >
                                  <DropdownToggle
                                    caret={false}
                                    className="bids-btn mt-1 mb-3"
                                  >
                                    More
                                  </DropdownToggle>
                                  <DropdownMenu className="bids-dropdown-menu">
                                    <DropdownItem>
                                      {item.QuotationAuctionVendorBidPriceHistory.map((bid, idx) => (
                                        <span
                                          key={idx}
                                          className={`d-flex justify-content-between align-items-center pie-chart-container ${idx === 0 ? '' : 'opacity-down'}`}
                                        >
                                          <span className="pie-chart-wrapper pie-chart-wrapper-1">
                                            {bid.Price}
                                          </span>
                                          <span>{bid.Remark}</span>
                                        </span>
                                      ))}
                                    </DropdownItem>
                                  </DropdownMenu>
                                </Dropdown>
                              </div>
                              {state.live && <>  <label className="custom-checkbox w-auto mb-0"
                                onChange={() => showVendorRank(item, item.IsDisplayRankToVendor)}>
                                Display Rank to {vendorLabel}
                                <input
                                  type="checkbox"
                                  value={"All"}
                                  id={`checkbox-diplay${index + 1}`}
                                  checked={item.IsDisplayRankToVendor}
                                />
                                <span className="before-box p-0"
                                  onChange={() => showVendorRank(item, item.IsDisplayRankToVendor)}
                                  checked={item.IsDisplayRankToVendor}
                                ></span>
                              </label>
                                <br />
                                <button
                                  type="button"
                                  className="submit-button save-btn mr-2"
                                  value="save"
                                  id="addRFQ_save"
                                  disabled={state.isTimerRunning}
                                  onClick={() => handleCounterPopup(item.QuotationAuctionVendorBidPriceHistory[0] && item.QuotationAuctionVendorBidPriceHistory[0].QuotationAuctionVendorBidPriceDetailsId
                                  )}
                                >
                                  Counter Offer
                                </button></>}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </Col>
                </Row>
              </div>
            ) : (
              <div>
                <LoaderCustom />
              </div>
            )}
          </div>
        </div>
      </div>
      <Row className="justify-content-between sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer mt-4">
        <div className="col-sm-12 text-right bluefooter-butn">
          <button
            id="addRFQ_cancel"
            type={"button"}
            className="reset mr-2 cancel-btn"
            onClick={cancel}
          >
            <div className={"cancel-icon"}></div>
            {"Cancel"}
          </button>
          {state.live && <>
            <button
              type="button"
              className="reset mr-2 cancel-btn mr-2"
              value="save"
              id="addRFQ_save"
              onClick={closeAuctionHanlde}
              disabled={false}
            >
              <div className={"cancel-icon"}></div>
              {"Close Auction"}
            </button>
            <button
              id="addRFQ_cancel"
              type={"button"}
              className="submit-button save-btn mr-2"
              onClick={extendTime}
              disabled={!state.isTimerRunning}
            >
              {"Extend Time"}
            </button>
          </>}
        </div>
      </Row>
      {state.showCounterPopup && (
        <PopupMsgWrapper
          header={"Counter Offer"}
          isOpen={state.showCounterPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          customClass={"counterOfferModal"}
          message={
            <>
              <TextFieldHookForm
                // title={titleObj.descriptionTitle}
                label="Counter Offer:"
                name={"CounterOfferPrice"}
                Controller={Controller}
                control={control}
                register={register}
                rules={{ required: false }}
                mandatory={false}
                handleChange={() => { }}
                defaultValue={""}
                className=""
                customClassName={
                  "withBorder d-flex align-items-center justify-content-center"
                }
                errors={errors.CounterOfferPrice}
              />
            </>
          }
        />
      )}
      {state.showClosedAuction && (
        <PopupMsgWrapper
          isOpen={state.showClosedAuction}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirmForCloseAuction}
          message={popupMessage}
        />
      )}
    </div>
  );
}

export default ComparsionAuction;
