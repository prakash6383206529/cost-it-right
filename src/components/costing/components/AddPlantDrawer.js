import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, } from '../../layout/HookFormInputs';
import { getPlantSelectListByType } from '../../../actions/Common';
import { getZBCDetailByPlantId, } from '../actions/Costing';
import { EMPTY_GUID, ZBC } from '../../../config/constants';

function AddPlantDrawer(props) {

  const { register, handleSubmit, formState: { errors }, control } = useForm();

  const [plant, setPlant] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [wacPlant, setWacPlant] = useState([]);

  const dispatch = useDispatch()
  const plantSelectList = useSelector(state => state.comman.plantSelectList)

  useEffect(() => {
    const { zbcPlantGrid, wacPlantGrid } = props;
    dispatch(getPlantSelectListByType(ZBC, "COSTING", () => { }))

    let tempArr = [];
    zbcPlantGrid && zbcPlantGrid.map(el => {
      tempArr.push(el.PlantId)
      return null;
    })
    setSelectedPlants(tempArr)
    let wacTempArr = [];
    wacPlantGrid && wacPlantGrid.map(el => {
      wacTempArr.push(el.PlantId)
      return null;
    })
    setWacPlant(wacTempArr)

  }, []);

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', {
      PlantName: `${plant.label}`,
      PlantId: `${plant.value}`,
      PlantCode: `${plant.PlantCode}`,
      Status: 'Draft',
      IsNewCosting: true,
      CostingId: EMPTY_GUID,
      CostingOptions: []
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
        if (item.PlantId === '0' || (!props.isWAC && selectedPlants.includes(item.PlantId)) || (props.isWAC && wacPlant.includes(item.PlantId))) return false;
        temp.push({ label: item.PlantNameCode, value: item.PlantId, PlantCode: item.PlantCode })
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
    } else {
      setPlant([])
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
                  <h3>{"Add Plant"}</h3>
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
                    label={"Plant (Code)"}
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

export default React.memo(AddPlantDrawer);
