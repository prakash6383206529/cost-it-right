import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import { Row, Col, Table } from 'reactstrap'
import { required, checkForNull, positiveAndDecimalNumber, maxLength10, checkForDecimalAndNull, decimalLengthsix } from '../../../helper/validation'
import { focusOnError, renderNumberInputField, searchableSelect } from '../../layout/FormInputs'
import { getPlantListByState } from '../actions/Fuel'
import { createLabour, getLabourData, updateLabour, labourTypeVendorSelectList, getLabourTypeByMachineTypeSelectList, } from '../actions/Labour'
import { getMachineTypeSelectList } from '../actions/MachineMaster'
import Toaster from '../../common/Toaster'
import { fetchStateDataAPI, getAllCity } from '../../../actions/Common';
import { MESSAGES } from '../../../config/message'
import { EMPTY_DATA, searchCount, SPACEBAR } from '../../../config/constants'
import { loggedInUserId } from '../../../helper/auth'
import Switch from 'react-switch'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import AddMachineTypeDrawer from '../machine-master/AddMachineTypeDrawer'
import NoContentFound from '../../common/NoContentFound'
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom'
import _, { debounce } from 'lodash'
import AsyncSelect from 'react-select/async';
import { onFocus } from '../../../helper'
import { reactLocalStorage } from 'reactjs-localstorage'
import { autoCompleteDropdown } from '../../common/CommonFunctions'
import PopupMsgWrapper from '../../common/PopupMsgWrapper'

const selector = formValueSelector('AddLabour')

class AddLabour extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    this.state = {
      isEditFlag: false,
      LabourDetailId: '',
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,

      IsEmployeContractual: true,
      IsVendor: false,
      labourData: [],
      vendorName: [],
      StateName: [],
      selectedPlants: [],

      gridTable: [],
      machineType: [],
      labourType: [],
      effectiveDate: '',

      isOpenMachineType: false,

