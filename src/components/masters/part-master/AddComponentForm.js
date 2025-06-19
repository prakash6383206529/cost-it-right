import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, maxLength5, postiveNumber, minValue1, acceptAllExceptSingleSpecialCharacter, } from "../../../helper/validation";
import { renderText, validateForm } from "../../layout/FormInputs";
import { getComponentPartSelectList, getDrawerComponentPartData, } from '../actions/Part';
import { COMPONENT_PART, LEVEL1, searchCount, SPACEBAR } from '../../../config/constants';
import AsyncSelect from 'react-select/async';
import LoaderCustom from '../../common/LoaderCustom';
import { PartEffectiveDate } from './AddAssemblyPart';
import { onFocus } from '../../../helper';
import { autoCompleteDropdown } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { LabelsClass } from '../../../helper/core';
import { withTranslation } from 'react-i18next';

class AddComponentForm extends Component {
  static contextType = PartEffectiveDate
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      part: [],
      parentPart: [],
      isAddMore: false,
      selectedParts: [],
      updateAsyncDropdown: false,
      isPartNoNotSelected: false,
      isLoader: false,
      showErrorOnFocus: false,
      partName: '',
      mainLoader: false
    }
  }

  /**
 * @method componentDidMount
 * @description called after render the component
 */
  componentDidMount() {
    const { BOMViewerData, partAssembly } = this.props;

    let tempArr = [];
    BOMViewerData && BOMViewerData.map(el => {
      if (el.PartType === COMPONENT_PART && el.Level === LEVEL1) {
        tempArr.push(el.PartId)
      }
      return null;
    })

    this.setState({ selectedParts: tempArr })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.BOMViewerData !== prevProps.BOMViewerData) {
      const { BOMViewerData } = this.props;

      let tempArr = [];
      BOMViewerData && BOMViewerData.map(el => {
        if (el.PartType === COMPONENT_PART && el.Level === LEVEL1) {
          tempArr.push(el.PartId)
        }
        return null;
      })
      this.setState({ selectedParts: tempArr })
    }
  }

  componentWillUnmount() {
    reactLocalStorage?.setObject('PartData', [])
  }

  checkRadio = (radioType) => {
    this.setState({ childType: radioType })
  }

  /**
  * @method handlePartChange
  * @description  used to handle 
  */
  handlePartChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ part: newValue, isPartNoNotSelected: false, mainLoader: true }, () => {
        const { part } = this.state;
        this.props.getDrawerComponentPartData(part.value, res => {
          let Data = res.data.Data
          this.setState({ mainLoader: false })
          this.props.change("ECNNumber", Data.ECNNumber)
          this.props.change('DrawingNumber', Data.DrawingNumber)
          this.props.change('RevisionNumber', Data.RevisionNumber)
          this.props.change('PartName', Data.PartName)
          this.props.change('PartDescription', Data.Description)
          this.props.change('GroupCode', Data.GroupCodeList ? (Data.GroupCodeList.length > 0 ? (Data.GroupCodeList[0].GroupCode ? Data.GroupCodeList[0].GroupCode : "") : "") : "")
        })

      });
    } else {
      this.setState({ part: [], });
      this.props.getDrawerComponentPartData('', res => { })
    }
  }

  /**
  * @method handleParentPartChange
  * @description  used to handle 
  */
  handleParentPartChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ parentPart: newValue, });
    } else {
      this.setState({ parentPart: [], });
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { BOMViewerData } = this.props;
    let tempArr = [];
    BOMViewerData && BOMViewerData.map(el => {
      if (el.PartType === COMPONENT_PART && el.Level === LEVEL1) {
        tempArr.push(el.PartId)
      }
      return null;
    })


  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.props.toggleDrawer('')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { part, isAddMore } = this.state;
    const { DrawerPartData } = this.props;

    if (part.length <= 0) {
      this.setState({ isPartNoNotSelected: true })      // IF PART NO IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY
      return false
    }
    this.setState({ isPartNoNotSelected: false })

    let childData = {
      PartNumber: part ? part : [],
      Position: { "x": 600, "y": 50 },
      Outputs: part ? part.label : '',
      InnerContent: DrawerPartData && DrawerPartData.Description !== undefined ? DrawerPartData.Description : '',
      PartName: DrawerPartData && DrawerPartData.PartName ? DrawerPartData.PartName : "",
      Quantity: values.Quantity,
      Level: "L1",
      selectedPartType: this.props.selectedPartType,
      PartType: this.props.selectedPartType.Text,
      PartTypeId: this.props.selectedPartType.Value,
      PartId: part ? part.value : '',
      Input: Math.floor(100000 + Math.random() * 900000),
      Technology: DrawerPartData?.TechnologyName || '',
      RevisionNo: DrawerPartData?.RevisionNumber || null

    }
    this.props.getDrawerComponentPartData('', res => { })
    this.setState({
      part: [],
      showErrorOnFocus: false
    })

    this.props.change('PartNumber', [{ label: '', value: '' }])
    this.myRef.current.select.state.value = []

    if (isAddMore) {
      this.props.setChildParts(childData)
      this.setState({ updateAsyncDropdown: !this.state.updateAsyncDropdown })       //UPDATING RANDOM STATE FOR RERENDERING OF COMPONENT AFTER CLICKING ON ADD MORE BUTTON

    } else {
      this.props.toggleDrawer('', childData)
    }

    setTimeout(() => {
      this.setState({ updateAsyncDropdown: !this.state.updateAsyncDropdown })      // UPDATING RANDOM STATE AFTER 1 SECOND FOR REFRESHING THE ASYNC SELECT DROPDOWN AFTER CLICKING ON  ADD MORE BUTTON
    }, 1000);

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
    const { handleSubmit, isEditFlag, partAssembly, t } = this.props;
    const RevisionNoLabel = LabelsClass(t, 'MasterLabels').revisionNoLabel;
    const DrawingNoLabel = LabelsClass(t, 'MasterLabels').drawingNoLabel;
    const filterList = async (inputValue) => {
      const { partName, selectedParts } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && partName !== resultInput) {
        let obj = {
          technologyId: this.props?.TechnologySelected.value,
          date: this.context,
          partNumber: resultInput,
          isActive: true
        }
        this.setState({ isLoader: true })
        const res = await getComponentPartSelectList(obj)
        this.setState({ isLoader: false })
        this.setState({ partName: resultInput })
        let partDataAPI = res?.data?.SelectList

        if (partAssembly && partAssembly.convertPartToAssembly) {
          let filteredPartDataAPI = []
          partDataAPI && partDataAPI.map((item) => {
            if (item.Value !== partAssembly.value) {
              filteredPartDataAPI.push(item)
            }
          })
          partDataAPI = filteredPartDataAPI
        }

        if (inputValue) {
          return autoCompleteDropdown(inputValue, partDataAPI, true, selectedParts, true)
        } else {
          return partDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let partData = reactLocalStorage?.getObject('Data')
          if (inputValue) {
            return autoCompleteDropdown(inputValue, partData, true, selectedParts, false)
          } else {
            return partData
          }
        }
      }
    };

    return (
      <>
        <form
          noValidate
          className="form"
          onSubmit={handleSubmit(this.onSubmit.bind(this))}
          onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
        >
          {this.state.mainLoader && <LoaderCustom />}
          <Row>
            <Col md="6">
              <label>{"Part No."}<span className="asterisk-required">*</span></label>
              <div className='p-relative'>
                {this.state.isLoader && <LoaderCustom customClass="input-loader" />}
                <AsyncSelect
                  name="PartNumber"
                  ref={this.myRef}
                  key={this.state.updateAsyncDropdown}
                  cacheOptions
                  loadOptions={filterList}
                  onChange={(e) => this.handlePartChange(e)}
                  noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? 'Enter 3 characters to show data' : "No results found"}
                  onBlur={() => this.setState({ showErrorOnFocus: true })}
                  onKeyDown={(onKeyDown) => {
                    if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                  }}
                />
                {((this.state.showErrorOnFocus && this.state.part.length === 0) || this.state.isPartNoNotSelected) && <div className='text-help'>This field is required.</div>}
              </div>
            </Col>
            <Col md="6">
              <Field
                label={`Part Name`}
                name={"PartName"}
                type="text"
                placeholder={""}
                validate={[acceptAllExceptSingleSpecialCharacter]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`Part Description`}
                name={"PartDescription"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>
            <Col md="6">
              <Field
                label={`ECN No.`}
                name={"ECNNumber"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={RevisionNoLabel}
                name={"RevisionNumber"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>
            <Col md="6">
              <Field
                label={DrawingNoLabel}
                name={"DrawingNumber"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>

            <Col md="6">
              <Field
                label={`Group Code`}
                name={"GroupCode"}
                type="text"
                placeholder={""}
                validate={[]}
                component={renderText}
                className=""
                customClassName={"withBorder"}
                disabled={true}
              />
            </Col>
            <Col md="6">
              <Field
                label={`Quantity`}
                name={"Quantity"}
                type="text"
                placeholder={""}
                validate={[postiveNumber, maxLength5, required, minValue1]}
                component={renderText}
                required={true}
                className=""
                customClassName={"withBorder"}
                disabled={false}
              />
            </Col>
          </Row>

          <Row className="sf-btn-footer no-gutters justify-content-between">
            <div className="col-sm-12 text-right d-flex align-items-center justify-content-end pr-3">
              <button
                type={"button"}
                className="reset mt-2 mr-2 cancel-btn"
                onClick={this.cancel}
              >
                <div className={"cancel-icon"}></div>
                {"Cancel"}
              </button>
              <button
                type={"submit"}
                className="submit-button mt-2 mr-2 save-btn"
                onClick={() => this.setState({ isAddMore: true })}
              >
                <div className={"plus"}></div>
                {"ADD MORE"}
              </button>
              <button
                type="submit"
                className="submit-button mt-2 save-btn"
                onClick={() => this.setState({ isAddMore: false })}
              >
                <div className={"save-icon"}></div>
                {isEditFlag ? "Update" : "Save"}
              </button>
            </div>
          </Row>
        </form>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part }) {
  const { componentPartSelectList, DrawerPartData } = part;

  let initialValues = {};
  if (DrawerPartData && DrawerPartData !== undefined) {
    initialValues = {
      BOMNumber: DrawerPartData.BOMNumber,
    }

  }

  return { componentPartSelectList, DrawerPartData, initialValues, }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getComponentPartSelectList,
  getDrawerComponentPartData,
})(reduxForm({
  form: 'AddComponentForm',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation(['MasterLabels'])(AddComponentForm)));
