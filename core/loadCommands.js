const fs = require('fs');
const path = require('path');

const loadCommands = (dir, commandsArray, client) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      loadCommands(filePath, commandsArray, client);
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
      } else {
        console.warn(`⚠️ The command at ${filePath} is missing required properties.`);
      }
    }
  }
};

module.exports = loadCommands;
