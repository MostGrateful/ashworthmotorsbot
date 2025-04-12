module.exports = {
    name: 'guildMemberAdd',
  
    async execute(member, client) {
      const autoRoleIds = [
        '1354665383298076752', // Role 1
        '1354665250208743514', // Role 2
      ];
  
      console.log(`➕ New Member Joined: ${member.user.tag}`);
  
      // Auto Role Loop
      for (const roleId of autoRoleIds) {
        try {
          await member.roles.add(roleId);
        } catch (error) {
          console.error(`❌ Failed to auto-role ${member.user.tag} with Role ID: ${roleId}`, error);
        }
      }
  
      // Auto Log to log channel via utils
      try {
        await client.utils.log(member.guild, `➕ ${member.user} has joined and was auto-roled.`);
      } catch (error) {
        console.error('❌ Failed to send join log:', error);
      }
    },
  };
  
