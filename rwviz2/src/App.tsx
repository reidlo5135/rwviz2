import { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import './App.css';
import DashBoardPage from './page/dashboard/DashBoardPage';
import RCLReact from './ros/rclreact';

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
