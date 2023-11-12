import React, { useEffect, useState } from 'react';
import './App.css';
import RclReact from './ros/rclreact';
import ROSLIB from 'roslib';

function App() {
  const [chatter, setChatter] = useState<string>('');

  const rclReact: RclReact = new RclReact();
  rclReact.rclReactInit();
  const subscription: ROSLIB.Topic = rclReact.createSubscription('/chatter', 'std_msgs/msg/String');
  subscription.subscribe(function(result) {
    const chatterCallback: any = JSON.parse(JSON.stringify(result));
    console.log(`chatterCallback : ${JSON.stringify(chatterCallback)}`);
    setChatter(chatterCallback.data);
  });

  useEffect(() => {
    
  }, []);

  return (
    <div className="App">
      hi
      <h1>{chatter}</h1>
    </div>
  );
}

export default App;
