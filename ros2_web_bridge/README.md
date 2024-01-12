# ROS2 Web Bridge

## Document
  - [Environment](#environment)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Install node(nodejs) & npm](#install-nodenodejs--npm)
    - [Clone](#clone)
    - [Colcon Build](#colcon-build)
    - [Run Test](#run-test)

## Environment
* <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
* <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white">
* <img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
* <img src="https://img.shields.io/badge/cmake-064F8C?style=for-the-badge&logo=cmake&logoColor=white">
* <img src="https://img.shields.io/badge/mqtt-660066?style=for-the-badge&logo=mqtt&logoColor=white">
* <img src="https://img.shields.io/badge/ROS2-22314E?style=for-the-badge&logo=ros&logoColor=white">
* <img src="https://img.shields.io/badge/ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white">
* <img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white">

## Installation

### Prerequisites
- [node](https://nodejs.org/en/) version required 18.15.0 (npm 9.5.0)
  
- [nodejs](https://nodejs.org/en/) version required between 10.23.1 - 12.x.

- [ROS2 setup](https://index.ros.org/doc/ros2/Installation/) for install rclnodejs by npm -
  **INSTALL [ROS2 Foxy-Fitzroy](https://docs.ros.org/en/foxy/Installation/Ubuntu-Install-Debians.html)**

### Install node(nodejs) & npm

Install the node(nodejs) & npm into your Linux(Ubuntu 20.0.4LTS)

For the most current version of nodejs

```bash
sudo install nodejs
```

For the most current version of npm(node package manager)

```bash
sudo install npm -g
```

Install node(nodejs) & npm latest version by n

```bash
sudo npm i n
```

```bash
sudo n 18.15.0
```

### Clone
```bash
git clone https://github.com/reidlo5135/ros2_web_bridge
cd ros2_web_bridge
```

### Colcon Build
```bash
source /opt/ros/foxy/setup.bash
colcon build --symlink-install
source install/setup.bash
```

### Run Test
```bash
source ros2_web_bridge/install/setup.bash
ros2 launch ros2_web_bridge rosbridge.launch.py
```