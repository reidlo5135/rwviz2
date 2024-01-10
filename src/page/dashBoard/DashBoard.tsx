import { useEffect } from 'react';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import URDFLoader, { URDFRobot } from 'urdf-loader';

export default function DashboardPage() {
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.innerHTML = "";
    document.body.appendChild(renderer.domElement);

    const scene: THREE.Scene = new THREE.Scene();
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);

    camera.position.set(0, 20, 100);
    camera.position.z = 5;

    controls.update();

    function setAxesHelper(): void {
        const axesHelper: THREE.AxesHelper = new THREE.AxesHelper(3);
        axesHelper.position.set(0, 0, 0);
        scene.add(axesHelper);
    }

    function setSLAM(): void {
        const map: THREE.Texture = new THREE.TextureLoader().load("map.png");

        const box: THREE.BoxGeometry = new THREE.BoxGeometry(7, 7, 0);
        const ms: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
            map: map,
            color: 0xffffff
        });

        const mesh: THREE.Mesh = new THREE.Mesh(box, ms);
        mesh.position.x = 0;
        mesh.position.y = 0.1;
        mesh.position.z = 0;

        mesh.rotation.x = Math.PI / 2;

        scene.add(mesh);
    }

    function setGridHelper(): void {
        const size: number = 10;
        const divisions: number = 10;

        const gridHelper: THREE.GridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);
    }

    function setURDF(): void {
        const manager = new THREE.LoadingManager();
        const loader = new URDFLoader(manager);
        loader.packages = {
            packageName: "/"
        };

        loader.load("urdf/has_ugv.urdf", (robot: URDFRobot) => {
            console.log(`robot : ${JSON.stringify(robot)}`);
            const robotGroup: THREE.Group = new THREE.Group();
            robot.traverse((child: any) => {
                if (child instanceof THREE.Mesh) {
                    const childJson: any = JSON.parse(JSON.stringify(child));
                    const colorTag: string = childJson.materials[0].name.toLocaleLowerCase()

                    switch (colorTag) {
                        case "black":
                            child.material = new THREE.MeshBasicMaterial({ color: 0x00000 });
                            break;
                        case "blue":
                            child.material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                            break;
                        case "red":
                            child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                            break;
                    }
                    child.material.transparent = true;
                    child.material.opacity = 1.0;
                }
                child.castShadow = true;
            });
            robotGroup.add(robot);
            robotGroup.position.set(0, 0.1, 0);
            robotGroup.rotateX(-(Math.PI / 2));

            scene.add(robotGroup);
        });
    }

    function animate(): void {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    useEffect(() => {
        setAxesHelper();
        setSLAM();
        setGridHelper();
        setURDF();
        animate();
    }, []);

    return (
        <div>
            <canvas id="myThreeJsCanvas" />
        </div>
    );
}