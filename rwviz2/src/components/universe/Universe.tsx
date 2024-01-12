import { useEffect, useState } from 'react';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import URDFLoader, { URDFRobot } from 'urdf-loader';

interface UniverseProps {
    isURDFLoaded: boolean;
    isSLAMLoaded: boolean;
}

const Universe: React.FC<UniverseProps> = ({ isURDFLoaded, isSLAMLoaded }) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;

    const [robot, setRobot] = useState<THREE.Group>();

    const setUpScene = (container: HTMLElement): void => {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(115, container.offsetWidth / container.offsetHeight, 1, 10000);
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
        if (isSLAMLoaded) {

        }
        const slamURL: string = localStorage.getItem('slam')!.toString();
        console.log(`slamURL : ${slamURL}`);

        const map: THREE.Texture = new THREE.TextureLoader().load(slamURL);
        const mapWidth: number = 1148 * 0.05;
        const mapHeight: number = 713 * 0.05;

        const box: THREE.BoxGeometry = new THREE.BoxGeometry(mapWidth, mapHeight, 0);
        const ms: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
            map: map,
            color: 0xffffff,
        });

        const mesh: THREE.Mesh = new THREE.Mesh(box, ms);
        mesh.position.x = 0;
        mesh.position.y = 0.1;
        mesh.position.z = 0;

        mesh.rotation.x = -(Math.PI / 2);

        scene.add(mesh);
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

                robotGroup.add(robot);
                setRobot(robotGroup);
                robotGroup.position.set(0, 0.1, 0);
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
            }
        }

        return () => {
            container!.removeChild(renderer.domElement);
            loadURDF();
        };
    }, [isURDFLoaded, isSLAMLoaded]);

    return (
        <div>
            <div id='universe_container' className='universe_container'></div>
        </div>
    );
};

export default Universe;