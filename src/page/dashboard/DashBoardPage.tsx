import TopicsBar from "../../components/topics/TopicsBar";
import Universe from "../../components/universe/Universe";
import "./DashBoardStyle.css";

export default function DashBoardPage() {
  
    return (
        <div className="dashboard_container">
            <TopicsBar />
            <Universe />
        </div>
    )
};