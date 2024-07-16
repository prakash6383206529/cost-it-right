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
import { auctionHeaderDetails, sendCounterOffer, ShowBidWindow } from "./actions/RfqAuction";
import { ASSEMBLY, BOP, COMPONENT, RM } from "./AddAuction";
import DayTime from "../common/DayTimeWrapper";
import PopupMsgWrapper from "../common/PopupMsgWrapper";
import { TextFieldHookForm } from "../layout/HookFormInputs";
import { checkForNull, loggedInUserId } from "../../helper";
import Toaster from "../common/Toaster";


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


  const [isViewFlag, setIsViewFlag] = useState(false);
  const [showCounterPopup, setShowCounterPopup] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const { bidDetails } = useSelector(state => state.Auction);
  const [state, setState] = useState({
    bidData: {},
    PartType: '',
    headerDetails: {},
    showCounterPopup: false,
    counterOfferId: ''
  })

  const handleSubmitClick = (data, e, isPartDetailSent) => {
    //handleSubmit(() => onSubmit(data, e, isSent))()
    onSubmit(data, e, isPartDetailSent);
  };

  useEffect(() => {
    setState(prevState => ({ ...prevState, bidData: bidDetails ?? {} }))
  }, [bidDetails])
  useEffect(() => {
    dispatch(auctionHeaderDetails(props.quotationAuctionId, (res) => {
      if (res && res.data.Result) {
        let data = res.data.Data;
        setState(prevState => ({ ...prevState, PartType: data?.PartType, headerDetails: data }))
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

  }
  const onSubmit = () => {

  };



  const handleCounterPopup = (counterOfferId) => {
    setState(prevState => ({ ...prevState, showCounterPopup: true, counterOfferId: counterOfferId }))
  };
  const closePopUp = () => {
    setState(prevState => ({ ...prevState, showCounterPopup: false }))
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


  // Table data Array

  const toggle = (index) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const labels = {
    rfqNumberLabel: "RFQ No",
    auctionNameLabel: "Auction Name",
    partTypeLabel: "Part Type",
    partNumberLabel: "Part No",
    rmNameLabel: "RM Name Grade Specification",
    rmCodeLabel: "RM Code",
    timeLabel: "Time",
    durationLabel: "Duration",
    endTimeLabel: "End Time",
    remainingTimeLabel: "Remaining Time",
    bopNumberLabel: "BOP No",
    bopCategoryLabel: "Category",
  };
  const data = {
    rfqNumber: "12345",
    auctionName: "Auction A",
    partType: "Assembly",
    partNumber: "PN-6789",
    rmName: "John Doe",
    rmgrade: "RM Wide Test",
    rmSpecification: "CRCA D",
    rmCode: "RM-1000202",
    bopName: "Machine",
    bopNumber: "BOP-12345",
    bopCategory: "STD",
    time: "10:00",
    duration: "2:00",
    endTime: "12:00",
    remainingTime: "1:30",
  };

  const startTime = new Date().toISOString();
  const endTime = new Date(new Date().getTime() + 72000).toISOString();
  const { headerDetails } = state
  return (
    <div className="container-fluid">
      <div className="signup-form">
        <div className="row">
          <div className="col-md-12">
            <div className="shadow-lgg login-formg">
              <div className="row">
                <div className="col-md-6">
                  <h1>
                    Comparison Auction / Bids
                    {!isViewFlag && (
                      <TourWrapper
                        buttonSpecificProp={{ id: "Comparsion_Bids_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t).RFQ_FORM,
                        }}
                      />
                    )}
                  </h1>
                </div>
                <div className="col-md-6 d-flex justify-content-end">
                  <div className="mr-3">
                    <p>Remaining Time</p>
                    <CountdownTimer startTime={startTime} endTime={endTime} />
                  </div>
                  <div className="d-flex flex-wrap refresh-div">
                    <label className="mb-0 pr-4">Refresh In:</label>
                    <InputTimer quotationAuctionId={props.quotationAuctionId} />
                  </div>
                </div>
              </div>
              <div>
                <form>
                  <Row className="comparison-row">
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rfqNumberLabel}:</label>
                        <span>{headerDetails.RfqNumber ?? '-'}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.auctionNameLabel}:</label>
                        <span>{headerDetails.AuctionName ?? '-'}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.partTypeLabel}:</label>
                        <span>{headerDetails.PartType ?? '-'}</span>
                      </div>
                    </Col>
                    {(state.PartType === COMPONENT || state.PartType === ASSEMBLY) &&
                      <Col md="2" className="mb-2">
                        <div className="view-label">
                          <label>{labels.partNumberLabel}:</label>
                          <span>{headerDetails.PartNumber ?? '-'}</span>
                        </div>
                      </Col>}
                    {state.PartType === RM && <><Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.rmNameLabel}:</label>
                        <span>{headerDetails.RawMaterial ?? '-'}</span>
                      </div>
                    </Col>
                      <Col md="2" className="mb-2">
                        <div className="view-label">
                          <label>{labels.rmCodeLabel}:</label>
                          <span>{headerDetails.RawMaterialCode ?? '-'}</span>
                        </div>
                      </Col>
                    </>}
                    {state.PartType === BOP && <><Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>{labels.bopNumberLabel}:</label>
                        <span>{headerDetails.BoughtOutPart ?? '-'}</span>
                      </div>
                    </Col>
                      <Col md="2" className="mb-2">
                        <div className="view-label">
                          <label>{labels.bopCategoryLabel}:</label>
                          <span>{headerDetails.Category ?? '-'}</span>
                        </div>
                      </Col>
                    </>}
                    {state.PartType !== BOP && <Col md="2">
                      <div className="view-label">
                        <label>Technology:</label>
                        <span>{headerDetails.Technology ?? '-'}</span>
                      </div>
                    </Col>}
                  </Row>
                  <Row className="comparison-time-row">
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>Start Time(HH:MM):</label>
                        <span>{DayTime(headerDetails.AuctionStartDateTime).isValid() ? DayTime(headerDetails.AuctionStartDateTime).format('HH:mm') : '-'}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>Duration(HH:MM):</label>
                        <span>{headerDetails.AuctionDuration ?? '-'}</span>
                      </div>
                    </Col>
                    <Col md="2" className="mb-2">
                      <div className="view-label">
                        <label>End Time(HH:MM):</label>
                        <span>{DayTime(headerDetails.AuctionEndDateTime).isValid() ? DayTime(headerDetails.AuctionEndDateTime).format('HH:mm') : '-'}</span>
                      </div>
                    </Col>
                  </Row>
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
                                          <span
                                            className="checkbox-text"
                                            title={`BhuVendorTwo(SOB: 0%)`}
                                          >
                                            <div>
                                              <strong>{item.Rank}</strong>
                                              <span className="ml-2">{item.VendorName}</span>
                                            </div>
                                          </span>
                                        </div>
                                        <div className="action text-right">
                                          <button
                                            type="button"
                                            className="CancelIcon mb-0 align-middle"
                                            title="Discard"
                                          ></button>
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
                                          return <>
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
                                      <label className="custom-checkbox w-auto mb-0">
                                        Display Rank to Vendor
                                        <input
                                          type="checkbox"
                                          value={"All"}
                                          id={`checkbox-diplay${index + 1}`}
                                        />
                                        <span className="before-box p-0"></span>
                                      </label>
                                      <br />
                                      <button
                                        type="button"
                                        className="submit-button save-btn mr-2"
                                        value="save"
                                        id="addRFQ_save"
                                        onClick={() => handleCounterPopup(item.QuotationAuctionVendorBidPriceHistory[0] && item.QuotationAuctionVendorBidPriceHistory[0].QuotationAuctionVendorBidPriceDetailsId
                                        )}
                                      >
                                        Counter Offer
                                      </button>
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
                      <button
                        id="addRFQ_cancel"
                        type={"button"}
                        className="reset mr-2 cancel-btn"
                        onClick={extendTime}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Extend Time"}
                      </button>

                      {
                        <button
                          type="button"
                          className="submit-button save-btn mr-2"
                          value="save"
                          id="addRFQ_save"
                          onClick={(data, e) =>
                            handleSubmitClick(data, e, false)
                          }
                          disabled={false}
                        >
                          <div className={"save-icon"}></div>
                          {"Close Auction"}
                        </button>
                      }

                      <button
                        type="button"
                        className="submit-button save-btn"
                        value="send"
                        id="addRFQ_send"
                        onClick={(data, e) =>
                          handleSubmitClick(data, e, true)
                        }
                        disabled={false}
                      >
                        <div className="send-for-approval mr-1"></div>
                        {"Send for Approval"}
                      </button>
                    </div>
                  </Row>
                </form>


              </div>
            </div>
          </div>
        </div>
      </div>
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
    </div>
  );
}

export default ComparsionAuction;
