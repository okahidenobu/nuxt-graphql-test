export default function(context) {
  return {
    // httpEndpoint: "http://localhost:4000",
    httpEndpoint: "http://localhost:8092/graphql",
    // wsEndpoint: "ws://localhost:4000",
    wsEndpoint: "ws://localhost:8092/graphql",
    websocketsOnly: true
  };
}