      DropdownChanged: true,
      setDisable: false,
      inputLoader: false,
      labourRate: '',
      errorObj: {
        machineType: false,
        labourType: false,
        labourRate: false,
        effectiveDate: false
      },
      showErrorOnFocus: false,
      isEditMode: false,
      showPopup: false
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {

    }
    if (!this.state.isViewMode) {
      this.props.getMachineTypeSelectList(() => { })
    }
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {
      this.props.getAllCity(countryId => {
        this.props.fetchStateDataAPI(countryId, () => { })
      })
      this.props.getLabourTypeByMachineTypeSelectList({ machineTypeId: '' }, (res) => { this.setState({ labourData: res?.data?.SelectList }) })
      this.props.getPlantListByState('', () => { })
    }
    this.getDetail()
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }

  componentDidUpdate(prevProps) { }

  /**
   * @method getDetail
   * @description used to get user detail
   */
  getDetail = () => {
    const { data } = this.props
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: true,
        LabourId: data.ID,
      })
      this.props.getLabourData(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data

          setTimeout(() => {
            let GridArray =
              Data &&
              Data.LabourDetails.map((item) => {
                return {
                  LabourDetailId: item.LabourDetailId,
                  MachineTypeId: item.MachineTypeId,
                  MachineType: item.MachineType,
                  LabourTypeId: item.LabourTypeId,
                  LabourType: item.LabourType,
                  EffectiveDate: DayTime(item.EffectiveDate).isValid() ? DayTime(item.EffectiveDate).format('YYYY-MM-DD HH:mm') : '',
                  LabourRate: item.LabourRate,
                  IsAssociated: item.IsAssociated
                }
              })

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsVendor,
              IsEmployeContractual: Data.IsContractBase,
              vendorName: Data.IsContractBase ? Data.VendorName && Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [] : [],
              StateName: Data.StateName !== undefined ? { label: Data.StateName, value: Data.StateId } : [],
              selectedPlants: Data.Plants[0].PlantName !== undefined ? { label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId } : [],
              gridTable: GridArray,
            }, () => this.setState({ isLoader: false }))
          }, 500)
        }
      })
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getLabourData('', () => { })
    }
  }
  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  renderListing = (label) => {
    const {
      plantSelectList,
      stateList,
      machineTypeSelectList,
    } = this.props
    const { labourData } = this.state
    const temp = []

    if (label === 'state') {
      stateList && stateList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }

    if (label === 'plant') {
      plantSelectList &&
        plantSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

    if (label === 'MachineTypeList') {
      machineTypeSelectList &&
        machineTypeSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

    if (label === 'labourList') {
      labourData &&
        labourData.map((item) => {
          if (item.Value === '0') return false
          if (this.findLabourtype(item.Value, this.state.gridTable)) return false;
          temp.push({ label: item.Text, value: item.Value })
          return null;
        })
      return temp
    }
  }

  /**
   * @method onPressEmployeeTerms
   * @description EMPLOYEE TERMS
   */
  onPressEmployeeTerms = () => {
    this.setState({
      IsEmployeContractual: !this.state.IsEmployeContractual,
    })

  }

  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = () => {
    this.setState({
      IsVendor: !this.state.IsVendor,

    })
  }

  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, selectedVendorPlants: [], isVendorNameNotSelected: false })
    } else {
      this.setState({ vendorName: [], selectedVendorPlants: [] })
    }
  }

  /**
   * @method handleState
   * @description called
   */
  // handleState = (newValue, actionMeta) => {
  //   if (newValue && newValue !== '') {
  //     this.setState({ StateName: newValue }, () => {
  //       const { StateName } = this.state
  //       this.setState({ selectedPlants: [] })
  //       this.props.getPlantListByState(StateName.value, () => { })
  //     })
  //   } else {
  //     this.setState({ StateName: [] })
  //     this.props.getPlantListByState('', () => { })
  //   }
  // }
  handleState = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ StateName: newValue }, () => {
        const { StateName } = this.state
        this.setState({ selectedPlants: [] })
        this.props.getPlantListByState(StateName.value, () => { })
      })
    } else {
      this.setState({ StateName: [] })
      this.props.getPlantListByState('', () => { })

    }
  };

  /**
   * @method handlePlants
   * @description called
   */
  handlePlants = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ selectedPlants: newValue })
    } else {
      this.setState({ selectedPlants: [] })
    }
  }
  /**
   * @method handleMachineType
   * @description called
   */
  handleMachineType = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ machineType: newValue, labourType: [] }, () => {
        const { machineType } = this.state
        const data = {
          machineTypeId: machineType.value
        }
        this.props.getLabourTypeByMachineTypeSelectList(data, (res) => {
          const Data = res.data.SelectList
          this.setState({ labourData: Data })
        })
      })
    } else {
      this.setState({ machineType: [], labourType: [] })
      this.props.getLabourTypeByMachineTypeSelectList({ machineTypeId: '' }, () => { })
    }
  }

  machineTypeToggler = () => {
    this.setState({ isOpenMachineType: true, isEditMode: false })
  }
  machineTypeEdit = () => {
    this.setState({ isOpenMachineType: true, isEditMode: true })
  }
  closeMachineTypeDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenMachineType: false, labourType: '' }, () => {
      if (!this.state.isEditMode) {
        this.props.getMachineTypeSelectList(() => {
          const { machineTypeSelectList } = this.props
          /*TO SHOW MACHINE TYPE VALUE PRE FILLED FROM DRAWER*/
          if (Object.keys(formData).length > 0) {
            const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Text === formData.MachineType)
            this.setState({
              machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
            })
          }
        })
      }
    })
    setTimeout(() => {
      this.props.getLabourTypeByMachineTypeSelectList(
        { machineTypeId: this.state.machineType?.value ? this.state.machineType?.value : '' },
        (res) => { this.setState({ labourData: res?.data?.SelectList }) },
      )
    }, 400);
  }

  /**
   * @method labourHandler
   * @description called
   */
  labourHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ labourType: newValue })
    } else {
      this.setState({ labourType: [] })
    }
  }

  findLabourtype = (clickedData, arr) => {
    const { machineType } = this.state
    let isLabourType = _.find(arr, function (obj) {
      if (String(machineType.value) === String(obj.MachineTypeId) && String(obj.LabourTypeId) === String(clickedData)) {
        return true;
      } else {
        return false
      }
    });
    return isLabourType
  }

  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    })
  }

  gridHandler = () => {
    const { machineType, labourType, gridTable, effectiveDate, vendorName, selectedPlants, StateName, IsEmployeContractual } = this.state
    const { fieldsObj } = this.props
    if ((IsEmployeContractual ? vendorName.length === 0 : false) || selectedPlants.length === 0 || StateName === 0) {
      Toaster.warning('First fill upper detail')
      return false
    }
    let count = 0;
    setTimeout(() => {
      if (machineType.length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, machineType: true } })
        count++;
      }
      if (labourType.length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, labourType: true } })
        count++;
      }
      if (fieldsObj === undefined || Number(fieldsObj) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, labourRate: true } })
        count++;
      }
      if (effectiveDate === undefined || effectiveDate === '') {
        this.setState({ errorObj: { ...this.state.errorObj, effectiveDate: true } })
        count++;
      }
      if (count > 0) {
        return false
      }
      if (this.props.invalid === true) {
        return false;
      }

      //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
      const isExist = gridTable.findIndex((el) =>
        el.MachineTypeId === machineType.value &&
        el.LabourTypeId === labourType.value,
      )
      if (isExist !== -1) {
        Toaster.warning('Already added, Please check the values.')
        return false
      }
      const LabourRate = fieldsObj && fieldsObj !== undefined ? checkForNull(fieldsObj) : 0

      const tempArray = []

      tempArray.push(...gridTable, {
        LabourDetailId: '',
        MachineTypeId: machineType.value,
        MachineType: machineType.label,
        LabourTypeId: labourType.value,
        LabourType: labourType.label,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm'),
        LabourRate: LabourRate,
      })

      this.setState(
        {
          gridTable: tempArray,
          machineType: [],
          labourType: [],
          effectiveDate: '',
        },
        () => this.props.change('LabourRate', ''),
      )
      this.setState({ DropdownChanged: false, errorObj: { machineType: false, labourType: false, labourRate: false } })
    }, 200);
  }

  /**
   * @method updateGrid
   * @description Used to handle update grid
   */
  updateGrid = () => {
    const { machineType, labourType, gridTable, effectiveDate, gridEditIndex, } = this.state
    const { fieldsObj } = this.props
    const LabourRate =
      fieldsObj && fieldsObj !== undefined ? checkForNull(fieldsObj) : 0

    //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
    let skipEditedItem = gridTable.filter((el, i) => {
      if (i === gridEditIndex) return false
      return true
    })
    if (fieldsObj === undefined || Number(fieldsObj) === 0) {
      this.setState({ errorObj: { labourRate: true } })
      return false
    }
    //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
    const isExist = skipEditedItem.findIndex(
      (el) =>
        el.MachineTypeId === machineType.value &&
        el.LabourTypeId === labourType.value,
    )
    if (isExist !== -1) {
      Toaster.warning('Already added, Please check the values.')
      return false
    }
    if (this.props.invalid === true) {
      return false;
    }
    let tempArray = []

    let tempData = gridTable[gridEditIndex]
    tempData = {
      MachineTypeId: machineType.value,
      MachineType: machineType.label,
      LabourTypeId: labourType.value,
      LabourType: labourType.label,
      EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm'),
      LabourRate: LabourRate,
    }

    tempArray = Object.assign([...gridTable], { [gridEditIndex]: tempData })

    this.setState(
      {
        gridTable: tempArray,
        machineType: [],
        labourType: [],
        effectiveDate: '',
        gridEditIndex: '',
        isEditIndex: false,
      },
      () => this.props.change('LabourRate', 0),
    )
    this.setState({ DropdownChanged: false, errorObj: { machineType: false, labourType: false, labourRate: false } })
  }

  /**
   * @method resetGridData
   * @description Used to handle resetGridData
   */
  resetGridData = () => {
    this.setState(
      {
        machineType: [],
        labourType: [],
        gridEditIndex: '',
        isEditIndex: false,
        effectiveDate: ''
      },
      () => this.props.change('LabourRate', ''), this.props.getLabourTypeByMachineTypeSelectList({ machineTypeId: '' }, (res) => { this.setState({ labourData: res?.data?.SelectList }) })
    )
  }

  /**
   * @method editGridItemDetails
   * @description used to Edit grid data
   */
  editGridItemDetails = (index) => {
    const { gridTable } = this.state
    const tempData = gridTable[index]

    this.props.getLabourTypeByMachineTypeSelectList(
      { machineTypeId: tempData.MachineTypeId },
      (res) => {
        this.setState({ labourData: res?.data?.SelectList })
        this.setState({
          labourType: {
            label: tempData.LabourType,
            value: tempData.LabourTypeId,
          },
        })
      },
    )

    this.setState(
      {
        gridEditIndex: index,
        isEditIndex: true,
        machineType: {
          label: tempData.MachineType,
          value: tempData.MachineTypeId,
        },
        effectiveDate: tempData.EffectiveDate,
      },
      () => this.props.change('LabourRate', tempData.LabourRate),
    )
  }

  /**
   * @method deleteGridItem
   * @description DELETE GRID ITEM
   */
  deleteGridItem = (index) => {
    const { gridTable } = this.state

    let tempData = gridTable.filter((item, i) => {
      if (i === index) return false
      return true
    })

    this.setState({ gridTable: tempData })
    this.setState({ DropdownChanged: false, effectiveDate: '' })
    this.resetGridData()
    this.props.change('LabourRate', '')
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  cancel = (type) => {
    const { reset } = this.props
    reset()
    this.setState({
      selectedPlants: [],
      vendorName: [],
      isEditFlag: false,
      IsEmployeContractual: true,
    })
    this.props.getLabourData('', () => { })

    this.props.hideForm(type)
  }
  cancelHandler = () => {
    this.setState({ showPopup: true })
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = debounce((values) => {
    const { IsEmployeContractual, IsVendor, StateName, selectedPlants, vendorName, LabourId, gridTable, DropdownChanged } = this.state

    if (vendorName.length <= 0 && IsEmployeContractual) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })

    if (gridTable && gridTable.length === 0) {
      Toaster.warning('Labour Rate entry required.')
      return false
    }

    /** Update existing detail of supplier master **/
    if (this.state.isEditFlag) {

      if (DropdownChanged) {
        this.cancel('cancel')
        return false
      }

      this.setState({ setDisable: true })
      let updateData = {
        LabourId: LabourId,
        IsContractBase: IsEmployeContractual,
        IsVendor: IsVendor,
        VendorId: IsEmployeContractual ? vendorName.value : '',
        StateId: StateName.value,
        LoggedInUserId: loggedInUserId(),
        LabourDetails: gridTable,
        Plants: [
          { PlantId: selectedPlants.value, PlantName: selectedPlants.label },
        ],
        VendorPlant: [],
      }

      this.props.updateLabour(updateData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_LABOUR_SUCCESS)
          this.cancel('submit')
        }
      })
      this.setState({ DropdownChanged: true })
    } else {
      /** Add new detail for creating operation master **/

      this.setState({ setDisable: true })
      let formData = {
        IsContractBase: IsEmployeContractual,
        IsVendor: IsVendor,
        VendorId: IsEmployeContractual ? vendorName.value : '',
        StateId: StateName.value,
        LabourDetails: gridTable,
        Plants: [
          { PlantId: selectedPlants.value, PlantName: selectedPlants.label },
        ],
        LoggedInUserId: loggedInUserId(),
        VendorPlant: [],
      }

      this.props.createLabour(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.LABOUR_ADDED_SUCCESS)
          this.cancel('submit')
        }
      })
    }
  }, 500)

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
    const { handleSubmit, initialConfiguration } = this.props;
    const { isEditFlag, isOpenMachineType, isViewMode, setDisable, gridTable, isEditMode } = this.state;
    const filterList = async (inputValue) => {
      const { vendorName } = this.state
      const resultInput = inputValue.slice(0, 3)
      if (inputValue?.length >= searchCount && vendorName !== resultInput) {
        // this.setState({ inputLoader: true })
        let res
        res = await labourTypeVendorSelectList(resultInput)
        // this.setState({ inputLoader: false })
        this.setState({ vendorName: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        let VendorData = []
        if (inputValue) {
          VendorData = reactLocalStorage?.getObject('vendorData')
          // this.setState({ inputLoader: false })
          return autoCompleteDropdown(inputValue, VendorData)
        } else {
          return VendorData
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('vendorData')
          if (inputValue) {
            VendorData = reactLocalStorage?.getObject('vendorData')
            return autoCompleteDropdown(inputValue, VendorData)
          } else {
            return VendorData
          }
        }
      }
    };

    return (
      <div className="container-fluid">
        {this.state.isLoader && <LoaderCustom />}
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-heading mb-0">
                      <h1>{this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Labour
                      </h1>
                    </div>
                  </div>
                </div>
                <form
                  noValidate
                  className="form"
                  onSubmit={handleSubmit(this.onSubmit.bind(this))}
                  onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                >
                  <div className="add-min-height">
                    <Row>
                      <Col md="4" className="switch mb15">
                        <label className="switch-level">
                          <div className={"left-title"}>Employed</div>
                          <Switch
                            onChange={this.onPressEmployeeTerms}
                            checked={this.state.IsEmployeContractual}
                            id="normal-switch"
                            disabled={isEditFlag ? true : false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#4DC771"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                          />
                          <div className={"right-title"}>Contractual</div>
                        </label>
                      </Col>

                    </Row>

                    <Row>
                      <Col md="12" className="filter-block">
                        <div className=" flex-fills mb-2 w-100 pl-0">
                          <h5>{"Vendor:"}</h5>
                        </div>
                      </Col>
                      {this.state.IsEmployeContractual && (
                        <Col md="3" className='mb-4'>
                          <label>{"Vendor (Code)"}<span className="asterisk-required">*</span></label>
                          <div className="p-relative">
                            {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                            <AsyncSelect
                              name="vendorName"
                              ref={this.myRef}
                              key={this.state.updateAsyncDropdown}
                              loadOptions={filterList}
                              onChange={(e) => this.handleVendorName(e)}
                              value={this.state.vendorName}
                              noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? "Enter 3 characters to show data" : "No results found"}
                              isDisabled={(isEditFlag) || gridTable.length !== 0 ? true : false}
                              onKeyDown={(onKeyDown) => {
                                if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                              }}
                              onFocus={() => onFocus(this)}
                              placeholder={"Select"}
                            />
                            {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}

                          </div>
                        </Col>
                      )}
                      <Col md="3">
                        <div className="form-group">
                          <Field
                            name="state"
                            type="text"
                            label="State"
                            component={searchableSelect}
                            placeholder={(isEditFlag && gridTable.length !== 0) ? '-' : "Select"}
                            options={this.renderListing("state")}
                            validate={
                              this.state.StateName == null || this.state.StateName.length === 0 ? [required] : []}
                            required={true}
                            handleChangeDescription={this.handleState}
                            valueDescription={this.state.StateName}
                            disabled={(isEditFlag || gridTable.length !== 0) ? true : false}
                          /></div>
                        { }
                      </Col>
                      <Col md="3">
                        <div className="form-group">
                          <Field
                            name="Plant"
                            type="text"
                            label="Plant (Code)"
                            component={searchableSelect}
                            placeholder={(isEditFlag && gridTable.length !== 0) ? '-' : "Select"}
                            options={this.renderListing("plant")}
                            validate={
                              this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                            required={true}
                            handleChangeDescription={this.handlePlants}
                            valueDescription={this.state.selectedPlants}
                            disabled={(isEditFlag || gridTable.length !== 0) ? true : false}
                          /></div>
                      </Col>
                    </Row>

                    <Row className='sub-form-container'>
                      <Col md="12" className="filter-block">
                        <div className=" flex-fills mb-2 w-100 pl-0">
                          <h5>{"Rate Per Person:"}</h5>
                        </div>
                      </Col>

                      <Col md="3" className="col">
                        <div className="d-flex justify-space-between inputwith-icon form-group">
                          <div className="fullinput-icon">
                            <Field
                              name="MachineType"
                              type="text"
                              label="Machine Type"
                              component={searchableSelect}
                              placeholder={isViewMode ? '-' : "Select"}
                              options={this.renderListing("MachineTypeList")}
                              required={true}
                              handleChangeDescription={this.handleMachineType}
                              valueDescription={this.state.machineType}
                              disabled={isViewMode}
                            />
                            {this.state.errorObj.machineType && this.state.machineType.length === 0 && <div className='text-help p-absolute'>This field is required.</div>}
                          </div>
                          {!isViewMode && (
                            <div className='action-icon-container'>
                              <div
                                onClick={this.machineTypeToggler}
                                className={"plus-icon-square mt-0 right"}
                              ></div>
                              <button type="button" onClick={this.machineTypeEdit} className={'user-btn'} disabled={this.state.machineType.value ? false : true}> <div className={"edit_pencil_icon right"}></div></button>
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col md="2" className="col">
                        <div className="form-group">
                          <Field
                            name="LabourTypeIds"
                            type="text"
                            label="Labour Type"
                            component={searchableSelect}
                            placeholder={isViewMode ? '-' : "Select"}
                            options={this.renderListing("labourList")}
                            required={true}
                            handleChangeDescription={this.labourHandler}
                            valueDescription={this.state.labourType}
                            disabled={isViewMode}
                          />
                          {this.state.errorObj.labourType && this.state.labourType.length === 0 && <div className='text-help'>This field is required.</div>}
                        </div>
                      </Col>
                      <Col md="auto">
                        <div className="form-group">
                          <Field
                            label={`Rate Per Person/Annum (INR)`}
                            name={"LabourRate"}
                            type="text"
                            placeholder={isViewMode ? "-" : "Enter"}
                            disabled={isViewMode}
                            validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                            component={renderNumberInputField}
                            required={true}
                            className=" "
                            customClassName="withBorder"
                          />
                          {this.state.errorObj.labourRate && (this.props.fieldsObj === undefined || Number(this.props.fieldsObj) === 0) && <div className='text-help'>This field is required.</div>}
                        </div>
                      </Col>
                      <Col md="auto" className="d-flex">
                        <div className="form-group date-filed pr-3">
                          <label>Effective Date<span className="asterisk-required">*</span></label>
                          <div className="inputbox date-section">
                            <DatePicker
                              name="EffectiveDate"
                              selected={this.state.effectiveDate ? new Date(this.state.effectiveDate) : ""}
                              onChange={this.handleEffectiveDateChange}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="dd/MM/yyyy"
                              dropdownMode="select"
                              placeholderText={isViewMode ? '-' : "Select Date"}
                              className="withBorder"
                              autoComplete={"off"}
                              disabledKeyboardNavigation
                              onChangeRaw={(e) => e.preventDefault()}
                              disabled={isViewMode}
                              valueDescription={this.state.effectiveDate}
                            />
                            {this.state.errorObj.effectiveDate && this.state.effectiveDate === "" && <div className='text-help'>This field is required.</div>}
                          </div>
                        </div>
                        <div className="btn-mr-rate mt30 pt-1 pr-0 col-auto">
                          {this.state.isEditIndex ? (
                            <>
                              <button type="button"
                                className={"btn btn-primary pull-left mr5"}
                                onClick={this.updateGrid}
                              > Update
                              </button>

                              <button
                                type="button"
                                className={"reset-btn pull-left"}
                                onClick={this.resetGridData}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className={"user-btn  pull-left"}
                                onClick={this.gridHandler}
                                disabled={isViewMode}
                              >
                                <div className={"plus"}></div>ADD
                              </button>
                              <button
                                type="button"
                                className={"reset-btn pull-left ml5"}
                                onClick={this.resetGridData}
                              >
                                Reset
                              </button>
                            </>
                          )}
                        </div>
                      </Col>
                      <Col md="12">
                        <Table className="table border" size="sm">
                          <thead>
                            <tr>
                              <th>{`Machine Type`}</th>
                              <th>{`Labour Type`}</th>
                              <th>{`Rate Per Person/Annum(INR)`}</th>
                              <th>{`Effective Date`}</th>
                              <th>{`Action`}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.gridTable &&
                              this.state.gridTable.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{item.MachineType}</td>
                                    <td>{item.LabourType}</td>
                                    <td>{checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                                    <td>
                                      {item.EffectiveDate ? DayTime(item.EffectiveDate).format(
                                        "DD/MM/YYYY"
                                      ) : '-'}
                                    </td>
                                    <td>
                                      <button
                                        className="Edit mr-2"
                                        type={"button"}
                                        disabled={isViewMode || item.IsAssociated}
                                        onClick={() =>
                                          this.editGridItemDetails(index)
                                        }
                                      />
                                      <button
                                        className="Delete"
                                        disabled={isViewMode || item.IsAssociated}
                                        type={"button"}
                                        onClick={() =>
                                          this.deleteGridItem(index)
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              })}

                          </tbody>
                          {this.state.gridTable.length === 0 && (<tbody className='border'>
                            <tr>
                              <td colSpan={"5"}>
                                <NoContentFound title={EMPTY_DATA} />
                              </td>
                            </tr>
                          </tbody>)}
                        </Table>
                      </Col>
                    </Row>
                  </div>

                  <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        type={"button"}
                        className="reset mr15 cancel-btn"
                        onClick={this.cancelHandler}
                        disabled={setDisable}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="submit-button mr5 save-btn"
                        disabled={isViewMode || setDisable}
                      >
                        <div className={"save-icon"}></div>
                        {isEditFlag ? "Update" : "Save"}
                      </button>
                    </div>
                  </Row>
                </form>
              </div>
            </div>
          </div>
        </div>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
        {isOpenMachineType && (
          <AddMachineTypeDrawer
            isOpen={isOpenMachineType}
            closeDrawer={this.closeMachineTypeDrawer}
            isEditFlag={isEditMode}
            machineTypeId={this.state.machineType.value ? this.state.machineType.value : ''}
            ID={""}
            anchor={"right"}
            gridTable={this.state.gridTable}
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
function mapStateToProps(state) {
  const fieldsObj = selector(state, 'LabourRate')
  const { supplier, machine, fuel, labour, auth, comman } = state
  const {
    VendorLabourTypeSelectList,
  } = labour
  const { stateList } = comman;

  const { vendorWithVendorCodeSelectList } = supplier
  const { machineTypeSelectList } = machine
  const { fuelDataByPlant, plantSelectList } = fuel
  const { initialConfiguration } = auth;
  let initialValues = {}

  return {
    fuelDataByPlant,
    plantSelectList,
    vendorWithVendorCodeSelectList,
    machineTypeSelectList,
    VendorLabourTypeSelectList,
    fieldsObj,
    initialValues,
    initialConfiguration,
    stateList
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  createLabour,
  getLabourData,
  updateLabour,
  getMachineTypeSelectList,
  getLabourTypeByMachineTypeSelectList,
  fetchStateDataAPI,
  getAllCity,
  getPlantListByState,
  labourTypeVendorSelectList,
})(
  reduxForm({
    form: 'AddLabour',
    enableReinitialize: true,
    touchOnChange: true,
    onSubmitFail: errors => {
      focusOnError(errors);
    },
  })(AddLabour),
)
