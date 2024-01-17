import { useState } from "react";
import SettingsComponent from "../../components/setting/SettingComponent";
import TopComponent from "../../components/top/TopComponent";
import UniverseComponent from "../../components/universe/UniverseComponent";
import CoordinateComponent from "../../components/coordinate/CoordinateComponent";
import "./DashBoardStyle.css";

export default function DashBoardPage() {
    const [isURDFLoaded, setIsURDFLoaded] = useState<boolean | null>(null);
    const [isSLAMLoaded, setIsSLAMLoaded] = useState<boolean | null>(null);

    const handleURDFLoad = (isURDFLoaded: boolean): void => {
        setIsURDFLoaded(isURDFLoaded);
    };

    const handleSLAMLoad = (isSLAMLoaded: boolean): void => {
        setIsSLAMLoaded(isSLAMLoaded);
    };

    return (
        <div className="dashboard_container">
            <div className="top_component_container">
                <TopComponent />
            </div>
            <div className="main_container">
                <div className="setting_component_container">
                    <SettingsComponent onURDFLoad={handleURDFLoad} onSLAMLoad={handleSLAMLoad} />
                </div>
                <div className="universe_component_container">
                    <UniverseComponent isURDFLoaded={isURDFLoaded!} isSLAMLoaded={isSLAMLoaded!} />
                </div>
                <div className="coordinate_component_container">
                    <CoordinateComponent />
                </div>
            </div>
        </div>
    );
};