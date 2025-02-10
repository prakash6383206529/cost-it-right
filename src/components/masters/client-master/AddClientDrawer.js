import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Table, } from 'reactstrap';
import { required, email, minLength7, maxLength70, acceptAllExceptSingleSpecialCharacter, maxLength12, minLength10, maxLength80, checkWhiteSpaces, maxLength20, postiveNumber, maxLength5, maxLength6, number, checkForNull, positiveAndDecimalNumber, maxLength10, hashValidation } from "../../../helper/validation";
import { renderText, renderEmailInputField, searchableSelect, renderTextInputField } from "../../layout/FormInputs";
import { createClient, updateClient, getClientData, checkAndGetCustomerCode, getPoamStatusSelectList } from '../actions/Client';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, getCityByCountryAction, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import LoaderCustom from '../../common/LoaderCustom';
import { debounce } from 'lodash';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import HeaderTitle from '../../common/HeaderTitle';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';

const selector = formValueSelector('AddClientDrawer');


class AddClientDrawer extends Component {
    constructor(props) {

        super(props);
        this.state = {
            isEditFlag: false,
            isShowForm: false,
            isViewMode: this.props?.isViewMode ? true : false,
            ClientId: '',
            city: [],
            country: [],
            state: [],
            showStateCity: true,
            DropdownChanged: true,
            DataToCheck: [],
            setDisable: false,
            isDisableCode: false,
            companyCode: '',
            companyName: '',
            showPopup: false,
            status: [],
            errorObj: {
                status: false,
                fromPOSeries: false,
                toPOSeries: false
            },
            statusGrid: []
        }
    }
    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { initialConfiguration } = this.props

