import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from "react-hook-form";
import Drawer from '@material-ui/core/Drawer'
import { TextFieldHookForm } from '../../../layout/HookFormInputs'
import Pipe from '../WeightCalculatorDrawer/Pipe';
import WeightCalculator from '../WeightCalculatorDrawer';


function ViewRM(props) {
    console.log(props,"RM props");
    const { viewRMData } = props
    console.log( viewRMData,"RM");
    /*
    * @method toggleDrawer
    * @description closing drawer
    */
   const { register, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
   
  });
  const [viewRM, setViewRM] = useState({})
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  console.log(viewRM,"rrrrrrrrrrrrrrrrrrrr");
  useEffect(() => {
    console.log( viewRMData,"RM1111111111111111111111");
    const [ rm ] = viewRMData
    console.log(rm,"RM arrrrrrrrrrrrrrrrrrr");
    setViewRM(rm)
  }, [])
 
   const toggleDrawer = (event) => {
     if (
       event.type === 'keydown' &&
       (event.key === 'Tab' || event.key === 'Shift')
     ) {
       return
     }
     props.closeDrawer('')
   }
 const closeWeightDrawer = (e="") => {
    setWeightCalculatorDrawer(false)
   }
    return (
        <>
                <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
                <Container>
                    <div className={'drawer-wrapper'}>
                        <form>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'RM:'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <div className="input-group form-group col-md-12 input-withouticon" >
                                <TextFieldHookForm
                                 label="RM Name"
                                 name={'rmName'}
                                 Controller={Controller}
                                 control={control}
                                 register={register}
                                 mandatory={false}
                                 handleChange={() => { }}
                                 //defaultValue={`${viewRM[0].RMName}`}
                                 defaultValue={viewRM.RMName}
                                 className=""
                                 customClassName={'withBorder'}
                                 //errors={errors.ECNNumber}
                                 disabled={true}
                                />
                                </div>
                                <div className="input-group form-group col-md-12 input-withouticon" >
                                <TextFieldHookForm
                                 label="RM Rate"
                                 name={'rmRate'}
                                 Controller={Controller}
                                 control={control}
                                 register={register}
                                 mandatory={false}
                                 handleChange={() => { }}
                                 defaultValue={viewRM.RMRate}
                                 className=""
                                 customClassName={'withBorder'}
                                 //errors={errors.ECNNumber}
                                 disabled={true}
                                />
                                </div>
                                <div className="input-group form-group col-md-12 input-withouticon">
                                 <h5>Calculator 
                                    <br />
                                <button 
                                className="CalculatorIcon cr-cl-icon mt15" 
                                type={'button'} 
                                onClick={() => {
                                    setWeightCalculatorDrawer(true)
                                }} />
                                </h5>  
                                </div>
                                <div className="input-group form-group col-md-12 input-withouticon" >
                                <TextFieldHookForm
                                 label="Gross Weight(Kg)"
                                 name={'grossweight'}
                                 Controller={Controller}
                                 control={control}
                                 register={register}
                                 mandatory={false}
                                 handleChange={() => { }}
                                 defaultValue={viewRM.GrossWeight}
                                 className=""
                                 customClassName={'withBorder'}
                                 //errors={errors.ECNNumber}
                                 disabled={true}
                                />
                                </div>
                                <div className="input-group form-group col-md-12 input-withouticon" >
                                <TextFieldHookForm
                                 label="Finish Weight(Kg)"
                                 name={'finishWeight'}
                                 Controller={Controller}
                                 control={control}
                                 register={register}
                                 mandatory={false}
                                 handleChange={() => { }}
                                 defaultValue={viewRM.FinishWeight}
                                 className=""
                                 customClassName={'withBorder'}
                                 //errors={errors.ECNNumber}
                                 disabled={true}
                                />
                                </div>
                                <div className="input-group form-group col-md-12 input-withouticon" >
                                <TextFieldHookForm
                                 label="Net RM Cost"
                                 name={'netRMCost'}
                                 Controller={Controller}
                                 control={control}
                                 register={register}
                                 mandatory={false}
                                 handleChange={() => { }}
                                 defaultValue={viewRM.NetLandedCost}
                                 className=""
                                 customClassName={'withBorder'}
                                 //errors={errors.ECNNumber}
                                 disabled={true}
                                />
                                </div>
                               </Row>
                        </form>
                        {
                            weightCalculatorDrawer && 
                            <WeightCalculator
                            rmRowData ={viewRM}
                            anchor={`right`}
                            isEditFlag={false}
                            isOpen={weightCalculatorDrawer}
                            closeDrawer={closeWeightDrawer}
                            />
                        }
                    </div>
                </Container>
            </Drawer>
        </>
    )
}

export default React.memo(ViewRM)
