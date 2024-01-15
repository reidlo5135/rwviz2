import ROSLIB from "roslib";

const rclReactUrl: string = 'ws://192.168.0.187:9090';
// const rclReactUrl: string = 'ws://192.168.56.1:9090';
const rosLibRos : ROSLIB.Ros = new ROSLIB.Ros({url: rclReactUrl});

export default class RCLReact {
    
    public rclReactInit(): void {
        if(!rosLibRos.isConnected) {
            console.log(`RCLReact try to reconnect... ${rclReactUrl}`);
            rosLibRos.connect(rclReactUrl);
        };
        rosLibRos.on('connection', function() {
            console.log(`RCLReact connected with ${rclReactUrl}`);
        });
        rosLibRos.on('error', function(error) {
            console.error(`RCLReact error : ${JSON.stringify(error)}`);
        });
        rosLibRos.on('close', function () {
            console.log('RCLReact Connection closed');
        });
    }

    public isConnected(): boolean {
        return rosLibRos.isConnected;
    }

    public createPublisher(topic: string, messageType: string): ROSLIB.Topic {
        const publisher: ROSLIB.Topic = new ROSLIB.Topic({
            ros: rosLibRos,
            name: topic,
            messageType: messageType
        });

        return publisher;
    }

    public createSubscription(topic: string, messageType: string): ROSLIB.Topic {
        console.log(`RCLReact createSubscription topic : ${topic}, messageType : ${messageType}`);
        const subscription: ROSLIB.Topic = new ROSLIB.Topic({
            ros: rosLibRos,
            name: topic,
            messageType: messageType,
            queue_size: 10
        });

        return subscription;
    }
}