        if (!(this.props.isEditFlag || this.props.isViewMode)) {
            this.props.fetchCountryDataAPI(() => { })
        }
        this.getDetail()
        if (getConfigurationKey().IsShowPOSeriesInCustomerMaster) {
            this.props.getPoamStatusSelectList(() => { })
        }

    }

    getAllCityData = () => {

        const { country } = this.state;
        if (country && country.label !== 'India') {
            this.props.getCityByCountryAction(country.value, '00000000000000000000000000000000', '', () => { })
        } else {
            this.props.fetchStateDataAPI(country.value, () => { })
        }
    }

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ country: newValue, state: [], city: [] }, () => {
                this.getAllCityData()
            });
        } else {
            this.setState({ country: [], state: [], city: [] })
        }
        this.setState({ DropdownChanged: false })
    };

    /**
    * @method stateHandler
    * @description Used to handle state
    */
    stateHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ state: newValue, city: [], }, () => {
                const { state } = this.state;
                this.props.fetchCityDataAPI(state.value, () => { })
            });
        } else {
            this.setState({ state: [], city: [] });
        }
        this.setState({ DropdownChanged: false })
    };

    /**
    * @method cityHandler
    * @description Used to handle City
    */
    cityHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ city: newValue });
        } else {
            this.setState({ city: [] });
        }
        this.setState({ DropdownChanged: false })
    };
    /**
* @method handleStatus
* @description called
*/
    handleStatus = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ status: newValue });
        } else {
            this.setState({ status: [] })
        }
        this.setState({ DropdownChanged: false })
    };

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { countryList, stateList, cityList, poamStatusSelectList } = this.props;
        const temp = [];

        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
        if (label === 'status') {
            poamStatusSelectList && poamStatusSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
    }

    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = () => {
        const { isEditFlag, ID } = this.props;
        if (isEditFlag) {
            this.setState({
                isLoader: true,
                ClientId: ID,
            })
            this.props.getClientData(ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    let gridArray = Data &&
                        Data?.POSeriesRequestList?.map((item) => {
                            return {
                                Status: item.Status,
                                StatusId: item.StatusId,
                                POSeriesFrom: item.POSeriesFrom,
                                POSeriesTo: item.POSeriesTo,
                            }
                        })
                    this.setState({ DataToCheck: Data })
                    if (!(this.props.isEditFlag || this.props.isViewMode)) {
                        this.props.fetchStateDataAPI(Data.CountryId, () => { })
                        this.props.fetchCityDataAPI(Data.StateId, () => { })
                    }
                    this.props.change('CompanyCode', Data?.CompanyCode)
                    this.props.change('AddressLine1', Data.AddressLine1)
                    this.props.change('AddressLine2', Data.AddressLine2)
                    setTimeout(() => {
                        this.setState({
                            // isLoader: false,
                            country: Data.CountryName !== undefined ? { label: Data.CountryName, value: Data.CountryId } : [],
                            state: Data.StateName !== undefined ? { label: Data.StateName, value: Data.StateId } : [],
                            city: Data.CityName !== undefined ? { label: Data.CityName, value: Data.CityId } : [],
                            statusGrid: gridArray
                        }, () => this.setState({ isLoader: false }))
                    }, 500)
                }
            })
        } else {
            this.props.getClientData('', () => { })
        }
    }

    toggleDrawer = (event, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', type)
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = (type) => {
        const { reset } = this.props;
        reset();
        this.setState({
            city: [],
            country: [],
            state: [],
            isViewMode: false
        })
        if (type === 'submit') {
            this.props.getClientData('', () => { })
            this.props.fetchStateDataAPI(0, () => { })
        }

        this.toggleDrawer('', type)
    }
    cancelHandler = () => {
        // this.setState({ showPopup: true })
        this.cancel('cancel')
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
        const { city, DataToCheck, DropdownChanged, statusGrid } = this.state;
        const { isEditFlag, ID, clientData } = this.props;

        if (getConfigurationKey().IsShowPOSeriesInCustomerMaster && statusGrid && statusGrid.length === 0) {
            Toaster.warning('PO Series Table entry required.')
            return false
        }
        /** Update existing detail of supplier master **/
        if (isEditFlag) {
            if (DropdownChanged && DataToCheck.ClientName === values.ClientName && DataToCheck.ClientEmailId === values.ClientEmailId &&
                DataToCheck.PhoneNumber === values.PhoneNumber && DataToCheck.Extension === values.Extension &&
                DataToCheck.MobileNumber === values.MobileNumber && DataToCheck.ZipCode === values.ZipCode && DataToCheck.AddressLine1 === values.AddressLine1 &&
                DataToCheck.AddressLine2 === values.AddressLine2) {
                this.toggleDrawer('')
                return false
            }

            this.setState({ setDisable: true })
            let updateData = {
                ClientId: ID,
                ClientName: values.ClientName,
                CompanyName: values.CompanyName,
                ClientEmailId: values.ClientEmailId,
                MobileNumber: values.MobileNumber,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
                LoggedInUserId: loggedInUserId(),
                CompanyCode: values.CompanyCode,
                POSeriesRequestList: getConfigurationKey().IsShowPOSeriesInCustomerMaster ? statusGrid : [],
                AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
                AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
                AddressId: clientData.AddressId,
            }

            this.props.updateClient(updateData, (res) => {
                this.setState({ setDisable: false })
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.CLIENT_UPDATE_SUCCESS);
                    this.cancel('submit');
                }
            });

        } else {/** Add new detail for creating supplier master **/

            this.setState({ setDisable: true })
            let formData = {
                ClientName: values.ClientName,
                CompanyName: values.CompanyName,
                ClientEmailId: values.ClientEmailId,
                MobileNumber: values.MobileNumber,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
                LoggedInUserId: loggedInUserId(),
                CompanyCode: values.CompanyCode,
                POSeriesRequestList: getConfigurationKey().IsShowPOSeriesInCustomerMaster ? statusGrid : [],
                AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
                AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
            }
            this.props.createClient(formData, (res) => {
                this.setState({ setDisable: false })
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.CLIENT_ADD_SUCCESS);
                    this.cancel('submit');
                }
            });
        }

    }, 500)
    handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    checkUniqCode = debounce((e) => {

        this.setState({ companyCode: e.target.value });

        if (!this.props.initialConfiguration?.IsAutoGeneratedCustomerCompanyCode) { // When the key is false
            this.props.checkAndGetCustomerCode(e.target.value, this.state.companyName, res => {
                if (this.state.companyCode !== '' && this.state.companyName === '') {
                    this.props.change('CompanyCode', res?.data?.Data.CompanyCode);
                    this.props.change('CompanyName', res?.data?.Data.CompanyName);
                    Toaster.warning(res.data.Message);

                }
                if (res && res.status === 202) {

                    this.props.change('CompanyName', res?.data?.Data.CompanyName);
                    this.props.change('CompanyCode', res?.data?.Data.CompanyCode);
                }
                if (res && res.status === 200) {
                    this.props.change('CompanyCode', res?.data?.Data.CompanyCode);
                }
                if (res && res.status === 412) {

                    // Toaster.warning(res.data.Message);
                    this.props.change('CompanyCode', '');
                }
            });
        } else { // When the key is true
            this.props.checkAndGetCustomerCode(e.target.value, this.state.companyName, res => {
                let Data = res.data.DynamicData;
                if (Data?.IsExist) {
                    if (this.state.operationName) {
                        this.props.change('CompanyCode', Data.DynamicData.CompanyCode || '');
                    } else {

                        Toaster.warning(Data.Message);
                        this.props.change('CompanyCode', '');
                    }
                }
            });
        }
    }, 600);

    checkUniqCodeByName = debounce((e) => {

        this.setState({ companyName: e.target.value });
        if (!this.props.initialConfiguration?.IsAutoGeneratedCustomerCompanyCode) {
            this.props.checkAndGetCustomerCode("", e.target.value, res => {
                if (res && res.status === 202) {
                    if (res.data.Data?.CompanyCode !== '') {
                        this.props.change('CompanyCode', res.data.Data?.CompanyCode);
                        Toaster.warning(res.data.Message);
                        this.setState({ isDisableCode: true });
                    } else {
                        this.setState({ isDisableCode: false });
                        this.props.change('CompanyCode', '');
                    }
                }
            });
        } else {
            this.props.checkAndGetCustomerCode(this.state.companyCode, e.target.value, res => {
                if (res && res.data && res.data.Result === false) {
                    this.props.change('CompanyCode', res.data.Identity ? res.data.Identity : '');
                } else {
                    this.setState({ isDisableCode: !res.data.Result }, () => {
                        this.props.change('CompanyCode', res.data.Identity ? res.data.Identity : '');
                        Toaster.warning(res.data.Message);
                    });
                }
            });
        }
    }, 600);
    /**
     * @method statusTableHandler
  
     * @description ADDIN PROCESS ROW IN TABLE GRID
    */
    statusTableHandler = () => {
        const { status, statusGrid } = this.state;
        const { fieldsObj } = this.props;
        const tempArray = [];
        let count = 0;
        setTimeout(() => {

            if (status.length === 0) {
                this.setState({ errorObj: { ...this.state.errorObj, status: true } })
                count++;
            }
            if (fieldsObj.FromPOSeries === undefined || Number(fieldsObj.FromPOSeries) === 0) {
                this.setState({ errorObj: { ...this.state.errorObj, fromPOSeries: true } })
                count++;
            }
            if (fieldsObj.ToPOSeries === undefined || Number(fieldsObj.ToPOSeries) === 0) {
                this.setState({ errorObj: { ...this.state.errorObj, toPOSeries: true } })
                count++;
            }
            if (count > 0) {
                return false;
            }
            if (maxLength10(fieldsObj.ToPOSeries) || maxLength10(fieldsObj.FromPOSeries)) {
                return false
            }

            const FromPOSeries = checkForNull(fieldsObj?.FromPOSeries);
            const ToPOSeries = checkForNull(fieldsObj.ToPOSeries);

            // CONDITION TO CHECK DUPLICATE ENTRY IN GRID
            const isExist = statusGrid.findIndex(el => ((el.statusId === status.value) && (el.FromPOSeries === FromPOSeries) && (el.ToPOSeries === ToPOSeries)))
            if (isExist !== -1) {
                Toaster.warning('Already added, Please check the values.')
                return false;
            }
            if (FromPOSeries >= ToPOSeries) {
                Toaster.warning('From PO Series should be less than To PO Series ')
                return false;
            }
            tempArray.push(...statusGrid, {
                Status: status.label,
                StatusId: status.value,
                POSeriesFrom: FromPOSeries,
                POSeriesTo: ToPOSeries
            })

            this.setState({
                statusGrid: tempArray,
                status: [],
                errorObj: []
            }, () => this.props.change('ToPOSeries', ''));
            this.props.change('FromPOSeries', '')
        }, 200);
    }
    /**     
     * @method statusTableReset
     * @description RESET VALUES 
     */
    statusTableReset = () => {
        this.setState({
            status: [],
            errorObj: []
        }, () => this.props.change('ToPOSeries', ''));
        this.props.change('FromPOSeries', '')
    }

    /**     
     * @method deleteItem
     * @description DELETE ROW ENTRY FROM TABLE 
     */
    deleteItem = (index) => {
        const { statusGrid } = this.state;

        let tempData = statusGrid.filter((item, i) => {
            if (i === index) {
                return false;
            }
            return true;
        });

        this.setState({
            statusGrid: tempData,
            status: [],
            DropdownChanged: false
        }, () => this.props.change('ToPOSeries', tempData.length === 0 ? '' : this.props.fieldsObj.ToPOSeries))
        this.props.change('FromPOSeries', tempData.length === 0 ? '' : this.props.fieldsObj.FromPOSeries)
    }
    /**
     * @method render
     * @description Renders the component
     */
    render() {
        const { handleSubmit, isEditFlag, t } = this.props;
        const { country, isViewMode, setDisable, isDisableCode } = this.state;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    {this.state.isLoader && <LoaderCustom />}
                    <Container >
                        <div className={'drawer-wrapper drawer-700px'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Customer
                                                {!isViewMode && <TourWrapper
                                                    buttonSpecificProp={{ id: "Add_Customer_Form" }}
                                                    stepsSpecificProp={{
                                                        steps: Steps(t, { isEditFlag: isEditFlag }).ADD_CLIENT
                                                    }} />}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e, 'cancel')}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="6">
                                        <Field
                                            label={`Customer Name`}
                                            name={"CompanyName"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : "Enter"}
                                            validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation]}
                                            component={renderText}
                                            onChange={this.checkUniqCodeByName}
                                            required={true}
                                            className=""
                                            customClassName={'withBorder'}
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label={`Customer Code`}
                                            name={'CompanyCode'}
                                            type="text"
                                            placeholder={(isEditFlag || isDisableCode) ? '-' : "Select"}
                                            validate={[required]}
                                            valueDescription={this.state.companyCode}
                                            component={renderText}
                                            required={true}
                                            onChange={this.checkUniqCode}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={(isEditFlag || isDisableCode || getConfigurationKey()?.IsAutoGeneratedCustomerCompanyCode) ? true : false}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label={`Contact Name`}
                                            name={"ClientName"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : "Enter"}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength70, checkWhiteSpaces, hashValidation]}
                                            component={renderText}
                                            required={false}
                                            className=""
                                            customClassName={'withBorder'}
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            id="AddClientDrawer_ClientEmailId"
                                            name="ClientEmailId"
                                            label="Email Id"
                                            component={renderEmailInputField}
                                            placeholder={isEditFlag ? '-' : "Enter"}
                                            validate={[required, email, minLength7, maxLength70]}
                                            required={true}
                                            maxLength={70}
                                            isDisabled={isEditFlag ? true : false}
                                            customClassName={'withBorderEmail withBorder remove-double-border'}
                                        />
                                    </Col>

                                    <Col md="6">
                                        <Row>
                                            <Col className="Phone phoneNumber" md="8">
                                                <Field
                                                    label="Phone No."
                                                    name={"PhoneNumber"}
                                                    type="text"
                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                    validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
                                                    component={renderTextInputField}
                                                    // required={true}
                                                    // maxLength={12}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    disabled={isViewMode}
                                                />
                                            </Col>
                                            <Col className="Ext phoneNumber pr-0" md="4">
                                                <Field
                                                    label="Ext."
                                                    name={"Extension"}
                                                    type="text"
                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                    validate={[postiveNumber, maxLength5, checkWhiteSpaces, number]}
                                                    component={renderTextInputField}
                                                    // required={true}
                                                    maxLength={5}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    disabled={isViewMode}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col md='6'>
                                        <Field
                                            name="MobileNumber"
                                            label="Mobile No."
                                            type="text"
                                            placeholder={isViewMode ? '-' : "Enter"}
                                            component={renderTextInputField}
                                            disabled={isViewMode}
                                            validate={[postiveNumber, maxLength12, minLength10, checkWhiteSpaces, number]}
                                            // required={true}
                                            maxLength={10}
                                            customClassName={'withBorder'}
                                        />
                                    </Col>

                                    <Col md='6'>
                                        <Field
                                            name="CountryId"
                                            type="text"
                                            label="Country"
                                            component={searchableSelect}
                                            placeholder={'Select'}
                                            options={this.renderListing('country')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.country == null || this.state.country.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.countryHandler}
                                            valueDescription={this.state.country}
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>
                                    {(country.length === 0 || country.label === 'India') &&
                                        <Col md='6'>
                                            <Field
                                                name="StateId"
                                                type="text"
                                                label="State"
                                                component={searchableSelect}
                                                placeholder={'Select'}
                                                options={this.renderListing('state')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.state == null || this.state.state.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.stateHandler}
                                                valueDescription={this.state.state}
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>}
                                    <Col md='6'>
                                        <Field
                                            name="CityId"
                                            type="text"
                                            label="City"
                                            component={searchableSelect}
                                            placeholder={'Select'}
                                            options={this.renderListing('city')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.city == null || this.state.city.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.cityHandler}
                                            valueDescription={this.state.city}
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>

                                    <Col md='6'>
                                        <Field
                                            label="ZipCode"
                                            name={"ZipCode"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : "Enter"}
                                            validate={[postiveNumber, maxLength6, number]}
                                            component={renderTextInputField}
                                            // required={true}
                                            maxLength={6}
                                            customClassName={'withBorder'}
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label="Address 1"
                                            name={"AddressLine1"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, hashValidation]}
                                            component={renderText}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label="Address 2"
                                            name={"AddressLine2"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, hashValidation]}
                                            component={renderText}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                </Row>
                                <Row className='pl-3'>
                                    {getConfigurationKey().IsShowPOSeriesInCustomerMaster && (
                                        <>
                                            <Col md="12">
                                                <HeaderTitle title={'PO Series Table:'} />
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="Status"
                                                            type="text"
                                                            label="Status"
                                                            component={searchableSelect}
                                                            placeholder={isViewMode ? '-' : 'Select'}
                                                            options={this.renderListing('status')}
                                                            required={true}
                                                            handleChangeDescription={this.handleStatus}
                                                            valueDescription={this.state.status}
                                                            disabled={isViewMode}
                                                        />
                                                        {this.state.errorObj?.status && (this.state.status && this.state.status?.length === 0) && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={'From PO Series'}
                                                    name={"FromPOSeries"}
                                                    type="number"
                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                    validate={[positiveAndDecimalNumber, maxLength10]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isViewMode}
                                                    className=" "
                                                    customClassName="po-series withBorder"
                                                />
                                                {this.state.errorObj.fromPOSeries && (this.props.fieldsObj.FromPOSeries === undefined || Number(this.props.fieldsObj.FromPOSeries) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={'To PO Series'}
                                                    name={"ToPOSeries"}
                                                    type="number"
                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                    validate={[positiveAndDecimalNumber, maxLength10]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isViewMode}
                                                    className=" "
                                                    customClassName="po-series withBorder"
                                                />
                                                {this.state.errorObj.toPOSeries && (this.props.fieldsObj.ToPOSeries === undefined || Number(this.props.fieldsObj.ToPOSeries) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                            </Col>
                                            <Col md="3" className='pl-0 mb-2 d-flex align-items-center'>
                                                <div className='d-flex mb-1'>
                                                    <button
                                                        type="button"
                                                        className={`${isViewMode ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                                        disabled={isViewMode ? true : false}
                                                        onClick={this.statusTableHandler}>
                                                        <div className={'plus'}></div>ADD</button>
                                                    <button
                                                        type="button"
                                                        disabled={isViewMode ? true : false}
                                                        className={`${isViewMode ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                                        onClick={this.statusTableReset}
                                                    >Reset</button>
                                                </div>
                                            </Col>
                                            <Col md="12">
                                                <Table className="table border" size="sm" >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Status`}</th>
                                                            <th>{`From PO Series`}</th>
                                                            <th>{`To PO Series`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {
                                                            this.state.statusGrid &&
                                                            this.state.statusGrid.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.Status}</td>
                                                                        <td>{item.POSeriesFrom}</td>
                                                                        <td>{item.POSeriesTo}</td>
                                                                        <td>
                                                                            <button title='Delete' className="Delete" type={'button'} disabled={isViewMode ? true : false} onClick={() => this.deleteItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                        <tr>
                                                            {this.state.statusGrid?.length === 0 && <td colSpan={"6"}>
                                                                <NoContentFound title={EMPTY_DATA} />
                                                            </td>}
                                                        </tr>
                                                    </tbody>

                                                </Table>
                                                {/* //RE */}
                                                {/* <Row className='pl-3'>
                                    {getConfigurationKey().IsShowPOSeriesInCustomerMaster && (
                                        <>
                                            <Col md="12">
                                                <HeaderTitle title={'PO Series Table:'} />
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="Status"
                                                            type="text"
                                                            label="Status"
                                                            component={searchableSelect}
                                                            placeholder={isViewMode ? '-' : 'Select'}
                                                            options={this.renderListing('status')}
                                                            required={true}
                                                            handleChangeDescription={this.handleStatus}
                                                            valueDescription={this.state.status}
                                                            disabled={isViewMode}
                                                        />
                                                        {this.state.errorObj?.status && (this.state.status && this.state.status?.length === 0) && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={'From PO Series'}
                                                    name={"FromPOSeries"}
                                                    type="number"
                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                    validate={[positiveAndDecimalNumber, maxLength10]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isViewMode}
                                                    className=" "
                                                    customClassName="po-series withBorder"
                                                />
                                                {this.state.errorObj.fromPOSeries && (this.props.fieldsObj.FromPOSeries === undefined || Number(this.props.fieldsObj.FromPOSeries) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={'To PO Series'}
                                                    name={"ToPOSeries"}
                                                    type="number"
                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                    validate={[positiveAndDecimalNumber, maxLength10]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isViewMode}
                                                    className=" "
                                                    customClassName="po-series withBorder"
                                                />
                                                {this.state.errorObj.toPOSeries && (this.props.fieldsObj.ToPOSeries === undefined || Number(this.props.fieldsObj.ToPOSeries) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                            </Col>
                                            <Col md="3" className='pl-0 mb-2 d-flex align-items-center'>
                                                <div className='d-flex mb-1'>
                                                    <button
                                                        type="button"
                                                        className={`${isViewMode ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                                        disabled={isViewMode ? true : false}
                                                        onClick={this.statusTableHandler}>
                                                        <div className={'plus'}></div>ADD</button>
                                                    <button
                                                        type="button"
                                                        disabled={isViewMode ? true : false}
                                                        className={`${isViewMode ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                                        onClick={this.statusTableReset}
                                                    >Reset</button>
                                                </div>
                                            </Col>
                                            <Col md="12">
                                                <Table className="table border" size="sm" >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Status`}</th>
                                                            <th>{`From PO Series`}</th>
                                                            <th>{`To PO Series`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {
                                                            this.state.statusGrid &&
                                                            this.state.statusGrid.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.Status}</td>
                                                                        <td>{item.POSeriesFrom}</td>
                                                                        <td>{item.POSeriesTo}</td>
                                                                        <td>
                                                                            <button title='Delete' className="Delete" type={'button'} disabled={isViewMode ? true : false} onClick={() => this.deleteItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                        <tr>
                                                            {this.state.statusGrid?.length === 0 && <td colSpan={"6"}>
                                                                <NoContentFound title={EMPTY_DATA} />
                                                            </td>}
                                                        </tr>
                                                    </tbody>

                                                </Table>
                                                </Col>
                                        </>
                                    )}
                                </Row> */}

                                            </Col>
                                        </>
                                    )}
                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between mb-4">
                                    <div className="col-md-12  text-right px-3">
                                        <div className="">
                                            <button
                                                type={'button'}
                                                id="addClient_Cancel"
                                                className="mr15 cancel-btn"
                                                onClick={this.cancelHandler}
                                                disabled={setDisable}
                                            >
                                                <div className={'cancel-icon'}></div> {'Cancel'}
                                            </button>
                                            {!isViewMode && <button
                                                id="addClient_Save"
                                                type="submit"
                                                disabled={isViewMode || setDisable}
                                                className="user-btn save-btn" >
                                                <div className={"save-icon"}></div>
                                                {this.props.isEditFlag ? 'Update' : 'Save'}
                                            </button>}
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                }
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
    const { comman, client, auth } = state;
    const fieldsObj = selector(state, 'FromPOSeries', 'ToPOSeries');
    const { countryList, stateList, cityList } = comman;
    const { clientData, poamStatusSelectList } = client;
    const { initialConfiguration } = auth;

    let initialValues = {};
    if (clientData && clientData !== undefined) {
        initialValues = {
            ClientName: clientData.ClientName,
            CompanyName: clientData.CompanyName,
            ClientEmailId: clientData.ClientEmailId,
            MobileNumber: clientData.MobileNumber,
            ZipCode: clientData.ZipCode,
            PhoneNumber: clientData.PhoneNumber,
            Extension: clientData.Extension,
        }
    }

    return { countryList, stateList, cityList, initialValues, clientData, initialConfiguration, poamStatusSelectList, fieldsObj }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    createClient,
    updateClient,
    getClientData,
    getCityByCountryAction,
    checkAndGetCustomerCode,
    getPoamStatusSelectList
})(reduxForm({
    form: 'AddClientDrawer',
    enableReinitialize: true,
    touchOnChange: true
})(withTranslation(['Client'])(AddClientDrawer)))
