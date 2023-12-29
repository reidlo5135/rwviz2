import React from 'react';
import RCLReact from '../../ros/rclreact';
import { useEffect, useState, useRef } from 'react';
import * as THREE from "three";
import { Canvas, useFrame, extend, useThree, RootState, ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
extend({ OrbitControls });


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
        axesHelper.position.setX(0);
        axesHelper.position.setY(0);
        axesHelper.position.setZ(0);
        scene.add(axesHelper);
    }

    function setGridHelper(): void {
        const size: number = 10;
        const divisions: number = 10;

        const gridHelper: THREE.GridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);
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
        setGridHelper();
        animate();
    }, []);

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
        </div>
    );
}