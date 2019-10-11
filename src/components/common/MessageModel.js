import React from 'react';
import { Modal, ModalHeader, ModalBody ,Row, Col} from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import {Field, reduxForm } from "redux-form";
import { connect } from 'react-redux';
import { getMutualProfileFolowerList, composeNewMessage } from '../../actions/Message';
import { MESSAGES } from '../../config/message';
import { renderTextAreaField } from "../layout/FormInputs";
import { required, maxLength5000 } from "../../helper/validation";

class MessageModel extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        message: '',
        isSubmitted: false,
        errorShow: false,
        isRedirect: false,
        url: ''
    };
  }

  /** 
  * @method onSubmit
  * @description used to submit form
  */
  onSubmit = () =>{
    this.sendMessageToTalent();
  }

  /** 
  * @method toggle
  * @description used to toggle modal
  */
  handleCancel = () => {
    this.props.onCancel();
  }

  /** 
  * @method toggle
  * @description used to toggle modal
  */
  toggle = () => {
    this.props.onCancel();
  }

  /** 
  * @method handleMessageChange
  * @description used to haldle message change
  */
  handleMessageChange = (e) => {
    this.setState({
        message: e.target.value.trim()
    })
  }

  /** 
  * @method sendMessageToTalent
  * @description used to send message to user
  */
  sendMessageToTalent = () => {
    const { message } = this.state;
    const {recieverUserId} = this.props;
    this.setState({ isSubmitted: true });
    if (this.state.message.length === 0) {
        this.setState({
            isSubmitted: false,
            errorShow: true
        })
        return false;
    }
    const rquestData = {
        senderUserId: this.props.userData.id,
        receiverUserId: [recieverUserId],
        message: message.trim()
    };
    this.setState({ sendMessageModalVisiable: false });
    this.props.composeNewMessage(rquestData, (res) => {
        if (res.data.status === true) {
          this.setState({ isSubmitted: false , errorShow: false });
            if (res.data.messageNotSentToUsers && res.data.messageNotSentToUsers.length > 0) {
                const blockedUsersName = res.data.messageNotSentToUsers.toString();
                const blockedUserMessage = `Message has been sent except the user(s) ${blockedUsersName}`;
                toastr.warning(blockedUserMessage);
            } else {
                this.setState({message : ''});
                this.setState({ isSubmitted: false, errorShow: false });
                toastr.success(res.data.message);
                this.toggle();
            }
        } else {
            this.setState({ sendMessageModalVisiable: true });
            toastr.error(MESSAGES.SOME_ERROR);
        }
    });
  }


  render() {
    const { modelData } = this.props;
    const { isSubmitted } = this.state;
    const { handleSubmit } = this.props;
    console.log("model data", modelData)
    return (
      <div>
        <Modal width="100%" height="100%" isOpen={this.props.sendMessageModalVisiable} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}></ModalHeader>
          <ModalBody>
          <Row >
            <Col md="12">
                <h3>Send A Message</h3>
            </Col>
          </Row>
          <hr/>
            <div className="col-md-12">
                <div className="sf-invitewrap">
                <form noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                <div className="row">
                        <div className="col-md-6">
                          <Field
                            label="Message"
                            placeholder="Type your message here..."
                            onChange={this.handleMessageChange}
                            value={this.state.message}
                            className="withoutBorder"
                            validate={[required, maxLength5000]}
                            component={renderTextAreaField}
                            required={true}
                            maxLength="5000"  
                          />
                          {this.state.errorShow && this.state.message.length === 0 &&
                            <div className="text-help">This field is required.</div>
                          }
                        </div>
                    <button 
                      type="button" 
                      onClick={this.sendMessageToTalent} 
                      disabled={isSubmitted ? true : false}
                      className="add-icon btn "
                    >
                        <i className="icon-navigation" /> send
                    </button>
                </div>
                </form>
                </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ auth, message }) =>{
  const { userData, loading } = auth;
  const { mutualFollowerList, sendMessageLoading } = message;
  console.log('mutualFollowerList',mutualFollowerList)
  return {
      userData, loading, mutualFollowerList, sendMessageLoading
  };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps                                       
*/
export default connect(
  mapStateToProps, { getMutualProfileFolowerList, composeNewMessage 
})(reduxForm({
  form: 'CompanyListFilter',
})(MessageModel));