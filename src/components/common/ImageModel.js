import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

class ImageModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      videoId: this.props._id
    };
  }

  handleSubmit = () => {
    this.props.onOk();
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  toggle = () => {
    this.props.onCancel();
  }

  render() {
    const { modelData } = this.props;
    return (
      <div>
        <Modal width="100%" height="100%" isOpen={this.props.modalVisible} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}></ModalHeader>
          <ModalBody>
            {<img src={this.props.imageURL} width="100%" height="100%" />}
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ImageModel;
