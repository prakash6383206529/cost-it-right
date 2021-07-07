import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, acceptAllExceptSingleSpecialCharacter, maxLength80 } from "../../../helper/validation";
import { renderText, searchableSelect } from "../../layout/FormInputs";
import {
  createRMSpecificationAPI, updateRMSpecificationAPI, getRMSpecificationDataAPI,
  getRowMaterialDataAPI, getRawMaterialNameChild, getMaterialTypeDataAPI, getRMGradeSelectListByRawMaterial,
  getMaterialTypeSelectList,
} from '../actions/Material';
import { fetchRMGradeAPI } from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import AddGrade from './AddGrade';
import AddMaterialType from './AddMaterialType';
import AddRawMaterial from './AddRawMaterial';

class AddSpecification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditFlag: false,
      RawMaterial: [],
      material: [],
      RMGrade: [],
      Id: '',
      isOpenRMDrawer: false,
      isOpenGrade: false,
      isOpenMaterialDrawer: false,
      DropdownChanged: true,
      DataToChange: []
    }
  }

  /**
  * @method componentWillMount
  * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    this.props.getRawMaterialNameChild(() => { })
    // this.props.getMaterialTypeSelectList(() => { })
    this.props.getRMGradeSelectListByRawMaterial('', res => { })
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    const { RawMaterial, RMGrade, isRMDomesticSpec, } = this.props;

    if (isRMDomesticSpec && RawMaterial !== '' && RMGrade !== '') {
      this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, res => { })

      setTimeout(() => {
        const { rawMaterialNameSelectList, gradeSelectList } = this.props;

        let tempObj1 = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value === RawMaterial.value)
        let tempObj3 = gradeSelectList && gradeSelectList.find(item => item.Value === RMGrade.value)

        this.setState({
          RawMaterial: tempObj1 && tempObj1 !== undefined ? { label: tempObj1.Text, value: tempObj1.Value } : [],
          RMGrade: tempObj3 && tempObj3 !== undefined ? { label: tempObj3.Text, value: tempObj3.Value } : [],
        })
      }, 500)
    }

    this.getDetails()
  }

  getDetails = () => {
    const { ID, isEditFlag } = this.props;
    if (isEditFlag) {
      this.props.getRMSpecificationDataAPI(ID, res => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.getRMGradeSelectListByRawMaterial(Data.RawMaterialId, res => { })

          setTimeout(() => {
            const { rawMaterialNameSelectList, MaterialSelectList, gradeSelectList } = this.props;

            let tempObj1 = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value === Data.RawMaterialId)
            // let tempObj2 = MaterialSelectList && MaterialSelectList.find(item => item.Value === Data.MaterialId)
            let tempObj3 = gradeSelectList && gradeSelectList.find(item => item.Value === Data.GradeId)

            // this.setDensity(Data.MaterialId);
            this.setState({
              RawMaterial: tempObj1 && tempObj1 !== undefined ? { label: tempObj1.Text, value: tempObj1.Value } : [],
              // material: tempObj2 && tempObj2 !== undefined ? { label: tempObj2.Text, value: tempObj2.Value } : [],
              RMGrade: tempObj3 && tempObj3 !== undefined ? { label: tempObj3.Text, value: tempObj3.Value } : [],
            })
          }, 500)

        }
      });
    } else {
      this.props.getRMSpecificationDataAPI('', res => { });
    }
  }

  /**
  * @method handleRawMaterial
  * @description  used to raw material change
  */
  handleRawMaterial = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [], }, () => {
        const { RawMaterial } = this.state;
        this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, res => { });
      });
    } else {
      this.setState({ RawMaterial: [], RMGrade: [], });
      this.props.getRMGradeSelectListByRawMaterial(0, res => { });
    }
  }

  /**
  * @method handleMaterialChange
  * @description  used to material change and get grade's
  */
  handleMaterialChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ material: newValue }, () => {
        const { material } = this.state;
        this.setDensity(material.value);
      });
    } else {
      this.setState({ material: [], RMGrade: [] });
      this.props.change('Density', '')
    }
  }

  setDensity = (ID) => {
    this.props.getMaterialTypeDataAPI(ID, res => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        this.props.change('Density', Data.Density)
      }
    });
  }

  /**
  * @method handleGrade
  * @description  used to handle type of listing change
  */
  handleGrade = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue });
    } else {
      this.setState({ RMGrade: [], });
    }
    this.setState({ DropdownChanged: false })
  }

  /**
  * @method renderListing
  * @description Used show listing of row material
  */
  renderListing = (label) => {
    const { rawMaterialNameSelectList, MaterialSelectList, gradeSelectList, } = this.props;
    const temp = [];

    if (label === 'RawMaterialName') {
      rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'material') {
      MaterialSelectList && MaterialSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'RMGrade') {
      gradeSelectList && gradeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      material: [],
      RMGrade: [],
    })
    this.toggleDrawer('')
    this.props.getRMSpecificationDataAPI('', res => { });
  }

  toggleDrawer = (event, data) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', data)
  };

  rawMaterialToggler = (Id = '') => {
    this.setState({ DropdownChanged: false })
    this.setState({ isOpenRMDrawer: true, Id: Id })
  }

  /**
  * @method closeGradeDrawer
  * @description  used to toggle RM Drawer Popup/Drawer
  */
  closeRMDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenRMDrawer: false, Id: '' }, () => {
      this.getDetails()
      this.props.getRawMaterialNameChild(() => {
        this.props.getRMGradeSelectListByRawMaterial('', res => { })
        /*FOR SHOWING DEFAULT VALUE FROM SELECTED FROM DRAWER*/
        const { rawMaterialNameSelectList } = this.props;
        if (Object.keys(formData).length > 0) {
          let tempObj1 = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Text === formData.RawMaterialName)
          this.setState({
            RawMaterial: tempObj1 && tempObj1 !== undefined ? { label: tempObj1.Text, value: tempObj1.Value } : [],
            RMGrade: []
          })

        }
      })
    })
  }

  gradeToggler = (Id = '') => {
    this.setState({ DropdownChanged: false })
    this.setState({ isOpenGrade: true, Id: Id })
  }

  /**
  * @method closeGradeDrawer
  * @description  used to toggle grade Popup/Drawer
  */
  closeGradeDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenGrade: false, Id: '' }, () => {
      this.getDetails()
      const { RawMaterial } = this.state;
      this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, res => {
        /* FOR SHOWING DEFAULT VALUE SELECTED FROM DRAWER*/
        const { gradeSelectList } = this.props;
        if (Object.keys(formData).length > 0) {
          let tempObj3 = gradeSelectList && gradeSelectList.find(item => item.Text === formData.Grade)
          this.setState({
            RMGrade: tempObj3 && tempObj3 !== undefined ? { label: tempObj3.Text, value: tempObj3.Value } : [],
          })
        }
      });

    })
  }

  materialToggler = () => {
    this.setState({ isOpenMaterialDrawer: true })
  }

  /**
  * @method closeMaterialDrawer
  * @description  used to toggle Material Popup/Drawer
  */
  closeMaterialDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenMaterialDrawer: false }, () => {
      this.props.getMaterialTypeSelectList(() => {
        /*THIS IS FOR SELECTING DEFAULT VALUE OF MATERIAL  FROM DRAWER*/
        const { MaterialSelectList } = this.props;
        if (Object.keys(formData).length > 0) {
          let tempObj2 = MaterialSelectList && MaterialSelectList.find(item => item.Text === formData.MaterialType)
          this.setState({
            material: tempObj2 && tempObj2 !== undefined ? { label: tempObj2.Text, value: tempObj2.Value } : [],
          })
          this.props.change('Density', formData.CalculatedDensityValue)
        }
      })
    })
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { RawMaterial, material, RMGrade, DataToChange, DropdownChanged } = this.state;
    const { ID, isEditFlag } = this.props;

    if (isEditFlag) {


      if (DataToChange.Specification == values.Specification && DropdownChanged) {
        this.cancel()
        return false
      }
      let formData = {
        RawMaterialId: RawMaterial.value,
        SpecificationId: ID,
        Specification: values.Specification,
        GradeId: RMGrade.value,
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        GradeName: RMGrade.label,
        MaterialId: material.value,
        MaterialTypeName: material.label,
      }
      this.props.reset()
      this.props.updateRMSpecificationAPI(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.SPECIFICATION_UPDATE_SUCCESS);
          this.toggleDrawer('', '')
        }
      })
    } else {

      let formData = {
        RawMaterialId: RawMaterial.value,
        Specification: values.Specification,
        GradeId: RMGrade.value,
        MaterialId: material.value,
      }
      this.props.reset()
      this.props.createRMSpecificationAPI(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.SPECIFICATION_ADD_SUCCESS);
          this.toggleDrawer('', formData)
        }
      });
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
    const { isOpenRMDrawer, isOpenGrade, isOpenMaterialDrawer } = this.state;
    const { handleSubmit, isEditFlag, specificationData, AddAccessibilityRMANDGRADE,
      EditAccessibilityRMANDGRADE, } = this.props;
    return (
      <div>
        <Drawer
          anchor={this.props.anchor}
          open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          <Container>
            <div className={"drawer-wrapper spec-drawer"}>
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
                        {isEditFlag
                          ? "Update  Specification"
                          : "Add Raw Material Specification"}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => this.toggleDrawer(e)}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>
                <div className="ml-3">
                  <Row>
                    <Col md="12">
                      <div className="d-flex">
                        <Field
                          name="RawMaterialName"
                          type="text"
                          label="Raw Material"
                          component={searchableSelect}
                          placeholder={"Select"}
                          options={this.renderListing("RawMaterialName")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={
                            this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleRawMaterial}
                          valueDescription={this.state.RawMaterial}
                          disabled={isEditFlag ? true : false}
                          className="w-100"
                        />

                        {isEditFlag
                          ? EditAccessibilityRMANDGRADE && (
                            <button
                              className="Edit drawer-edit mt30"
                              type={"button"}
                              onClick={() =>
                                this.rawMaterialToggler(specificationData.RawMaterialId)
                              }
                            />
                          )
                          : AddAccessibilityRMANDGRADE && (
                            <div
                              onClick={() => this.rawMaterialToggler("")}
                              className={"plus-icon-square mt30  right"}
                            ></div>
                          )}
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <div className="d-flex justify-space-between align-items-center inputwith-icon">
                        <div className="fullinput-icon">
                          <Field
                            name="GradeId"
                            type="text"
                            label="RM Grade"
                            component={searchableSelect}
                            placeholder={"Select"}
                            options={this.renderListing("RMGrade")}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={
                              this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                            required={true}
                            handleChangeDescription={this.handleGrade}
                            valueDescription={this.state.RMGrade}
                          />
                        </div>
                        {isEditFlag ? (
                          EditAccessibilityRMANDGRADE && (
                            <button
                              className="Edit drawer-edit mt-2"
                              type={"button"}
                              onClick={() =>
                                this.gradeToggler(specificationData.GradeId)
                              }
                            />
                          )
                        ) : (this.state.RawMaterial == null ||
                          this.state.RawMaterial.length === 0) &&
                          AddAccessibilityRMANDGRADE ? (
                          <div
                            className={"plus-icon-square blurPlus-icon-square right mt30"}
                          ></div>
                        ) : (
                          AddAccessibilityRMANDGRADE && (
                            <div
                              onClick={() => this.gradeToggler("")}
                              className={"plus-icon-square right"}
                            ></div>
                          )
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    {/* <Col md="12">
                      <div className="d-flex">
                        <Field
                          name="MaterialTypeId"
                          type="text"
                          label="Material"
                          component={searchableSelect}
                          placeholder={"Select"}
                          options={this.renderListing("material")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={this.state.material == null || this.state.material.length === 0 ? [required] : []} required={true}
                          handleChangeDescription={this.handleMaterialChange}
                          valueDescription={this.state.material}
                        />

                        <div
                          onClick={this.materialToggler}
                          className={"plus-icon-square mt30  right"}
                        ></div>
                      </div>
                    </Col> */}
                    {/* <Col md="12">
                      <Field
                        label={`Density`}
                        name={"Density"}
                        type="text"
                        placeholder={"Enter"}
                        validate={[required]}
                        component={renderText}
                        // required={true}
                        className=" "
                        disabled={true}
                        customClassName=" withBorder"
                      />
                    </Col> */}
                  </Row>


                  <Row>
                    <Col md="12">
                      <Field
                        label={`${CONSTANT.SPECIFICATION}`}
                        name={"Specification"}
                        type="text"
                        placeholder={"Enter"}
                        validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80]}
                        component={renderText}
                        required={true}
                        className=" "
                        customClassName=" withBorder"
                      />
                    </Col>
                  </Row>

                  <Row className="sf-btn-footer no-gutters justify-content-between">
                    <div className="col-md-12 pr-3">
                      <div className="text-right ">
                        <button
                          type={"button"}
                          className=" mr15 cancel-btn"
                          onClick={this.cancel}
                        >
                          <div className={"cancel-icon"}></div>
                          {"Cancel"}
                        </button>
                        <button
                          type="submit"
                          className="user-btn save-btn"
                        >
                          <div className={"save-icon"}></div>
                          {isEditFlag ? "Update" : "Save"}
                        </button>
                      </div>
                    </div>
                  </Row>
                </div>
              </form>
            </div>
          </Container>
        </Drawer>
        {isOpenRMDrawer && (
          <AddRawMaterial
            isOpen={isOpenRMDrawer}
            closeDrawer={this.closeRMDrawer}
            isEditFlag={isEditFlag}
            ID={this.state.Id}
            anchor={"right"}
          />
        )}
        {isOpenGrade && (
          <AddGrade
            isOpen={isOpenGrade}
            closeDrawer={this.closeGradeDrawer}
            isEditFlag={isEditFlag}
            RawMaterial={this.state.RawMaterial}
            ID={this.state.Id}
            anchor={"right"}
          />
        )}
        {isOpenMaterialDrawer && (
          <AddMaterialType
            isOpen={isOpenMaterialDrawer}
            closeDrawer={this.closeMaterialDrawer}
            isEditFlag={isEditFlag}
            //ID={ID}
            anchor={"right"}
          />
        )}
      </div>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, material }) {
  const { specificationData, rawMaterialNameSelectList, gradeSelectList, MaterialSelectList } = material;

  let initialValues = {};
  if (specificationData && specificationData !== undefined) {
    initialValues = { Specification: specificationData.Specification, }
  }

  return {
    gradeSelectList, MaterialSelectList, specificationData,
    rawMaterialNameSelectList, initialValues
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  createRMSpecificationAPI,
  fetchRMGradeAPI,
  getMaterialTypeSelectList,
  updateRMSpecificationAPI,
  getRMSpecificationDataAPI,
  getRowMaterialDataAPI,
  getRawMaterialNameChild,
  getMaterialTypeDataAPI,
  getRMGradeSelectListByRawMaterial,
})(reduxForm({
  form: 'AddSpecification',
  enableReinitialize: true,
})(AddSpecification));
