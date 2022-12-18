// ~ Data type to port number mapping (1-20)
const PortTypes = {
  ACTION: 1,  // ~ Used to send commands to the botnet
  ERRORS: 2,  // ~ Used to send errors to the botnet manager
  BEACON: 10, // ~ Identifies that the botnet manager is running
  KILL: 20,   // ~ Used to kill the bot script (if it is running)
}

export { PortTypes };
