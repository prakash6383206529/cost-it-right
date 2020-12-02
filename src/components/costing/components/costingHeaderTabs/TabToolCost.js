import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getToolTabData, saveToolTab, } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, } from '../../../../helper';
import OverheadProfit from '../CostingHeadCosts/OverheadProfit';
import Switch from "react-switch";
import Tool from '../CostingHeadCosts/Tool';

function TabToolCost(props) {

  const { register, handleSubmit, reset } = useForm();

  const [IsApplicableProcessWise, setIsApplicableProcessWise] = useState(false);
  const [tabData, setTabData] = useState([]);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      dispatch(getToolTabData(data, (res) => {
        console.log('res: >>>>>>>>> ', res);
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setTabData(Data.CostingPartDetails)
        }
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // let topHeaderData = {
    //   NetSurfaceTreatmentCost: surfaceTotal + transportationTotal,
    // }
    // props.setHeaderCost(topHeaderData)
  }, [tabData]);

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method setOverheadDetail
  * @description SET OVERHEAD DEATILS
  */
  const setOverheadDetail = (overheadObj, index) => {
    let tempObj = tabData[index];

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          CostingOverheadDetail: overheadObj,
          OverheadNetCost: '',
          NetOverheadAndProfitCost: '',
          OverheadProfitNetCost: '',
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)

  }


  /**
  * @method onPressApplicability
  * @description SET APPLICABILITY
  */
  const onPressApplicability = () => {
    setIsApplicableProcessWise(!IsApplicableProcessWise)
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {


    }

    dispatch(saveToolTab(data, res => {
      console.log('saveCostingOverheadProfitTab: ', res);
    }))

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {


  }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="1" >{'Applicability:'}</Col>
                <Col md="8" className="switch mb15">
                  <label className="switch-level">
                    <div className={'left-title'}>{'Overall'}</div>
                    <span className="cr-sw-level">
                      <span className="cr-switch-icon">
                        <Switch
                          onChange={onPressApplicability}
                          checked={IsApplicableProcessWise}
                          id="normal-switch"
                          disabled={false}
                          background="#4DC771"
                          onColor="#4DC771"
                          onHandleColor="#ffffff"
                          offColor="#CCC"
                          uncheckedIcon={false}
                          checkedIcon={false}
                          height={20}
                          width={46}
                        />
                      </span>
                      <div className={'right-title'}>{'Process Wise'}</div>
                    </span>
                  </label>
                </Col>
                <Col md="1" >{'Net Tool Cost'}</Col>
              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      {/* <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '150px' }}>{`200`}</th>
                        </tr>
                      </thead> */}
                      <tbody>
                        {
                          tabData && tabData.map((item, index) => {
                            return (
                              < >
                                <tr key={index} onClick={() => toggle(index)}>
                                  <td><span class="cr-prt-nm cr-prt-link">{item.PartName}</span></td>
                                  <td>{200}</td>
                                </tr>
                                {item.IsOpen &&
                                  <tr>
                                    <td colSpan={2}>
                                      <div>
                                        <Tool
                                          index={index}
                                          IsApplicableProcessWise={IsApplicableProcessWise}
                                          data={item}
                                        // headCostRMCCBOPData={props.headCostRMCCBOPData}
                                        // setOverheadDetail={setOverheadDetail}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                }
                              </>
                            )
                          })
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>

                {/* <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}>
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
                    </button>
                  </div>
                </Row> */}

              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};

export default TabToolCost;