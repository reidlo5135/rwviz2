import { useState } from "react";
import SettingsComponent from "../../components/settings/SettingsComponent";
import Top from "../../components/top/Top";
import UniverseComponent from "../../components/universe/UniverseComponent";
import "./DashBoardStyle.css";

export default function DashBoardPage() {
    const [isURDFLoaded, setIsURDFLoaded] = useState<boolean | null>(null);
    const [isSLAMLoaded, setIsSLAMLoaded] = useState<boolean | null>(null);

    const handleURDFLoad = (isURDFLoaded: boolean): void => {
        console.log('URDF loaded!');
        setIsURDFLoaded(isURDFLoaded);
    };

    const handleSLAMLoad = (isSLAMLoaded: boolean): void => {
        console.log('SLAM loaded!');
        setIsSLAMLoaded(isSLAMLoaded);
    };

    return (
        <div className="dashboard_container">
            <Top />
            <SettingsComponent onURDFLoad={handleURDFLoad} onSLAMLoad={handleSLAMLoad} />
            <UniverseComponent isURDFLoaded={isURDFLoaded!} isSLAMLoaded={isSLAMLoaded!} />
        </div>
    );
};