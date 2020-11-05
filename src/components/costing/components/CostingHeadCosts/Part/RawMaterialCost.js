import React, { useState, useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import AddRM from '../../Drawers/AddRM';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';

function RawMaterialCost(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [gridData, setGridData] = useState([])
  const costData = useContext(costingInfoContext)

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      setGridData([rowData])
    }
    setDrawerOpen(false)
  }

  const deleteItem = (index) => {
    setGridData([])
  }

  const rmGridFields = 'rmGridFields';

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>

          <Row>
            <Col col={'10'}>
              <p>{'Raw Material Cost'}</p>
            </Col>
            <Col col={'2'}>
              {gridData.length === 0 && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD RM</button>}
            </Col>
          </Row>

          <Row>
            {/*RAW MATERIAL COST GRID */}

            <Col md="12">
              <Table className="table" size="sm" >
                <thead>
                  <tr>
                    <th>{`RM Name`}</th>
                    <th>{`RM Rate`}</th>
                    <th>{`Scrap Rate`}</th>
                    <th>{`Weight Calculator`}</th>
                    <th>{`Gross Weight`}</th>
                    <th>{`Finish Weight`}</th>
                    <th>{`Net RM Cost`}</th>
                    <th>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData &&
                    gridData.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.RawMaterial}</td>
                          <td>{item.BasicRatePerUOM}</td>
                          <td>{item.ScrapRate}</td>
                          <td>{'Weight Calculator'}</td>
                          <td>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${rmGridFields}[${index}]GrossWeight`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  //required: true,
                                  pattern: {
                                    value: /^[0-9]\d*(\.\d+)?$/i,
                                    message: 'Invalid Number.'
                                  },
                                }}
                                defaultValue={item.GrossWeight}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  //handleZBCSOBChange(e, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].GrossWeight : ''}
                                disabled={false}
                              />
                            }
                          </td>
                          <td>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${rmGridFields}[${index}]FinishWeight`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  //required: true,
                                  pattern: {
                                    value: /^[0-9]\d*(\.\d+)?$/i,
                                    message: 'Invalid Number.'
                                  },
                                }}
                                defaultValue={item.FinishWeight}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  //handleZBCSOBChange(e, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].FinishWeight : ''}
                                disabled={false}
                              />
                            }
                          </td>
                          <td>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${rmGridFields}[${index}]NetRMCost`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                defaultValue={item.NetRMCost}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  //handleZBCSOBChange(e, index)
                                }}
                                //errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].RawMaterial : ''}
                                disabled={true}
                              />
                            }
                          </td>
                          <td>
                            <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                          </td>
                        </tr>
                      )
                    })
                  }
                  {gridData.length === 0 &&
                    <tr>
                      <td colSpan={7}>
                        <NoContentFound title={CONSTANT.EMPTY_DATA} />
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

        </div>
      </div >
      {isDrawerOpen && <AddRM
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
    </ >
  );
}

export default RawMaterialCost;