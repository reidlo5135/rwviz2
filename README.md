```bash
cd ros2_ws/src/rwviz2/ros2_web_bridge
npm i
npm run build
cd ../../../
colcon build --packages-select ros2_web_bridge
source install/setup.bash
source /opt/ros/humble/setup.bash
cd src/rwviz2/rwviz2
npm i
npm start
```