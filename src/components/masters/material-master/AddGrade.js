import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, hashValidation, maxLength80 } from "../../../helper/validation";
import { renderText, } from "../../layout/FormInputs";
import { createRMGradeAPI, getRMGradeDataAPI, updateRMGradeAPI, getMaterialTypeSelectList } from '../actions/Material';
import { getRawMaterialSelectList } from '../../../actions/Common';
import { createCommodityCustomName, createIndex, getCommodityInIndexDataListAPI, getCommodityIndexDataListAPI, updateIndex } from '../actions/Indexation';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';

class AddGrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      MaterialId: '',
      indexId: '',
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    const { ID, isEditFlag } = this.props;
    if (isEditFlag && !this.props.isShowCommodity && !this.props.isShowIndex) {
      this.props.getRMGradeDataAPI(ID, res => { });
    } else if (isEditFlag && this.props.isShowIndex) {
      this.props.getCommodityIndexDataListAPI(ID, '', '', '', true, res => {
        const data = res.data.DataList
        this.props.change('Index', data[0].IndexExchangeName)
        this.setState({ indexId: data[0].IndexExchangeId })

      });
    } else {
      this.props.getRMGradeDataAPI('', res => { });
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.toggleDrawer('', '', type)
  }

  toggleDrawer = (event, formData, type) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', formData, type)
  };




  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { ID, isEditFlag, RawMaterial, } = this.props;
    if (!this.props.isShowCommodity && !this.props.isShowIndex) {
      if (isEditFlag) {
        let formData = {
          GradeId: ID,
          Grade: values.Grade,
          IsActive: true,
          CreatedDate: '',
          CreatedBy: loggedInUserId(),
          RawMaterialSpecificationId: this.props?.specificationId
        }
        this.props.reset()
        this.props.updateRMGradeAPI(formData, (res) => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.RM_GRADE_UPDATE_SUCCESS);
            this.toggleDrawer('', formData, 'submit')
          }
        })
      }
      else {
        values.RawMaterialId = RawMaterial.value;
        values.CreatedBy = loggedInUserId();

        this.props.reset()
        this.props.createRMGradeAPI(values, (res) => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.GRADE_ADD_SUCCESS);
            this.toggleDrawer('', values, 'submit')
          }
        });

      }
    }
    else if (this.props.isShowCommodity) {
      let obj = {
        LoggedInUserId: loggedInUserId(),
        CommodityStandardName: values.MaterialName
      }
      this.props.reset();
      this.props.createCommodityCustomName(obj, (res) => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.COMMODITYNAME_ADD_SUCCESS);
          this.toggleDrawer('', obj, 'submit');
        }
      });
    }
    else if (this.props.isShowIndex) {

      if (isEditFlag) {
        let formData = {
          LoggedInUserId: loggedInUserId(),
          IndexExchangeName: values.Index,
          IndexExchangeId: this.state.indexId
        }
        this.props.updateIndex(formData, (res) => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.INDEX_UPDATE_SUCCESS);
            this.toggleDrawer('', formData, 'submit')
          }
        })
      } else {
        let formData = {
          LoggedInUserId: loggedInUserId(),
          IndexExchangeName: values.Index
        }
        this.props.reset()
        this.props.createIndex(formData, (res) => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.INDEX_ADD_SUCCESS);
            this.toggleDrawer('', formData, 'submit')
          }
        });
      }
    }
  }

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag } = this.props;
    return (
      <>
        <Drawer
          anchor={this.props.anchor}
          open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          <Container>
            <div className={"drawer-wrapper"}>
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
              >
                <Row className="drawer-heading">
                  <Col>
                    <div className={"header-wrapper left"}>
                      <h3>
                        {this.props.isShowCommodity ? "Add Commodity" : this.props.isShowIndex ? 'Add Index' : isEditFlag ? "Update RM Grade" : "Add RM Grade"}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => { this.toggleDrawer(e, '', 'cancel') }}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>

                {!this.props.isShowCommodity && !this.props.isShowIndex && <Col md="12">
                  <Field
                    label={`Grade`}
                    name={"Grade"}
                    type="text"
                    placeholder={"Enter"}
                    validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation]}
                    component={renderText}
                    required={true}
                    className=" "
                    customClassName=" withBorder"
                  />
                </Col>}
                {this.props.isShowCommodity && <Col md="12">
                  <Field
                    label={`Commodity Name (In CIR)`}
                    name={"MaterialName"}
                    type="text"
                    placeholder={"Enter"}
                    validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation]}
                    component={renderText}
                    required={true}
                    className=" "
                    customClassName=" withBorder"
                  />
                </Col>}
                {this.props.isShowIndex && <Col md="12">
                  <Field
                    label={`Index`}
                    name={"Index"}
                    type="text"
                    placeholder={"Enter"}
                    validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation]}
                    component={renderText}
                    required={true}
                    className=" "
                    customClassName=" withBorder"
                  />
                </Col>}


                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="text-right w-100 p-0">
                    <Button
                      id="AddRMGrade_cancel"
                      variant="mr15 cancel-btn"
                      buttonName="CANCEL"
                      icon="cancel-icon"
                      onClick={() => { this.cancel('cancel') }}

                    />
                    <Button
                      id="AddRMGrade_save"
                      type="submit"
                      className="save-btn"
                      icon="save-icon"
                      buttonName={this.props.isEditFlag ? "UPDATE" : "SAVE"}
                    />
                  </div>
                </Row>

              </form>
            </div>
          </Container>
        </Drawer>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, material }) {
  const { rowMaterialList } = comman;
  const { gradeData, MaterialSelectList } = material;
  let initialValues = {};

  if (gradeData && gradeData !== undefined) {
    initialValues = {
      Grade: gradeData.Grade,
    }
  }
  return { rowMaterialList, MaterialSelectList, gradeData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
  {
    createRMGradeAPI,
    getRawMaterialSelectList,
    getMaterialTypeSelectList,
    getRMGradeDataAPI,
    updateRMGradeAPI,
    createCommodityCustomName,
    createIndex,
    updateIndex,
    getCommodityIndexDataListAPI
  })(reduxForm({
    form: 'AddGrade',
    enableReinitialize: true,
    touchOnChange: true
  })(AddGrade));
