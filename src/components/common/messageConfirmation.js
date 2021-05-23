import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

class MessageConfirmation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      isShowAddressPublicly: false
    };
  }

  handleSubmit = () => {
    this.props.onOk(
      this.setState({
        isShowAddressPublicly: true
      })
    );
  }

  handleCancel = () => {
    this.props.onCancel(
      this.setState({
        isShowAddressPublicly: false
      })
    );
  }

  render() {
    return (
      <div>
        <Button color="danger" onClick={this.toggle}>{this.props.buttonLabel}</Button>
        <Modal isOpen={this.props.modalVisible} toggle={this.toggle} className={this.props.className }>
          {/* <ModalHeader toggle={this.toggle}>Modal title</ModalHeader> */}
          <ModalBody>
          As you have selected the date of birth less than 18 years, would you like to hide your contact details (phone number,email address, address) publicly?
          </ModalBody>
          <ModalFooter>
            <Button className="btn dark-pinkbtn px-3" onClick={this.handleSubmit}>Yes</Button>
            <Button className="btn black-btn px-3"  onClick={this.handleCancel}>No</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default MessageConfirmation;