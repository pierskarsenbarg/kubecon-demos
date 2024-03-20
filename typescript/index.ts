import * as k8s from "@pulumi/kubernetes";
// import {Application} from "./component"

const appLabel = { app: "hello-world" };

const namespace = new k8s.core.v1.Namespace("app-namespace");

const deployment = new k8s.apps.v1.Deployment("app-deployment", {
    metadata: {
        namespace: namespace.metadata.name
    },
    spec: {
        selector: {
            matchLabels: appLabel
        },
        template: {
            metadata: {labels: appLabel},
            spec: {
                containers: [{
                    name: "hello-world",
                    image: "pierskarsenbarg/hello-world-app",
                    ports: [{
                        containerPort: 8080,
                        hostPort: 8080
                    }]
                }]
            }
        }
    }
});

const service = new k8s.core.v1.Service("app-service", {
    metadata: {
        namespace: namespace.metadata.name
    },
    spec: {
        selector: appLabel,
        ports: [{
            port: 8080,
            targetPort: 8080,
            name: "http-port"
        }]
    }
}, {dependsOn: deployment})

const ingress = new k8s.networking.v1.Ingress("app-ingress", {
    metadata: {
        namespace: namespace.metadata.name
    },
    spec: {
        rules: [{
            host: "localhost",
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: {
                            name: service.metadata.name,
                            port: {
                                name: "http-port",
                            }
                        }
                    }
                }]
            }
        }]
    }
})
// const app = new Application("myapp", {
//     appName: "myapp",
//     containerPort: 8080,
//     hostName: "localhost",
//     image: "pierskarsenbarg/hello-world-app"
// });