import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import URDFLoader, { URDFRobot } from 'urdf-loader';
import RCLReact from '../../ros/rclreact';

interface UniverseProps {
    isURDFLoaded: boolean;
    isSLAMLoaded: boolean;
}

const Universe: React.FC<UniverseProps> = ({ isURDFLoaded, isSLAMLoaded }) => {
    const rclReact: RCLReact = new RCLReact();
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;

    const [robot, setRobot] = useState<THREE.Group>();
    const [mapSubscription, setMapSubscription] = useState<ROSLIB.Topic | null>();

    const setUpScene = (container: HTMLElement): void => {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(70, container.offsetWidth / container.offsetHeight, 1, 10000);
        controls = new OrbitControls(camera, renderer.domElement);

        camera.position.set(0, 20, 100);
        camera.position.z = 5;

        controls.update();

        container.addEventListener('resize', () => {
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
        });

        setAxesHelper();
        setGridHelper();
    };

    const setAxesHelper = (): void => {
        const axesHelper: THREE.AxesHelper = new THREE.AxesHelper(3);
        axesHelper.position.set(0, 0, 0);
        scene.add(axesHelper);
    };

    const setGridHelper = (): void => {
        const size: number = 10;
        const divisions: number = 10;

        const gridHelper: THREE.GridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);
    };

    const loadSLAM = (): void => {
        console.log(`SLAM `);

        const rclMapSubscription: ROSLIB.Topic = rclReact.createSubscription('/map', 'nav_msgs/msg/OccupancyGrid');
        setMapSubscription(rclMapSubscription);

        mapSubscription?.subscribe(function (occupancyGrid: any) {
            const occupancyGridJson: any = JSON.parse(JSON.stringify(occupancyGrid));
            console.log(`occupancyGridJson : ${JSON.stringify(occupancyGridJson)}`);
            const rawWidth: number = occupancyGridJson.info.width;
            const rawHeight: number = occupancyGridJson.info.height;
            const resolution: number = occupancyGridJson.info.resolution;

            const data: Array<number> = occupancyGridJson.data;
            const buffer: Uint8ClampedArray = new Uint8ClampedArray(rawWidth * rawHeight * 4);

            console.log(`SLAM width : ${rawWidth}, height : ${rawHeight}, resoultion : ${resolution}`);

            for (let i = 0; i < buffer.length; i += 4) {
                const index: number = Math.floor(i / 4);
                if (data[index] === -1) {
                    buffer[i] = 220;
                    buffer[i + 1] = 220;
                    buffer[i + 2] = 220;
                    buffer[i + 3] = 230;
                } else if (data[index] === 0) {
                    buffer[i] = 255;
                    buffer[i + 1] = 255;
                    buffer[i + 2] = 255;
                    buffer[i + 3] = 230;
                } else if (data[index] === 100) {
                    buffer[i] = 0;
                    buffer[i + 3] = 255;
                };
            };

            const texture = new THREE.DataTexture(buffer, rawWidth, rawHeight);
            texture.needsUpdate = true;

            const geometry = new THREE.BoxGeometry(rawWidth * resolution, rawHeight * resolution, 0);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0);
            mesh.rotation.x = -(Math.PI / 2);
            scene.add(mesh);
        });
    };

    const loadURDF = (): void => {
        if (isURDFLoaded) {
            const manager = new THREE.LoadingManager();
            const loader = new URDFLoader(manager);

            loader.packages = {
                packageName: '/',
            };

            const urdfURL: string = localStorage.getItem('urdf')!.toString();
            console.log(`urdfURL : ${urdfURL}`);

            loader.load(urdfURL, (robot: URDFRobot) => {
                console.log(`robot : ${JSON.stringify(robot)}`);

                const robotGroup: THREE.Group = new THREE.Group();
                robot.traverse((child: any) => {
                    const childJson: any = JSON.parse(JSON.stringify(child));

                    if (child instanceof THREE.Mesh) {
                        const colorTag: string = childJson.materials[0].name.toLocaleLowerCase();

                        switch (colorTag) {
                            case 'black':
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                            case 'light_black':
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                            case 'blue':
                                child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                                break;
                            case 'red':
                                child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                                break;
                            default:
                                child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                                break;
                        }
                        child.material.transparent = true;
                        child.material.opacity = 1.0;
                    }
                    child.castShadow = true;
                });

                robot.scale.set(0.1, 0.1, 0.1);

                robotGroup.add(robot);
                setRobot(robotGroup);
                robotGroup.position.set(0, 0, 0);
                robotGroup.rotateX(-(Math.PI / 2));

                scene.add(robotGroup);
            });
        }
    };

    const animate = (): void => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };

    useEffect(() => {
        const container: HTMLElement | null = document.getElementById('universe_container');

        if (container) {
            setUpScene(container);
            animate();

            if (isURDFLoaded) {
                loadURDF();
            }

            if (isSLAMLoaded) {
                loadSLAM();
            } else {
                mapSubscription?.unsubscribe();
            }
        }

        return () => {
            container!.removeChild(renderer.domElement);
            loadURDF();
        };
    }, [isURDFLoaded, isSLAMLoaded]);

    useEffect(() => {

    }, []);

    return (
        <div>
            <div id='universe_container' className='universe_container'></div>
        </div>
    );
};

export default Universe;