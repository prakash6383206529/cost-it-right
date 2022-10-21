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


    const dispatch = useDispatch()

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
                        message: `(${item.SenderName}) : ${item.Message ? item.Message : '-'} `,
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
                    <div className={`drawer-wrapper drawer-700px min-320`}>
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
                        <ChatFeed
                            messages={messages} // Array: list of message objects
                            // isTyping={true} // Boolean: is the recipient typing
                            hasInputField={false} // Boolean: use our input, or use your own
                            showSenderName={true} // show the name of the user who sent the message
                            bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                            chatBubble={false}
                            sendorName={"ashok"}
                        />
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