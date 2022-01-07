import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getPlantSelectListByType } from '../../../actions/Common';
import { getZBCDetailByPlantId, } from '../actions/Costing';
import { EMPTY_GUID_0, ZBC } from '../../../config/constants';
import { getPlantCode, getVendorCode } from '../../../helper/validation';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';

function AddNCCDrawer(props) {

  const { register, handleSubmit, formState: { errors }, control, reset,setValue } =useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [plant, setPlant] = useState([]);
  const [data, setPlantData] = useState({});
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [vendor, setVendor] = useState([]);

  const dispatch = useDispatch()
  const plantSelectList = useSelector(state => state.comman.plantSelectList)
  const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)

  useEffect(() => {
    const { nccGrid } = props;
    dispatch(getVendorWithVendorCodeSelectList(() => { }))
    dispatch(getPlantSelectListByType(ZBC, () => { }))

    let tempArr = [];
    nccGrid && nccGrid.map(el => {
      tempArr.push(el.PlantId)
      return null;
    })
    setSelectedPlants(tempArr)

  }, []);

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', {
             ...data,
            VendorCode: Object.keys(vendor).length>0 ? getVendorCode(vendor.label):'',
            VendorId:  Object.keys(vendor).length>0 ? vendor.value:EMPTY_GUID_0,
            VendorName:  Object.keys(vendor).length>0 ?vendor.label:'',
            Vendor: vendor,
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
        if (item.Value === '0' || selectedPlants.includes(item.Value)) return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'Vendor') {
      vendorSelectList && vendorSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
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
      setValue('Plant',{label:newValue.label,value:newValue.value})
      dispatch(getZBCDetailByPlantId(newValue.value, (res) => {
        if (res && res.data && res.data.Data) {
          setPlantData(res.data.Data)
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
      setVendor(newValue)
   
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
                  <h3>{"Add Vendor/Plant"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="pl-3">
                <Col md="12">
                  <SearchableSelectHookForm
                    label={"Plant"}
                    name={"Plant"}
                    placeholder={"-Select-"}
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
                  <SearchableSelectHookForm
                    label={"Vendor"}
                    name={"Vendor"}
                    placeholder={"-Select-"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: false }}
                    register={register}
                    defaultValue={vendor.length !== 0 ? vendor : ""}
                    options={renderListing("Vendor")}
                    mandatory={false}
                    handleChange={handleVendorChange}
                    errors={errors.Vendor}
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