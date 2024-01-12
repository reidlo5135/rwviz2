import { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import './App.css';
import Universe from './components/universe/Universe';
import RCLReact from './ros/rclreact';
import DashBoardPage from './page/dashboard/DashBoardPage';

function App() {

  useEffect(() => {
    const rclReact: RCLReact = new RCLReact();
    rclReact.rclReactInit();
  }, []);

  return (
    <div className="App">
      <Switch>
        <Route exact path={'/'} component={DashBoardPage} />
      </Switch>
    </div>
  );
}

export default App;
