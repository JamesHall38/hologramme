import Model from './components/Model';
import './App.css';


import FPSStats from "react-fps-stats";

function App() {
  return (
    <div className="App">
      <Model />
      <FPSStats />
    </div>
  );
}

export default App;
