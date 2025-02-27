import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getPlantSelectListByType } from '../../../actions/Common';
import { getConfigurationKey } from '../../../helper';
import { ZBC } from '../../../config/constants';
import { getClientSelectList } from '../../masters/actions/Client';
import TooltipCustom from '../../common/Tooltip';

function AddClientDrawer(props) {

  const { register, handleSubmit, formState: { errors }, control } = useForm();

  const [customer, setCustomer] = useState([]);
  const [data, setData] = useState({});
  const [DestinationPlant, setDestinationPlant] = useState([]);
  //dropdown loader 
  const [inputLoader, setInputLoader] = useState(false)
  const [VendorInputLoader, setVendorInputLoader] = useState(false)
  const [infoCategory, setInfoCategory] = useState([])
  const [isInfoCategorySelected, setIsInfoCategorySelected] = useState(false)

  const dispatch = useDispatch()

  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const plantSelectList = useSelector(state => state.comman.plantSelectList);
  const clientSelectList = useSelector((state) => state.client.clientSelectList)

  useEffect(() => {
    setVendorInputLoader(true)
    const { cbcGrid } = props;
    dispatch(getClientSelectList((res) => {
      setVendorInputLoader(false)
    }))
    dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))

    let tempArr = [];
    cbcGrid && cbcGrid.map(el => {
      tempArr.push(el.CustomerId)
      return null;
    })
    initialConfiguration?.IsDestinationPlantConfigure === false && setCustomer(tempArr)
  }, []);

  useEffect(() => {
    setInfoCategory(initialConfiguration?.InfoCategories)
  }, [initialConfiguration])

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    // label=>PlantName
    const userDetailsCosting = JSON.parse(localStorage.getItem('userDetail'))
    props.closeDrawer('',
      {
        ...data,
        DestinationPlantCode: getConfigurationKey().IsCBCApplicableOnPlant ? DestinationPlant?.PlantCode : userDetailsCosting.Plants[0].PlantCode,
        DestinationPlantId: getConfigurationKey().IsCBCApplicableOnPlant ? DestinationPlant?.value : userDetailsCosting.Plants[0].PlantId,
        DestinationPlantName: getConfigurationKey().IsCBCApplicableOnPlant ? DestinationPlant?.label : userDetailsCosting.Plants[0].PlantName,                 //PlantName
        DestinationPlant: DestinationPlant ? DestinationPlant : userDetailsCosting.Plants,
        CustomerName: customer.label,
        CustomerId: customer.value,
        InfoCategory: isInfoCategorySelected === true ? infoCategory[0]?.Text : infoCategory[1]?.Text,
        InfoCategoryObj: isInfoCategorySelected === true ? infoCategory[0] : infoCategory[1]
      })
  };

  /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
  const renderListing = (label) => {

    const temp = [];

    if (label === 'Customer') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'DestinationPlant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ label: item.PlantNameCode, value: item.PlantId, PlantName: item.PlantName, PlantCode: item.PlantCode })
        return null
      })
      return temp
    }
  }

  /**
  * @method handleCustomerChange
  * @description  USED TO HANDLE VENDOR CHANGE
  */
  const handleCustomerChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCustomer(newValue)
      setData({})
    }
  }


  /**
  * @method handleDestinationPlantChange
  * @description  USED TO HANDLE DESTINATION PLANT CHANGE
  */
  const handleDestinationPlantChange = (newValue) => {
    if (newValue && newValue !== '') {
      setDestinationPlant(newValue)
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer('', {})
  }

  const onSubmit = data => {
    toggleDrawer('')
  }

  const categoryTypeOnChange = (e) => {
    setIsInfoCategorySelected(!isInfoCategorySelected)
  }

  const VendorLoaderObj = { isLoader: VendorInputLoader }
  const plantLoaderObj = { isLoader: inputLoader }
  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"Add Customer"}</h3>
                </div>
                <div
                  onClick={cancel}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="pl-3">
                <Col md="12">
                  <SearchableSelectHookForm
                    label={"Customer (Code)"}
                    name={"Customer"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={customer.length !== 0 ? customer : ""}
                    options={renderListing("Customer")}
                    mandatory={true}
                    handleChange={handleCustomerChange}
                    errors={errors.Customer}
                    isLoading={VendorLoaderObj}
                  />
                </Col>

                {getConfigurationKey().IsCBCApplicableOnPlant &&

                  <Col md="12">
                    <SearchableSelectHookForm
                      label={"Plant (Code)"}
                      name={"DestinationPlant"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                      options={renderListing("DestinationPlant")}
                      mandatory={true}
                      handleChange={handleDestinationPlantChange}
                      errors={errors.DestinationPlant}
                      disabled={customer.length === 0 ? true : false}
                      isLoading={plantLoaderObj}
                    />
                  </Col>}
                <Col md="12">
                  <span className="d-inline-block">
                    <label
                      className={`custom-checkbox mb-0`}
                      onChange={(e) => categoryTypeOnChange(e)}
                      selected={isInfoCategorySelected}
                      id={'category'}
                    >
                      Sub Contracting
                      <input
                        type="checkbox"
                      />
                      <span
                        className=" before-box"
                        onChange={(e) => categoryTypeOnChange(e)}
                        selected={isInfoCategorySelected}
                      />
                    </label>
                    <TooltipCustom
                      disabledIcon={false}
                      id={`category`}
                      tooltipText={infoCategory && `If checkbox is selected then category will be ${infoCategory[0]?.Text}, otherwise category will be ${infoCategory[1]?.Text}.`}
                    />
                  </span>
                </Col>
              </Row>

              <Row className="justify-content-between">
                <div className="col-sm-12 text-right">
                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={cancel}
                  >
                    <div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>

                  <button type="submit" className="submit-button save-btn">
                    <div class="plus"></div>
                    {"ADD"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddClientDrawer)