import SimulationHistoryReducer from './reducers/History'
import SimulationReducer from './reducers/Simulation'

const mainReducer = {
    history: SimulationHistoryReducer,
    simulation: SimulationReducer
}
export default mainReducer
