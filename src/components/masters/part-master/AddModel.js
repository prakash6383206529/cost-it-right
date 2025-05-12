import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { acceptAllExceptSingleSpecialCharacter, checkSpacesInString, checkWhiteSpaces, maxLength80, required } from '../../../helper';
import { renderText } from '../../layout/FormInputs';
import { addModel, editModel, getModelById } from '../actions/Part';
import { loggedInUserId } from "../../../helper/auth";
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';

class ModelDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false
    };
  }
  componentDidMount() {
    // If we're in edit mode and have an ID, fetch the model data
    if (this.props.isEditFlag && this.props.ID) {
      this.props.getModelById(this.props.ID, (res) => {
        if (res && res.data && res.data.Result) {
          const modelData = res.data.Data;
          // Set the form field value using redux-form's change function
          this.props.change('ModelName', modelData.PartModelName);
        }
      });
    }
  }
  handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  handleCancel = (e) => {
    if (this.props.onClose) this.props.onClose();
  };

  handleSubmit = (e) => {
    e.preventDefault();
    
    const { ModelName } = this.props.formData;
    if (!ModelName) {
      Toaster.warning("Please fill all required fields");
      return;
    }
    
    this.setState({ isSubmitting: true });
    
    if (this.props.isEditFlag) {
      const updateData = {
        PartModelId: this.props.ID,
        PartModelMasterName: ModelName,
      };
      
      this.props.editModel(updateData, (res) => {
        this.setState({ isSubmitting: false });
        if (res && res.data && res.data.Result) {
          Toaster.success("Model updated successfully");
          if (this.props.refreshModelList) this.props.refreshModelList();
          if (this.props.onClose) this.props.onClose();
        }
      });
    } else {
      const addData = {
        PartModelMasterName: ModelName,
      };
      
      this.props.addModel(addData, (res) => {
        this.setState({ isSubmitting: false });
        if (res && res.data && res.data.Result) {
          Toaster.success("Model added successfully");
          if (this.props.refreshModelList) this.props.refreshModelList();
          if (this.props.onClose) this.props.onClose();
        }
      });
    }
  };

  render() {
    const { isOpen, anchor = 'right', onClose, isEditFlag } = this.props;
    return (
      <Drawer anchor={anchor} open={isOpen} onClose={onClose}>
        <Container>
          <div className="drawer-wrapper">
            {this.state.isSubmitting && <LoaderCustom />}
            <form
              noValidate
              className="form"
              onSubmit={this.handleSubmit}
              onKeyDown={this.handleKeyDown}
            >
              <Row className="drawer-heading">
                <Col>
                  <div className="header-wrapper left">
                    <h3>{isEditFlag ? "Update Model" : "Add Model"}</h3>
                  </div>
                  <div
                    onClick={this.handleCancel}
                    className="close-button right"
                  ></div>
                </Col>
              </Row>
              <Row>
                <Col md="12">
                  <Field
                    label={`Model Name`}
                    name={"ModelName"}
                    type="text"
                    placeholder={isEditFlag ? '-' : "Enter"}
                    validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
                    component={renderText}
                    required={true}
                    className=""
                    customClassName={"withBorder"}
                  />
                </Col>
              </Row>
              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-md-12 pl-3 pr-3">
                  <div className="text-right">
                    <Button
                      onClick={this.handleCancel}
                      variant="mr15 cancel-btn"
                      icon="cancel-icon"
                      buttonName="Cancel"
                    />
                    <Button
                      type="submit"
                      className="save-btn"
                      icon="save-icon"
                      buttonName={isEditFlag ? "Update" : "Save"}
                      disabled={this.state.isSubmitting}
                    />
                  </div>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    formData: state.form.ModelForm && state.form.ModelForm.values ? state.form.ModelForm.values : {}
  };
};

export default connect(mapStateToProps, {
  addModel,
  editModel,
  loggedInUserId,
  getModelById
})(reduxForm({
  form: 'ModelForm',
  enableReinitialize: true,
  touchOnChange: true,
})(ModelDrawer));