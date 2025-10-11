/**
 * Custom Branch Check Plugin
 * 
 * This plugin increases the risk score for operations on main/master branches.
 * It serves as an example of how to extend Sentinel's behavior.
 */

module.exports = {
  name: 'custom-branch-check',
  
  /**
   * Evaluate command and adjust risk score
   * @param {Object} command - Parsed command object
   * @param {number} currentScore - Current risk score
   * @returns {number} - Adjusted risk score
   */
  evaluate: (command, currentScore) => {
    let score = currentScore;
    
    // Increase score for main/master branch operations
    if (command.currentBranch === 'main' || command.currentBranch === 'master') {
      // Check for particularly dangerous operations
      const dangerousOps = ['push', 'deploy', 'publish', 'delete', 'drop', 'reset'];
      
      for (const op of dangerousOps) {
        if (command.fullCommand.toLowerCase().includes(op)) {
          score += 15;
          console.log(`[Plugin: custom-branch-check] +15 risk: ${op} on ${command.currentBranch}`);
          break;
        }
      }
    }
    
    // Increase score for production environment
    if (command.environment === 'production') {
      score += 10;
      console.log(`[Plugin: custom-branch-check] +10 risk: production environment`);
    }
    
    return score;
  },
  
  /**
   * Handle telemetry events (optional)
   * @param {Object} event - Telemetry event
   */
  onEvent: (event) => {
    // You could send metrics to external systems here
    if (event.riskLevel === 'critical' && event.executed) {
      console.log(`[Plugin: custom-branch-check] ALERT: Critical command executed: ${event.command}`);
    }
  }
};
