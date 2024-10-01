import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { getVBCDetailByVendorId, getZBCDetailByPlantId, } from '../actions/Costing';
import { EMPTY_GUID_0, searchCount, VBC_VENDOR_TYPE, ZBC } from '../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctions';
import { MESSAGES } from '../../../config/message';
import { useLabels } from '../../../helper/core';

function AddNCCDrawer(props) {
  const { vendorLabel } = useLabels()
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [plant, setPlant] = useState([]);
  const [data, setPlantData] = useState({});
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [vendorName, setVendorName] = useState('')
  const dispatch = useDispatch()
  const plantSelectList = useSelector(state => state.comman.plantSelectList)
  const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)

  useEffect(() => {
    const { nccGrid } = props;
    dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))

    let tempArr = [];
    nccGrid && nccGrid.map(el => {
      tempArr.push(el.PlantId)
      return null;
    })
    setSelectedPlants(tempArr)
    return () => {
      reactLocalStorage?.setObject('vendorData', [])
    }
  }, []);

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    props.closeDrawer('', {
      ...data,
      VendorCode: Object.keys(vendor).length > 0 ? vendor.VendorCode : '',
      VendorId: Object.keys(vendor).length > 0 ? vendor.VendorId : EMPTY_GUID_0,
      VendorName: Object.keys(vendor).length > 0 ? `${vendor.VendorName} (${vendor.VendorCode})` : '',
      Vendor: vendor,
      DestinationPlantName: `${data.DestinationPlantName} (${data.DestinationPlantCode})`
    })
  };

  /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
  const renderListing = (label) => {
    const temp = [];

    if (label === 'Plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.PlantId === '0' || selectedPlants.includes(item.PlantId)) return false;
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null;
      });
      return temp;
    }
  }

  /**
  * @method handlePlantChange
  * @description  USED TO HANDLE PLANT CHANGE
  */
  const handlePlantChange = (newValue) => {
    if (newValue && newValue !== '') {
      setPlant(newValue)
      setValue('Plant', { label: newValue.label, value: newValue.value })
      dispatch(getZBCDetailByPlantId(newValue.value, (res) => {
        if (res && res.data && res.data.Data) {
          let obj = res.data.Data
          if (obj.DestinationPlantId == undefined) {
            obj.DestinationPlantId = res.data.Data.PlantId
            obj.DestinationPlantName = res.data.Data.PlantName
            obj.DestinationPlantCode = res.data.Data.PlantCode
          }
          setPlantData(obj)
        }
      }))
    } else {
      setPlant([])
    }
  }

  /**
 * @method handleVendorChange
 * @description  USED TO HANDLE VENDOR CHANGE
 */
  const handleVendorChange = (newValue) => {
    if (newValue && newValue !== '') {

      let data = {
        VendorId: newValue.value,
        VendorPlantId: "00000000-0000-0000-0000-000000000000",
      }
      dispatch(getVBCDetailByVendorId(data, res => {
        if (res && res.data && res.data.Data) {
          setVendor(res.data.Data)
        }
      }))
    } else {
      setVendor([])
    }
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  const onSubmit = data => {
    toggleDrawer('')
  }
  const filterList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount)
    if (inputValue?.length >= searchCount && vendorName !== resultInput) {
      let res
      res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
      setVendorName(resultInput)
      let vendorDataAPI = res?.data?.SelectList
      if (inputValue) {
        return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
      } else {
        return vendorDataAPI
      }
    }
    else {
      if (inputValue?.length < searchCount) return false
      else {
        let VendorData = reactLocalStorage?.getObject('Data')
        if (inputValue) {
          return autoCompleteDropdown(inputValue, VendorData, false, [], false)
        } else {
          return VendorData
        }
      }
    }
  };
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
                  <h3>{`Add ${vendorLabel}`}</h3>
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
                    label={"Destination Plant (Code)"}
                    name={"Plant"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={plant.length !== 0 ? plant : ""}
                    options={renderListing("Plant")}
                    mandatory={true}
                    handleChange={handlePlantChange}
                    errors={errors.Plant}
                  />
                </Col>
                <Col md="12">
                  <AsyncSearchableSelectHookForm
                    label={`${vendorLabel} (Code)`}
                    name={"Vendor"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={vendor.length !== 0 ? vendor : ""}
                    options={renderListing("Vendor")}
                    mandatory={true}
                    handleChange={handleVendorChange}
                    asyncOptions={filterList}
                    errors={errors.Vendor}
                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                  />
                </Col>
              </Row>

              <Row className="justify-content-between row">
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

export default React.memo(AddNCCDrawer);