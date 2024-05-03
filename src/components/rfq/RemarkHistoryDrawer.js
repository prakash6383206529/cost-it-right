import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getReporterList } from '../.././actions/Common';
import { getCostingSpecificTechnology } from '../costing/actions/Costing'
import { getTimeZone, loggedInUserId } from '../.././helper';
import { MESSAGES } from '../../config/message';
import { getCommunicationHistory } from './actions/rfq';
import PopupMsgWrapper from '../common/PopupMsgWrapper';

import NoContentFound from '../common/NoContentFound';
import { ChatFeed, Message } from 'react-chat-ui'




function RemarkHistoryDrawer(props) {

    const [showPopup, setShowPopup] = useState(false)
    const [messages, setMessages] = useState([])



    const dispatch = useDispatch()



    useEffect(() => {
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getReporterList(() => { }))
        const { data } = props
        let reqData = {
            quotationId: data.QuotationId,
            partId: data.PartId,
            vendorId: data.VendorId,
            timeZone: getTimeZone()

        }
        dispatch(getCommunicationHistory(reqData, (res) => {
            // dispatch(getCommunicationHistory(props.data.CostingId, (res) => {         //RE

            if (res && res.data) {
                let temp = []
                let responseMessageArray = res?.data?.DataList
                responseMessageArray && responseMessageArray.map((item) => {
                    const dateObject = new Date(item.SentDate);
                    let obj = new Message({
                        id: 1,
                        // message: `(${item.SenderName}) : ${item.Message ? item.Message : '-'} `,     //RE
                        message: (
                            <div className='chat-container'>
                                <div className='sender-name'> {item.SenderName}</div> {item.Message ? <div className='sender-message'>{item.Message}</div> : '-'}
                                <div className='sender-date'>{dateObject.toLocaleDateString()}<span className='sender-time'>{dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                            </div>
                        ),
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
            >
                <Container>
                    <div className={`drawer-wrapper drawer-700px min-320`}>
                        <Row className="drawer-heading mb-0">
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
                        {messages.length === 0 ? <NoContentFound title={"Remark history not found"} /> : <ChatFeed
                            messages={messages} // Array: list of message objects
                            // isTyping={true} // Boolean: is the recipient typing
                            hasInputField={false} // Boolean: use our input, or use your own
                            showSenderName={true} // show the name of the user who sent the message
                            bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                            chatBubble={false}
                        />}
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