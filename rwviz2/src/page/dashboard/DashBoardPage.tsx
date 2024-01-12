import { useState } from "react";
import Top from "../../components/top/Top";
import TopicsBar from "../../components/topics/TopicsBar";
import Universe from "../../components/universe/Universe";
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
            <TopicsBar onURDFLoad={handleURDFLoad} onSLAMLoad={handleSLAMLoad} />
            <Universe isURDFLoaded={isURDFLoaded!} isSLAMLoaded={isSLAMLoaded!} />
        </div>
    );
};