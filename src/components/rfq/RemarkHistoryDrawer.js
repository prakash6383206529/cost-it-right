import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { NumberFieldHookForm, SearchableSelectHookForm, TextAreaHookForm, } from '.././layout/HookFormInputs'
import { getVendorWithVendorCodeSelectList, getReporterList, fetchPlantDataAPI } from '../.././actions/Common';
import { getCostingSpecificTechnology, getPartSelectListByTechnology, } from '../costing/actions/Costing'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../.././helper';
import { EMPTY_DATA, FILE_URL } from '../.././config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { createRfqQuotation, fileDeleteQuotation, fileUploadQuotation, getQuotationById, updateRfqQuotation, getContactPerson, getCommunicationHistory } from './actions/rfq';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import redcrossImg from '../../assests/images/red-cross.png'
import NoContentFound from '../common/NoContentFound';
import HeaderTitle from '../common/HeaderTitle';
import { BubbleGroup, ChatFeed, Message } from 'react-chat-ui'
import { custom } from 'joi';

const gridOptions = {};

function RemarkHistoryDrawer(props) {

    const dropzone = useRef(null);
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, control } = useForm();

    const [showPopup, setShowPopup] = useState(false)
    const [messages, setMessages] = useState([

    ])


    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const partSelectListByTechnology = useSelector(state => state.costing.partSelectListByTechnology)
    const dispatch = useDispatch()
    const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    // const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)
    const plantList = useSelector(state => state.comman.plantList)

    useEffect(() => {


        setVendorInputLoader(true)
        const { vbcVendorGrid } = props;
        dispatch(getVendorWithVendorCodeSelectList(() => {
            setVendorInputLoader(false)
        }))
        dispatch(fetchPlantDataAPI(() => { }))
        let tempArr = [];
        vbcVendorGrid && vbcVendorGrid.map(el => {
            tempArr.push(el.VendorId)
            return null;
        })
        initialConfiguration?.IsDestinationPlantConfigure === false && setSelectedVendors(tempArr)
    }, []);



    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getReporterList(() => { }))
        dispatch(getCommunicationHistory(props.data.CostingId, (res) => {

            if (res && res.data) {
                let temp = []
                let responseMessageArray = res?.data?.DataList
                responseMessageArray && responseMessageArray.map((item) => {

                    let obj = new Message({
                        id: 1,
                        message: `(${item.SenderName}) : ${item.Message}`,
                    })

                    temp.push(obj)
                })
                setMessages(temp)
            }
        })
        )

    }, [])




    const closePopUp = () => {
        setShowPopup(false)
    }

    const onPopupConfirm = () => {

    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props.closeDrawer('', {})
    }


    /**
    * @method render
    * @description Renders the component
    */
    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
                onClose={(e) => cancel}
                className='rfq-container-drawer'
            >
                <Container>
                    <div className={`drawer-wrapper drawer-700px`}>
                        <Row className="drawer-heading">
                            <Col className='pl-0'>
                                <div className={"header-wrapper d-flex justify-content-between right"}>
                                    <h3>{"Remark history"}</h3>
                                    <div
                                        onClick={cancel}
                                        className={"close-button right"}
                                    ></div>
                                </div>

                            </Col>
                        </Row>



                        {/* <BubbleGroup
                            messages={messages}
                            id={1}
                            showSenderName={true}
                        //chatBubble={MyChatBubble}
                        /> */}

                        <ChatFeed
                            messages={messages} // Array: list of message objects
                            // isTyping={true} // Boolean: is the recipient typing
                            hasInputField={false} // Boolean: use our input, or use your own
                            showSenderName={true} // show the name of the user who sent the message
                            bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                            chatBubble={false}
                            sendorName={"ashok"}
                        //JSON: Custom bubble styles
                        // chatBubble={custom}
                        // bubbleStyles={
                        //     {
                        //         text: {
                        //             fontSize: 30
                        //         },
                        //         chatbubble: {
                        //             borderRadius: 70,
                        //             padding: 40
                        //         }
                        //     }
                        // }
                        />







                        < Row className="justify-content-between">
                            <div className="col-sm-12 text-right">
                                <button
                                    type={"button"}
                                    className="reset mr15 cancel-btn"
                                    onClick={cancel}
                                >
                                    <div className={"cancel-icon"}></div>
                                    {"Cancel"}
                                </button>

                                {/* <button type="submit" className="submit-button save-btn"
                                        disabled={isViewFlag}>
                                        <div className={"save-icon"}></div>
                                        {"Send"}
                                    </button> */}
                            </div>
                        </Row>
                    </div>
                </Container >
            </Drawer >
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_ADD_SUCCESS}`} />
            }
        </div >
    );
}

export default RemarkHistoryDrawer